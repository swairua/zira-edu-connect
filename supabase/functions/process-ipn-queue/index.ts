import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QueueItem {
  id: string;
  ipn_event_id: string;
  institution_id: string | null;
  match_status: string;
  retry_count: number;
  max_retries: number;
  ipn_events: {
    id: string;
    amount: number;
    currency: string;
    external_reference: string | null;
    sender_phone: string | null;
    sender_name: string | null;
    bank_reference: string | null;
    integration_id: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('[Process IPN Queue] Starting queue processing');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get pending queue items
    const { data: queueItems, error: fetchError } = await supabase
      .from('ipn_processing_queue')
      .select(`
        *,
        ipn_events(id, amount, currency, external_reference, sender_phone, sender_name, bank_reference, integration_id)
      `)
      .in('match_status', ['pending', 'partial_match'])
      .or('next_retry_at.is.null,next_retry_at.lte.now()')
      .lt('retry_count', 5)
      .limit(50);

    if (fetchError) {
      console.error('[Process IPN Queue] Fetch error:', fetchError);
      throw fetchError;
    }

    console.log(`[Process IPN Queue] Processing ${queueItems?.length || 0} items`);

    let processed = 0;
    let matched = 0;
    let failed = 0;

    for (const item of (queueItems || []) as QueueItem[]) {
      try {
        const event = item.ipn_events;
        if (!event) continue;

        let matchedStudentId: string | null = null;
        let matchedInvoiceId: string | null = null;
        let matchConfidence = 0;
        let matchDetails: Record<string, unknown> = {};

        // Try to match by external reference (admission number, invoice number, etc.)
        if (event.external_reference && item.institution_id) {
          // Try admission number match
          const { data: studentByAdmission } = await supabase
            .from('students')
            .select('id')
            .eq('institution_id', item.institution_id)
            .eq('admission_number', event.external_reference)
            .single();

          if (studentByAdmission) {
            matchedStudentId = studentByAdmission.id;
            matchConfidence = 95;
            matchDetails.matched_by = 'admission_number';
          } else {
            // Try invoice number match
            const { data: invoice } = await supabase
              .from('student_invoices')
              .select('id, student_id')
              .eq('institution_id', item.institution_id)
              .eq('invoice_number', event.external_reference)
              .single();

            if (invoice) {
              matchedStudentId = invoice.student_id;
              matchedInvoiceId = invoice.id;
              matchConfidence = 100;
              matchDetails.matched_by = 'invoice_number';
            } else {
              // Try partial match on reference containing admission number
              const { data: students } = await supabase
                .from('students')
                .select('id, admission_number')
                .eq('institution_id', item.institution_id);

              for (const student of students || []) {
                if (student.admission_number && 
                    event.external_reference.includes(student.admission_number)) {
                  matchedStudentId = student.id;
                  matchConfidence = 70;
                  matchDetails.matched_by = 'partial_admission_match';
                  break;
                }
              }
            }
          }
        }

        // Try phone number match if no student found
        if (!matchedStudentId && event.sender_phone && item.institution_id) {
          // Check parent phone numbers
          const { data: parent } = await supabase
            .from('parents')
            .select('id')
            .eq('institution_id', item.institution_id)
            .eq('phone', event.sender_phone)
            .single();

          if (parent) {
            // Get linked student
            const { data: studentParent } = await supabase
              .from('student_parents')
              .select('student_id')
              .eq('parent_id', parent.id)
              .limit(1)
              .single();

            if (studentParent) {
              matchedStudentId = studentParent.student_id;
              matchConfidence = 60;
              matchDetails.matched_by = 'parent_phone';
            }
          }
        }

        // Determine final match status
        let newMatchStatus: string;
        if (matchedStudentId && matchConfidence >= 80) {
          newMatchStatus = 'matched';
          matched++;
        } else if (matchedStudentId && matchConfidence >= 50) {
          newMatchStatus = 'partial_match';
        } else if (item.retry_count >= item.max_retries - 1) {
          newMatchStatus = 'unmatched';
          failed++;
        } else {
          newMatchStatus = 'pending';
        }

        // Update queue item
        const updateData: Record<string, unknown> = {
          match_status: newMatchStatus,
          match_confidence: matchConfidence,
          match_details: matchDetails,
          retry_count: item.retry_count + 1,
          updated_at: new Date().toISOString(),
        };

        if (matchedStudentId) {
          updateData.student_id = matchedStudentId;
        }
        if (matchedInvoiceId) {
          updateData.invoice_id = matchedInvoiceId;
        }

        if (newMatchStatus === 'pending') {
          // Schedule retry in 5 minutes
          updateData.next_retry_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();
        } else {
          updateData.processed_at = new Date().toISOString();
        }

        await supabase
          .from('ipn_processing_queue')
          .update(updateData)
          .eq('id', item.id);

        // If matched with high confidence, create payment record
        if (newMatchStatus === 'matched' && matchedStudentId) {
          // Get or create student fee account
          let { data: feeAccount } = await supabase
            .from('student_fee_accounts')
            .select('id')
            .eq('student_id', matchedStudentId)
            .single();

          if (!feeAccount) {
            const { data: newAccount } = await supabase
              .from('student_fee_accounts')
              .insert({
                student_id: matchedStudentId,
                institution_id: item.institution_id,
                total_fees: 0,
                total_paid: 0,
                balance: 0,
              })
              .select()
              .single();
            feeAccount = newAccount;
          }

          if (feeAccount) {
            // Create payment record
            await supabase
              .from('student_payments')
              .insert({
                student_id: matchedStudentId,
                student_fee_account_id: feeAccount.id,
                institution_id: item.institution_id,
                invoice_id: matchedInvoiceId,
                amount: event.amount,
                payment_method: 'mobile_money',
                payment_date: new Date().toISOString(),
                reference_number: event.bank_reference,
                status: 'completed',
                notes: `Auto-applied from IPN: ${event.external_reference || event.bank_reference}`,
              });

            // Update student fee account balance
            await supabase.rpc('update_student_fee_balance', {
              p_student_id: matchedStudentId,
            });

            // Update queue item with action taken
            await supabase
              .from('ipn_processing_queue')
              .update({
                action_taken: 'auto_applied',
                action_at: new Date().toISOString(),
              })
              .eq('id', item.id);

            // Update IPN event status
            await supabase
              .from('ipn_events')
              .update({
                status: 'processed',
                processing_completed_at: new Date().toISOString(),
              })
              .eq('id', event.id);
          }
        }

        processed++;
      } catch (itemError) {
        console.error(`[Process IPN Queue] Error processing item ${item.id}:`, itemError);
        
        // Mark as exception
        await supabase
          .from('ipn_processing_queue')
          .update({
            match_status: 'exception',
            processing_notes: `Error: ${itemError instanceof Error ? itemError.message : 'Unknown error'}`,
            updated_at: new Date().toISOString(),
          })
          .eq('id', item.id);
      }
    }

    console.log(`[Process IPN Queue] Completed: ${processed} processed, ${matched} matched, ${failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        processed,
        matched,
        failed,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[Process IPN Queue] Error:', error);

    return new Response(
      JSON.stringify({ 
        error: 'Processing failed',
        message: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
