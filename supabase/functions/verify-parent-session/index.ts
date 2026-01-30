import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Hash the token using SHA-256
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
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

    // Get token from Authorization header
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ valid: false, error: "No token provided" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const tokenHash = await hashToken(token);

    // Find session
    const { data: session, error: sessionError } = await supabase
      .from("parent_sessions")
      .select("parent_id, expires_at")
      .eq("token_hash", tokenHash)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid or expired session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get parent info
    const { data: parent, error: parentError } = await supabase
      .from("parents")
      .select("id, first_name, last_name, phone, email, institution_id")
      .eq("id", session.parent_id)
      .single();

    if (parentError || !parent) {
      return new Response(
        JSON.stringify({ valid: false, error: "Parent not found" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get institution
    const { data: institution } = await supabase
      .from("institutions")
      .select("id, name, code")
      .eq("id", parent.institution_id)
      .single();

    // Get linked students
    const { data: links } = await supabase
      .from("student_parents")
      .select("student_id, students(id, first_name, last_name, admission_number)")
      .eq("parent_id", parent.id);

    const students = links?.map((link: any) => ({
      id: link.students?.id,
      firstName: link.students?.first_name,
      lastName: link.students?.last_name,
      admissionNumber: link.students?.admission_number,
    })).filter((s: any) => s.id) || [];

    return new Response(
      JSON.stringify({
        valid: true,
        parent: {
          id: parent.id,
          firstName: parent.first_name,
          lastName: parent.last_name,
          email: parent.email,
          phone: parent.phone,
          institutionId: parent.institution_id,
          students,
        },
        institution: institution ? {
          id: institution.id,
          name: institution.name,
          code: institution.code,
        } : null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error verifying parent session:", error);
    return new Response(
      JSON.stringify({ valid: false, error: "Session verification failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
