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

    // Get token from Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ valid: false, error: "No token provided" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Hash the token
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const tokenHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    // Find session
    const { data: session, error: sessionError } = await supabase
      .from("student_sessions")
      .select("student_id, expires_at")
      .eq("token_hash", tokenHash)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiry
    if (new Date(session.expires_at) < new Date()) {
      // Delete expired session
      await supabase
        .from("student_sessions")
        .delete()
        .eq("token_hash", tokenHash);

      return new Response(
        JSON.stringify({ valid: false, error: "Session expired" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get student info
    const { data: student } = await supabase
      .from("students")
      .select(`
        id,
        first_name,
        last_name,
        admission_number,
        institution_id,
        class_id,
        classes(name, level),
        institutions(id, name, code)
      `)
      .eq("id", session.student_id)
      .single();

    if (!student) {
      return new Response(
        JSON.stringify({ valid: false, error: "Student not found" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const classInfo = student.classes as unknown as { name: string; level: string } | null;
    const institution = student.institutions as unknown as { id: string; name: string; code: string } | null;

    return new Response(
      JSON.stringify({
        valid: true,
        student: {
          id: student.id,
          firstName: student.first_name,
          lastName: student.last_name,
          admissionNumber: student.admission_number,
          className: classInfo?.name || null,
          classLevel: classInfo?.level || null,
          institutionId: student.institution_id,
        },
        institution: institution ? {
          id: institution.id,
          name: institution.name,
          code: institution.code,
        } : null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in verify-student-session:", error);
    return new Response(
      JSON.stringify({ valid: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
