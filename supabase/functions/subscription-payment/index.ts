import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscriptionPaymentRequest {
  institutionId: string;
  paymentType: 'plan_upgrade' | 'addon_purchase' | 'renewal';
  amount: number;
  phoneNumber: string;
  planId?: string;
  moduleId?: string;
  billingCycle?: 'monthly' | 'annual';
}

async function getMpesaAccessToken(): Promise<string> {
  const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY");
  const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET");
  
  if (!consumerKey || !consumerSecret) {
    throw new Error("M-PESA credentials not configured");
  }

  const auth = btoa(`${consumerKey}:${consumerSecret}`);
  const response = await fetch(
    "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      method: "GET",
      headers: { Authorization: `Basic ${auth}` },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get M-PESA access token");
  }

  const data = await response.json();
  return data.access_token;
}

async function initiateStkPush(
  accessToken: string,
  phoneNumber: string,
  amount: number,
  accountRef: string
): Promise<{ CheckoutRequestID: string; MerchantRequestID: string }> {
  const shortcode = Deno.env.get("MPESA_SHORTCODE") || "174379";
  const passkey = Deno.env.get("MPESA_PASSKEY") || "";
  const callbackUrl = `${SUPABASE_URL}/functions/v1/mpesa-subscription-callback`;
  
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14);
  const password = btoa(`${shortcode}${passkey}${timestamp}`);

  const response = await fetch(
    "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.ceil(amount),
        PartyA: phoneNumber,
        PartyB: shortcode,
        PhoneNumber: phoneNumber,
        CallBackURL: callbackUrl,
        AccountReference: accountRef,
        TransactionDesc: `Subscription Payment - ${accountRef}`,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.text();
    console.error("STK Push failed:", errorData);
    throw new Error("Failed to initiate M-PESA payment");
  }

  return response.json();
}

const handler = async (req: Request): Promise<Response> => {
  console.log("subscription-payment function invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const body: SubscriptionPaymentRequest = await req.json();
    const { institutionId, paymentType, amount, phoneNumber, planId, moduleId, billingCycle } = body;

    console.log("Processing subscription payment:", { institutionId, paymentType, amount });

    // Validate institution exists
    const { data: institution, error: instError } = await supabaseAdmin
      .from("institutions")
      .select("id, name, code")
      .eq("id", institutionId)
      .single();

    if (instError || !institution) {
      throw new Error("Institution not found");
    }

    // Format phone number
    let formattedPhone = phoneNumber.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith("254")) {
      formattedPhone = "254" + formattedPhone;
    }

    // Generate account reference
    const accountRef = `${institution.code}-${paymentType.toUpperCase().slice(0, 3)}`;

    // Create invoice
    const lineItems = [];
    if (paymentType === 'plan_upgrade' && planId) {
      const { data: plan } = await supabaseAdmin
        .from("subscription_plans")
        .select("name, price_monthly, price_annual")
        .eq("id", planId)
        .single();
      
      if (plan) {
        lineItems.push({
          description: `${plan.name} Plan (${billingCycle || 'monthly'})`,
          amount: billingCycle === 'annual' ? plan.price_annual : plan.price_monthly,
          quantity: 1,
        });
      }
    } else if (paymentType === 'addon_purchase' && moduleId) {
      const { data: module } = await supabaseAdmin
        .from("module_pricing")
        .select("display_name, base_monthly_price")
        .eq("module_id", moduleId)
        .single();
      
      if (module) {
        lineItems.push({
          description: `${module.display_name} Module`,
          amount: module.base_monthly_price,
          quantity: 1,
        });
      }
    }

    const billingPeriodStart = new Date();
    const billingPeriodEnd = new Date();
    billingPeriodEnd.setMonth(billingPeriodEnd.getMonth() + (billingCycle === 'annual' ? 12 : 1));

    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from("institution_invoices")
      .insert({
        institution_id: institutionId,
        invoice_type: paymentType === 'renewal' ? 'renewal' : paymentType === 'addon_purchase' ? 'addon' : 'subscription',
        billing_period_start: billingPeriodStart.toISOString().split('T')[0],
        billing_period_end: billingPeriodEnd.toISOString().split('T')[0],
        plan_id: planId || null,
        base_plan_amount: paymentType === 'addon_purchase' ? 0 : amount,
        addons_amount: paymentType === 'addon_purchase' ? amount : 0,
        total_amount: amount,
        due_date: new Date().toISOString().split('T')[0],
        line_items: lineItems,
        notes: moduleId ? `Module: ${moduleId}` : null,
      })
      .select()
      .single();

    if (invoiceError) {
      console.error("Failed to create invoice:", invoiceError);
      throw new Error("Failed to create invoice");
    }

    // Get M-PESA access token and initiate STK push
    const accessToken = await getMpesaAccessToken();
    const stkResult = await initiateStkPush(accessToken, formattedPhone, amount, accountRef);

    // Create payment record
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("institution_payments")
      .insert({
        institution_id: institutionId,
        invoice_id: invoice.id,
        amount,
        payment_type: paymentType,
        payment_method: "mpesa",
        mpesa_phone: formattedPhone,
        checkout_request_id: stkResult.CheckoutRequestID,
        status: "processing",
        metadata: {
          merchant_request_id: stkResult.MerchantRequestID,
          plan_id: planId,
          module_id: moduleId,
          billing_cycle: billingCycle,
        },
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Failed to create payment record:", paymentError);
      throw new Error("Failed to create payment record");
    }

    // Log the payment initiation
    await supabaseAdmin.from("audit_logs").insert({
      action: "SUBSCRIPTION_PAYMENT_INITIATED",
      entity_type: "institution_payment",
      entity_id: payment.id,
      institution_id: institutionId,
      metadata: {
        payment_type: paymentType,
        amount,
        plan_id: planId,
        module_id: moduleId,
        phone: formattedPhone,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        paymentId: payment.id,
        invoiceId: invoice.id,
        checkoutRequestId: stkResult.CheckoutRequestID,
        message: "Payment initiated. Please check your phone to complete the transaction.",
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error processing subscription payment:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
