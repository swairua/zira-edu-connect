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
  console.log("mpesa-subscription-callback function invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const body: MpesaCallbackBody = await req.json();
    console.log("M-PESA Subscription Callback received:", JSON.stringify(body, null, 2));

    const { stkCallback } = body.Body;
    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    // Find the payment record
    const { data: payment, error: findError } = await supabaseAdmin
      .from("institution_payments")
      .select("*, institution_invoices(*)")
      .eq("checkout_request_id", CheckoutRequestID)
      .single();

    if (findError || !payment) {
      console.error("Payment not found:", CheckoutRequestID);
      return new Response(
        JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Already processed
    if (payment.status === "completed") {
      console.log("Payment already processed:", payment.id);
      return new Response(
        JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Extract metadata if successful
    let mpesaReceipt = null;
    let transactionDate = null;
    let phoneNumber = payment.mpesa_phone;

    if (ResultCode === 0 && CallbackMetadata?.Item) {
      for (const item of CallbackMetadata.Item) {
        switch (item.Name) {
          case "MpesaReceiptNumber":
            mpesaReceipt = item.Value as string;
            break;
          case "TransactionDate":
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

    // Update payment record
    await supabaseAdmin
      .from("institution_payments")
      .update({
        status: newStatus,
        mpesa_receipt: mpesaReceipt,
        payment_reference: mpesaReceipt,
        metadata: {
          ...payment.metadata,
          result_code: ResultCode,
          result_desc: ResultDesc,
          transaction_date: transactionDate,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    // Update invoice status
    if (payment.invoice_id) {
      await supabaseAdmin
        .from("institution_invoices")
        .update({
          status: newStatus === "completed" ? "paid" : "pending",
          paid_at: newStatus === "completed" ? new Date().toISOString() : null,
          payment_method: "mpesa",
          payment_reference: mpesaReceipt,
        })
        .eq("id", payment.invoice_id);
    }

    // If successful, apply the upgrade/addon
    if (ResultCode === 0) {
      console.log("Payment successful, applying changes");

      const metadata = payment.metadata as Record<string, any>;
      const paymentType = payment.payment_type;
      const institutionId = payment.institution_id;

      if (paymentType === 'plan_upgrade' && metadata?.plan_id) {
        // Update institution's subscription plan
        const billingCycle = metadata.billing_cycle || 'monthly';
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + (billingCycle === 'annual' ? 12 : 1));

        await supabaseAdmin
          .from("institutions")
          .update({
            subscription_plan: metadata.plan_id,
            subscription_started_at: new Date().toISOString(),
            subscription_expires_at: expiresAt.toISOString(),
            last_payment_at: new Date().toISOString(),
          })
          .eq("id", institutionId);

        console.log("Plan upgraded to:", metadata.plan_id);
      } else if (paymentType === 'addon_purchase' && metadata?.module_id) {
        // Enable the module for the institution
        const { data: existingConfig } = await supabaseAdmin
          .from("institution_module_config")
          .select("id")
          .eq("institution_id", institutionId)
          .eq("module_id", metadata.module_id)
          .single();

        if (existingConfig) {
          await supabaseAdmin
            .from("institution_module_config")
            .update({
              is_enabled: true,
              activation_type: 'addon',
              activated_at: new Date().toISOString(),
            })
            .eq("id", existingConfig.id);
        } else {
          await supabaseAdmin
            .from("institution_module_config")
            .insert({
              institution_id: institutionId,
              module_id: metadata.module_id,
              is_enabled: true,
              activation_type: 'addon',
              activated_at: new Date().toISOString(),
            });
        }

        console.log("Module enabled:", metadata.module_id);
      } else if (paymentType === 'renewal') {
        // Extend subscription
        const currentExpiry = payment.institution_invoices?.billing_period_end;
        const newExpiry = new Date(currentExpiry || Date.now());
        newExpiry.setMonth(newExpiry.getMonth() + 1);

        await supabaseAdmin
          .from("institutions")
          .update({
            subscription_expires_at: newExpiry.toISOString(),
            last_payment_at: new Date().toISOString(),
          })
          .eq("id", institutionId);

        console.log("Subscription renewed until:", newExpiry.toISOString());
      }

      // Log successful payment
      await supabaseAdmin.from("audit_logs").insert({
        action: "SUBSCRIPTION_PAYMENT_COMPLETED",
        entity_type: "institution_payment",
        entity_id: payment.id,
        institution_id: institutionId,
        metadata: {
          payment_type: paymentType,
          amount: payment.amount,
          mpesa_receipt: mpesaReceipt,
          plan_id: metadata?.plan_id,
          module_id: metadata?.module_id,
        },
      });

    } else {
      // Log failed payment
      await supabaseAdmin.from("audit_logs").insert({
        action: "SUBSCRIPTION_PAYMENT_FAILED",
        entity_type: "institution_payment",
        entity_id: payment.id,
        institution_id: payment.institution_id,
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
    console.error("Error processing subscription callback:", error);
    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
