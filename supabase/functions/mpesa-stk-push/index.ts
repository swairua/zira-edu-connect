import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// M-PESA Configuration
const MPESA_CONSUMER_KEY = Deno.env.get("MPESA_CONSUMER_KEY");
const MPESA_CONSUMER_SECRET = Deno.env.get("MPESA_CONSUMER_SECRET");
const MPESA_SHORTCODE = Deno.env.get("MPESA_SHORTCODE");
const MPESA_PASSKEY = Deno.env.get("MPESA_PASSKEY");
const MPESA_CALLBACK_URL = Deno.env.get("MPESA_CALLBACK_URL");
const MPESA_ENVIRONMENT = Deno.env.get("MPESA_ENVIRONMENT") || "sandbox";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StkPushRequest {
  phone: string;
  amount: number;
  invoiceId: string;
  studentId: string;
  institutionId: string;
  triggeredBy?: "parent" | "system" | "admin";
  accountReference?: string;
  transactionDesc?: string;
}

// Get M-PESA base URL based on environment
function getMpesaBaseUrl(): string {
  return MPESA_ENVIRONMENT === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
}

// Format phone number to M-PESA format (254...)
function formatPhoneNumber(phone: string): string {
  let formatted = phone.replace(/\s+/g, "").replace(/[^0-9]/g, "");
  
  if (formatted.startsWith("0")) {
    formatted = "254" + formatted.substring(1);
  } else if (formatted.startsWith("+254")) {
    formatted = formatted.substring(1);
  } else if (!formatted.startsWith("254")) {
    formatted = "254" + formatted;
  }
  
  return formatted;
}

// Generate timestamp in format YYYYMMDDHHmmss
function generateTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Generate password for STK Push
function generatePassword(shortcode: string, passkey: string, timestamp: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(shortcode + passkey + timestamp);
  const hashBuffer = new Uint8Array(32);
  
  // Use built-in crypto for base64 encoding
  const str = shortcode + passkey + timestamp;
  return btoa(str);
}

// Get M-PESA access token
async function getAccessToken(): Promise<string> {
  const credentials = btoa(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`);
  const baseUrl = getMpesaBaseUrl();
  
  const response = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Failed to get access token:", error);
    throw new Error("Failed to get M-PESA access token");
  }

  const data = await response.json();
  return data.access_token;
}

// Initiate STK Push
async function initiateStkPush(
  accessToken: string,
  phone: string,
  amount: number,
  accountReference: string,
  transactionDesc: string
): Promise<{ CheckoutRequestID: string; MerchantRequestID: string; ResponseCode: string; ResponseDescription: string }> {
  const baseUrl = getMpesaBaseUrl();
  const timestamp = generateTimestamp();
  const password = generatePassword(MPESA_SHORTCODE!, MPESA_PASSKEY!, timestamp);

  const payload = {
    BusinessShortCode: MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.round(amount),
    PartyA: phone,
    PartyB: MPESA_SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: MPESA_CALLBACK_URL,
    AccountReference: accountReference,
    TransactionDesc: transactionDesc,
  };

  console.log("Initiating STK Push:", { phone, amount, accountReference });

  const response = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  
  if (data.ResponseCode !== "0") {
    console.error("STK Push failed:", data);
    throw new Error(data.ResponseDescription || "STK Push request failed");
  }

  return data;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("mpesa-stk-push function invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate M-PESA configuration
    if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET || !MPESA_SHORTCODE || !MPESA_PASSKEY || !MPESA_CALLBACK_URL) {
      console.error("M-PESA configuration missing");
      return new Response(
        JSON.stringify({ error: "M-PESA integration not configured. Please contact administrator." }),
        { status: 503, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verify user
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Parse request
    const body: StkPushRequest = await req.json();
    const { phone, amount, invoiceId, studentId, institutionId, triggeredBy = "admin", accountReference, transactionDesc } = body;

    // Validate required fields
    if (!phone || !amount || !studentId || !institutionId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: phone, amount, studentId, institutionId" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Amount must be greater than 0" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const formattedPhone = formatPhoneNumber(phone);
    
    // Validate phone format
    if (formattedPhone.length !== 12 || !formattedPhone.startsWith("254")) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number format. Please use format: 0712345678 or 254712345678" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check for duplicate pending STK Push (within last 5 minutes for same phone + invoice)
    if (invoiceId) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: pendingRequests } = await supabaseAdmin
        .from("mpesa_stk_requests")
        .select("id")
        .eq("phone_number", formattedPhone)
        .eq("invoice_id", invoiceId)
        .in("status", ["pending", "processing"])
        .gte("created_at", fiveMinutesAgo);

      if (pendingRequests && pendingRequests.length > 0) {
        return new Response(
          JSON.stringify({ error: "A payment request is already pending for this invoice. Please wait a few minutes before trying again." }),
          { status: 409, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Verify invoice is valid (not draft, not cancelled, has balance)
    if (invoiceId) {
      const { data: invoice, error: invoiceError } = await supabaseAdmin
        .from("student_invoices")
        .select("id, status, total_amount, amount_paid")
        .eq("id", invoiceId)
        .single();

      if (invoiceError || !invoice) {
        return new Response(
          JSON.stringify({ error: "Invoice not found" }),
          { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      if (invoice.status === "draft") {
        return new Response(
          JSON.stringify({ error: "Cannot pay draft invoices. Invoice must be posted first." }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      if (invoice.status === "cancelled") {
        return new Response(
          JSON.stringify({ error: "Cannot pay cancelled invoices." }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const balance = (invoice.total_amount || 0) - (invoice.amount_paid || 0);
      if (balance <= 0) {
        return new Response(
          JSON.stringify({ error: "Invoice is already fully paid." }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Create STK request record
    const { data: stkRequest, error: insertError } = await supabaseAdmin
      .from("mpesa_stk_requests")
      .insert({
        institution_id: institutionId,
        student_id: studentId,
        invoice_id: invoiceId || null,
        phone_number: formattedPhone,
        amount: Math.round(amount),
        status: "pending",
        triggered_by: triggeredBy,
        metadata: { user_id: user.id, original_phone: phone },
      })
      .select()
      .single();

    if (insertError || !stkRequest) {
      console.error("Failed to create STK request record:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to initiate payment request" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    try {
      // Get access token
      const accessToken = await getAccessToken();

      // Initiate STK Push
      const ref = accountReference || `FEE-${stkRequest.id.substring(0, 8).toUpperCase()}`;
      const desc = transactionDesc || "School Fee Payment";
      
      const stkResponse = await initiateStkPush(accessToken, formattedPhone, amount, ref, desc);

      // Update record with M-PESA response
      await supabaseAdmin
        .from("mpesa_stk_requests")
        .update({
          checkout_request_id: stkResponse.CheckoutRequestID,
          merchant_request_id: stkResponse.MerchantRequestID,
          status: "processing",
        })
        .eq("id", stkRequest.id);

      // Log to audit
      await supabaseAdmin.from("audit_logs").insert({
        action: "MPESA_STK_PUSH_INITIATED",
        entity_type: "mpesa_stk_request",
        entity_id: stkRequest.id,
        institution_id: institutionId,
        user_id: user.id,
        user_email: user.email,
        metadata: {
          phone: formattedPhone,
          amount,
          invoice_id: invoiceId,
          checkout_request_id: stkResponse.CheckoutRequestID,
        },
      });

      return new Response(
        JSON.stringify({
          success: true,
          requestId: stkRequest.id,
          checkoutRequestId: stkResponse.CheckoutRequestID,
          message: "STK Push sent. Please check your phone and enter M-PESA PIN.",
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );

    } catch (stkError: any) {
      // Update request as failed
      await supabaseAdmin
        .from("mpesa_stk_requests")
        .update({
          status: "failed",
          result_desc: stkError.message,
        })
        .eq("id", stkRequest.id);

      console.error("STK Push failed:", stkError);
      return new Response(
        JSON.stringify({ error: stkError.message || "Failed to send STK Push" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

  } catch (error: any) {
    console.error("Error in mpesa-stk-push function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
