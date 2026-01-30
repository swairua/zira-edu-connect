import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL");
const RESEND_FROM_NAME = Deno.env.get("RESEND_FROM_NAME") || "Zira Technologies";

const PARENT_PORTAL_URL = "https://zira-edu-connect.lovable.app/parent";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteParentRequest {
  parentId?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  relationshipType: string;
  studentId: string;
  institutionId: string;
  sendInvite: boolean;
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

async function sendParentInviteEmail(
  email: string,
  firstName: string,
  studentName: string,
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

  console.log(`Sending parent invite email to: ${email} from: ${RESEND_FROM_EMAIL}`);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`,
      to: [email],
      subject: `Parent Portal Access - ${institutionName}`,
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
                <td style="background: linear-gradient(135deg, #0d9488 0%, #0a7c73 100%); border-radius: 16px 16px 0 0; padding: 40px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Parent Portal Access</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 12px 0 0 0; font-size: 16px;">${institutionName}</p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07);">
                  <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 22px; font-weight: 600;">
                    Hello ${firstName}! 👋
                  </h2>
                  <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                    You have been granted access to the Parent Portal for <strong>${studentName}</strong> at <strong>${institutionName}</strong>.
                  </p>
                  
                  <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                    With the Parent Portal, you can:
                  </p>
                  <ul style="color: #475569; font-size: 15px; line-height: 1.8; margin: 0 0 24px 0; padding-left: 20px;">
                    <li>View fee balances and payment history</li>
                    <li>Download fee statements</li>
                    <li>View released exam results</li>
                    <li>Receive school announcements</li>
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
                    <a href="${PARENT_PORTAL_URL}" style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #0a7c73 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Access Parent Portal
                    </a>
                  </div>
                  <p style="color: #64748b; font-size: 14px; text-align: center;">
                    Or visit: <a href="${PARENT_PORTAL_URL}" style="color: #0d9488;">${PARENT_PORTAL_URL}</a>
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
    console.error("Failed to send parent invite email:", errorData);
    throw new Error(errorData.message || "Failed to send invite email");
  }

  console.log("Parent invite email sent successfully to:", email);
}

const handler = async (req: Request): Promise<Response> => {
  console.log("invite-parent function invoked");

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

    // Check authorization - super admin, support admin, or institution admin
    const { data: isSuperAdmin } = await supabaseAdmin.rpc('is_super_admin', { _user_id: callingUser.id });
    const { data: isSupportAdmin } = await supabaseAdmin.rpc('is_support_admin', { _user_id: callingUser.id });

    const requestBody: InviteParentRequest = await req.json();
    const { firstName, lastName, phone, email, relationshipType, studentId, institutionId, sendInvite, parentId } = requestBody;

    // If not super/support admin, check institution admin role
    if (!isSuperAdmin && !isSupportAdmin) {
      const { data: hasRole } = await supabaseAdmin.rpc('has_institution_role', {
        _user_id: callingUser.id,
        _role: 'institution_admin',
        _institution_id: institutionId
      });

      if (!hasRole) {
        return new Response(
          JSON.stringify({ error: "Unauthorized to manage parents for this institution" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Validate required fields
    if (!firstName || !lastName || !phone || !relationshipType || !studentId || !institutionId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify student exists and belongs to institution
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select('id, first_name, last_name, institution_id')
      .eq('id', studentId)
      .eq('institution_id', institutionId)
      .single();

    if (studentError || !student) {
      return new Response(
        JSON.stringify({ error: "Student not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get institution name
    const { data: institution } = await supabaseAdmin
      .from('institutions')
      .select('name')
      .eq('id', institutionId)
      .single();

    let parent;
    let isNewParent = false;

    if (parentId) {
      // Link existing parent
      const { data: existingParent, error: parentError } = await supabaseAdmin
        .from('parents')
        .select('*')
        .eq('id', parentId)
        .single();

      if (parentError || !existingParent) {
        return new Response(
          JSON.stringify({ error: "Parent not found" }),
          { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      parent = existingParent;
    } else {
      // Check if parent with same phone exists in institution
      const { data: existingParent } = await supabaseAdmin
        .from('parents')
        .select('*')
        .eq('phone', phone)
        .eq('institution_id', institutionId)
        .maybeSingle();

      if (existingParent) {
        parent = existingParent;
      } else {
        // Create new parent
        const { data: newParent, error: createError } = await supabaseAdmin
          .from('parents')
          .insert({
            first_name: firstName,
            last_name: lastName,
            phone,
            email: email || null,
            institution_id: institutionId,
            relationship_type: relationshipType,
          })
          .select()
          .single();

        if (createError) {
          console.error("Failed to create parent:", createError);
          return new Response(
            JSON.stringify({ error: "Failed to create parent record" }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
        parent = newParent;
        isNewParent = true;
      }
    }

    // Check if parent-student link already exists
    const { data: existingLink } = await supabaseAdmin
      .from('student_parents')
      .select('id')
      .eq('parent_id', parent.id)
      .eq('student_id', studentId)
      .maybeSingle();

    if (!existingLink) {
      // Create student-parent link
      const { error: linkError } = await supabaseAdmin
        .from('student_parents')
        .insert({
          parent_id: parent.id,
          student_id: studentId,
          institution_id: institutionId,
          relationship: relationshipType,
          is_primary: true,
        });

      if (linkError) {
        console.error("Failed to link parent to student:", linkError);
        return new Response(
          JSON.stringify({ error: "Failed to link parent to student" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    let userCreated = false;
    let temporaryPassword: string | null = null;

    // Create user account if sendInvite is true and parent doesn't have user_id
    if (sendInvite && !parent.user_id && email) {
      // Check if user with this email already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === email);

      if (existingUser) {
        // Update parent with existing user_id
        await supabaseAdmin
          .from('parents')
          .update({ user_id: existingUser.id })
          .eq('id', parent.id);

        // Check if parent role exists, if not assign it
        const { data: hasParentRole } = await supabaseAdmin.rpc('has_role', {
          _user_id: existingUser.id,
          _role: 'parent'
        });

        if (!hasParentRole) {
          await supabaseAdmin.from('user_roles').insert({
            user_id: existingUser.id,
            role: 'parent',
            institution_id: institutionId,
            granted_by: callingUser.id,
          });
        }
      } else {
        temporaryPassword = generateSecurePassword();

        const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password: temporaryPassword,
          email_confirm: true,
          user_metadata: {
            first_name: firstName,
            last_name: lastName,
            is_parent: true,
          },
        });

        if (createUserError || !newUser.user) {
          console.error("Failed to create user:", createUserError);
          // Continue without user creation - parent record still valid
        } else {
          userCreated = true;

          // Update parent with user_id
          await supabaseAdmin
            .from('parents')
            .update({ user_id: newUser.user.id })
            .eq('id', parent.id);

          // Assign parent role
          await supabaseAdmin.from('user_roles').insert({
            user_id: newUser.user.id,
            role: 'parent',
            institution_id: institutionId,
            granted_by: callingUser.id,
          });

          // Send invite email
          const studentName = `${student.first_name} ${student.last_name}`;
          try {
            await sendParentInviteEmail(
              email,
              firstName,
              studentName,
              institution?.name || 'School',
              temporaryPassword
            );
          } catch (emailError) {
            console.error("Failed to send invite email:", emailError);
          }
        }
      }
    }

    // Log the action
    await supabaseAdmin.from('audit_logs').insert({
      action: isNewParent ? 'CREATE_PARENT' : 'LINK_PARENT',
      entity_type: 'parent',
      entity_id: parent.id,
      institution_id: institutionId,
      user_id: callingUser.id,
      user_email: callingUser.email,
      metadata: {
        parent_name: `${firstName} ${lastName}`,
        student_id: studentId,
        student_name: `${student.first_name} ${student.last_name}`,
        user_created: userCreated,
        invite_sent: sendInvite && userCreated,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        parent: {
          id: parent.id,
          firstName: parent.first_name,
          lastName: parent.last_name,
          phone: parent.phone,
          email: parent.email,
          hasPortalAccess: !!parent.user_id || userCreated,
        },
        userCreated,
        message: userCreated
          ? "Parent added and portal invite sent"
          : sendInvite && !email
          ? "Parent added. Email required to send portal invite."
          : "Parent linked to student successfully",
      }),
      { status: 201, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in invite-parent function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);