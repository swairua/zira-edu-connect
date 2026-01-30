import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Format phone number to Kenyan format (254...)
function formatPhoneNumber(phone: string): string {
  let cleaned = phone.trim().replace(/[\s-]/g, '');
  
  if (cleaned.startsWith('+254')) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  } else if (cleaned.startsWith('254')) {
    // Already correct
  } else if (/^\d{9}$/.test(cleaned.replace(/\D/g, ''))) {
    cleaned = '254' + cleaned;
  }
  
  cleaned = cleaned.replace(/\D/g, '');
  return cleaned;
}

// Hash the OTP using SHA-256
async function hashOtp(otp: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Generate a secure session token
function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { phone, code, userType, entityId } = await req.json();

    if (!phone || !code || !userType) {
      return new Response(
        JSON.stringify({ success: false, error: "Phone, code, and userType are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formattedPhone = formatPhoneNumber(phone);
    const codeHash = await hashOtp(code);
    console.log(`Verifying OTP for ${userType} with phone: ${formattedPhone}`);

    // Find matching OTP record
    let query = supabase
      .from("otp_codes")
      .select("*")
      .eq("phone", formattedPhone)
      .eq("user_type", userType)
      .eq("verified", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (entityId) {
      query = query.eq("entity_id", entityId);
    }

    const { data: otpRecords, error: otpError } = await query.limit(1);

    if (otpError) {
      console.error("Error finding OTP:", otpError);
      throw otpError;
    }

    if (!otpRecords || otpRecords.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "OTP expired or not found. Please request a new one." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const otpRecord = otpRecords[0];

    // Check attempts (max 3)
    if (otpRecord.attempts >= 3) {
      return new Response(
        JSON.stringify({ success: false, error: "Too many failed attempts. Please request a new OTP." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the code
    if (otpRecord.code_hash !== codeHash) {
      // Increment attempts
      await supabase
        .from("otp_codes")
        .update({ attempts: otpRecord.attempts + 1 })
        .eq("id", otpRecord.id);

      return new Response(
        JSON.stringify({ success: false, error: "Invalid OTP. Please try again." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark OTP as verified
    await supabase
      .from("otp_codes")
      .update({ verified: true })
      .eq("id", otpRecord.id);

    // Create session based on user type
    const sessionToken = generateSessionToken();
    const tokenHash = await hashOtp(sessionToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    let userData: any = null;
    let institutionData: any = null;

    if (userType === "student") {
      // Get student data
      const { data: student, error: studentError } = await supabase
        .from("students")
        .select(`
          id,
          first_name,
          last_name,
          admission_number,
          institution_id,
          class_id
        `)
        .eq("id", otpRecord.entity_id)
        .single();

      if (studentError || !student) {
        console.error("Error fetching student:", studentError);
        return new Response(
          JSON.stringify({ success: false, error: "Student not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get class info separately
      let className = null;
      let classLevel = null;
      if (student.class_id) {
        const { data: classData } = await supabase
          .from("classes")
          .select("id, name, level")
          .eq("id", student.class_id)
          .single();
        if (classData) {
          className = classData.name;
          classLevel = classData.level;
        }
      }

      // Get institution
      const { data: institution } = await supabase
        .from("institutions")
        .select("id, name, code")
        .eq("id", student.institution_id)
        .single();

      // Create student session
      await supabase.from("student_sessions").insert({
        student_id: student.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
        ip_address: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip"),
        user_agent: req.headers.get("user-agent"),
      });

      userData = {
        id: student.id,
        firstName: student.first_name,
        lastName: student.last_name,
        admissionNumber: student.admission_number,
        className,
        classLevel,
        institutionId: student.institution_id,
      };
      institutionData = institution;
    } else {
      // Get parent data
      const { data: parent, error: parentError } = await supabase
        .from("parents")
        .select("id, first_name, last_name, email, phone, institution_id")
        .eq("id", otpRecord.entity_id)
        .single();

      if (parentError || !parent) {
        console.error("Error fetching parent:", parentError);
        return new Response(
          JSON.stringify({ success: false, error: "Parent not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get institution
      const { data: institution } = await supabase
        .from("institutions")
        .select("id, name, code")
        .eq("id", parent.institution_id)
        .single();

      // Update parent last login
      await supabase
        .from("parents")
        .update({ last_login_at: new Date().toISOString(), portal_enabled: true })
        .eq("id", parent.id);

      // Create parent session
      await supabase.from("parent_sessions").insert({
        parent_id: parent.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
        ip_address: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip"),
        user_agent: req.headers.get("user-agent"),
      });

      userData = {
        id: parent.id,
        firstName: parent.first_name,
        lastName: parent.last_name,
        email: parent.email,
        phone: parent.phone,
        institutionId: parent.institution_id,
      };
      institutionData = institution;
    }

    // Cleanup old OTPs for this phone
    await supabase
      .from("otp_codes")
      .delete()
      .eq("phone", formattedPhone)
      .lt("expires_at", new Date().toISOString());

    return new Response(
      JSON.stringify({
        success: true,
        token: sessionToken,
        expiresAt,
        userType,
        user: userData,
        institution: institutionData,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in verify-otp:", error);
    return new Response(
      JSON.stringify({ success: false, error: "An error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
