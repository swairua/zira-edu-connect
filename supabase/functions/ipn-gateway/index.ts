import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NormalizedPayload {
  amount: number;
  currency: string;
  sender_phone: string | null;
  sender_name: string | null;
  sender_account: string | null;
  external_reference: string | null;
  bank_reference: string | null;
  transaction_date: string;
  event_type: 'payment' | 'reversal' | 'timeout' | 'validation_failure';
}

// Normalize M-PESA C2B callback payload
function normalizeMpesaPayload(payload: Record<string, unknown>): NormalizedPayload {
  // M-PESA C2B callback structure
  const bodyWrapper = payload.Body as Record<string, unknown> | undefined;
  const body = (bodyWrapper?.stkCallback || payload) as Record<string, unknown>;
  
  // Handle STK Push callback
  if (body.ResultCode !== undefined) {
    const callbackMeta = body.CallbackMetadata as Record<string, unknown> | undefined;
    const metadata = (callbackMeta?.Item || []) as Array<{Name: string, Value: unknown}>;
    const getMetaValue = (name: string) => metadata.find(m => m.Name === name)?.Value;
    
    return {
      amount: Number(getMetaValue('Amount')) || 0,
      currency: 'KES',
      sender_phone: String(getMetaValue('PhoneNumber') || ''),
      sender_name: null,
      sender_account: String(body.CheckoutRequestID || ''),
      external_reference: String(body.CheckoutRequestID || ''),
      bank_reference: String(getMetaValue('MpesaReceiptNumber') || ''),
      transaction_date: new Date().toISOString(),
      event_type: body.ResultCode === 0 ? 'payment' : 'validation_failure',
    };
  }
  
  // Handle C2B validation/confirmation
  return {
    amount: Number(payload.TransAmount) || 0,
    currency: 'KES',
    sender_phone: String(payload.MSISDN || ''),
    sender_name: String(payload.FirstName || '') + ' ' + String(payload.MiddleName || '') + ' ' + String(payload.LastName || ''),
    sender_account: String(payload.BillRefNumber || ''),
    external_reference: String(payload.BillRefNumber || ''),
    bank_reference: String(payload.TransID || ''),
    transaction_date: String(payload.TransTime || new Date().toISOString()),
    event_type: 'payment',
  };
}

// Normalize generic bank API payload
function normalizeBankPayload(payload: Record<string, unknown>, bankCode: string): NormalizedPayload {
  // Generic normalization - banks have different structures
  return {
    amount: Number(payload.amount || payload.Amount || payload.transaction_amount || 0),
    currency: String(payload.currency || payload.Currency || 'KES'),
    sender_phone: String(payload.phone || payload.Phone || payload.sender_phone || payload.customer_phone || ''),
    sender_name: String(payload.name || payload.Name || payload.sender_name || payload.customer_name || ''),
    sender_account: String(payload.account || payload.Account || payload.sender_account || ''),
    external_reference: String(payload.reference || payload.Reference || payload.external_ref || payload.bill_ref || ''),
    bank_reference: String(payload.transaction_id || payload.TransactionId || payload.bank_ref || ''),
    transaction_date: String(payload.timestamp || payload.Timestamp || payload.transaction_date || new Date().toISOString()),
    event_type: 'payment',
  };
}

// Validate IP whitelist (if configured)
function validateIPWhitelist(sourceIP: string, whitelist: string[]): boolean {
  if (!whitelist || whitelist.length === 0) return true;
  return whitelist.includes(sourceIP);
}

// Verify M-PESA signature (simplified - production should verify properly)
function verifyMpesaSignature(payload: unknown, signature: string | null, passkey: string | null): boolean {
  // In production, verify the signature using the passkey
  // For now, just check if we have a valid-looking callback
  return true;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const bankCode = pathParts[pathParts.length - 1] || 'unknown';

  console.log(`[IPN Gateway] Received callback for bank: ${bankCode}`);

  // Get source IP
  const sourceIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                   req.headers.get('cf-connecting-ip') || 
                   'unknown';

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the bank integration
    const { data: integration, error: integrationError } = await supabase
      .from('platform_bank_integrations')
      .select('*')
      .eq('bank_code', bankCode)
      .eq('is_active', true)
      .single();

    if (integrationError || !integration) {
      console.error(`[IPN Gateway] Integration not found or inactive: ${bankCode}`, integrationError);
      return new Response(
        JSON.stringify({ error: 'Integration not found or inactive' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate IP whitelist
    const webhookConfig = integration.webhook_config as Record<string, unknown> || {};
    const ipWhitelist = (webhookConfig.ip_whitelist as string[]) || [];
    
    if (!validateIPWhitelist(sourceIP, ipWhitelist)) {
      console.error(`[IPN Gateway] IP not whitelisted: ${sourceIP}`);
      
      // Log the attempt
      await supabase.from('integration_health_logs').insert({
        integration_id: integration.id,
        check_type: 'callback',
        status: 'failure',
        error_message: `IP not whitelisted: ${sourceIP}`,
        checked_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({ error: 'Unauthorized IP' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse payload
    let rawPayload: Record<string, unknown>;
    try {
      rawPayload = await req.json();
    } catch {
      console.error('[IPN Gateway] Failed to parse JSON payload');
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[IPN Gateway] Raw payload:`, JSON.stringify(rawPayload).substring(0, 500));

    // Normalize payload based on bank type
    let normalizedPayload: NormalizedPayload;
    const validationErrors: string[] = [];

    try {
      if (bankCode === 'mpesa') {
        normalizedPayload = normalizeMpesaPayload(rawPayload);
      } else {
        normalizedPayload = normalizeBankPayload(rawPayload, bankCode);
      }

      // Validate required fields
      if (!normalizedPayload.amount || normalizedPayload.amount <= 0) {
        validationErrors.push('Invalid or missing amount');
      }
      if (!normalizedPayload.bank_reference && !normalizedPayload.external_reference) {
        validationErrors.push('Missing transaction reference');
      }
    } catch (e) {
      console.error('[IPN Gateway] Normalization error:', e);
      validationErrors.push(`Normalization failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
      normalizedPayload = {
        amount: 0,
        currency: 'KES',
        sender_phone: null,
        sender_name: null,
        sender_account: null,
        external_reference: null,
        bank_reference: null,
        transaction_date: new Date().toISOString(),
        event_type: 'validation_failure',
      };
    }

    // Check for duplicate (same bank_reference)
    let isDuplicate = false;
    if (normalizedPayload.bank_reference) {
      const { data: existingEvent } = await supabase
        .from('ipn_events')
        .select('id')
        .eq('bank_reference', normalizedPayload.bank_reference)
        .eq('integration_id', integration.id)
        .single();
      
      isDuplicate = !!existingEvent;
    }

    // Determine status
    let status: string;
    if (isDuplicate) {
      status = 'duplicate';
    } else if (validationErrors.length > 0) {
      status = 'failed';
    } else {
      status = 'validated';
    }

    // Store IPN event
    const { data: ipnEvent, error: insertError } = await supabase
      .from('ipn_events')
      .insert({
        integration_id: integration.id,
        raw_payload: rawPayload,
        normalized_payload: normalizedPayload,
        event_type: normalizedPayload.event_type,
        external_reference: normalizedPayload.external_reference,
        amount: normalizedPayload.amount,
        currency: normalizedPayload.currency,
        sender_phone: normalizedPayload.sender_phone,
        sender_name: normalizedPayload.sender_name?.trim() || null,
        sender_account: normalizedPayload.sender_account,
        bank_reference: normalizedPayload.bank_reference,
        status,
        validation_errors: validationErrors.length > 0 ? validationErrors : null,
        source_ip: sourceIP,
        processing_started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('[IPN Gateway] Failed to store event:', insertError);
      throw insertError;
    }

    console.log(`[IPN Gateway] Event stored: ${ipnEvent.id}, status: ${status}`);

    // If validated, add to processing queue
    if (status === 'validated') {
      // Try to match institution by account reference
      let matchedInstitutionId: string | null = null;
      let matchedBankAccountId: string | null = null;

      if (normalizedPayload.external_reference) {
        // Look for institution bank account that matches
        const { data: bankAccounts } = await supabase
          .from('institution_bank_accounts')
          .select('id, institution_id, account_reference, paybill_number, till_number')
          .eq('platform_integration_id', integration.id)
          .eq('is_enabled', true);

        // Simple matching logic - can be enhanced
        for (const account of bankAccounts || []) {
          if (account.account_reference && 
              normalizedPayload.external_reference.startsWith(account.account_reference)) {
            matchedInstitutionId = account.institution_id;
            matchedBankAccountId = account.id;
            break;
          }
        }
      }

      // Add to processing queue
      const { error: queueError } = await supabase
        .from('ipn_processing_queue')
        .insert({
          ipn_event_id: ipnEvent.id,
          institution_id: matchedInstitutionId,
          institution_bank_account_id: matchedBankAccountId,
          match_status: matchedInstitutionId ? 'matched' : 'pending',
          match_confidence: matchedInstitutionId ? 100 : 0,
          match_details: {
            matched_by: matchedInstitutionId ? 'account_reference' : null,
          },
        });

      if (queueError) {
        console.error('[IPN Gateway] Failed to add to queue:', queueError);
      }

      // Update event status
      await supabase
        .from('ipn_events')
        .update({ status: 'queued' })
        .eq('id', ipnEvent.id);
    }

    // Log successful callback
    await supabase.from('integration_health_logs').insert({
      integration_id: integration.id,
      check_type: 'callback',
      status: 'success',
      response_time_ms: 0, // Could measure actual processing time
      checked_at: new Date().toISOString(),
    });

    // Return success to bank (important to prevent retries)
    // M-PESA expects specific response format
    if (bankCode === 'mpesa') {
      return new Response(
        JSON.stringify({
          ResultCode: 0,
          ResultDesc: 'Accepted',
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        event_id: ipnEvent.id,
        status,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[IPN Gateway] Error:', error);

    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
