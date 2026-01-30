import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MpesaCallback {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{ Name: string; Value?: string | number }>;
      };
    };
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('==== SMS CREDIT CALLBACK START ====');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse callback body
    const callback: MpesaCallback = await req.json();
    console.log('Callback received:', JSON.stringify(callback));

    const { stkCallback } = callback.Body;
    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    // Find the purchase record
    const { data: purchase, error: findError } = await supabase
      .from('sms_credit_purchases')
      .select('*, sms_bundles(name)')
      .eq('checkout_request_id', CheckoutRequestID)
      .single();

    if (findError || !purchase) {
      console.error('Purchase not found for checkout:', CheckoutRequestID);
      // Return success to M-PESA to prevent retries
      return new Response(
        JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Already processed?
    if (purchase.status === 'completed' || purchase.status === 'failed') {
      console.log('Purchase already processed:', purchase.id);
      return new Response(
        JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract M-PESA receipt from callback
    let mpesaReceipt: string | null = null;
    let transactionDate: string | null = null;
    let phoneNumber: string | null = null;

    if (CallbackMetadata?.Item) {
      for (const item of CallbackMetadata.Item) {
        if (item.Name === 'MpesaReceiptNumber' && item.Value) {
          mpesaReceipt = String(item.Value);
        } else if (item.Name === 'TransactionDate' && item.Value) {
          transactionDate = String(item.Value);
        } else if (item.Name === 'PhoneNumber' && item.Value) {
          phoneNumber = String(item.Value);
        }
      }
    }

    if (ResultCode === 0) {
      // Payment successful - Update purchase and add credits
      console.log('Payment successful:', mpesaReceipt);

      // Update purchase status
      await supabase
        .from('sms_credit_purchases')
        .update({
          status: 'completed',
          result_code: String(ResultCode),
          result_desc: ResultDesc,
          mpesa_receipt: mpesaReceipt,
          callback_received_at: new Date().toISOString(),
        })
        .eq('id', purchase.id);

      // Get current credits
      const { data: currentCredits } = await supabase
        .from('institution_sms_credits')
        .select('total_credits, used_credits')
        .eq('institution_id', purchase.institution_id)
        .single();

      const currentTotal = currentCredits?.total_credits || 0;
      const currentUsed = currentCredits?.used_credits || 0;
      const newTotal = currentTotal + purchase.credits_to_add;
      const newRemaining = newTotal - currentUsed;

      // Upsert credits
      const { error: creditError } = await supabase
        .from('institution_sms_credits')
        .upsert({
          institution_id: purchase.institution_id,
          total_credits: newTotal,
          used_credits: currentUsed,
          last_topup_at: new Date().toISOString(),
        }, {
          onConflict: 'institution_id',
        });

      if (creditError) {
        console.error('Failed to update credits:', creditError);
      }

      // Record transaction
      const { error: txError } = await supabase
        .from('sms_credit_transactions')
        .insert({
          institution_id: purchase.institution_id,
          transaction_type: 'purchase',
          credits: purchase.credits_to_add,
          balance_after: newRemaining,
          bundle_id: purchase.bundle_id,
          payment_id: mpesaReceipt,
          description: `Purchased ${purchase.credits_to_add} SMS credits - ${purchase.sms_bundles?.name || 'Bundle'}`,
        });

      if (txError) {
        console.error('Failed to record transaction:', txError);
      }

      // Send notification to admins
      const { data: admins } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('institution_id', purchase.institution_id)
        .in('role', ['institution_owner', 'institution_admin']);

      if (admins && admins.length > 0) {
        const notifications = admins.map(admin => ({
          user_id: admin.user_id,
          title: 'SMS Credits Purchased',
          message: `${purchase.credits_to_add} SMS credits have been added to your account.`,
          type: 'success',
        }));

        await supabase.from('notifications').insert(notifications);
      }

      // Audit log
      await supabase.from('audit_logs').insert({
        action: 'sms_credits_purchased',
        entity_type: 'sms_credit_purchases',
        entity_id: purchase.id,
        institution_id: purchase.institution_id,
        user_id: purchase.created_by,
        metadata: {
          credits_added: purchase.credits_to_add,
          amount: purchase.amount,
          mpesa_receipt: mpesaReceipt,
          new_balance: newRemaining,
        },
      });

      console.log('Credits added successfully. New balance:', newRemaining);

    } else {
      // Payment failed
      console.log('Payment failed:', ResultDesc);

      await supabase
        .from('sms_credit_purchases')
        .update({
          status: 'failed',
          result_code: String(ResultCode),
          result_desc: ResultDesc,
          callback_received_at: new Date().toISOString(),
        })
        .eq('id', purchase.id);

      // Send failure notification
      if (purchase.created_by) {
        await supabase.from('notifications').insert({
          user_id: purchase.created_by,
          title: 'SMS Credit Purchase Failed',
          message: `Your payment of KES ${purchase.amount} was not completed: ${ResultDesc}`,
          type: 'error',
        });
      }

      // Audit log
      await supabase.from('audit_logs').insert({
        action: 'sms_credits_purchase_failed',
        entity_type: 'sms_credit_purchases',
        entity_id: purchase.id,
        institution_id: purchase.institution_id,
        user_id: purchase.created_by,
        metadata: {
          result_code: ResultCode,
          result_desc: ResultDesc,
        },
      });
    }

    // Always return success to M-PESA
    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Callback processing error:', error);
    // Return success to M-PESA anyway to prevent retries
    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } finally {
    console.log('==== SMS CREDIT CALLBACK END ====');
  }
});
