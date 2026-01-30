import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SmsRequest {
  phones: string | string[];
  message: string;
  messageType: string;
  smsType?: 'transactional' | 'promotional';
  institutionId?: string;
  recipientName?: string;
  recipientType?: 'parent' | 'staff' | 'student';
}

interface RobermsDataItem {
  username: string;
  phone_number: string;
  unique_identifier: string;
  sender_name: string;
  message: string;
  sender_type: number;
}

interface SmsSettings {
  id: string;
  institution_id: string | null;
  sender_name: string;
  transactional_sender_id: string | null;
  promotional_sender_id: string | null;
  transactional_sender_type: number;
  promotional_sender_type: number;
  api_url: string;
  username: string;
  is_active: boolean;
}

// Format phone number to Kenyan format (254...)
// Supports: +254XXXXXXXXX, 254XXXXXXXXX, 07XXXXXXXX, 7XXXXXXXX
function formatPhoneNumber(phone: string): string {
  // First, remove spaces and dashes for normalization
  let cleaned = phone.trim().replace(/[\s-]/g, '');
  
  // Handle +254 prefix (remove the +, keep 254)
  if (cleaned.startsWith('+254')) {
    cleaned = cleaned.substring(1);
  }
  // Handle 0 prefix (replace with 254)
  else if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  }
  // Handle already correct 254 prefix
  else if (cleaned.startsWith('254')) {
    // Already correct, do nothing
  }
  // Handle bare number without country code (e.g., 722241745)
  else if (/^\d{9}$/.test(cleaned.replace(/\D/g, ''))) {
    cleaned = '254' + cleaned;
  }
  
  // Final cleanup: remove any remaining non-digit characters
  cleaned = cleaned.replace(/\D/g, '');
  
  return cleaned;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log("==== SMS SESSION START ====");

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const robermsToken = Deno.env.get("ROBERMS_API_TOKEN");
    
    if (!robermsToken) {
      console.error("ROBERMS_API_TOKEN not configured");
      return new Response(
        JSON.stringify({ success: false, error: "SMS provider not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    let body: SmsRequest;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Received body:", JSON.stringify(body));
    
    const { phones, message, messageType, smsType = 'transactional', institutionId, recipientName, recipientType } = body;

    if (!phones || !message) {
      console.error("Validation failed - phones:", typeof phones, "message:", typeof message);
      return new Response(
        JSON.stringify({ success: false, error: "phones and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize phones to array
    const phoneList = Array.isArray(phones) ? phones : [phones];
    const smsCount = phoneList.length;
    
    // DEMO MODE CHECK: Skip real SMS for demo institutions
    if (institutionId) {
      const { data: institution } = await supabase
        .from("institutions")
        .select("is_demo")
        .eq("id", institutionId)
        .single();
      
      if (institution?.is_demo) {
        console.log("DEMO MODE: Skipping real SMS send for demo institution");
        return new Response(
          JSON.stringify({ 
            success: true, 
            demo: true, 
            message: "SMS simulated for demo mode",
            recipients: smsCount 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // CREDIT CHECK: Verify institution has enough credits
      const { data: credits } = await supabase
        .from("institution_sms_credits")
        .select("total_credits, used_credits")
        .eq("institution_id", institutionId)
        .single();
      
      const remainingCredits = (credits?.total_credits || 0) - (credits?.used_credits || 0);
      
      if (remainingCredits < smsCount) {
        console.log(`Insufficient credits: need ${smsCount}, have ${remainingCredits}`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Insufficient SMS credits",
            required: smsCount,
            available: remainingCredits
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      console.log(`Credit check passed: using ${smsCount} of ${remainingCredits} available`);
    }

    // TIERED SMS SETTINGS LOOKUP:
    // 1. First try institution-specific settings (if institutionId provided)
    // 2. Fall back to platform defaults (institution_id IS NULL)
    let smsSettings: SmsSettings | null = null;
    
    if (institutionId) {
      const { data: institutionSettings } = await supabase
        .from("sms_settings")
        .select("*")
        .eq("institution_id", institutionId)
        .eq("is_active", true)
        .maybeSingle() as { data: SmsSettings | null };
      
      if (institutionSettings) {
        smsSettings = institutionSettings;
        console.log(`Using institution-specific SMS settings for ${institutionId}`);
      }
    }
    
    // Fall back to platform defaults if no institution-specific settings found
    if (!smsSettings) {
      const { data: platformSettings } = await supabase
        .from("sms_settings")
        .select("*")
        .is("institution_id", null)
        .eq("is_active", true)
        .maybeSingle() as { data: SmsSettings | null };
      
      smsSettings = platformSettings;
      console.log("Using platform default SMS settings");
    }

    const apiUrl = smsSettings?.api_url || "https://endpint.roberms.com/roberms/bulk_api/";
    const username = smsSettings?.username || "ZIRA TECH";
    
    // Select sender based on SMS type
    let senderName: string;
    let senderType: number;
    
    if (smsType === 'promotional') {
      senderName = smsSettings?.promotional_sender_id || smsSettings?.sender_name || "ZIRA TECH";
      senderType = smsSettings?.promotional_sender_type || 10;
    } else {
      senderName = smsSettings?.transactional_sender_id || smsSettings?.sender_name || "ZIRA TECH";
      senderType = smsSettings?.transactional_sender_type || 0;
    }
    
    console.log(`Using sender: ${senderName} (type: ${senderType}) for ${smsType} SMS`);

    // Build RoberMS payload
    const dataSet: RobermsDataItem[] = phoneList.map(phone => ({
      username,
      phone_number: formatPhoneNumber(phone),
      unique_identifier: Math.floor(10000 + Math.random() * 90000).toString(),
      sender_name: senderName,
      message,
      sender_type: senderType
    }));

    const payload = {
      dataSet,
      timeStamp: Math.floor(Date.now() / 1000)
    };

    console.log("Payload:", JSON.stringify(payload));
    console.log(`Sending to ${phoneList.length} recipient(s)`);

    // Send request to RoberMS API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Token ${robermsToken}`
      },
      body: JSON.stringify(payload)
    });

    const httpCode = response.status;
    const responseText = await response.text();
    
    console.log("HTTP CODE:", httpCode);
    console.log("Response:", responseText || "EMPTY");

    let providerResponse;
    try {
      providerResponse = JSON.parse(responseText);
    } catch {
      providerResponse = responseText;
    }

    const isSuccess = httpCode >= 200 && httpCode < 300;
    const status = isSuccess ? "sent" : "failed";

    // Log each SMS to the database
    const smsLogs = dataSet.map(item => ({
      institution_id: institutionId || null,
      recipient_phone: item.phone_number,
      recipient_name: recipientName || null,
      recipient_type: recipientType || null,
      message,
      message_type: messageType,
      status,
      provider_response: providerResponse,
      unique_identifier: item.unique_identifier,
      error_message: isSuccess ? null : (typeof providerResponse === 'string' ? providerResponse : JSON.stringify(providerResponse)),
      sent_at: isSuccess ? new Date().toISOString() : null,
    }));

    const { error: logError } = await supabase
      .from("sms_logs")
      .insert(smsLogs);

    if (logError) {
      console.error("Error logging SMS:", logError);
    }

    // DEDUCT CREDITS after successful send
    if (isSuccess && institutionId) {
      const sentCount = phoneList.length;
      
      // Get current credits again for accurate deduction
      const { data: currentCredits } = await supabase
        .from("institution_sms_credits")
        .select("total_credits, used_credits")
        .eq("institution_id", institutionId)
        .single();
      
      if (currentCredits) {
        const newUsed = (currentCredits.used_credits || 0) + sentCount;
        const newRemaining = (currentCredits.total_credits || 0) - newUsed;
        
        // Update used credits
        const { error: updateError } = await supabase
          .from("institution_sms_credits")
          .update({ used_credits: newUsed })
          .eq("institution_id", institutionId);
        
        if (updateError) {
          console.error("Error updating credits:", updateError);
        } else {
          console.log(`Credits deducted: ${sentCount}. New remaining: ${newRemaining}`);
          
          // Record usage transaction
          await supabase
            .from("sms_credit_transactions")
            .insert({
              institution_id: institutionId,
              transaction_type: "usage",
              credits: -sentCount,
              balance_after: newRemaining,
              description: `Sent ${sentCount} SMS (${messageType})`,
            });
        }
      }
    }

    const duration = Date.now() - startTime;
    console.log(`SMS session completed in ${duration}ms`);
    console.log("==== SMS SESSION END ====");

    return new Response(
      JSON.stringify({
        success: isSuccess,
        http_code: httpCode,
        sent_count: isSuccess ? phoneList.length : 0,
        failed_count: isSuccess ? 0 : phoneList.length,
        response: providerResponse
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-sms:", error);
    console.log("==== SMS SESSION END (ERROR) ====");
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Internal server error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
