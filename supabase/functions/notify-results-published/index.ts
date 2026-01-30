import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyRequest {
  examId: string;
  institutionId: string;
  notifyViaSms: boolean;
  notifyInApp: boolean;
}

interface StudentParentJoin {
  parent: {
    id: string;
    phone: string | null;
    first_name: string | null;
    last_name: string | null;
    user_id: string | null;
  } | null;
}

interface StudentWithParents {
  id: string;
  first_name: string;
  last_name: string;
  student_parents: StudentParentJoin[];
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { examId, institutionId, notifyViaSms, notifyInApp }: NotifyRequest = await req.json();

    if (!examId || !institutionId) {
      return new Response(JSON.stringify({ error: "Missing examId or institutionId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get exam details
    const { data: exam, error: examError } = await supabaseAdmin
      .from("exams")
      .select("id, name, term:terms(name), academic_year:academic_years(name)")
      .eq("id", examId)
      .single();

    if (examError) {
      console.error("Exam fetch error:", examError);
      return new Response(JSON.stringify({ error: "Exam not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get institution details
    const { data: institution, error: instError } = await supabaseAdmin
      .from("institutions")
      .select("id, name")
      .eq("id", institutionId)
      .single();

    if (instError) {
      console.error("Institution fetch error:", instError);
      return new Response(JSON.stringify({ error: "Institution not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all students with scores for this exam
    const { data: studentsWithScores, error: scoresError } = await supabaseAdmin
      .from("student_scores")
      .select("student_id")
      .eq("exam_id", examId)
      .not("marks", "is", null);

    if (scoresError) {
      console.error("Scores fetch error:", scoresError);
      return new Response(JSON.stringify({ error: "Failed to fetch scores" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const studentIds = [...new Set(studentsWithScores?.map((s) => s.student_id) || [])];

    if (studentIds.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No students with scores found",
        notified: 0 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get students with their parents
    const studentsResult = await supabaseAdmin
      .from("students")
      .select(`
        id, 
        first_name, 
        last_name,
        student_parents(
          parent:parents(id, phone, first_name, last_name, user_id)
        )
      `)
      .in("id", studentIds);
    
    const students = studentsResult.data as StudentWithParents[] | null;
    const studentsError = studentsResult.error;

    if (studentsError) {
      console.error("Students fetch error:", studentsError);
      return new Response(JSON.stringify({ error: "Failed to fetch students" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let smsCount = 0;
    let inAppCount = 0;
    const errors: string[] = [];

    // Process each student
    for (const student of students || []) {
      const studentName = `${student.first_name} ${student.last_name}`;
      
      for (const sp of student.student_parents || []) {
        const parent = sp.parent;
        if (!parent) continue;

        // Create in-app notification
        if (notifyInApp) {
          try {
            await supabaseAdmin.from("in_app_notifications").insert({
              institution_id: institutionId,
              parent_id: parent.id,
              type: "results_published",
              title: "Exam Results Published",
              message: `${studentName}'s ${exam.name} results are now available. Login to view the report card.`,
              reference_type: "exam",
              reference_id: examId,
            });
            inAppCount++;
          } catch (err) {
            console.error("In-app notification error:", err);
            errors.push(`In-app notification failed for parent ${parent.id}`);
          }
        }

        // Send SMS via Roberms
        if (notifyViaSms && parent.phone) {
          try {
            const smsMessage = `Dear ${parent.first_name || "Parent"}, ${studentName}'s ${exam.name} results are now available. Login to the Parent Portal to view. - ${institution.name}`;
            
            const robermsToken = Deno.env.get("ROBERMS_API_TOKEN");
            if (robermsToken) {
              const smsResponse = await fetch("https://sms.roberms.com/sms/v1/sms/send", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${robermsToken}`,
                },
                body: JSON.stringify({
                  mobile: parent.phone,
                  message: smsMessage,
                }),
              });

              if (smsResponse.ok) {
                smsCount++;
              } else {
                const smsError = await smsResponse.text();
                console.error("SMS send error:", smsError);
                errors.push(`SMS failed for ${parent.phone}`);
              }
            }
          } catch (err) {
            console.error("SMS error:", err);
            errors.push(`SMS error for parent ${parent.id}`);
          }
        }
      }
    }

    // Log the action to audit
    await supabaseAdmin.from("audit_logs").insert({
      action: "PUBLISH_RESULTS_NOTIFY",
      entity_type: "exam",
      entity_id: examId,
      institution_id: institutionId,
      user_id: user.id,
      metadata: {
        exam_name: exam.name,
        students_count: studentIds.length,
        sms_sent: smsCount,
        in_app_sent: inAppCount,
        errors_count: errors.length,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notifications sent successfully`,
        stats: {
          studentsCount: studentIds.length,
          smsSent: smsCount,
          inAppSent: inAppCount,
          errorsCount: errors.length,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in notify-results-published:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
