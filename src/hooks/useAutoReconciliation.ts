import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MatchResult {
  recordId: string;
  paymentId: string | null;
  confidence: number; // 0-100
  matchType: 'reference' | 'amount_date' | 'none';
  externalReference: string;
  amount: number;
  transactionDate: string;
}

export interface AutoReconciliationSummary {
  total: number;
  matched: number;
  unmatched: number;
  results: MatchResult[];
}

export function useAutoReconciliation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (institutionId: string): Promise<AutoReconciliationSummary> => {
      // 1. Fetch unmatched reconciliation records
      const { data: unmatchedRecords, error: recordsError } = await supabase
        .from('reconciliation_records')
        .select('*')
        .eq('institution_id', institutionId)
        .eq('status', 'unmatched')
        .order('reconciliation_date', { ascending: false })
        .limit(500);

      if (recordsError) throw recordsError;
      if (!unmatchedRecords || unmatchedRecords.length === 0) {
        return { total: 0, matched: 0, unmatched: 0, results: [] };
      }

      // 2. Fetch unreconciled payments (those not already matched)
      const { data: payments, error: paymentsError } = await supabase
        .from('student_payments')
        .select('id, amount, payment_date, transaction_reference, payment_method')
        .eq('institution_id', institutionId)
        .eq('status', 'confirmed')
        .order('payment_date', { ascending: false })
        .limit(1000);

      if (paymentsError) throw paymentsError;

      // Filter out payments that are already matched
      const matchedPaymentIds = new Set(
        unmatchedRecords
          .filter(r => r.matched_payment_id)
          .map(r => r.matched_payment_id)
      );

      const { data: existingMatched } = await supabase
        .from('reconciliation_records')
        .select('matched_payment_id')
        .eq('institution_id', institutionId)
        .eq('status', 'matched')
        .not('matched_payment_id', 'is', null);

      existingMatched?.forEach(r => {
        if (r.matched_payment_id) matchedPaymentIds.add(r.matched_payment_id);
      });

      const availablePayments = (payments || []).filter(p => !matchedPaymentIds.has(p.id));

      const results: MatchResult[] = [];
      let matchedCount = 0;

      // 3. Run matching algorithm for each unmatched record
      for (const record of unmatchedRecords) {
        let bestMatch: { paymentId: string; confidence: number; matchType: 'reference' | 'amount_date' } | null = null;

        for (const payment of availablePayments) {
          // Priority 1: Exact reference match (confidence 100)
          if (record.external_reference && payment.transaction_reference) {
            const refNormalized = record.external_reference.replace(/\s+/g, '').toUpperCase();
            const payRefNormalized = payment.transaction_reference.replace(/\s+/g, '').toUpperCase();
            
            if (refNormalized === payRefNormalized || 
                refNormalized.includes(payRefNormalized) || 
                payRefNormalized.includes(refNormalized)) {
              bestMatch = { paymentId: payment.id, confidence: 100, matchType: 'reference' };
              break;
            }
          }

          // Priority 2: Amount + Date match (confidence 80-95)
          const amountMatch = Math.abs(record.external_amount - payment.amount) <= 1; // Allow 1 unit rounding diff
          if (amountMatch) {
            const recordDate = record.external_date 
              ? new Date(record.external_date).toDateString()
              : new Date(record.reconciliation_date).toDateString();
            const paymentDate = new Date(payment.payment_date).toDateString();
            
            if (recordDate === paymentDate) {
              // Same date + same amount = high confidence
              const confidence = 95;
              if (!bestMatch || bestMatch.confidence < confidence) {
                bestMatch = { paymentId: payment.id, confidence, matchType: 'amount_date' };
              }
            } else {
              // Check if within 3 days
              const recordDateObj = record.external_date 
                ? new Date(record.external_date) 
                : new Date(record.reconciliation_date);
              const daysDiff = Math.abs(
                (recordDateObj.getTime() - new Date(payment.payment_date).getTime()) / 
                (1000 * 60 * 60 * 24)
              );
              if (daysDiff <= 3) {
                const confidence = 80 - (daysDiff * 5); // 80, 75, 70
                if (!bestMatch || bestMatch.confidence < confidence) {
                  bestMatch = { paymentId: payment.id, confidence, matchType: 'amount_date' };
                }
              }
            }
          }
        }

        const result: MatchResult = {
          recordId: record.id,
          paymentId: bestMatch?.paymentId || null,
          confidence: bestMatch?.confidence || 0,
          matchType: bestMatch?.matchType || 'none',
          externalReference: record.external_reference || '',
          amount: record.external_amount,
          transactionDate: record.external_date || record.reconciliation_date,
        };

        results.push(result);

        // Auto-match if confidence >= 95
        if (bestMatch && bestMatch.confidence >= 95) {
          await supabase
            .from('reconciliation_records')
            .update({
              status: 'matched',
              matched_payment_id: bestMatch.paymentId,
              reconciled_at: new Date().toISOString(),
            })
            .eq('id', record.id);

          matchedCount++;
        }
      }

      return {
        total: unmatchedRecords.length,
        matched: matchedCount,
        unmatched: unmatchedRecords.length - matchedCount,
        results,
      };
    },
    onSuccess: (data, institutionId) => {
      queryClient.invalidateQueries({ queryKey: ['reconciliation-records', institutionId] });
      queryClient.invalidateQueries({ queryKey: ['reconciliation-summary', institutionId] });
      queryClient.invalidateQueries({ queryKey: ['student-payments', institutionId] });
      
      if (data.matched > 0) {
        toast.success(`Auto-matched ${data.matched} of ${data.total} records`);
      } else if (data.total > 0) {
        toast.info('No high-confidence matches found. Try manual matching.');
      } else {
        toast.info('No unmatched records to process');
      }
    },
    onError: (error: Error) => {
      toast.error('Auto-reconciliation failed', { description: error.message });
    },
  });
}

export function useManualMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recordId,
      paymentId,
      institutionId,
    }: {
      recordId: string;
      paymentId: string;
      institutionId: string;
    }) => {
      // Update reconciliation record
      const { error: recordError } = await supabase
        .from('reconciliation_records')
        .update({
          status: 'matched',
          matched_payment_id: paymentId,
          reconciled_at: new Date().toISOString(),
        })
        .eq('id', recordId);

      if (recordError) throw recordError;

      return { recordId, paymentId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reconciliation-records', variables.institutionId] });
      queryClient.invalidateQueries({ queryKey: ['reconciliation-summary', variables.institutionId] });
      queryClient.invalidateQueries({ queryKey: ['student-payments', variables.institutionId] });
      toast.success('Transaction matched successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to match transaction', { description: error.message });
    },
  });
}

export function useSuggestedMatches(institutionId: string | null) {
  return useMutation({
    mutationFn: async (recordId: string) => {
      if (!recordId || !institutionId) return [];

      // Get the record details
      const { data: record } = await supabase
        .from('reconciliation_records')
        .select('*')
        .eq('id', recordId)
        .single();

      if (!record) return [];

      // Find potential matches
      const { data: payments } = await supabase
        .from('student_payments')
        .select(`
          id,
          receipt_number,
          amount,
          payment_date,
          payment_method,
          transaction_reference,
          student:students(first_name, last_name, admission_number)
        `)
        .eq('institution_id', institutionId)
        .eq('status', 'confirmed')
        .gte('amount', record.external_amount * 0.9)
        .lte('amount', record.external_amount * 1.1)
        .order('payment_date', { ascending: false })
        .limit(20);

      return payments || [];
    },
  });
}
