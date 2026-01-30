import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PurchaseRequest {
  institution_id: string;
  bundle_id: string;
  phone_number: string;
}

// Format phone number to Kenyan format (254...)
function formatPhoneNumber(phone: string): string {
  let cleaned = phone.trim().replace(/[\s-]/g, '');
  if (cleaned.startsWith('+254')) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  } else if (!cleaned.startsWith('254') && /^\d{9}$/.test(cleaned)) {
    cleaned = '254' + cleaned;
  }
  return cleaned.replace(/\D/g, '');
}

// Generate timestamp for M-PESA
function generateTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Generate M-PESA password
function generatePassword(shortcode: string, passkey: string, timestamp: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${shortcode}${passkey}${timestamp}`);
  return btoa(String.fromCharCode(...data));
}

// Get M-PESA access token
async function getAccessToken(consumerKey: string, consumerSecret: string, isSandbox: boolean): Promise<string> {
  const authUrl = isSandbox
    ? 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    : 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

  const credentials = btoa(`${consumerKey}:${consumerSecret}`);

  const response = await fetch(authUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${credentials}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('M-PESA auth error:', errorText);
    throw new Error('Failed to get M-PESA access token');
  }

  const data = await response.json();
  return data.access_token;
}

// Initiate STK Push
async function initiateStkPush(params: {
  accessToken: string;
  shortcode: string;
  passkey: string;
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
  callbackUrl: string;
  isSandbox: boolean;
}): Promise<{ CheckoutRequestID: string; MerchantRequestID: string }> {
  const timestamp = generateTimestamp();
  const password = generatePassword(params.shortcode, params.passkey, timestamp);

  const stkUrl = params.isSandbox
    ? 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
    : 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

  const payload = {
    BusinessShortCode: params.shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(params.amount),
    PartyA: params.phoneNumber,
    PartyB: params.shortcode,
    PhoneNumber: params.phoneNumber,
    CallBackURL: params.callbackUrl,
    AccountReference: params.accountReference,
    TransactionDesc: params.transactionDesc,
  };

  console.log('STK Push payload:', JSON.stringify({ ...payload, Password: '[REDACTED]' }));

  const response = await fetch(stkUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const responseData = await response.json();
  console.log('STK Push response:', JSON.stringify(responseData));

  if (responseData.ResponseCode !== '0') {
    throw new Error(responseData.ResponseDescription || 'STK Push failed');
  }

  return {
    CheckoutRequestID: responseData.CheckoutRequestID,
    MerchantRequestID: responseData.MerchantRequestID,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('==== SMS CREDIT PURCHASE START ====');

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const mpesaConsumerKey = Deno.env.get('MPESA_CONSUMER_KEY');
    const mpesaConsumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET');
    const mpesaShortcode = Deno.env.get('MPESA_SHORTCODE');
    const mpesaPasskey = Deno.env.get('MPESA_PASSKEY');
    const mpesaEnvironment = Deno.env.get('MPESA_ENVIRONMENT') || 'sandbox';
    const callbackBaseUrl = Deno.env.get('SUPABASE_URL')!;

    // Validate M-PESA configuration
    if (!mpesaConsumerKey || !mpesaConsumerSecret || !mpesaShortcode || !mpesaPasskey) {
      console.error('M-PESA configuration incomplete');
      return new Response(
        JSON.stringify({ success: false, error: 'M-PESA payment not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: PurchaseRequest = await req.json();
    const { institution_id, bundle_id, phone_number } = body;

    if (!institution_id || !bundle_id || !phone_number) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user has access to institution
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('institution_id', institution_id)
      .maybeSingle();

    if (!userRole) {
      return new Response(
        JSON.stringify({ success: false, error: 'Access denied to this institution' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get bundle details
    const { data: bundle, error: bundleError } = await supabase
      .from('sms_bundles')
      .select('*')
      .eq('id', bundle_id)
      .eq('is_active', true)
      .single();

    if (bundleError || !bundle) {
      return new Response(
        JSON.stringify({ success: false, error: 'Bundle not found or inactive' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for pending purchase
    const { data: pendingPurchase } = await supabase
      .from('sms_credit_purchases')
      .select('id')
      .eq('institution_id', institution_id)
      .in('status', ['pending', 'processing'])
      .maybeSingle();

    if (pendingPurchase) {
      return new Response(
        JSON.stringify({ success: false, error: 'You have a pending purchase. Please wait or try again later.' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formattedPhone = formatPhoneNumber(phone_number);
    const totalCredits = bundle.credits + (bundle.bonus_credits || 0);
    const isSandbox = mpesaEnvironment === 'sandbox';

    // Create purchase record
    const { data: purchase, error: insertError } = await supabase
      .from('sms_credit_purchases')
      .insert({
        institution_id,
        bundle_id,
        amount: bundle.price,
        credits_to_add: totalCredits,
        phone_number: formattedPhone,
        status: 'pending',
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError || !purchase) {
      console.error('Failed to create purchase record:', insertError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create purchase record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get access token and initiate STK Push
    try {
      const accessToken = await getAccessToken(mpesaConsumerKey, mpesaConsumerSecret, isSandbox);
      
      const callbackUrl = `${callbackBaseUrl}/functions/v1/mpesa-sms-callback`;
      
      const stkResult = await initiateStkPush({
        accessToken,
        shortcode: mpesaShortcode,
        passkey: mpesaPasskey,
        phoneNumber: formattedPhone,
        amount: bundle.price,
        accountReference: `SMS-${purchase.id.substring(0, 8).toUpperCase()}`,
        transactionDesc: `SMS Credits - ${bundle.name}`,
        callbackUrl,
        isSandbox,
      });

      // Update purchase with checkout IDs
      await supabase
        .from('sms_credit_purchases')
        .update({
          checkout_request_id: stkResult.CheckoutRequestID,
          merchant_request_id: stkResult.MerchantRequestID,
          status: 'processing',
        })
        .eq('id', purchase.id);

      console.log('STK Push initiated successfully:', stkResult.CheckoutRequestID);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Payment initiated. Check your phone for M-PESA prompt.',
          purchase_id: purchase.id,
          checkout_request_id: stkResult.CheckoutRequestID,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (stkError) {
      // Mark purchase as failed
      await supabase
        .from('sms_credit_purchases')
        .update({
          status: 'failed',
          result_desc: stkError instanceof Error ? stkError.message : 'STK Push failed',
        })
        .eq('id', purchase.id);

      console.error('STK Push error:', stkError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to initiate M-PESA payment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Purchase error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } finally {
    console.log('==== SMS CREDIT PURCHASE END ====');
  }
});
