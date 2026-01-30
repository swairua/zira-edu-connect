import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentCommitment {
  id: string;
  institution_id: string;
  invoice_id: string;
  parent_id: string;
  student_id: string;
  committed_amount: number;
  committed_date: string;
  reminder_days_before: number[];
  status: string;
  parent: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
  };
  student: {
    id: string;
    first_name: string;
    last_name: string;
  };
  invoice: {
    id: string;
    invoice_number: string;
  };
  institution: {
    id: string;
    name: string;
    currency: string;
    is_demo: boolean;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log("process-commitment-reminders invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    let totalSent = 0;
    let totalFailed = 0;

    // Get all pending commitments
    const { data: commitments, error: commError } = await supabase
      .from("payment_commitments")
      .select(`
        id, institution_id, invoice_id, parent_id, student_id,
        committed_amount, committed_date, reminder_days_before, status,
        parent:parents!inner(id, first_name, last_name, phone, email),
        student:students!inner(id, first_name, last_name),
        invoice:student_invoices!inner(id, invoice_number),
        institution:institutions!inner(id, name, currency, is_demo)
      `)
      .eq("status", "pending")
      .gte("committed_date", todayStr);

    if (commError) {
      console.error("Error fetching commitments:", commError);
      throw commError;
    }

    console.log(`Found ${commitments?.length || 0} pending commitments`);

    for (const commitment of (commitments || []) as unknown as PaymentCommitment[]) {
      const commitDate = new Date(commitment.committed_date);
      const daysUntil = Math.floor((commitDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Check if today matches any reminder day
      const reminderDays = commitment.reminder_days_before || [3, 1];
      if (!reminderDays.includes(daysUntil) && daysUntil !== 0) {
        continue;
      }

      const currency = commitment.institution.currency || "KES";
      const formattedAmount = `${currency} ${commitment.committed_amount.toLocaleString()}`;
      const formattedDate = commitDate.toLocaleDateString("en-KE", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      let message: string;
      if (daysUntil === 0) {
        message = `📅 ${commitment.institution.name}: Your payment commitment of ${formattedAmount} for ${commitment.student.first_name}'s fees is DUE TODAY. Invoice: ${commitment.invoice.invoice_number}. Thank you for your commitment!`;
      } else {
        message = `📅 ${commitment.institution.name}: Reminder - Your payment commitment of ${formattedAmount} for ${commitment.student.first_name} is due in ${daysUntil} day${daysUntil > 1 ? "s" : ""} (${formattedDate}). Invoice: ${commitment.invoice.invoice_number}.`;
      }

      // Check SMS preference
      const { data: pref } = await supabase
        .from("notification_preferences")
        .select("is_opted_in")
        .eq("parent_id", commitment.parent.id)
        .eq("institution_id", commitment.institution.id)
        .eq("channel", "sms")
        .maybeSingle();

      if (pref && !pref.is_opted_in) {
        console.log(`Parent ${commitment.parent.id} opted out of SMS`);
        continue;
      }

      // Send SMS
      if (commitment.parent.phone && !commitment.institution.is_demo) {
        try {
          const smsResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-sms`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({
              phones: [commitment.parent.phone],
              message,
              messageType: "commitment_reminder",
              smsType: "transactional",
              institutionId: commitment.institution.id,
              recipientType: "parent",
            }),
          });

          if (smsResponse.ok) {
            totalSent++;
          } else {
            totalFailed++;
          }
        } catch (err) {
          console.error("SMS send error:", err);
          totalFailed++;
        }
      }

      // Create in-app notification
      await supabase.from("in_app_notifications").insert({
        institution_id: commitment.institution.id,
        parent_id: commitment.parent.id,
        user_type: "parent",
        title: daysUntil === 0 ? "Payment Commitment Due Today" : `Payment Commitment in ${daysUntil} Day${daysUntil > 1 ? "s" : ""}`,
        message,
        type: "info",
        reference_type: "payment_commitment",
        reference_id: commitment.id,
      });

      // Log communication event
      await supabase.from("communication_events").insert({
        institution_id: commitment.institution.id,
        event_type: "commitment_reminder",
        trigger_source: "scheduled",
        student_id: commitment.student.id,
        parent_id: commitment.parent.id,
        reference_type: "payment_commitment",
        reference_id: commitment.id,
        channels_used: commitment.parent.phone && !commitment.institution.is_demo ? ["sms", "in_app"] : ["in_app"],
        message_content: message,
        status: "sent",
        metadata: {
          days_until_due: daysUntil,
          committed_amount: commitment.committed_amount,
          committed_date: commitment.committed_date,
        },
        processed_at: new Date().toISOString(),
      });
    }

    // Check for missed commitments (past due, still pending)
    const { data: missedCommitments } = await supabase
      .from("payment_commitments")
      .select(`
        id, institution_id, committed_date, committed_amount,
        parent:parents!inner(id, first_name, phone),
        student:students!inner(first_name),
        institution:institutions!inner(name, is_demo)
      `)
      .eq("status", "pending")
      .lt("committed_date", todayStr);

    // Update missed commitments status
    for (const missed of (missedCommitments || []) as any[]) {
      await supabase
        .from("payment_commitments")
        .update({ status: "missed", updated_at: new Date().toISOString() })
        .eq("id", missed.id);

      // Notify about missed commitment
      if (missed.parent.phone && !missed.institution.is_demo) {
        const message = `⚠️ ${missed.institution.name}: Your payment commitment of ${missed.committed_amount.toLocaleString()} for ${missed.student.first_name} was due on ${new Date(missed.committed_date).toLocaleDateString("en-KE")} but has not been received. Please make payment as soon as possible.`;

        try {
          await fetch(`${SUPABASE_URL}/functions/v1/send-sms`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({
              phones: [missed.parent.phone],
              message,
              messageType: "commitment_missed",
              smsType: "transactional",
              institutionId: missed.institution.id,
              recipientType: "parent",
            }),
          });
        } catch (err) {
          console.error("Failed to send missed commitment SMS:", err);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: totalSent, 
        failed: totalFailed,
        missed_updated: missedCommitments?.length || 0,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
