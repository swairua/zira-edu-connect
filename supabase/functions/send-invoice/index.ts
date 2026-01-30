import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendInvoiceRequest {
  invoiceId: string;
  email: string;
  includePdf?: boolean;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { invoiceId, email, includePdf = true }: SendInvoiceRequest = await req.json();

    if (!invoiceId || !email) {
      return new Response(
        JSON.stringify({ error: "Missing invoiceId or email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch invoice with all related data
    const { data: invoice, error: invoiceError } = await supabase
      .from("student_invoices")
      .select(`
        id,
        invoice_number,
        total_amount,
        currency,
        due_date,
        created_at,
        status,
        institution_id,
        students (
          first_name,
          last_name,
          admission_number
        ),
        academic_years (name),
        terms (name)
      `)
      .eq("id", invoiceId)
      .single();

    if (invoiceError || !invoice) {
      return new Response(
        JSON.stringify({ error: "Invoice not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch institution
    const { data: institution } = await supabase
      .from("institutions")
      .select("name, email, phone, address")
      .eq("id", invoice.institution_id)
      .single();

    // Fetch invoice lines
    const { data: lines } = await supabase
      .from("invoice_lines")
      .select("description, quantity, unit_amount, total_amount")
      .eq("invoice_id", invoiceId);

    const currency = invoice.currency || "KES";
    const student = invoice.students as any;
    const studentName = `${student?.first_name || ""} ${student?.last_name || ""}`.trim();
    const dueDate = new Date(invoice.due_date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Build invoice items HTML
    const itemsHtml = (lines || [])
      .map(
        (line: any) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${line.description}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${line.quantity || 1}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${currency} ${(line.unit_amount || 0).toLocaleString()}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${currency} ${(line.total_amount || 0).toLocaleString()}</td>
        </tr>
      `
      )
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 5px;">${institution?.name || "School"}</h1>
          <p style="color: #6b7280; font-size: 14px; margin: 0;">${institution?.address || ""}</p>
          <p style="color: #6b7280; font-size: 14px; margin: 0;">${institution?.phone || ""} | ${institution?.email || ""}</p>
        </div>

        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
          <h2 style="margin: 0 0 10px 0; color: #111827;">Invoice ${invoice.invoice_number}</h2>
          <p style="margin: 0; color: #6b7280;">
            Student: <strong>${studentName}</strong> (${student?.admission_number || "-"})
          </p>
          <p style="margin: 5px 0 0 0; color: #6b7280;">
            Due Date: <strong style="color: #dc2626;">${dueDate}</strong>
          </p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
          <thead>
            <tr style="background: #2563eb; color: white;">
              <th style="padding: 12px; text-align: left; font-size: 13px;">Description</th>
              <th style="padding: 12px; text-align: center; font-size: 13px;">Qty</th>
              <th style="padding: 12px; text-align: right; font-size: 13px;">Unit Price</th>
              <th style="padding: 12px; text-align: right; font-size: 13px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="text-align: right; margin-bottom: 30px;">
          <div style="display: inline-block; background: #2563eb; color: white; padding: 15px 25px; border-radius: 8px;">
            <span style="display: block; font-size: 12px; opacity: 0.9;">Total Amount Due</span>
            <span style="font-size: 24px; font-weight: 700;">${currency} ${invoice.total_amount.toLocaleString()}</span>
          </div>
        </div>

        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 25px; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px; color: #92400e;">
            <strong>Payment Instructions:</strong><br>
            Please ensure payment is made by the due date to avoid late payment penalties.
            Contact the school office for available payment methods.
          </p>
        </div>

        <div style="text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          <p style="margin: 0;">This is an automated email. Please do not reply directly.</p>
          <p style="margin: 5px 0 0 0;">For inquiries, contact ${institution?.email || "the school office"}</p>
        </div>
      </body>
      </html>
    `;

    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";
    const fromName = Deno.env.get("RESEND_FROM_NAME") || institution?.name || "School";

    // Send email
    const emailResponse = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [email],
      subject: `Invoice ${invoice.invoice_number} - ${institution?.name || "School"}`,
      html: emailHtml,
    });

    console.log("Email sent:", emailResponse);

    // Log the email
    await supabase.from("invoice_email_logs").insert({
      invoice_id: invoiceId,
      institution_id: invoice.institution_id,
      sent_to: email,
      status: "sent",
      resend_message_id: emailResponse.data?.id,
      created_by: user.id,
    });

    return new Response(
      JSON.stringify({ success: true, messageId: emailResponse.data?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error sending invoice:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send invoice" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
