import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL");
const RESEND_FROM_NAME = Deno.env.get("RESEND_FROM_NAME") || "Zira Technologies";

const LOGIN_URL = "https://zira-edu-connect.lovable.app/auth";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Valid institution-level roles that can be assigned
const VALID_INSTITUTION_ROLES = [
  'institution_owner',
  'institution_admin', 
  'finance_officer',
  'academic_director',
  'teacher',
  'ict_admin',
  'hr_manager',
  'accountant'
] as const;

type InstitutionRole = typeof VALID_INSTITUTION_ROLES[number];

interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: InstitutionRole;
  institutionId: string;
  sendWelcomeEmail: boolean;
  staffId?: string; // Optional: Link to existing staff record
}

function generateSecurePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  for (let i = 0; i < 16; i++) {
    password += chars[array[i] % chars.length];
  }
  return password;
}

async function sendWelcomeEmail(
  email: string, 
  firstName: string, 
  lastName: string,
  institutionName: string,
  role: string,
  temporaryPassword: string
): Promise<void> {
  if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
    console.error("Email configuration missing:", { 
      hasApiKey: !!RESEND_API_KEY, 
      hasFromEmail: !!RESEND_FROM_EMAIL 
    });
    throw new Error("Email service not configured. Please set RESEND_API_KEY and RESEND_FROM_EMAIL secrets.");
  }

  console.log(`Sending welcome email to: ${email} from: ${RESEND_FROM_EMAIL}`);

  const roleLabel = role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`,
      to: [email],
      subject: `Welcome to ${institutionName} - Your Account is Ready`,
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
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Welcome to Zira EduSuite</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 12px 0 0 0; font-size: 16px;">${institutionName}</p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07);">
                  <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 22px; font-weight: 600;">
                    Hello ${firstName}! 👋
                  </h2>
                  <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                    Your account has been created for <strong>${institutionName}</strong> with the role of <strong>${roleLabel}</strong>.
                  </p>
                  
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
                    <a href="${LOGIN_URL}" style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #0a7c73 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Login to Your Account
                    </a>
                  </div>
                  <p style="color: #64748b; font-size: 14px; text-align: center;">
                    Or visit: <a href="${LOGIN_URL}" style="color: #0d9488;">${LOGIN_URL}</a>
                  </p>
                  
                  <p style="color: #dc2626; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                    ⚠️ For security, please change your password immediately after your first login.
                  </p>
                  
                  <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                    If you have any questions, please contact your institution administrator.
                  </p>
                  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
                  <p style="color: #94a3b8; font-size: 13px; margin: 0; text-align: center;">
                    © 2026 Zira EduSuite. All rights reserved.
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
    console.error("Failed to send welcome email:", errorData);
    throw new Error(errorData.message || "Failed to send welcome email");
  }

  console.log("Welcome email sent successfully to:", email);
}

const handler = async (req: Request): Promise<Response> => {
  console.log("create-institution-user function invoked");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Extract the Bearer token
    const token = authHeader.replace('Bearer ', '');

    // Create admin client with service role key
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Verify the calling user by passing the token directly
    const { data: { user: callingUser }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !callingUser) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Calling user:", callingUser.id, callingUser.email);

    // Check if the calling user is a super_admin or support_admin
    const { data: isSuperAdmin } = await supabaseAdmin.rpc('is_super_admin', { _user_id: callingUser.id });
    const { data: isSupportAdmin } = await supabaseAdmin.rpc('is_support_admin', { _user_id: callingUser.id });

    // Parse request body early to check institution permissions
    const requestBody = await req.json();
    const { email, firstName, lastName, role, institutionId, sendWelcomeEmail: shouldSendEmail, staffId }: CreateUserRequest = requestBody;

    // Check if user is an institution owner/admin for this specific institution
    let isInstitutionAdmin = false;
    if (!isSuperAdmin && !isSupportAdmin && institutionId) {
      const { data: hasInstOwner } = await supabaseAdmin.rpc('has_institution_role', { 
        _user_id: callingUser.id, 
        _role: 'institution_owner',
        _institution_id: institutionId 
      });
      const { data: hasInstAdmin } = await supabaseAdmin.rpc('has_institution_role', { 
        _user_id: callingUser.id, 
        _role: 'institution_admin',
        _institution_id: institutionId 
      });
      isInstitutionAdmin = hasInstOwner || hasInstAdmin;
      console.log("Institution admin check:", { hasInstOwner, hasInstAdmin, isInstitutionAdmin });
    }

    if (!isSuperAdmin && !isSupportAdmin && !isInstitutionAdmin) {
      console.error("User is not authorized to create institution users");
      return new Response(
        JSON.stringify({ error: "You don't have permission to create users for this institution" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }


    // Validate required fields
    if (!email || !firstName || !lastName || !role || !institutionId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, firstName, lastName, role, institutionId" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate role
    if (!VALID_INSTITUTION_ROLES.includes(role)) {
      return new Response(
        JSON.stringify({ error: `Invalid role. Must be one of: ${VALID_INSTITUTION_ROLES.join(', ')}` }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify institution exists
    const { data: institution, error: instError } = await supabaseAdmin
      .from('institutions')
      .select('id, name')
      .eq('id', institutionId)
      .single();

    if (instError || !institution) {
      console.error("Institution not found:", instError);
      return new Response(
        JSON.stringify({ error: "Institution not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Creating user for institution:", institution.name);

    // Check if user with this email already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);
    
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "A user with this email already exists" }),
        { status: 409, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate temporary password
    const temporaryPassword = generateSecurePassword();

    // Create the new user using admin API
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        institution_id: institutionId,
        must_change_password: true,
      },
    });

    if (createError || !newUser.user) {
      console.error("Failed to create user:", createError);
      return new Response(
        JSON.stringify({ error: createError?.message || "Failed to create user" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("User created:", newUser.user.id);

    // Assign the role to the user
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: role,
        institution_id: institutionId,
        granted_by: callingUser.id,
      });

    if (roleError) {
      console.error("Failed to assign role:", roleError);
      // Attempt to delete the user if role assignment fails
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      return new Response(
        JSON.stringify({ error: "Failed to assign role to user" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Role assigned:", role);

    // CRITICAL FIX: Update the profile with institution_id
    const { error: profileUpdateError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        institution_id: institutionId,
        first_name: firstName,
        last_name: lastName,
      })
      .eq('user_id', newUser.user.id);

    if (profileUpdateError) {
      console.error("Failed to update profile institution_id:", profileUpdateError);
      // Don't fail - user is already created with role
    } else {
      console.log("Profile updated with institution_id");
    }

    // Link to staff record if staffId provided
    if (staffId) {
      const { error: staffLinkError } = await supabaseAdmin
        .from('staff')
        .update({ user_id: newUser.user.id })
        .eq('id', staffId)
        .eq('institution_id', institutionId);

      if (staffLinkError) {
        console.error("Failed to link staff record:", staffLinkError);
        // Don't fail - user is already created
      } else {
        console.log("Staff record linked:", staffId);
      }
    }
    // Log the action to audit_logs
    await supabaseAdmin.from('audit_logs').insert({
      action: 'CREATE_INSTITUTION_USER',
      entity_type: 'user',
      entity_id: newUser.user.id,
      institution_id: institutionId,
      user_id: callingUser.id,
      user_email: callingUser.email,
      metadata: {
        created_user_email: email,
        created_user_name: `${firstName} ${lastName}`,
        assigned_role: role,
      },
    });

    // Send welcome email if requested
    if (shouldSendEmail) {
      try {
        await sendWelcomeEmail(email, firstName, lastName, institution.name, role, temporaryPassword);
      } catch (emailError) {
        console.error("Failed to send welcome email (user still created):", emailError);
        // Don't fail the request if email fails - user is already created
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          firstName,
          lastName,
          role,
          institutionId,
        },
        message: shouldSendEmail 
          ? "User created and welcome email sent" 
          : "User created successfully",
      }),
      { status: 201, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in create-institution-user function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);