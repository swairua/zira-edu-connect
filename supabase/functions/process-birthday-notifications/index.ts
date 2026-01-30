import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BirthdayStudent {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  class_id: string;
  institution_id: string;
  institution: {
    id: string;
    name: string;
    is_demo: boolean;
  } | null;
  class: {
    name: string;
  };
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

  console.log("==== BIRTHDAY NOTIFICATIONS START ====");
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

    // Parse optional institutionId from request body
    let institutionId: string | null = null;
    try {
      const body = await req.json();
      institutionId = body.institutionId || null;
    } catch {
      // No body or invalid JSON - process all institutions
    }

    // Get today's date (month and day only for birthday matching)
    const today = new Date();
    const todayMonth = today.getMonth() + 1; // 1-12
    const todayDay = today.getDate();

    console.log(`Processing birthdays for ${todayMonth}/${todayDay}`);

    // Find students with birthdays today
    let query = supabase
      .from("students")
      .select(`
        id,
        first_name,
        last_name,
        date_of_birth,
        class_id,
        institution_id,
        institution:institutions(id, name, is_demo),
        class:classes(name)
      `)
      .not("date_of_birth", "is", null);

    if (institutionId) {
      query = query.eq("institution_id", institutionId);
    }

    const { data: allStudents, error: studentsError } = await query;

    if (studentsError) {
      console.error("Error fetching students:", studentsError);
      throw new Error(`Failed to fetch students: ${studentsError.message}`);
    }

    // Filter students whose birthday is today
    const birthdayStudents = (allStudents || []).filter((student: any) => {
      if (!student.date_of_birth) return false;
      const dob = new Date(student.date_of_birth);
      return dob.getMonth() + 1 === todayMonth && dob.getDate() === todayDay;
    }) as unknown as BirthdayStudent[];

    console.log(`Found ${birthdayStudents.length} students with birthdays today`);

    if (birthdayStudents.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No birthdays today", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = {
      total: birthdayStudents.length,
      sms_sent: 0,
      email_sent: 0,
      skipped: 0,
      errors: [] as string[],
    };

    // Process each birthday student
    for (const student of birthdayStudents) {
      const studentName = `${student.first_name} ${student.last_name}`;
      const institution = student.institution as any;
      const className = (student.class as any)?.name || "Unknown Class";
      const age = today.getFullYear() - new Date(student.date_of_birth).getFullYear();

      console.log(`Processing birthday for ${studentName} (Age: ${age}, Class: ${className})`);

      // Check institution notification settings
      const { data: notifSettings } = await supabase
        .from("institution_notification_settings")
        .select("is_enabled, channels, custom_template")
        .eq("institution_id", student.institution_id)
        .eq("category", "birthday")
        .maybeSingle();

      // Skip if notifications are explicitly disabled for this institution
      if (notifSettings?.is_enabled === false) {
        console.log(`Birthday notifications disabled for institution ${institution.name}`);
        results.skipped++;
        continue;
      }

      // Determine which channels to use (default to sms and in_app)
      const enabledChannels = notifSettings?.channels || ["sms", "in_app"];

      // Check if already sent today (prevent duplicates)
      const { data: existingEvent } = await supabase
        .from("communication_events")
        .select("id")
        .eq("student_id", student.id)
        .eq("event_type", "birthday")
        .gte("created_at", new Date(today.setHours(0, 0, 0, 0)).toISOString())
        .maybeSingle();

      if (existingEvent) {
        console.log(`Birthday notification already sent for ${studentName} today`);
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

      // Check notification preferences and send
      for (const parent of parents) {
        const parentName = `${parent.first_name} ${parent.last_name}`;

        // Check if parent has opted in for SMS
        const { data: smsPref } = await supabase
          .from("notification_preferences")
          .select("is_opted_in")
          .eq("parent_id", parent.id)
          .eq("institution_id", student.institution_id)
          .eq("channel", "sms")
          .maybeSingle();

        const smsOptedIn = smsPref?.is_opted_in !== false; // Default to true if no preference

        // Birthday message - use custom template if available
        const defaultTemplate = `🎂 Happy Birthday {student_name}! {school_name} wishes {student_name} a wonderful {age}th birthday today. May this special day bring joy and happiness!`;
        const template = notifSettings?.custom_template || defaultTemplate;
        const smsMessage = template
          .replace(/{student_name}/g, student.first_name)
          .replace(/{school_name}/g, institution.name)
          .replace(/{age}/g, String(age));
        
        const emailSubject = `🎂 Happy Birthday ${student.first_name}!`;
        const emailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #f472b6 0%, #c084fc 100%); padding: 40px; border-radius: 16px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 48px;">🎂</h1>
              <h1 style="color: white; margin: 16px 0 8px; font-size: 28px;">Happy Birthday!</h1>
              <p style="color: white; font-size: 24px; margin: 0; font-weight: 600;">${student.first_name} ${student.last_name}</p>
            </div>
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 16px 16px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear ${parentName},</p>
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                On behalf of everyone at <strong>${institution.name}</strong>, we would like to wish 
                <strong>${student.first_name}</strong> a very happy <strong>${age}th birthday</strong>!
              </p>
              <div style="background: #fdf2f8; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <p style="margin: 0; font-size: 18px; color: #9333ea;">
                  🎈 Wishing ${student.first_name} a day filled with joy, laughter, and wonderful memories! 🎈
                </p>
              </div>
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                We are honored to be part of ${student.first_name}'s educational journey in <strong>${className}</strong>.
              </p>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Warm regards,<br>
                <strong>${institution.name}</strong>
              </p>
            </div>
          </div>
        `;

        const channelsUsed: string[] = [];

        // Send SMS (skip for demo institutions, respect channel settings)
        if (smsOptedIn && parent.phone && robermsToken && !institution.is_demo && enabledChannels.includes("sms")) {
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
                messageType: "birthday",
                smsType: "promotional",
                institutionId: student.institution_id,
                recipientName: parentName,
                recipientType: "parent",
              }),
            });

            if (smsResponse.ok) {
              results.sms_sent++;
              channelsUsed.push("sms");
              console.log(`SMS sent to ${parentName} for ${studentName}'s birthday`);
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
            console.log(`Email sent to ${parentName} for ${studentName}'s birthday`);
          } catch (emailError) {
            console.error(`Email failed for ${parentName}:`, emailError);
            results.errors.push(`Email to ${parentName}: ${emailError}`);
          }
        }

        // Log communication event
        if (channelsUsed.length > 0) {
          await supabase.from("communication_events").insert({
            institution_id: student.institution_id,
            event_type: "birthday",
            trigger_source: "scheduled",
            student_id: student.id,
            parent_id: parent.id,
            channels_used: channelsUsed,
            message_content: smsMessage,
            status: "sent",
            metadata: { age, class_name: className },
            processed_at: new Date().toISOString(),
          });
        }
      }
    }

    const duration = Date.now() - startTime;
    console.log(`Birthday notifications completed in ${duration}ms`);
    console.log(`Results: ${results.sms_sent} SMS, ${results.email_sent} emails sent, ${results.skipped} skipped`);
    console.log("==== BIRTHDAY NOTIFICATIONS END ====");

    return new Response(
      JSON.stringify({
        success: true,
        ...results,
        duration_ms: duration,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in birthday notifications:", error);
    console.log("==== BIRTHDAY NOTIFICATIONS END (ERROR) ====");
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Internal server error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
