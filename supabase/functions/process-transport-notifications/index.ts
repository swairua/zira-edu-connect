import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type NotificationType = 
  | "route_change"
  | "bus_departed"
  | "pickup_complete"
  | "dropoff_complete"
  | "subscription_reminder"
  | "subscription_suspended";

interface TransportNotificationRequest {
  type: NotificationType;
  institutionId: string;
  routeId?: string;
  vehicleId?: string;
  studentIds?: string[];
  message?: string;
  metadata?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("process-transport-notifications invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const body: TransportNotificationRequest = await req.json();
    const { type, institutionId, routeId, vehicleId, studentIds, message: customMessage, metadata } = body;

    if (!institutionId || !type) {
      return new Response(
        JSON.stringify({ error: "institutionId and type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get institution details
    const { data: institution } = await supabase
      .from("institutions")
      .select("id, name, is_demo")
      .eq("id", institutionId)
      .single();

    if (!institution) {
      throw new Error("Institution not found");
    }

    let totalSent = 0;
    let totalFailed = 0;
    let targetStudentIds: string[] = studentIds || [];

    // Get students based on route if not provided directly
    if (!studentIds?.length && routeId) {
      const { data: subscriptions } = await supabase
        .from("transport_subscriptions")
        .select("student_id")
        .eq("route_id", routeId)
        .eq("status", "active");

      targetStudentIds = (subscriptions || []).map(s => s.student_id);
    }

    // Get route info if available
    let routeInfo: any = null;
    if (routeId) {
      const { data: route } = await supabase
        .from("transport_routes")
        .select("id, name, departure_time, arrival_time")
        .eq("id", routeId)
        .single();
      routeInfo = route;
    }

    // Get vehicle info if available
    let vehicleInfo: any = null;
    if (vehicleId) {
      const { data: vehicle } = await supabase
        .from("transport_vehicles")
        .select("id, registration_number, vehicle_type")
        .eq("id", vehicleId)
        .single();
      vehicleInfo = vehicle;
    }

    // Process each student
    for (const studentId of targetStudentIds) {
      const { data: student } = await supabase
        .from("students")
        .select("id, first_name, last_name")
        .eq("id", studentId)
        .single();

      if (!student) continue;

      const { data: parentLinks } = await supabase
        .from("student_parents")
        .select("parent:parents!inner(id, first_name, phone)")
        .eq("student_id", studentId);

      if (!parentLinks || parentLinks.length === 0) continue;

      // Build message based on type
      let notificationMessage = customMessage || "";
      let notificationTitle = "";

      switch (type) {
        case "bus_departed":
          notificationTitle = "🚌 Bus Departed";
          notificationMessage = `🚌 ${institution.name}: The school bus${routeInfo ? ` (${routeInfo.name})` : ""}${vehicleInfo ? ` - ${vehicleInfo.registration_number}` : ""} has departed. ${student.first_name} should be ready for pickup.`;
          break;

        case "pickup_complete":
          notificationTitle = "✅ Pickup Complete";
          notificationMessage = `✅ ${institution.name}: ${student.first_name} has been picked up and is on the way to school.${vehicleInfo ? ` Vehicle: ${vehicleInfo.registration_number}` : ""}`;
          break;

        case "dropoff_complete":
          notificationTitle = "🏠 Dropoff Complete";
          notificationMessage = `🏠 ${institution.name}: ${student.first_name} has been safely dropped off.`;
          break;

        case "route_change":
          notificationTitle = "🔄 Route Change";
          notificationMessage = customMessage || `🔄 ${institution.name}: Important - There has been a change to ${student.first_name}'s transport route${routeInfo ? ` (${routeInfo.name})` : ""}. Please check the Parent Portal for details.`;
          break;

        case "subscription_reminder":
          notificationTitle = "📅 Transport Fee Reminder";
          notificationMessage = customMessage || `📅 ${institution.name}: Transport subscription for ${student.first_name} is due for renewal. Please make payment to continue the service.`;
          break;

        case "subscription_suspended":
          notificationTitle = "⚠️ Transport Suspended";
          notificationMessage = customMessage || `⚠️ ${institution.name}: Transport service for ${student.first_name} has been suspended due to non-payment. Please clear outstanding fees to resume.`;
          break;

        default:
          notificationMessage = customMessage || `${institution.name}: Transport notification for ${student.first_name}.`;
          notificationTitle = "🚌 Transport Update";
      }

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
          // Send SMS for critical notifications
          const criticalTypes: NotificationType[] = ["bus_departed", "pickup_complete", "dropoff_complete", "route_change", "subscription_suspended"];
          
          if (parent.phone && !institution.is_demo && criticalTypes.includes(type)) {
            try {
              const smsResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-sms`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                },
                body: JSON.stringify({
                  phones: [parent.phone],
                  message: notificationMessage,
                  messageType: `transport_${type}`,
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

        // Always create in-app notification
        await supabase.from("in_app_notifications").insert({
          institution_id: institutionId,
          parent_id: parent.id,
          user_type: "parent",
          title: notificationTitle,
          message: notificationMessage,
          type: type === "subscription_suspended" ? "alert" : "info",
          reference_type: "transport",
          reference_id: routeId || vehicleId || studentId,
        });
      }

      // Log communication event
      await supabase.from("communication_events").insert({
        institution_id: institutionId,
        event_type: `transport_${type}`,
        trigger_source: "realtime",
        student_id: studentId,
        reference_type: "transport",
        reference_id: routeId || vehicleId,
        channels_used: institution.is_demo ? ["in_app"] : ["sms", "in_app"],
        message_content: notificationMessage,
        status: "sent",
        metadata: {
          notification_type: type,
          route_id: routeId,
          vehicle_id: vehicleId,
          ...metadata,
        },
        processed_at: new Date().toISOString(),
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: totalSent, 
        failed: totalFailed,
        students_notified: targetStudentIds.length,
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
