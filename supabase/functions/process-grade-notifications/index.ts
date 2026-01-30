import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL");
const RESEND_FROM_NAME = Deno.env.get("RESEND_FROM_NAME") || "Zira EduSuite";
const PARENT_PORTAL_URL = "https://zira-edu-connect.lovable.app/parent";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GradeNotificationRequest {
  studentId?: string;
  examId?: string;
  subjectId?: string;
  institutionId: string;
  notificationType: "single_grade" | "exam_results" | "report_card";
}

const handler = async (req: Request): Promise<Response> => {
  console.log("process-grade-notifications invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

  try {
    const body: GradeNotificationRequest = await req.json();
    const { studentId, examId, subjectId, institutionId, notificationType } = body;

    if (!institutionId) {
      return new Response(
        JSON.stringify({ error: "institutionId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get institution details
    const { data: institution } = await supabase
      .from("institutions")
      .select("id, name, currency, is_demo")
      .eq("id", institutionId)
      .single();

    if (!institution) {
      throw new Error("Institution not found");
    }

    let totalSent = 0;
    let totalFailed = 0;

    if (notificationType === "exam_results" && examId) {
      // Notify all parents about exam results being published
      const { data: exam } = await supabase
        .from("exams")
        .select("id, name, exam_type")
        .eq("id", examId)
        .single();

      if (!exam) throw new Error("Exam not found");

      // Get all students with scores for this exam
      const { data: scores } = await supabase
        .from("student_scores")
        .select(`
          student_id, marks, grade,
          student:students!inner(id, first_name, last_name, class_id)
        `)
        .eq("exam_id", examId)
        .eq("institution_id", institutionId);

      // Group by student to send one notification per student
      const studentScores = new Map<string, { student: any; subjects: number }>();
      for (const score of (scores || [])) {
        const student = score.student as any;
        if (!studentScores.has(student.id)) {
          studentScores.set(student.id, { student, subjects: 0 });
        }
        studentScores.get(student.id)!.subjects++;
      }

      for (const [sId, { student, subjects }] of studentScores) {
        const { data: parentLinks } = await supabase
          .from("student_parents")
          .select("parent:parents!inner(id, first_name, last_name, phone, email)")
          .eq("student_id", sId);

        if (!parentLinks || parentLinks.length === 0) continue;

        const smsMessage = `📊 ${institution.name}: ${exam.name} results are now available for ${student.first_name}! ${subjects} subject(s) graded. Log in to the Parent Portal to view detailed results.`;

        for (const link of parentLinks) {
          const parent = link.parent as any;
          if (!parent) continue;

          // Check preference
          const { data: pref } = await supabase
            .from("notification_preferences")
            .select("is_opted_in")
            .eq("parent_id", parent.id)
            .eq("institution_id", institutionId)
            .eq("channel", "sms")
            .maybeSingle();

          if (!(pref && !pref.is_opted_in)) {
            // Send SMS
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
                    message: smsMessage,
                    messageType: "exam_results",
                    smsType: "transactional",
                    institutionId,
                    recipientType: "parent",
                  }),
                });

                if (smsResponse.ok) totalSent++;
                else totalFailed++;
              } catch (err) {
                console.error("SMS error:", err);
                totalFailed++;
              }
            }
          }

          // Send email with more details
          if (parent.email && resend && RESEND_FROM_EMAIL) {
            try {
              await resend.emails.send({
                from: `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`,
                to: [parent.email],
                subject: `📊 ${exam.name} Results Available - ${institution.name}`,
                html: `
                  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 30px; border-radius: 12px 12px 0 0;">
                      <h1 style="color: white; margin: 0; font-size: 24px;">📊 Exam Results Available</h1>
                    </div>
                    <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
                      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear ${parent.first_name},</p>
                      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                        The results for <strong>${exam.name}</strong> are now available for <strong>${student.first_name} ${student.last_name}</strong>.
                      </p>
                      
                      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; color: #374151;"><strong>Exam:</strong> ${exam.name}</p>
                        <p style="margin: 8px 0 0 0; color: #374151;"><strong>Subjects Graded:</strong> ${subjects}</p>
                      </div>

                      <div style="text-align: center; margin: 32px 0;">
                        <a href="${PARENT_PORTAL_URL}/academics" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          View Results
                        </a>
                      </div>

                      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                        Best regards,<br>
                        <strong>${institution.name}</strong>
                      </p>
                    </div>
                  </div>
                `,
              });
              totalSent++;
            } catch (emailErr) {
              console.error("Email error:", emailErr);
            }
          }

          // In-app notification
          await supabase.from("in_app_notifications").insert({
            institution_id: institutionId,
            parent_id: parent.id,
            user_type: "parent",
            title: `📊 ${exam.name} Results Available`,
            message: smsMessage,
            type: "info",
            reference_type: "exam",
            reference_id: examId,
          });
        }
      }

      // Log event
      await supabase.from("communication_events").insert({
        institution_id: institutionId,
        event_type: "exam_results_published",
        trigger_source: "manual",
        reference_type: "exam",
        reference_id: examId,
        channels_used: ["sms", "email", "in_app"],
        message_content: `${exam.name} results published`,
        status: "sent",
        metadata: {
          exam_name: exam.name,
          students_notified: studentScores.size,
        },
        processed_at: new Date().toISOString(),
      });

    } else if (notificationType === "report_card" && studentId) {
      // Report card ready notification
      const { data: student } = await supabase
        .from("students")
        .select("id, first_name, last_name")
        .eq("id", studentId)
        .single();

      if (!student) throw new Error("Student not found");

      const { data: parentLinks } = await supabase
        .from("student_parents")
        .select("parent:parents!inner(id, first_name, last_name, phone, email)")
        .eq("student_id", studentId);

      const smsMessage = `📋 ${institution.name}: The report card for ${student.first_name} ${student.last_name} is now ready! Log in to the Parent Portal to view and download.`;

      for (const link of (parentLinks || [])) {
        const parent = link.parent as any;
        if (!parent) continue;

        if (parent.phone && !institution.is_demo) {
          try {
            await fetch(`${SUPABASE_URL}/functions/v1/send-sms`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              },
              body: JSON.stringify({
                phones: [parent.phone],
                message: smsMessage,
                messageType: "report_card",
                smsType: "transactional",
                institutionId,
                recipientType: "parent",
              }),
            });
            totalSent++;
          } catch {
            totalFailed++;
          }
        }

        await supabase.from("in_app_notifications").insert({
          institution_id: institutionId,
          parent_id: parent.id,
          user_type: "parent",
          title: `📋 Report Card Ready`,
          message: smsMessage,
          type: "info",
          reference_type: "report_card",
          reference_id: studentId,
        });
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
