import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL");
const RESEND_FROM_NAME = Deno.env.get("RESEND_FROM_NAME") || "Zira Technologies";

const STUDENT_PORTAL_URL = "https://zira-edu-connect.lovable.app/student";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteStudentRequest {
  studentId: string;
  email: string;
  sendWelcomeEmail: boolean;
}

function generateSecurePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  const array = new Uint8Array(12);
  crypto.getRandomValues(array);
  for (let i = 0; i < 12; i++) {
    password += chars[array[i] % chars.length];
  }
  return password;
}

async function sendStudentInviteEmail(
  email: string,
  firstName: string,
  institutionName: string,
  temporaryPassword: string
): Promise<void> {
  if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
    console.error("Email configuration missing:", { 
      hasApiKey: !!RESEND_API_KEY, 
      hasFromEmail: !!RESEND_FROM_EMAIL 
    });
    throw new Error("Email service not configured. Please set RESEND_API_KEY and RESEND_FROM_EMAIL secrets.");
  }

  console.log(`Sending student invite email to: ${email} from: ${RESEND_FROM_EMAIL}`);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`,
      to: [email],
      subject: `Student Portal Access - ${institutionName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <tr>
                <td style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); border-radius: 16px 16px 0 0; padding: 40px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Student Portal Access</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 12px 0 0 0; font-size: 16px;">${institutionName}</p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07);">
                  <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 22px; font-weight: 600;">
                    Hello ${firstName}! 🎓
                  </h2>
                  <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                    You have been granted access to the Student Portal at <strong>${institutionName}</strong>.
                  </p>
                  
                  <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                    With the Student Portal, you can:
                  </p>
                  <ul style="color: #475569; font-size: 15px; line-height: 1.8; margin: 0 0 24px 0; padding-left: 20px;">
                    <li>View and submit assignments</li>
                    <li>Check your exam results</li>
                    <li>View fee balances and payment history</li>
                    <li>Access your attendance records</li>
                  </ul>
                  
                  <div style="background-color: #f1f5f9; border-radius: 12px; padding: 24px; margin: 24px 0;">
                    <h3 style="color: #1e293b; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">Your Login Credentials</h3>
                    <p style="color: #475569; font-size: 14px; margin: 0 0 8px 0;">
                      <strong>Email:</strong> ${email}
                    </p>
                    <p style="color: #475569; font-size: 14px; margin: 0;">
                      <strong>Temporary Password:</strong> <code style="background: #e2e8f0; padding: 2px 8px; border-radius: 4px; font-family: monospace;">${temporaryPassword}</code>
                    </p>
                  </div>
                  
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${STUDENT_PORTAL_URL}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Access Student Portal
                    </a>
                  </div>
                  <p style="color: #64748b; font-size: 14px; text-align: center;">
                    Or visit: <a href="${STUDENT_PORTAL_URL}" style="color: #6366f1;">${STUDENT_PORTAL_URL}</a>
                  </p>
                  
                  <p style="color: #dc2626; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                    ⚠️ For security, please change your password after your first login.
                  </p>
                  
                  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
                  <p style="color: #94a3b8; font-size: 13px; margin: 0; text-align: center;">
                    © 2026 Zira EduSuite. All rights reserved.
                  </p>
                  <p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0; text-align: center;">
                    Sent on behalf of ${institutionName}
                  </p>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.error("Failed to send student invite email:", errorData);
    throw new Error(errorData.message || "Failed to send invite email");
  }

  console.log("Student invite email sent successfully to:", email);
}

const handler = async (req: Request): Promise<Response> => {
  console.log("invite-student function invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: { user: callingUser }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !callingUser) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Calling user:", callingUser.id, callingUser.email);

    const requestBody: InviteStudentRequest = await req.json();
    const { studentId, email, sendWelcomeEmail } = requestBody;

    // Validate required fields
    if (!studentId || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: studentId and email" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch student details
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select('id, first_name, last_name, institution_id, user_id')
      .eq('id', studentId)
      .single();

    if (studentError || !student) {
      console.error("Student not found:", studentError);
      return new Response(
        JSON.stringify({ error: "Student not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if student already has portal access
    if (student.user_id) {
      return new Response(
        JSON.stringify({ error: "Student already has portal access", hasAccess: true }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check authorization - super admin, support admin, or institution admin
    const { data: isSuperAdmin } = await supabaseAdmin.rpc('is_super_admin', { _user_id: callingUser.id });
    const { data: isSupportAdmin } = await supabaseAdmin.rpc('is_support_admin', { _user_id: callingUser.id });

    if (!isSuperAdmin && !isSupportAdmin) {
      const { data: hasRole } = await supabaseAdmin.rpc('has_institution_role', {
        _user_id: callingUser.id,
        _role: 'institution_admin',
        _institution_id: student.institution_id
      });

      if (!hasRole) {
        return new Response(
          JSON.stringify({ error: "Unauthorized to manage students for this institution" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Get institution name
    const { data: institution } = await supabaseAdmin
      .from('institutions')
      .select('name')
      .eq('id', student.institution_id)
      .single();

    // Check if user with this email already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    let userId: string;
    let temporaryPassword: string | null = null;
    let userCreated = false;

    if (existingUser) {
      // User exists, link to student
      userId = existingUser.id;
      
      // Check if this user is already linked to another student
      const { data: linkedStudent } = await supabaseAdmin
        .from('students')
        .select('id')
        .eq('user_id', existingUser.id)
        .maybeSingle();
      
      if (linkedStudent) {
        return new Response(
          JSON.stringify({ error: "This email is already linked to another student" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    } else {
      // Create new user
      temporaryPassword = generateSecurePassword();

      const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: {
          first_name: student.first_name,
          last_name: student.last_name,
          is_student: true,
        },
      });

      if (createUserError || !newUser.user) {
        console.error("Failed to create user:", createUserError);
        return new Response(
          JSON.stringify({ error: "Failed to create user account" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      userId = newUser.user.id;
      userCreated = true;
    }

    // Update student with user_id
    const { error: updateError } = await supabaseAdmin
      .from('students')
      .update({ user_id: userId })
      .eq('id', studentId);

    if (updateError) {
      console.error("Failed to update student:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to link student to user account" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Assign student role
    const { error: roleError } = await supabaseAdmin.from('user_roles').insert({
      user_id: userId,
      role: 'student',
      institution_id: student.institution_id,
      granted_by: callingUser.id,
    });

    if (roleError && !roleError.message.includes('duplicate')) {
      console.error("Failed to assign student role:", roleError);
    }

    // Send invite email if requested and new user created
    if (sendWelcomeEmail && userCreated && temporaryPassword) {
      try {
        await sendStudentInviteEmail(
          email,
          student.first_name,
          institution?.name || 'School',
          temporaryPassword
        );
      } catch (emailError) {
        console.error("Failed to send invite email:", emailError);
      }
    }

    // Log the action
    await supabaseAdmin.from('audit_logs').insert({
      action: 'GRANT_STUDENT_PORTAL_ACCESS',
      entity_type: 'student',
      entity_id: studentId,
      institution_id: student.institution_id,
      user_id: callingUser.id,
      user_email: callingUser.email,
      metadata: {
        student_name: `${student.first_name} ${student.last_name}`,
        student_email: email,
        user_created: userCreated,
        invite_sent: sendWelcomeEmail && userCreated,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        userCreated,
        message: userCreated
          ? sendWelcomeEmail
            ? "Student portal access granted and invite email sent"
            : "Student portal access granted"
          : "Student linked to existing user account",
      }),
      { status: 201, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in invite-student function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);