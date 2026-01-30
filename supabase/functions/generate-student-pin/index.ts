import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { studentId, sendSms } = await req.json();

    if (!studentId) {
      return new Response(
        JSON.stringify({ error: "Student ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate 6-digit PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash the PIN for storage (simple hash for demo - in production use bcrypt)
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const pinHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    // Set expiry to 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Update student with PIN
    const { error: updateError } = await supabase
      .from("students")
      .update({
        login_pin: pinHash,
        pin_expires_at: expiresAt,
        pin_attempts: 0,
        portal_enabled: true,
      })
      .eq("id", studentId);

    if (updateError) {
      console.error("Error updating student:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to generate PIN" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get student and parent info for SMS
    if (sendSms) {
      const { data: student } = await supabase
        .from("students")
        .select(`
          first_name,
          last_name,
          admission_number,
          institution_id,
          institution:institutions(name, code)
        `)
        .eq("id", studentId)
        .single();

      const { data: parentLinks } = await supabase
        .from("student_parents")
        .select("parent:parents(phone, first_name)")
        .eq("student_id", studentId)
        .limit(1);

      if (parentLinks && parentLinks.length > 0 && parentLinks[0].parent) {
        const parentData = parentLinks[0].parent as unknown as { phone: string; first_name: string };
        const institutionData = student?.institution as unknown as { name: string; code: string } | null;
        
        if (parentData.phone) {
          // Compose the SMS message
          const message = `Dear ${parentData.first_name}, your child ${student?.first_name}'s portal PIN is ${pin}. Institution: ${institutionData?.code}, Admission: ${student?.admission_number}. Valid for 24hrs.`;

          // Call the send-sms function
          const { error: smsError } = await supabase.functions.invoke("send-sms", {
            body: {
              phones: parentData.phone,
              message,
              messageType: "pin_delivery",
              institutionId: student?.institution_id,
              recipientName: parentData.first_name,
              recipientType: "parent"
            }
          });

          if (smsError) {
            console.error("Error sending SMS:", smsError);
            // Don't fail the whole operation if SMS fails, just log it
          } else {
            console.log(`PIN SMS sent to ${parentData.phone}`);
          }
        } else {
          console.log("No phone number available for parent");
        }
      } else {
        console.log("No parent linked to student for SMS delivery");
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        pin: sendSms ? undefined : pin, // Only return PIN if not sending SMS
        expiresAt,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-student-pin:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
