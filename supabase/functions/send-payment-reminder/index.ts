import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL");
const RESEND_FROM_NAME = Deno.env.get("RESEND_FROM_NAME") || "Zira Technologies";

const PARENT_PORTAL_URL = "https://zira-edu-connect.lovable.app/parent";

const resend = new Resend(RESEND_API_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderRequest {
  institutionId?: string;
  studentFeeAccountIds?: string[];
  reminderType: "gentle" | "urgent" | "final";
}

interface StudentFeeAccount {
  id: string;
  student_name: string;
  student_id: string;
  total_fees: number;
  total_paid: number;
  class: string;
  institution: {
    name: string;
    email: string;
  };
}

const getReminderTemplate = (
  type: "gentle" | "urgent" | "final",
  studentName: string,
  balance: number,
  institutionName: string,
  currency: string = "KES"
): { subject: string; html: string } => {
  const formattedBalance = `${currency} ${balance.toLocaleString()}`;

  const loginButtonHtml = `
    <div style="text-align: center; margin: 24px 0;">
      <a href="${PARENT_PORTAL_URL}" style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #0a7c73 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
        View Full Statement in Parent Portal
      </a>
    </div>
    <p style="color: #64748b; font-size: 14px; text-align: center;">
      Or visit: <a href="${PARENT_PORTAL_URL}" style="color: #0d9488;">${PARENT_PORTAL_URL}</a>
    </p>
  `;

  const footerHtml = `
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
    <p style="color: #94a3b8; font-size: 13px; margin: 0; text-align: center;">
      © 2026 Zira EduSuite. All rights reserved.
    </p>
    <p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0; text-align: center;">
      Sent on behalf of ${institutionName}
    </p>
  `;

  const templates = {
    gentle: {
      subject: `Friendly Fee Reminder - ${institutionName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Fee Payment Reminder</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear Parent/Guardian of <strong>${studentName}</strong>,</p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              This is a friendly reminder that your child's school fees have an outstanding balance of:
            </p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <p style="margin: 0; font-size: 32px; font-weight: bold; color: #1f2937;">${formattedBalance}</p>
            </div>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              We kindly request you to make the payment at your earliest convenience to avoid any inconvenience.
            </p>
            ${loginButtonHtml}
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Best regards,<br>
              <strong>${institutionName}</strong>
            </p>
            ${footerHtml}
          </div>
        </div>
      `,
    },
    urgent: {
      subject: `⚠️ Urgent: Outstanding Fee Balance - ${institutionName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Urgent Fee Payment Required</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear Parent/Guardian of <strong>${studentName}</strong>,</p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              This is an urgent reminder regarding the overdue school fees balance:
            </p>
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #f59e0b;">
              <p style="margin: 0; font-size: 32px; font-weight: bold; color: #92400e;">${formattedBalance}</p>
              <p style="margin: 10px 0 0; color: #92400e; font-size: 14px;">OVERDUE</p>
            </div>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Please make the payment immediately to ensure your child's continued access to school facilities and services.
            </p>
            ${loginButtonHtml}
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Thank you for your prompt attention,<br>
              <strong>${institutionName}</strong>
            </p>
            ${footerHtml}
          </div>
        </div>
      `,
    },
    final: {
      subject: `🚨 Final Notice: Immediate Action Required - ${institutionName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🚨 Final Fee Payment Notice</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear Parent/Guardian of <strong>${studentName}</strong>,</p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              <strong>This is a final notice</strong> regarding the severely overdue school fees:
            </p>
            <div style="background: #fee2e2; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #dc2626;">
              <p style="margin: 0; font-size: 32px; font-weight: bold; color: #991b1b;">${formattedBalance}</p>
              <p style="margin: 10px 0 0; color: #991b1b; font-size: 14px; font-weight: bold;">FINAL NOTICE</p>
            </div>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Failure to settle this balance within 7 days may result in:
            </p>
            <ul style="color: #374151; font-size: 16px; line-height: 1.8;">
              <li>Suspension of student from classes</li>
              <li>Withholding of examination results</li>
              <li>Additional late payment penalties</li>
            </ul>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Please contact the accounts office immediately if you need to discuss payment arrangements.
            </p>
            ${loginButtonHtml}
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Regards,<br>
              <strong>${institutionName}</strong>
            </p>
            ${footerHtml}
          </div>
        </div>
      `,
    },
  };

  return templates[type];
};

const handler = async (req: Request): Promise<Response> => {
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { institutionId, studentFeeAccountIds, reminderType }: ReminderRequest = await req.json();

    console.log(`Processing ${reminderType} payment reminders from: ${RESEND_FROM_EMAIL}`);

    // Build query for defaulters
    let query = supabase
      .from("student_fee_accounts")
      .select(`
        id,
        student_name,
        student_id,
        total_fees,
        total_paid,
        class,
        institution:institutions(name, email)
      `)
      .gt("total_fees", 0);

    if (institutionId) {
      query = query.eq("institution_id", institutionId);
    }

    if (studentFeeAccountIds && studentFeeAccountIds.length > 0) {
      query = query.in("id", studentFeeAccountIds);
    }

    const { data: accounts, error: fetchError } = await query;

    if (fetchError) {
      console.error("Error fetching accounts:", fetchError);
      throw new Error(`Failed to fetch student accounts: ${fetchError.message}`);
    }

    if (!accounts || accounts.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No accounts found", sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Filter to only include accounts with outstanding balance
    const defaulters = accounts.filter((acc: any) => {
      const balance = (acc.total_fees || 0) - (acc.total_paid || 0);
      return balance > 0;
    });

    console.log(`Found ${defaulters.length} accounts with outstanding balances`);

    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const account of defaulters) {
      const balance = (account.total_fees || 0) - (account.total_paid || 0);
      const institutionEmail = (account.institution as any)?.email;
      const institutionName = (account.institution as any)?.name || "School";

      if (!institutionEmail) {
        console.log(`Skipping ${account.student_name}: No institution email`);
        results.errors.push(`${account.student_name}: No institution email configured`);
        results.failed++;
        continue;
      }

      const template = getReminderTemplate(
        reminderType,
        account.student_name,
        balance,
        institutionName
      );

      try {
        const emailResponse = await resend.emails.send({
          from: `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`,
          to: [institutionEmail], // In production, this would be parent email
          subject: template.subject,
          html: template.html,
        });

        console.log(`Email sent to ${institutionEmail} for ${account.student_name}:`, emailResponse);
        results.sent++;
      } catch (emailError: any) {
        console.error(`Failed to send email for ${account.student_name}:`, emailError);
        results.errors.push(`${account.student_name}: ${emailError.message}`);
        results.failed++;
      }
    }

    // Log the reminder action
    await supabase.from("audit_logs").insert({
      entity_type: "payment_reminder",
      action: `sent_${reminderType}_reminders`,
      metadata: {
        total_accounts: defaulters.length,
        sent: results.sent,
        failed: results.failed,
        reminder_type: reminderType,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Payment reminders processed`,
        ...results,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-payment-reminder function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);