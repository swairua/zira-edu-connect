import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL");
const RESEND_FROM_NAME = Deno.env.get("RESEND_FROM_NAME") || "Zira EduSuite";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QueuedNotification {
  id: string;
  institution_id: string;
  notification_type: string;
  recipient_type: string;
  recipient_id: string;
  channel: string;
  subject: string | null;
  message: string;
  priority: number;
  scheduled_at: string;
  status: string;
  retry_count: number;
  max_retries: number;
  metadata: Record<string, any>;
  reference_type: string | null;
  reference_id: string | null;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("process-notification-queue invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

  try {
    const now = new Date().toISOString();
    const batchSize = 50; // Process 50 notifications per run

    // Get pending notifications ready to be sent
    const { data: notifications, error: fetchError } = await supabase
      .from("notification_queue")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_at", now)
      .order("priority", { ascending: false })
      .order("scheduled_at", { ascending: true })
      .limit(batchSize);

    if (fetchError) {
      console.error("Error fetching queue:", fetchError);
      throw fetchError;
    }

    console.log(`Processing ${notifications?.length || 0} queued notifications`);

    let processed = 0;
    let succeeded = 0;
    let failed = 0;

    for (const notif of (notifications || []) as QueuedNotification[]) {
      processed++;

      // Mark as processing
      await supabase
        .from("notification_queue")
        .update({ status: "processing" })
        .eq("id", notif.id);

      let success = false;
      let errorMessage: string | null = null;

      try {
        // Get recipient contact info
        let recipientPhone: string | null = null;
        let recipientEmail: string | null = null;
        let recipientName: string | null = null;

        if (notif.recipient_type === "parent") {
          const { data: parent } = await supabase
            .from("parents")
            .select("phone, email, first_name, last_name")
            .eq("id", notif.recipient_id)
            .single();

          if (parent) {
            recipientPhone = parent.phone;
            recipientEmail = parent.email;
            recipientName = `${parent.first_name} ${parent.last_name}`;
          }
        } else if (notif.recipient_type === "staff") {
          const { data: staff } = await supabase
            .from("staff")
            .select("phone, email, first_name, last_name")
            .eq("id", notif.recipient_id)
            .single();

          if (staff) {
            recipientPhone = staff.phone;
            recipientEmail = staff.email;
            recipientName = `${staff.first_name} ${staff.last_name}`;
          }
        } else if (notif.recipient_type === "student") {
          const { data: student } = await supabase
            .from("students")
            .select("email, first_name, last_name")
            .eq("id", notif.recipient_id)
            .single();

          if (student) {
            recipientEmail = student.email;
            recipientName = `${student.first_name} ${student.last_name}`;
          }
        }

        // Check if institution is demo
        const { data: institution } = await supabase
          .from("institutions")
          .select("is_demo")
          .eq("id", notif.institution_id)
          .single();

        const isDemo = institution?.is_demo || false;

        // Send based on channel
        switch (notif.channel) {
          case "sms":
            if (recipientPhone && !isDemo) {
              const smsResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-sms`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                },
                body: JSON.stringify({
                  phones: [recipientPhone],
                  message: notif.message,
                  messageType: notif.notification_type,
                  smsType: "transactional",
                  institutionId: notif.institution_id,
                  recipientType: notif.recipient_type,
                }),
              });

              const smsResult = await smsResponse.json();
              success = smsResponse.ok && smsResult.success;
              if (!success) {
                errorMessage = smsResult.error || "SMS send failed";
              }
            } else if (isDemo) {
              success = true; // Skip for demo but mark as success
            } else {
              errorMessage = "No phone number for recipient";
            }
            break;

          case "email":
            if (recipientEmail && resend && RESEND_FROM_EMAIL) {
              try {
                await resend.emails.send({
                  from: `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`,
                  to: [recipientEmail],
                  subject: notif.subject || "Notification",
                  html: `<p>${notif.message.replace(/\n/g, "<br>")}</p>`,
                });
                success = true;
              } catch (emailErr: any) {
                errorMessage = emailErr.message || "Email send failed";
              }
            } else if (!recipientEmail) {
              errorMessage = "No email for recipient";
            } else {
              errorMessage = "Email service not configured";
            }
            break;

          case "in_app":
            // Create in-app notification
            const { error: inAppError } = await supabase.from("in_app_notifications").insert({
              institution_id: notif.institution_id,
              ...(notif.recipient_type === "parent" ? { parent_id: notif.recipient_id } : {}),
              ...(notif.recipient_type === "staff" ? { user_id: notif.recipient_id } : {}),
              user_type: notif.recipient_type,
              title: notif.subject || notif.notification_type,
              message: notif.message,
              type: "info",
              reference_type: notif.reference_type,
              reference_id: notif.reference_id,
            });

            success = !inAppError;
            if (inAppError) {
              errorMessage = inAppError.message;
            }
            break;

          case "whatsapp":
            // WhatsApp integration placeholder
            errorMessage = "WhatsApp not yet implemented";
            break;

          default:
            errorMessage = `Unknown channel: ${notif.channel}`;
        }

      } catch (err: any) {
        errorMessage = err.message || "Unknown error";
      }

      // Update notification status
      if (success) {
        await supabase
          .from("notification_queue")
          .update({
            status: "sent",
            processed_at: new Date().toISOString(),
            error_message: null,
          })
          .eq("id", notif.id);
        succeeded++;
      } else {
        const newRetryCount = notif.retry_count + 1;
        const shouldRetry = newRetryCount < notif.max_retries;

        await supabase
          .from("notification_queue")
          .update({
            status: shouldRetry ? "pending" : "failed",
            retry_count: newRetryCount,
            error_message: errorMessage,
            // If retrying, schedule for 5 minutes later
            scheduled_at: shouldRetry 
              ? new Date(Date.now() + 5 * 60 * 1000).toISOString() 
              : undefined,
          })
          .eq("id", notif.id);
        
        if (!shouldRetry) {
          failed++;
        }
      }
    }

    // Clean up old sent/failed notifications (older than 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from("notification_queue")
      .delete()
      .in("status", ["sent", "failed"])
      .lt("created_at", thirtyDaysAgo);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed,
        succeeded,
        failed,
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
