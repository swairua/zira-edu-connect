import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Installment {
  id: string;
  invoice_id: string;
  amount: number;
  due_date: string;
  status: string;
  installment_number: number;
  invoice: {
    id: string;
    invoice_number: string;
    student_id: string;
    institution_id: string;
    student: {
      id: string;
      first_name: string;
      last_name: string;
      institution: {
        id: string;
        name: string;
        currency: string;
        is_demo: boolean;
      };
    };
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log("process-installment-reminders invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check for installments due in 7, 3, and 1 days
    const reminderDays = [7, 3, 1];
    let totalSent = 0;
    let totalFailed = 0;

    for (const daysAhead of reminderDays) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + daysAhead);
      const targetDateStr = targetDate.toISOString().split("T")[0];

      // Get unpaid installments due on target date
      const { data: installments, error: instError } = await supabase
        .from("fee_installments")
        .select(`
          id, invoice_id, amount, due_date, status, installment_number,
          invoice:student_invoices!inner(
            id, invoice_number, student_id, institution_id,
            student:students!inner(
              id, first_name, last_name,
              institution:institutions!inner(id, name, currency, is_demo)
            )
          )
        `)
        .eq("due_date", targetDateStr)
        .in("status", ["pending", "partial"]);

      if (instError) {
        console.error("Error fetching installments:", instError);
        continue;
      }

      console.log(`Found ${installments?.length || 0} installments due in ${daysAhead} days`);

      for (const inst of (installments || []) as unknown as Installment[]) {
        const student = inst.invoice.student;
        const institution = student.institution;
        const currency = institution.currency || "KES";

        // Get parents for this student
        const { data: parentLinks } = await supabase
          .from("student_parents")
          .select("parent:parents!inner(id, phone, email, first_name, last_name)")
          .eq("student_id", student.id);

        if (!parentLinks || parentLinks.length === 0) continue;

        const formattedAmount = `${currency} ${inst.amount.toLocaleString()}`;
        const dueDate = new Date(inst.due_date).toLocaleDateString("en-KE", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        const message = `📅 ${institution.name}: Installment ${inst.installment_number} of ${formattedAmount} for ${student.first_name} is due in ${daysAhead} day${daysAhead > 1 ? "s" : ""} (${dueDate}). Invoice: ${inst.invoice.invoice_number}. Please ensure timely payment.`;

        for (const link of parentLinks) {
          const parent = link.parent as any;
          if (!parent) continue;

          // Check SMS preference
          const { data: pref } = await supabase
            .from("notification_preferences")
            .select("is_opted_in")
            .eq("parent_id", parent.id)
            .eq("institution_id", institution.id)
            .eq("channel", "sms")
            .maybeSingle();

          if (pref && !pref.is_opted_in) {
            console.log(`Parent ${parent.id} opted out of SMS`);
            continue;
          }

          // Send SMS (skip demo institutions)
          if (parent.phone && !institution.is_demo) {
            try {
              const smsResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-sms`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                },
                body: JSON.stringify({
                  phones: [parent.phone],
                  message,
                  messageType: "installment_reminder",
                  smsType: "transactional",
                  institutionId: institution.id,
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
            institution_id: institution.id,
            parent_id: parent.id,
            user_type: "parent",
            title: `Installment Due in ${daysAhead} Day${daysAhead > 1 ? "s" : ""}`,
            message,
            type: "info",
            reference_type: "fee_installment",
            reference_id: inst.id,
          });

          // Log communication event
          await supabase.from("communication_events").insert({
            institution_id: institution.id,
            event_type: "installment_reminder",
            trigger_source: "scheduled",
            student_id: student.id,
            parent_id: parent.id,
            reference_type: "fee_installment",
            reference_id: inst.id,
            channels_used: parent.phone && !institution.is_demo ? ["sms", "in_app"] : ["in_app"],
            message_content: message,
            status: "sent",
            metadata: {
              days_before_due: daysAhead,
              installment_number: inst.installment_number,
              amount: inst.amount,
            },
            processed_at: new Date().toISOString(),
          });
        }
      }
    }

    // Also check for overdue installments
    const { data: overdueInstallments } = await supabase
      .from("fee_installments")
      .select(`
        id, invoice_id, amount, due_date, status, installment_number,
        invoice:student_invoices!inner(
          id, invoice_number, student_id, institution_id,
          student:students!inner(
            id, first_name, last_name,
            institution:institutions!inner(id, name, currency, is_demo)
          )
        )
      `)
      .lt("due_date", today.toISOString().split("T")[0])
      .in("status", ["pending", "partial"]);

    console.log(`Found ${overdueInstallments?.length || 0} overdue installments`);

    // Process overdue (send once per week)
    const todayDay = today.getDay();
    if (todayDay === 1) { // Monday
      for (const inst of (overdueInstallments || []) as unknown as Installment[]) {
        const student = inst.invoice.student;
        const institution = student.institution;
        const currency = institution.currency || "KES";
        
        const daysOverdue = Math.floor((today.getTime() - new Date(inst.due_date).getTime()) / (1000 * 60 * 60 * 24));
        const formattedAmount = `${currency} ${inst.amount.toLocaleString()}`;

        const { data: parentLinks } = await supabase
          .from("student_parents")
          .select("parent:parents!inner(id, phone, email, first_name)")
          .eq("student_id", student.id);

        if (!parentLinks || parentLinks.length === 0) continue;

        const message = `⚠️ ${institution.name}: Installment ${inst.installment_number} of ${formattedAmount} for ${student.first_name} is ${daysOverdue} days overdue. Please pay to avoid penalties.`;

        for (const link of parentLinks) {
          const parent = link.parent as any;
          if (!parent?.phone || institution.is_demo) continue;

          try {
            await fetch(`${SUPABASE_URL}/functions/v1/send-sms`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              },
              body: JSON.stringify({
                phones: [parent.phone],
                message,
                messageType: "installment_overdue",
                smsType: "transactional",
                institutionId: institution.id,
                recipientType: "parent",
              }),
            });
            totalSent++;
          } catch (err) {
            totalFailed++;
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, sent: totalSent, failed: totalFailed }),
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
