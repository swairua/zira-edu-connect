import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PARENT_PORTAL_URL = "https://zira-edu-connect.lovable.app/parent";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("==== PAYMENT CONFIRMATION START ====");
  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendFromEmail = Deno.env.get("RESEND_FROM_EMAIL");
    const resendFromName = Deno.env.get("RESEND_FROM_NAME") || "Zira EduSuite";
    const robermsToken = Deno.env.get("ROBERMS_API_TOKEN");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    // Parse request body
    const body = await req.json();
    const { paymentId, institutionId } = body;

    if (!paymentId) {
      return new Response(
        JSON.stringify({ success: false, error: "paymentId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch payment details
    const { data: payment, error: paymentError } = await supabase
      .from("student_payments")
      .select(`
        id,
        amount,
        payment_date,
        payment_method,
        reference_number,
        receipt_number,
        notes,
        student_id,
        institution_id,
        student:students(
          id,
          first_name,
          last_name,
          admission_number,
          institution:institutions(id, name, is_demo, currency),
          class:classes(name)
        )
      `)
      .eq("id", paymentId)
      .single();

    if (paymentError || !payment) {
      console.error("Error fetching payment:", paymentError);
      throw new Error(`Payment not found: ${paymentId}`);
    }

    const student = payment.student as any;
    const institution = student?.institution as any;
    const studentName = `${student.first_name} ${student.last_name}`;
    const className = student.class?.name || "";
    const currency = institution?.currency || "KES";

    console.log(`Processing payment confirmation for ${studentName}: ${currency} ${payment.amount}`);

    // Get current balance
    const { data: invoices } = await supabase
      .from("student_invoices")
      .select("total_amount")
      .eq("student_id", student.id)
      .eq("status", "posted");

    const { data: payments } = await supabase
      .from("student_payments")
      .select("amount")
      .eq("student_id", student.id);

    const totalInvoiced = (invoices || []).reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0);
    const totalPaid = (payments || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    const currentBalance = totalInvoiced - totalPaid;

    // Get parents for this student
    const { data: parentLinks } = await supabase
      .from("student_parents")
      .select(`
        parent:parents(id, first_name, last_name, phone, email)
      `)
      .eq("student_id", student.id);

    const parents = (parentLinks || [])
      .map((link: any) => link.parent)
      .filter((p: any) => p !== null);

    if (parents.length === 0) {
      console.log(`No parents found for ${studentName}`);
      return new Response(
        JSON.stringify({ success: true, message: "No parents to notify", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = {
      sms_sent: 0,
      email_sent: 0,
      errors: [] as string[],
    };

    // Format values
    const formattedAmount = `${currency} ${payment.amount.toLocaleString()}`;
    const formattedBalance = `${currency} ${Math.abs(currentBalance).toLocaleString()}`;
    const paymentDate = new Date(payment.payment_date).toLocaleDateString("en-GB", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    for (const parent of parents) {
      const parentName = `${parent.first_name} ${parent.last_name}`;

      // Check SMS preference
      const { data: smsPref } = await supabase
        .from("notification_preferences")
        .select("is_opted_in")
        .eq("parent_id", parent.id)
        .eq("institution_id", payment.institution_id)
        .eq("channel", "sms")
        .maybeSingle();

      const smsOptedIn = smsPref?.is_opted_in !== false;

      // Construct messages
      const smsMessage = `✅ ${institution.name}: Payment of ${formattedAmount} received for ${student.first_name}. Receipt: ${payment.receipt_number || "Pending"}. Balance: ${currentBalance <= 0 ? "CLEARED" : formattedBalance}. Thank you!`;

      const emailSubject = `✅ Payment Received - ${institution.name}`;
      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">✅ Payment Received</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear ${parentName},</p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              We have received your payment for <strong>${studentName}</strong>. Thank you for your commitment to your child's education.
            </p>
            
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <table style="width: 100%; font-size: 15px; color: #374151;">
                <tr><td style="padding: 8px 0; font-weight: 600;">Amount Paid:</td><td style="text-align: right; font-size: 20px; color: #10b981; font-weight: bold;">${formattedAmount}</td></tr>
                <tr><td style="padding: 8px 0;">Payment Date:</td><td style="text-align: right;">${paymentDate}</td></tr>
                <tr><td style="padding: 8px 0;">Payment Method:</td><td style="text-align: right;">${payment.payment_method?.toUpperCase() || "N/A"}</td></tr>
                ${payment.reference_number ? `<tr><td style="padding: 8px 0;">Reference:</td><td style="text-align: right;">${payment.reference_number}</td></tr>` : ""}
                ${payment.receipt_number ? `<tr><td style="padding: 8px 0;">Receipt No:</td><td style="text-align: right; font-weight: 600;">${payment.receipt_number}</td></tr>` : ""}
              </table>
            </div>

            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <table style="width: 100%; font-size: 14px; color: #374151;">
                <tr>
                  <td style="padding: 4px 0;"><strong>Student:</strong></td>
                  <td style="text-align: right;">${studentName}</td>
                </tr>
                ${className ? `<tr><td style="padding: 4px 0;"><strong>Class:</strong></td><td style="text-align: right;">${className}</td></tr>` : ""}
                <tr>
                  <td style="padding: 4px 0;"><strong>Current Balance:</strong></td>
                  <td style="text-align: right; font-weight: 600; color: ${currentBalance <= 0 ? "#10b981" : "#dc2626"};">
                    ${currentBalance <= 0 ? "✓ FULLY PAID" : formattedBalance}
                  </td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${PARENT_PORTAL_URL}" style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #0a7c73 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                View Full Statement
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Thank you for your continued support,<br>
              <strong>${institution.name}</strong>
            </p>
          </div>
        </div>
      `;

      const channelsUsed: string[] = [];

      // Send SMS (skip for demo institutions)
      if (smsOptedIn && parent.phone && robermsToken && !institution.is_demo) {
        try {
          const smsResponse = await fetch(`${supabaseUrl}/functions/v1/send-sms`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              phones: parent.phone,
              message: smsMessage,
              messageType: "payment_confirmation",
              smsType: "transactional",
              institutionId: payment.institution_id,
              recipientName: parentName,
              recipientType: "parent",
            }),
          });

          if (smsResponse.ok) {
            results.sms_sent++;
            channelsUsed.push("sms");
            console.log(`SMS sent to ${parentName}`);
          }
        } catch (smsError) {
          console.error(`SMS failed for ${parentName}:`, smsError);
          results.errors.push(`SMS to ${parentName}: ${smsError}`);
        }
      }

      // Send Email
      if (parent.email && resend && resendFromEmail) {
        try {
          await resend.emails.send({
            from: `${resendFromName} <${resendFromEmail}>`,
            to: [parent.email],
            subject: emailSubject,
            html: emailHtml,
          });
          results.email_sent++;
          channelsUsed.push("email");
          console.log(`Email sent to ${parentName}`);
        } catch (emailError) {
          console.error(`Email failed for ${parentName}:`, emailError);
          results.errors.push(`Email to ${parentName}: ${emailError}`);
        }
      }

      // Log communication event
      if (channelsUsed.length > 0) {
        await supabase.from("communication_events").insert({
          institution_id: payment.institution_id,
          event_type: "payment_confirmation",
          trigger_source: "realtime",
          student_id: student.id,
          parent_id: parent.id,
          reference_type: "payment",
          reference_id: payment.id,
          channels_used: channelsUsed,
          message_content: smsMessage,
          status: "sent",
          metadata: {
            amount: payment.amount,
            receipt_number: payment.receipt_number,
            balance_after: currentBalance,
          },
          processed_at: new Date().toISOString(),
        });
      }
    }

    const duration = Date.now() - startTime;
    console.log(`Payment confirmation completed in ${duration}ms`);
    console.log("==== PAYMENT CONFIRMATION END ====");

    return new Response(
      JSON.stringify({
        success: true,
        ...results,
        duration_ms: duration,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in payment confirmation:", error);
    console.log("==== PAYMENT CONFIRMATION END (ERROR) ====");
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Internal server error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
