import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AttendanceRecord {
  id: string;
  student_id: string;
  status: string;
  date: string;
  notes: string | null;
  class_id: string;
}

interface Parent {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("==== ATTENDANCE ALERTS START ====");
  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendFromEmail = Deno.env.get("RESEND_FROM_EMAIL");
    const resendFromName = Deno.env.get("RESEND_FROM_NAME") || "Zira EduSuite";
    const robermsToken = Deno.env.get("ROBERMS_API_TOKEN");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    // Parse request body
    let body: {
      institutionId?: string;
      attendanceIds?: string[];
      mode?: "realtime" | "batch";
    } = {};
    
    try {
      body = await req.json();
    } catch {
      // No body - use defaults
    }

    const { institutionId, attendanceIds, mode = "batch" } = body;

    const today = new Date().toISOString().split("T")[0];
    console.log(`Processing attendance alerts for ${today}, mode: ${mode}`);

    // Build query for attendance records
    let query = supabase
      .from("attendance")
      .select(`
        id,
        student_id,
        status,
        date,
        notes,
        class_id,
        student:students(
          id,
          first_name,
          last_name,
          admission_number,
          institution_id,
          institution:institutions(id, name, is_demo),
          class:classes(name)
        )
      `)
      .in("status", ["absent", "late"])
      .eq("date", today);

    if (institutionId) {
      query = query.eq("institution_id", institutionId);
    }

    if (attendanceIds && attendanceIds.length > 0) {
      query = query.in("id", attendanceIds);
    }

    const { data: attendanceRecords, error: attendanceError } = await query;

    if (attendanceError) {
      console.error("Error fetching attendance:", attendanceError);
      throw new Error(`Failed to fetch attendance: ${attendanceError.message}`);
    }

    console.log(`Found ${attendanceRecords?.length || 0} absent/late records for today`);

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No absence/late records to process", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = {
      total: attendanceRecords.length,
      absent_sms: 0,
      late_sms: 0,
      email_sent: 0,
      skipped: 0,
      errors: [] as string[],
    };

    // Process each attendance record
    for (const record of attendanceRecords) {
      const student = record.student as any;
      if (!student) {
        results.skipped++;
        continue;
      }

      const studentName = `${student.first_name} ${student.last_name}`;
      const institution = student.institution as any;
      const className = student.class?.name || "Unknown Class";
      const admissionNo = student.admission_number || "";
      
      const notifCategory = record.status === "absent" ? "attendance_absent" : "attendance_late";

      // Check institution notification settings
      const { data: notifSettings } = await supabase
        .from("institution_notification_settings")
        .select("is_enabled, channels, custom_template")
        .eq("institution_id", student.institution_id)
        .eq("category", notifCategory)
        .maybeSingle();

      // Skip if notifications are explicitly disabled
      if (notifSettings?.is_enabled === false) {
        console.log(`${notifCategory} notifications disabled for institution ${institution.name}`);
        results.skipped++;
        continue;
      }

      // Determine which channels to use
      const enabledChannels = notifSettings?.channels || ["sms", "in_app"];

      // Check if already notified today for this record
      const { data: existingEvent } = await supabase
        .from("communication_events")
        .select("id")
        .eq("reference_id", record.id)
        .eq("event_type", record.status === "absent" ? "attendance_absent" : "attendance_late")
        .maybeSingle();

      if (existingEvent) {
        console.log(`Alert already sent for ${studentName}'s ${record.status} record`);
        results.skipped++;
        continue;
      }

      // Get parents for this student
      const { data: parentLinks } = await supabase
        .from("student_parents")
        .select(`
          parent:parents(id, first_name, last_name, phone, email)
        `)
        .eq("student_id", student.id);

      const parents = (parentLinks || [])
        .map((link: any) => link.parent)
        .filter((p: Parent | null) => p !== null) as Parent[];

      if (parents.length === 0) {
        console.log(`No parents found for ${studentName}`);
        results.skipped++;
        continue;
      }

      // Format date for display
      const displayDate = new Date(record.date).toLocaleDateString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      for (const parent of parents) {
        const parentName = `${parent.first_name} ${parent.last_name}`;

        // Check SMS preference
        const { data: smsPref } = await supabase
          .from("notification_preferences")
          .select("is_opted_in")
          .eq("parent_id", parent.id)
          .eq("institution_id", student.institution_id)
          .eq("channel", "sms")
          .maybeSingle();

        const smsOptedIn = smsPref?.is_opted_in !== false;

        // Check rate limit (max 3 SMS per day)
        const { data: rateLimit } = await supabase
          .from("notification_rate_limits")
          .select("count")
          .eq("institution_id", student.institution_id)
          .eq("recipient_type", "parent")
          .eq("recipient_id", parent.id)
          .eq("channel", "sms")
          .eq("notification_date", today)
          .maybeSingle();

        const dailySmsCount = rateLimit?.count || 0;
        const withinRateLimit = dailySmsCount < 3;

        // Construct messages
        let smsMessage: string;
        let emailSubject: string;
        let statusEmoji: string;
        let statusColor: string;

        if (record.status === "absent") {
          smsMessage = `Dear ${parent.first_name}, ${institution.name} notes that ${student.first_name} (${className}) was marked ABSENT today, ${new Date().toLocaleDateString("en-GB")}. Please contact the school if this is unexpected.`;
          emailSubject = `⚠️ Absence Alert: ${student.first_name} - ${institution.name}`;
          statusEmoji = "⚠️";
          statusColor = "#dc2626";
        } else {
          smsMessage = `Dear ${parent.first_name}, ${institution.name} notes that ${student.first_name} (${className}) arrived LATE today. Kindly ensure timely arrival.`;
          emailSubject = `⏰ Late Arrival: ${student.first_name} - ${institution.name}`;
          statusEmoji = "⏰";
          statusColor = "#f59e0b";
        }

        const emailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: ${statusColor}; padding: 24px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">${statusEmoji} Attendance Alert</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear ${parentName},</p>
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                We would like to inform you that <strong>${studentName}</strong> was marked as 
                <strong style="color: ${statusColor};">${record.status.toUpperCase()}</strong> on ${displayDate}.
              </p>
              <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <table style="width: 100%; font-size: 14px; color: #374151;">
                  <tr><td style="padding: 4px 0;"><strong>Student:</strong></td><td>${studentName}</td></tr>
                  <tr><td style="padding: 4px 0;"><strong>Class:</strong></td><td>${className}</td></tr>
                  ${admissionNo ? `<tr><td style="padding: 4px 0;"><strong>Adm No:</strong></td><td>${admissionNo}</td></tr>` : ""}
                  <tr><td style="padding: 4px 0;"><strong>Date:</strong></td><td>${displayDate}</td></tr>
                  <tr><td style="padding: 4px 0;"><strong>Status:</strong></td><td style="color: ${statusColor}; font-weight: bold;">${record.status.toUpperCase()}</td></tr>
                  ${record.notes ? `<tr><td style="padding: 4px 0;"><strong>Notes:</strong></td><td>${record.notes}</td></tr>` : ""}
                </table>
              </div>
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                ${record.status === "absent" 
                  ? "If you believe this is an error or if you have any concerns, please contact the school administration immediately."
                  : "We kindly request that you ensure your child arrives at school on time. Punctuality is important for academic success."}
              </p>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Best regards,<br>
                <strong>${institution.name}</strong>
              </p>
            </div>
          </div>
        `;

        const channelsUsed: string[] = [];

        // Send SMS (skip for demo institutions, respect rate limits and channel settings)
        if (smsOptedIn && parent.phone && robermsToken && !institution.is_demo && withinRateLimit && enabledChannels.includes("sms")) {
          try {
            const smsResponse = await fetch(`${supabaseUrl}/functions/v1/send-sms`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({
                phones: parent.phone,
                message: smsMessage,
                messageType: record.status === "absent" ? "attendance_absent" : "attendance_late",
                smsType: "transactional",
                institutionId: student.institution_id,
                recipientName: parentName,
                recipientType: "parent",
              }),
            });

            if (smsResponse.ok) {
              if (record.status === "absent") {
                results.absent_sms++;
              } else {
                results.late_sms++;
              }
              channelsUsed.push("sms");
              console.log(`SMS sent to ${parentName} for ${studentName}'s ${record.status}`);

              // Update rate limit
              await supabase
                .from("notification_rate_limits")
                .upsert({
                  institution_id: student.institution_id,
                  recipient_type: "parent",
                  recipient_id: parent.id,
                  channel: "sms",
                  notification_date: today,
                  count: dailySmsCount + 1,
                  last_sent_at: new Date().toISOString(),
                }, { onConflict: "institution_id,recipient_type,recipient_id,channel,notification_date" });
            }
          } catch (smsError) {
            console.error(`SMS failed for ${parentName}:`, smsError);
            results.errors.push(`SMS to ${parentName}: ${smsError}`);
          }
        }

        // Send Email (respect channel settings)
        if (parent.email && resend && resendFromEmail && enabledChannels.includes("email")) {
          try {
            await resend.emails.send({
              from: `${resendFromName} <${resendFromEmail}>`,
              to: [parent.email],
              subject: emailSubject,
              html: emailHtml,
            });
            results.email_sent++;
            channelsUsed.push("email");
            console.log(`Email sent to ${parentName} for ${studentName}'s ${record.status}`);
          } catch (emailError) {
            console.error(`Email failed for ${parentName}:`, emailError);
            results.errors.push(`Email to ${parentName}: ${emailError}`);
          }
        }

        // Log communication event
        if (channelsUsed.length > 0) {
          await supabase.from("communication_events").insert({
            institution_id: student.institution_id,
            event_type: record.status === "absent" ? "attendance_absent" : "attendance_late",
            trigger_source: mode,
            student_id: student.id,
            parent_id: parent.id,
            reference_type: "attendance",
            reference_id: record.id,
            channels_used: channelsUsed,
            message_content: smsMessage,
            status: "sent",
            metadata: { 
              class_name: className,
              attendance_date: record.date,
              notes: record.notes,
            },
            processed_at: new Date().toISOString(),
          });
        }
      }
    }

    const duration = Date.now() - startTime;
    console.log(`Attendance alerts completed in ${duration}ms`);
    console.log(`Results: ${results.absent_sms} absent SMS, ${results.late_sms} late SMS, ${results.email_sent} emails, ${results.skipped} skipped`);
    console.log("==== ATTENDANCE ALERTS END ====");

    return new Response(
      JSON.stringify({
        success: true,
        ...results,
        duration_ms: duration,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in attendance alerts:", error);
    console.log("==== ATTENDANCE ALERTS END (ERROR) ====");
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Internal server error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
