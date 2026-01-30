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

    const { institutionCode, admissionNumber, pin } = await req.json();

    if (!institutionCode || !admissionNumber || !pin) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find institution by code
    const { data: institution, error: instError } = await supabase
      .from("institutions")
      .select("id, name")
      .eq("code", institutionCode.toUpperCase())
      .single();

    if (instError || !institution) {
      return new Response(
        JSON.stringify({ error: "Invalid institution code" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find student by admission number and institution
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select(`
        id,
        first_name,
        last_name,
        admission_number,
        login_pin,
        pin_expires_at,
        pin_attempts,
        portal_enabled,
        class_id,
        classes(name, level)
      `)
      .eq("institution_id", institution.id)
      .eq("admission_number", admissionNumber)
      .is("deleted_at", null)
      .single();

    if (studentError || !student) {
      return new Response(
        JSON.stringify({ error: "Invalid credentials" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if portal is enabled
    if (!student.portal_enabled) {
      return new Response(
        JSON.stringify({ error: "Portal access not enabled" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if account is locked (5+ failed attempts)
    if (student.pin_attempts >= 5) {
      return new Response(
        JSON.stringify({ error: "Account locked. Contact administrator." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check PIN expiry
    if (!student.pin_expires_at || new Date(student.pin_expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "PIN expired. Request a new one." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Hash the provided PIN and compare
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const pinHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    if (pinHash !== student.login_pin) {
      // Increment failed attempts
      await supabase
        .from("students")
        .update({ pin_attempts: student.pin_attempts + 1 })
        .eq("id", student.id);

      return new Response(
        JSON.stringify({ error: "Invalid credentials" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Reset attempts on successful login
    await supabase
      .from("students")
      .update({ pin_attempts: 0 })
      .eq("id", student.id);

    // Generate session token
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const sessionToken = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, "0")).join("");

    // Hash token for storage
    const tokenData = encoder.encode(sessionToken);
    const tokenHashBuffer = await crypto.subtle.digest("SHA-256", tokenData);
    const tokenHashArray = Array.from(new Uint8Array(tokenHashBuffer));
    const tokenHash = tokenHashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    // Create session (expires in 7 days)
    const sessionExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    
    await supabase.from("student_sessions").insert({
      student_id: student.id,
      token_hash: tokenHash,
      expires_at: sessionExpires,
      ip_address: req.headers.get("x-forwarded-for") || "unknown",
      user_agent: req.headers.get("user-agent") || "unknown",
    });

    const classInfo = student.classes as unknown as { name: string; level: string } | null;

    return new Response(
      JSON.stringify({
        success: true,
        token: sessionToken,
        expiresAt: sessionExpires,
        student: {
          id: student.id,
          firstName: student.first_name,
          lastName: student.last_name,
          admissionNumber: student.admission_number,
          className: classInfo?.name || null,
          classLevel: classInfo?.level || null,
        },
        institution: {
          id: institution.id,
          name: institution.name,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in student-pin-login:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
