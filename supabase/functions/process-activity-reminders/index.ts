import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ActivityEvent {
  id: string;
  activity_id: string;
  event_name: string;
  event_date: string;
  event_type: string;
  location: string | null;
  start_time: string | null;
  description: string | null;
  institution_id: string;
  activity: {
    id: string;
    name: string;
    category: string;
    requires_fee: boolean;
    fee_amount: number | null;
  };
  institution: {
    id: string;
    name: string;
    currency: string;
    is_demo: boolean;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log("process-activity-reminders invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const reminderDays = [7, 3, 1, 0]; // Remind 7, 3, 1 days before and on event day
    let totalSent = 0;
    let totalFailed = 0;

    for (const daysAhead of reminderDays) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + daysAhead);
      const targetDateStr = targetDate.toISOString().split("T")[0];

      // Get events on target date
      const { data: events, error: eventsError } = await supabase
        .from("activity_events")
        .select(`
          id, activity_id, event_name, event_date, event_type, location, start_time, description, institution_id,
          activity:activities!inner(id, name, category, requires_fee, fee_amount),
          institution:institutions!inner(id, name, currency, is_demo)
        `)
        .eq("event_date", targetDateStr)
        .eq("status", "scheduled");

      if (eventsError) {
        console.error("Error fetching events:", eventsError);
        continue;
      }

      console.log(`Found ${events?.length || 0} events in ${daysAhead} days`);

      for (const event of (events || []) as unknown as ActivityEvent[]) {
        // Check institution notification settings
        const { data: notifSettings } = await supabase
          .from("institution_notification_settings")
          .select("is_enabled, channels, custom_template")
          .eq("institution_id", event.institution_id)
          .eq("category", "activity_reminder")
          .maybeSingle();

        // Skip if notifications are explicitly disabled
        if (notifSettings?.is_enabled === false) {
          console.log(`Activity reminders disabled for institution ${event.institution.name}`);
          continue;
        }

        const enabledChannels = notifSettings?.channels || ["sms", "in_app"];

        // Get enrolled students for this activity
        const { data: enrollments } = await supabase
          .from("activity_enrollments")
          .select("student_id")
          .eq("activity_id", event.activity_id)
          .eq("status", "active");

        if (!enrollments || enrollments.length === 0) continue;

        const studentIds = enrollments.map(e => e.student_id);

        // Get parents of enrolled students
        const { data: parentLinks } = await supabase
          .from("student_parents")
          .select(`
            student_id,
            student:students!inner(id, first_name, last_name),
            parent:parents!inner(id, first_name, last_name, phone, email)
          `)
          .in("student_id", studentIds);

        if (!parentLinks || parentLinks.length === 0) continue;

        const eventDate = new Date(event.event_date).toLocaleDateString("en-KE", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const timeInfo = event.start_time 
          ? ` at ${event.start_time}` 
          : "";
        const locationInfo = event.location 
          ? ` | Location: ${event.location}` 
          : "";

        let dayText: string;
        if (daysAhead === 0) {
          dayText = "TODAY";
        } else if (daysAhead === 1) {
          dayText = "TOMORROW";
        } else {
          dayText = `in ${daysAhead} days`;
        }

        // Group by parent to avoid duplicate messages
        const parentMap = new Map<string, { parent: any; students: string[] }>();
        
        for (const link of parentLinks) {
          const parent = link.parent as any;
          const student = link.student as any;
          
          if (!parent) continue;

          if (!parentMap.has(parent.id)) {
            parentMap.set(parent.id, { parent, students: [] });
          }
          parentMap.get(parent.id)!.students.push(student.first_name);
        }

        for (const [parentId, { parent, students }] of parentMap) {
          const studentNames = students.length > 1 
            ? students.slice(0, -1).join(", ") + " and " + students[students.length - 1]
            : students[0];

          const message = `📅 ${event.institution.name}: ${event.event_name} (${event.activity.name}) is ${dayText} - ${eventDate}${timeInfo}${locationInfo}. Student(s): ${studentNames}. ${event.description ? `Details: ${event.description}` : ""}`;

          // Check SMS preference
          const { data: pref } = await supabase
            .from("notification_preferences")
            .select("is_opted_in")
            .eq("parent_id", parentId)
            .eq("institution_id", event.institution_id)
            .eq("channel", "sms")
            .maybeSingle();

          if (pref && !pref.is_opted_in) continue;

          // Send SMS (respect channel settings)
          if (parent.phone && !event.institution.is_demo && enabledChannels.includes("sms")) {
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
                  messageType: "activity_reminder",
                  smsType: "transactional",
                  institutionId: event.institution_id,
                  recipientType: "parent",
                }),
              });

              if (smsResponse.ok) {
                totalSent++;
              } else {
                totalFailed++;
              }
            } catch (err) {
              console.error("SMS error:", err);
              totalFailed++;
            }
          }

          // Create in-app notification
          await supabase.from("in_app_notifications").insert({
            institution_id: event.institution_id,
            parent_id: parentId,
            user_type: "parent",
            title: daysAhead === 0 ? `🎯 ${event.event_name} - TODAY` : `📅 Upcoming: ${event.event_name}`,
            message,
            type: "info",
            reference_type: "activity_event",
            reference_id: event.id,
          });

          // Log communication event
          await supabase.from("communication_events").insert({
            institution_id: event.institution_id,
            event_type: "activity_reminder",
            trigger_source: "scheduled",
            parent_id: parentId,
            reference_type: "activity_event",
            reference_id: event.id,
            channels_used: parent.phone && !event.institution.is_demo ? ["sms", "in_app"] : ["in_app"],
            message_content: message,
            status: "sent",
            metadata: {
              days_before: daysAhead,
              event_name: event.event_name,
              activity_name: event.activity.name,
              students: students,
            },
            processed_at: new Date().toISOString(),
          });
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
