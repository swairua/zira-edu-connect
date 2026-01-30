import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  status: string;
  total_marks: number | null;
  class_id: string;
  subject_id: string;
  institution_id: string;
  class: {
    id: string;
    name: string;
  };
  subject: {
    id: string;
    name: string;
  };
  institution: {
    id: string;
    name: string;
    is_demo: boolean;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log("process-assignment-reminders invoked");

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

    // Process assignments due tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const { data: dueTomorrow, error: dueError } = await supabase
      .from("assignments")
      .select(`
        id, title, description, due_date, status, total_marks, class_id, subject_id, institution_id,
        class:classes!inner(id, name),
        subject:subjects!inner(id, name),
        institution:institutions!inner(id, name, is_demo)
      `)
      .eq("due_date", tomorrowStr)
      .eq("status", "active");

    if (dueError) {
      console.error("Error fetching assignments:", dueError);
    }

    console.log(`Found ${dueTomorrow?.length || 0} assignments due tomorrow`);

    for (const assignment of (dueTomorrow || []) as unknown as Assignment[]) {
      // Get students in this class who haven't submitted
      const { data: students } = await supabase
        .from("students")
        .select("id, first_name, last_name")
        .eq("class_id", assignment.class_id)
        .eq("status", "active");

      if (!students || students.length === 0) continue;

      // Get existing submissions
      const { data: submissions } = await supabase
        .from("assignment_submissions")
        .select("student_id")
        .eq("assignment_id", assignment.id);

      const submittedIds = new Set((submissions || []).map(s => s.student_id));
      const pendingStudents = students.filter(s => !submittedIds.has(s.id));

      if (pendingStudents.length === 0) continue;

      // Get parents of pending students
      for (const student of pendingStudents) {
        const { data: parentLinks } = await supabase
          .from("student_parents")
          .select("parent:parents!inner(id, first_name, phone, email)")
          .eq("student_id", student.id);

        if (!parentLinks || parentLinks.length === 0) continue;

        const dueDate = new Date(assignment.due_date).toLocaleDateString("en-KE", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });

        const message = `📚 ${assignment.institution.name}: Assignment reminder for ${student.first_name}. "${assignment.title}" (${assignment.subject.name}) is due TOMORROW (${dueDate}). ${assignment.total_marks ? `Total marks: ${assignment.total_marks}.` : ""} Please ensure timely submission.`;

        for (const link of parentLinks) {
          const parent = link.parent as any;
          if (!parent) continue;

          // Check preference
          const { data: pref } = await supabase
            .from("notification_preferences")
            .select("is_opted_in")
            .eq("parent_id", parent.id)
            .eq("institution_id", assignment.institution_id)
            .eq("channel", "sms")
            .maybeSingle();

          if (pref && !pref.is_opted_in) continue;

          // Send SMS
          if (parent.phone && !assignment.institution.is_demo) {
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
                  messageType: "assignment_due",
                  smsType: "transactional",
                  institutionId: assignment.institution_id,
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

          // In-app notification
          await supabase.from("in_app_notifications").insert({
            institution_id: assignment.institution_id,
            parent_id: parent.id,
            user_type: "parent",
            title: `📚 Assignment Due Tomorrow`,
            message,
            type: "alert",
            reference_type: "assignment",
            reference_id: assignment.id,
          });
        }
      }
    }

    // Process overdue assignments (not submitted, past due date)
    const { data: overdue } = await supabase
      .from("assignments")
      .select(`
        id, title, due_date, class_id, subject_id, institution_id,
        subject:subjects!inner(name),
        institution:institutions!inner(id, name, is_demo)
      `)
      .lt("due_date", todayStr)
      .eq("status", "active");

    console.log(`Found ${overdue?.length || 0} overdue assignments`);

    // Only send overdue reminders once per week (Monday)
    const isMonday = today.getDay() === 1;
    
    if (isMonday && overdue) {
      for (const assignment of overdue as any[]) {
        const daysOverdue = Math.floor((today.getTime() - new Date(assignment.due_date).getTime()) / (1000 * 60 * 60 * 24));
        
        // Only remind if 1-14 days overdue
        if (daysOverdue < 1 || daysOverdue > 14) continue;

        const { data: students } = await supabase
          .from("students")
          .select("id, first_name")
          .eq("class_id", assignment.class_id)
          .eq("status", "active");

        const { data: submissions } = await supabase
          .from("assignment_submissions")
          .select("student_id")
          .eq("assignment_id", assignment.id);

        const submittedIds = new Set((submissions || []).map(s => s.student_id));
        const pendingStudents = (students || []).filter(s => !submittedIds.has(s.id));

        for (const student of pendingStudents) {
          const { data: parentLinks } = await supabase
            .from("student_parents")
            .select("parent:parents!inner(id, phone)")
            .eq("student_id", student.id);

          for (const link of (parentLinks || [])) {
            const parent = link.parent as any;
            if (!parent?.phone || assignment.institution.is_demo) continue;

            const message = `⚠️ ${assignment.institution.name}: "${assignment.title}" (${assignment.subject.name}) by ${student.first_name} is ${daysOverdue} days overdue. Please submit as soon as possible.`;

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
                  messageType: "assignment_overdue",
                  smsType: "transactional",
                  institutionId: assignment.institution_id,
                  recipientType: "parent",
                }),
              });
              totalSent++;
            } catch {
              totalFailed++;
            }
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
