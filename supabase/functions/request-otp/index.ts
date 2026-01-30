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

// Generate a 6-digit OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Hash the OTP using SHA-256
async function hashOtp(otp: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Fixed demo OTP for demo institutions
const DEMO_OTP = "123456";

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { phone, userType } = await req.json();

    if (!phone || !userType) {
      return new Response(
        JSON.stringify({ success: false, error: "Phone and userType are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["student", "parent"].includes(userType)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid userType" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formattedPhone = formatPhoneNumber(phone);
    console.log(`Requesting OTP for ${userType} with phone: ${formattedPhone}`);

    // Rate limiting: Check recent OTP requests (max 3 per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentCount } = await supabase
      .from("otp_codes")
      .select("*", { count: "exact", head: true })
      .eq("phone", formattedPhone)
      .gte("created_at", oneHourAgo);

    if (recentCount && recentCount >= 3) {
      return new Response(
        JSON.stringify({ success: false, error: "Too many OTP requests. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find the user by phone number
    let entities: { id: string; name: string; institution_id: string; admission_number?: string }[] = [];

    if (userType === "student") {
      // Step 1: Find parents with this phone number
      const localPhone = formattedPhone.startsWith('254') ? '0' + formattedPhone.substring(3) : formattedPhone;
      const { data: parents, error: parentError } = await supabase
        .from("parents")
        .select("id")
        .or(`phone.eq.${formattedPhone},phone.eq.+${formattedPhone},phone.eq.${localPhone}`);

      if (parentError) {
        console.error("Error finding parents by phone:", parentError);
      }

      // Step 2: Get linked students for those parents
      if (parents && parents.length > 0) {
        const parentIds = parents.map(p => p.id);
        console.log(`Found ${parents.length} parent(s), fetching linked students...`);
        
        const { data: links, error: linksError } = await supabase
          .from("student_parents")
          .select(`
            student:students (
              id,
              first_name,
              last_name,
              admission_number,
              institution_id
            )
          `)
          .in("parent_id", parentIds);

        if (linksError) {
          console.error("Error finding student links:", linksError);
        } else if (links) {
          for (const link of links) {
            const student = link.student as any;
            if (student) {
              entities.push({
                id: student.id,
                name: `${student.first_name} ${student.last_name}`,
                institution_id: student.institution_id,
                admission_number: student.admission_number,
              });
            }
          }
        }
      }
      console.log(`Found ${entities.length} linked student(s)`);
    } else {
      // Find parent directly by phone
      const localPhone = formattedPhone.startsWith('254') ? '0' + formattedPhone.substring(3) : formattedPhone;
      const { data: parents, error: parentError } = await supabase
        .from("parents")
        .select("id, first_name, last_name, institution_id")
        .or(`phone.eq.${formattedPhone},phone.eq.+${formattedPhone},phone.eq.${localPhone}`);

      if (parentError) {
        console.error("Error finding parents:", parentError);
        throw parentError;
      }

      if (parents && parents.length > 0) {
        entities = parents.map(p => ({
          id: p.id,
          name: `${p.first_name} ${p.last_name}`,
          institution_id: p.institution_id,
        }));
      }
    }

    if (entities.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "No account found with this phone number" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if this is a demo institution
    const institutionId = entities[0].institution_id;
    const { data: institution } = await supabase
      .from("institutions")
      .select("is_demo")
      .eq("id", institutionId)
      .single();

    const isDemo = institution?.is_demo === true;
    console.log(`Institution is_demo: ${isDemo}`);

    // Generate OTP (use fixed demo OTP for demo institutions)
    const otp = isDemo ? DEMO_OTP : generateOtp();
    const otpHash = await hashOtp(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    // Store OTP for each entity (in case of multiple students)
    for (const entity of entities) {
      await supabase.from("otp_codes").insert({
        phone: formattedPhone,
        code_hash: otpHash,
        user_type: userType,
        entity_id: entity.id,
        institution_id: entity.institution_id,
        expires_at: expiresAt,
      });
    }

    // Mask phone for response
    const maskedPhone = formattedPhone.replace(/(\d{3})\d{6}(\d{3})/, "$1******$2");

    // For demo institutions, skip SMS and return success immediately
    if (isDemo) {
      console.log(`Demo mode: Skipping SMS, using fixed OTP ${DEMO_OTP}`);
      return new Response(
        JSON.stringify({
          success: true,
          message: `Demo mode: Use OTP 123456`,
          maskedPhone,
          isDemo: true,
          demoOtp: DEMO_OTP,
          entities: entities.map(e => ({
            id: e.id,
            name: e.name,
            admissionNumber: e.admission_number,
          })),
          expiresIn: 300,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send OTP via SMS (only for non-demo institutions)
    const smsMessage = userType === "student"
      ? `Your Zira EduSuite student login code is ${otp}. Valid for 5 minutes. Do not share.`
      : `Your Zira EduSuite parent portal login code is ${otp}. Valid for 5 minutes. Do not share.`;

    console.log(`Sending OTP SMS to ${formattedPhone}...`);
    
    const { error: smsError } = await supabase.functions.invoke("send-sms", {
      body: {
        phones: [formattedPhone],
        message: smsMessage,
        messageType: "otp",
      },
    });

    if (smsError) {
      console.error("Error sending SMS:", smsError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to send OTP. Please try again.",
          maskedPhone,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`OTP sent successfully to ${maskedPhone}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `OTP sent to ${maskedPhone}`,
        maskedPhone,
        isDemo: false,
        entities: entities.map(e => ({
          id: e.id,
          name: e.name,
          admissionNumber: e.admission_number,
        })),
        expiresIn: 300, // 5 minutes in seconds
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in request-otp:", error);
    return new Response(
      JSON.stringify({ success: false, error: "An error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
