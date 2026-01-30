import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MpesaCallbackBody {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value?: string | number;
        }>;
      };
    };
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log("mpesa-callback function invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const body: MpesaCallbackBody = await req.json();
    console.log("M-PESA Callback received:", JSON.stringify(body, null, 2));

    const { stkCallback } = body.Body;
    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    // Find the STK request
    const { data: stkRequest, error: findError } = await supabaseAdmin
      .from("mpesa_stk_requests")
      .select("*, students(first_name, last_name)")
      .eq("checkout_request_id", CheckoutRequestID)
      .single();

    if (findError || !stkRequest) {
      console.error("STK request not found:", CheckoutRequestID);
      // Still return success to Safaricom to prevent retries
      return new Response(
        JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Already processed
    if (stkRequest.status === "completed" || stkRequest.callback_received_at) {
      console.log("Callback already processed:", stkRequest.id);
      return new Response(
        JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Extract metadata if successful
    let mpesaReceipt = null;
    let transactionDate = null;
    let phoneNumber = stkRequest.phone_number;

    if (ResultCode === 0 && CallbackMetadata?.Item) {
      for (const item of CallbackMetadata.Item) {
        switch (item.Name) {
          case "MpesaReceiptNumber":
            mpesaReceipt = item.Value as string;
            break;
          case "TransactionDate":
            // Format: YYYYMMDDHHmmss
            const dateStr = String(item.Value);
            if (dateStr.length === 14) {
              transactionDate = new Date(
                parseInt(dateStr.substring(0, 4)),
                parseInt(dateStr.substring(4, 6)) - 1,
                parseInt(dateStr.substring(6, 8)),
                parseInt(dateStr.substring(8, 10)),
                parseInt(dateStr.substring(10, 12)),
                parseInt(dateStr.substring(12, 14))
              ).toISOString();
            }
            break;
          case "PhoneNumber":
            phoneNumber = String(item.Value);
            break;
        }
      }
    }

    // Determine status
    const newStatus = ResultCode === 0 ? "completed" : "failed";

    // Update STK request
    await supabaseAdmin
      .from("mpesa_stk_requests")
      .update({
        status: newStatus,
        result_code: String(ResultCode),
        result_desc: ResultDesc,
        mpesa_receipt: mpesaReceipt,
        transaction_date: transactionDate,
        callback_received_at: new Date().toISOString(),
      })
      .eq("id", stkRequest.id);

    // If successful, create payment record
    if (ResultCode === 0) {
      console.log("Payment successful, creating payment record");

      // Create payment in student_payments
      const { data: payment, error: paymentError } = await supabaseAdmin
        .from("student_payments")
        .insert({
          institution_id: stkRequest.institution_id,
          student_id: stkRequest.student_id,
          amount: stkRequest.amount,
          payment_method: "mpesa",
          transaction_ref: mpesaReceipt,
          status: "completed",
          payment_date: transactionDate || new Date().toISOString(),
          notes: `M-PESA STK Push payment. Receipt: ${mpesaReceipt}`,
          metadata: {
            mpesa_stk_request_id: stkRequest.id,
            checkout_request_id: CheckoutRequestID,
            merchant_request_id: MerchantRequestID,
            phone: phoneNumber,
          },
        })
        .select()
        .single();

      if (paymentError) {
        console.error("Failed to create payment record:", paymentError);
      } else {
        console.log("Payment record created:", payment.id);

        // Allocate to invoice if specified
        if (stkRequest.invoice_id) {
          // Update invoice amount_paid
          const { data: invoice } = await supabaseAdmin
            .from("student_invoices")
            .select("amount_paid, total_amount")
            .eq("id", stkRequest.invoice_id)
            .single();

          if (invoice) {
            const newAmountPaid = (invoice.amount_paid || 0) + stkRequest.amount;
            const newStatus = newAmountPaid >= (invoice.total_amount || 0) ? "paid" : "partial";

            await supabaseAdmin
              .from("student_invoices")
              .update({ 
                amount_paid: newAmountPaid,
                status: newStatus,
              })
              .eq("id", stkRequest.invoice_id);

            // Create payment allocation
            await supabaseAdmin
              .from("payment_allocations")
              .insert({
                payment_id: payment.id,
                invoice_id: stkRequest.invoice_id,
                amount: stkRequest.amount,
              });
          }
        }

        // Create in-app notification for parent
        const { data: parentLinks } = await supabaseAdmin
          .from("student_parents")
          .select("parent_id")
          .eq("student_id", stkRequest.student_id);

        if (parentLinks && parentLinks.length > 0) {
          const studentName = stkRequest.students 
            ? `${stkRequest.students.first_name} ${stkRequest.students.last_name}`
            : "Student";

          for (const link of parentLinks) {
            await supabaseAdmin.from("in_app_notifications").insert({
              institution_id: stkRequest.institution_id,
              parent_id: link.parent_id,
              user_type: "parent",
              title: "Payment Successful",
              message: `Your M-PESA payment of KES ${stkRequest.amount.toLocaleString()} for ${studentName} has been received. Receipt: ${mpesaReceipt}`,
              type: "payment",
              reference_type: "student_payment",
              reference_id: payment.id,
            });
          }
        }
      }

      // Log successful payment
      await supabaseAdmin.from("audit_logs").insert({
        action: "MPESA_PAYMENT_RECEIVED",
        entity_type: "mpesa_stk_request",
        entity_id: stkRequest.id,
        institution_id: stkRequest.institution_id,
        metadata: {
          amount: stkRequest.amount,
          mpesa_receipt: mpesaReceipt,
          phone: phoneNumber,
          student_id: stkRequest.student_id,
          invoice_id: stkRequest.invoice_id,
        },
      });

    } else {
      // Log failed payment
      await supabaseAdmin.from("audit_logs").insert({
        action: "MPESA_PAYMENT_FAILED",
        entity_type: "mpesa_stk_request",
        entity_id: stkRequest.id,
        institution_id: stkRequest.institution_id,
        metadata: {
          result_code: ResultCode,
          result_desc: ResultDesc,
          phone: phoneNumber,
        },
      });
    }

    // Return success to Safaricom
    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error processing M-PESA callback:", error);
    // Still return success to prevent Safaricom retries
    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
