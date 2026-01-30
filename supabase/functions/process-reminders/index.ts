import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderSchedule {
  id: string;
  institution_id: string;
  name: string;
  reminder_type: string;
  days_offset: number;
  channels: string[];
  message_template: string;
  is_active: boolean;
}

interface InvoiceWithStudent {
  id: string;
  invoice_number: string;
  total_amount: number;
  amount_paid: number;
  due_date: string;
  status: string;
  student_id: string;
  institution_id: string;
  students: {
    id: string;
    first_name: string;
    last_name: string;
    admission_number: string;
  };
}

// Replace placeholders in message template
function formatMessage(template: string, data: {
  student_name: string;
  amount: number;
  balance: number;
  due_date: string;
  invoice_number: string;
  institution_name: string;
}): string {
  return template
    .replace(/{student_name}/g, data.student_name)
    .replace(/{amount}/g, data.amount.toLocaleString())
    .replace(/{balance}/g, data.balance.toLocaleString())
    .replace(/{due_date}/g, data.due_date)
    .replace(/{invoice_number}/g, data.invoice_number)
    .replace(/{institution_name}/g, data.institution_name);
}

// Send SMS via the centralized send-sms edge function
async function sendSms(
  phone: string, 
  message: string, 
  institutionId: string
): Promise<boolean> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const response = await fetch(`${supabaseUrl}/functions/v1/send-sms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        phones: [phone],
        message,
        messageType: "reminder",
        smsType: "transactional",
        institutionId,
        recipientType: "parent",
      }),
    });

    const result = await response.json();
    return response.ok && result.success;
  } catch (error) {
    console.error("SMS send error:", error);
    return false;
  }
}

// Send email via Resend
async function sendEmail(email: string, subject: string, message: string): Promise<boolean> {
  if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
    console.error("Email not configured");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: [email],
        subject,
        html: `<p>${message.replace(/\n/g, "<br>")}</p>`,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}

const handler = async (req: Request): Promise<Response> => {
  console.log("process-reminders function invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    // Get all active reminder schedules
    const { data: schedules, error: schedError } = await supabaseAdmin
      .from("reminder_schedules")
      .select("*")
      .eq("is_active", true);

    if (schedError || !schedules) {
      console.error("Failed to fetch schedules:", schedError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch reminder schedules" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Processing ${schedules.length} active schedules`);

    let totalSent = 0;
    let totalFailed = 0;

    for (const schedule of schedules as ReminderSchedule[]) {
      // Calculate target date based on days_offset
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() - schedule.days_offset); // Negative offset = before due date
      const targetDateStr = targetDate.toISOString().split("T")[0];

      // Build query based on reminder type
      let query = supabaseAdmin
        .from("student_invoices")
        .select(`
          id, invoice_number, total_amount, amount_paid, due_date, status, student_id, institution_id,
          students!inner(id, first_name, last_name, admission_number)
        `)
        .eq("institution_id", schedule.institution_id)
        .not("status", "in", '("paid","cancelled","draft")');

      // Filter based on reminder type
      switch (schedule.reminder_type) {
        case "upcoming_due":
          // Due date is X days in the future
          query = query.eq("due_date", targetDateStr);
          break;
        case "due_date":
          // Due date is today
          query = query.eq("due_date", todayStr);
          break;
        case "overdue":
          // Due date was X days ago
          query = query.eq("due_date", targetDateStr).lt("due_date", todayStr);
          break;
        case "penalty_applied":
          // Skip - handled by apply-penalties function
          continue;
        default:
          continue;
      }

      const { data: invoices, error: invError } = await query;

      if (invError || !invoices) {
        console.error(`Failed to fetch invoices for schedule ${schedule.id}:`, invError);
        continue;
      }

      console.log(`Schedule "${schedule.name}": Found ${invoices.length} matching invoices`);

      // Get institution name
      const { data: institution } = await supabaseAdmin
        .from("institutions")
        .select("name")
        .eq("id", schedule.institution_id)
        .single();

      for (const invoice of invoices as unknown as InvoiceWithStudent[]) {
        const balance = (invoice.total_amount || 0) - (invoice.amount_paid || 0);
        if (balance <= 0) continue;

        const studentName = `${invoice.students.first_name} ${invoice.students.last_name}`;
        const message = formatMessage(schedule.message_template, {
          student_name: studentName,
          amount: invoice.total_amount,
          balance,
          due_date: new Date(invoice.due_date).toLocaleDateString("en-KE"),
          invoice_number: invoice.invoice_number,
          institution_name: institution?.name || "School",
        });

        // Get parent contacts
        const { data: parents } = await supabaseAdmin
          .from("student_parents")
          .select("parent:parents!inner(id, phone, email, first_name, last_name)")
          .eq("student_id", invoice.student_id);

        if (!parents || parents.length === 0) {
          console.log(`No parents found for student ${invoice.student_id}`);
          continue;
        }

        for (const parentLink of parents) {
          const parent = parentLink.parent as any;
          if (!parent) continue;

          // Check notification preferences
          for (const channel of schedule.channels) {
            const { data: pref } = await supabaseAdmin
              .from("notification_preferences")
              .select("is_opted_in")
              .eq("parent_id", parent.id)
              .eq("institution_id", schedule.institution_id)
              .eq("channel", channel)
              .single();

            // Skip if opted out
            if (pref && !pref.is_opted_in) {
              await supabaseAdmin.from("reminder_logs").insert({
                schedule_id: schedule.id,
                institution_id: schedule.institution_id,
                student_id: invoice.student_id,
                invoice_id: invoice.id,
                parent_id: parent.id,
                channel,
                message,
                status: "opted_out",
              });
              continue;
            }

            let success = false;

            switch (channel) {
              case "sms":
                if (parent.phone) {
                  success = await sendSms(parent.phone, message, schedule.institution_id);
                }
                break;
              case "email":
                if (parent.email) {
                  const subject = schedule.reminder_type === "overdue" 
                    ? "Overdue Fee Reminder" 
                    : "Fee Payment Reminder";
                  success = await sendEmail(parent.email, subject, message);
                }
                break;
              case "in_app":
                // Create in-app notification
                await supabaseAdmin.from("in_app_notifications").insert({
                  institution_id: schedule.institution_id,
                  parent_id: parent.id,
                  user_type: "parent",
                  title: schedule.reminder_type === "overdue" ? "Overdue Payment" : "Payment Reminder",
                  message,
                  type: "reminder",
                  reference_type: "student_invoice",
                  reference_id: invoice.id,
                });
                success = true;
                break;
            }

            // Log the reminder
            await supabaseAdmin.from("reminder_logs").insert({
              schedule_id: schedule.id,
              institution_id: schedule.institution_id,
              student_id: invoice.student_id,
              invoice_id: invoice.id,
              parent_id: parent.id,
              channel,
              message,
              status: success ? "sent" : "failed",
              sent_at: success ? new Date().toISOString() : null,
            });

            if (success) {
              totalSent++;
            } else {
              totalFailed++;
            }
          }
        }
      }
    }

    // Log summary
    await supabaseAdmin.from("audit_logs").insert({
      action: "PROCESS_REMINDERS_COMPLETED",
      entity_type: "reminder_schedule",
      metadata: {
        date: todayStr,
        schedules_processed: schedules.length,
        reminders_sent: totalSent,
        reminders_failed: totalFailed,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        processed: schedules.length,
        sent: totalSent,
        failed: totalFailed,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error processing reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
