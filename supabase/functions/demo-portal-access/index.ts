import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Simple session token generator
function generateSessionToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Hash token for storage (simple hash for demo purposes)
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userType } = await req.json();

    if (!userType || !["student", "parent"].includes(userType)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid user type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find a demo institution
    const { data: demoInstitution, error: instError } = await supabase
      .from("institutions")
      .select("id, name, code")
      .eq("is_demo", true)
      .limit(1)
      .single();

    if (instError || !demoInstitution) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Demo mode is not available. Please set up a demo institution first." 
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sessionToken = generateSessionToken();
    const hashedToken = await hashToken(sessionToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    if (userType === "student") {
      // Prefer the designated showcase student (fixed demo user)
      let { data: student, error: studentError } = await supabase
        .from("students")
        .select("id, first_name, last_name, admission_number, class_id, institution_id")
        .eq("institution_id", demoInstitution.id)
        .eq("is_demo_showcase", true)
        .limit(1)
        .maybeSingle();

      // Fallback to any student if no showcase user found
      if (studentError || !student) {
        if (studentError) console.error("Student lookup error:", studentError);

        const { data: fallbackStudent, error: fallbackError } = await supabase
          .from("students")
          .select(
            "id, first_name, last_name, admission_number, class_id, institution_id"
          )
          .eq("institution_id", demoInstitution.id)
          .limit(1)
          .maybeSingle();

        if (fallbackError || !fallbackStudent) {
          if (fallbackError) console.error("Fallback student lookup error:", fallbackError);
          return new Response(
            JSON.stringify({
              success: false,
              error: "No demo student available. Please seed demo data first.",
            }),
            {
              status: 404,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        student = fallbackStudent;
      }

      // Load class info (optional)
      let classInfo: { name?: string; level?: string } | null = null;
      if (student.class_id) {
        const { data: klass, error: classError } = await supabase
          .from("classes")
          .select("name, level")
          .eq("id", student.class_id)
          .limit(1)
          .maybeSingle();

        if (classError) console.error("Class lookup error:", classError);
        classInfo = klass ?? null;
      }

      // Create a session directly
      const { error: sessionError } = await supabase.from("student_sessions").insert({
        student_id: student.id,
        token_hash: hashedToken,
        expires_at: expiresAt.toISOString(),
        ip_address: req.headers.get("x-forwarded-for") || "demo",
        user_agent: req.headers.get("user-agent") || "demo-access",
      });

      if (sessionError) {
        console.error("Session creation error:", sessionError);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to create session" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const studentProfile = {
        id: student.id,
        firstName: student.first_name,
        lastName: student.last_name,
        admissionNumber: student.admission_number,
        className: classInfo?.name || null,
        classLevel: classInfo?.level || null,
        institutionId: student.institution_id,
      };

      return new Response(
        JSON.stringify({
          success: true,
          token: sessionToken,
          expiresAt: expiresAt.toISOString(),
          user: studentProfile,
          institution: {
            id: demoInstitution.id,
            name: demoInstitution.name,
            code: demoInstitution.code,
          },
          isDemo: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (userType === "parent") {
      // Prefer the designated showcase parent (fixed demo user)
      let { data: parent, error: parentError } = await supabase
        .from("parents")
        .select("id, first_name, last_name, phone, email, institution_id")
        .eq("institution_id", demoInstitution.id)
        .eq("is_demo_showcase", true)
        .limit(1)
        .maybeSingle();

      // Fallback to any parent with a phone if no showcase user found
      if (parentError || !parent) {
        if (parentError) console.error("Parent lookup error:", parentError);

        const { data: fallbackParent, error: fallbackError } = await supabase
          .from("parents")
          .select("id, first_name, last_name, phone, email, institution_id")
          .eq("institution_id", demoInstitution.id)
          .not("phone", "is", null)
          .limit(1)
          .maybeSingle();

        if (fallbackError || !fallbackParent) {
          if (fallbackError) console.error("Fallback parent lookup error:", fallbackError);
          return new Response(
            JSON.stringify({
              success: false,
              error: "No demo parent available. Please seed demo data first.",
            }),
            {
              status: 404,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        parent = fallbackParent;
      }

      // Load linked students (optional)
      const { data: links, error: linksError } = await supabase
        .from("student_parents")
        .select(
          "student_id, students (id, first_name, last_name, admission_number)"
        )
        .eq("parent_id", parent.id);

      if (linksError) console.error("student_parents lookup error:", linksError);

      // Create a parent session
      const { error: sessionError } = await supabase.from("parent_sessions").insert({
        parent_id: parent.id,
        token_hash: hashedToken,
        expires_at: expiresAt.toISOString(),
        ip_address: req.headers.get("x-forwarded-for") || "demo",
        user_agent: req.headers.get("user-agent") || "demo-access",
      });

      if (sessionError) {
        console.error("Session creation error:", sessionError);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to create session" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const parentProfile = {
        id: parent.id,
        firstName: parent.first_name,
        lastName: parent.last_name,
        phone: parent.phone,
        email: parent.email,
        institutionId: parent.institution_id,
        students:
          links?.map((sp: any) => ({
            id: sp.students?.id,
            firstName: sp.students?.first_name,
            lastName: sp.students?.last_name,
            admissionNumber: sp.students?.admission_number,
          })) || [],
      };

      return new Response(
        JSON.stringify({
          success: true,
          token: sessionToken,
          expiresAt: expiresAt.toISOString(),
          user: parentProfile,
          institution: {
            id: demoInstitution.id,
            name: demoInstitution.name,
            code: demoInstitution.code,
          },
          isDemo: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Invalid request" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Demo access error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
