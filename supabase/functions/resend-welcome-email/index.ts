import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL");
const RESEND_FROM_NAME = Deno.env.get("RESEND_FROM_NAME") || "Zira Technologies";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ResendWelcomeEmailRequest {
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  loginUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("resend-welcome-email function invoked");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate email configuration before proceeding
    if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
      console.error("Email configuration missing:", { 
        hasApiKey: !!RESEND_API_KEY, 
        hasFromEmail: !!RESEND_FROM_EMAIL 
      });
      return new Response(
        JSON.stringify({ error: "Email service not configured. Please set RESEND_API_KEY and RESEND_FROM_EMAIL secrets." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { email, firstName, lastName, role, loginUrl }: ResendWelcomeEmailRequest = await req.json();
    
    if (!email || !firstName || !lastName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, firstName, lastName" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    const appLoginUrl = loginUrl || "https://zira-edusuite.lovable.app/auth";
    console.log(`Resending welcome email to: ${email} from: ${RESEND_FROM_EMAIL}, loginUrl: ${appLoginUrl}`);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`,
        to: [email],
        subject: "Welcome to Zira EduSuite - Your Account Details",
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
                    <p style="color: rgba(255,255,255,0.9); margin: 12px 0 0 0; font-size: 16px;">Education Management Platform</p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07);">
                    <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 22px; font-weight: 600;">
                      Hello ${firstName} ${lastName}! 👋
                    </h2>
                    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                      ${role ? `You have been added as a <strong>${role}</strong> on Zira EduSuite.` : 'Welcome to Zira EduSuite!'}
                    </p>
                    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                      You can log in using your email address: <strong>${email}</strong>
                    </p>
                    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                      If you haven't set your password yet, please use the "Forgot Password" option on the login page to create one.
                    </p>
                    <div style="text-align: center; margin: 32px 0;">
                      <a href="${appLoginUrl}" style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #0a7c73 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                        Login to Zira EduSuite
                      </a>
                    </div>
                    <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                      If you have any questions, feel free to reach out to your institution's administrator.
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
      console.error("Resend API error:", errorData);
      throw new Error(errorData.message || "Failed to send email");
    }

    const emailResponse = await res.json();

    console.log("Welcome email resent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, ...emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in resend-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
