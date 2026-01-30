import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ReconciliationSource = 'bank' | 'mpesa' | 'cash' | 'cheque' | 'other';
export type ReconciliationStatus = 'matched' | 'unmatched' | 'exception' | 'duplicate' | 'ignored';

export interface ReconciliationRecord {
  id: string;
  institution_id: string;
  reconciliation_date: string;
  source: ReconciliationSource;
  external_reference: string | null;
  external_amount: number;
  external_date: string | null;
  external_description: string | null;
  matched_payment_id: string | null;
  status: ReconciliationStatus;
  exception_type: string | null;
  exception_notes: string | null;
  reconciled_by: string | null;
  reconciled_at: string | null;
  batch_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  matched_payment?: {
    id: string;
    amount: number;
    receipt_number: string;
    payment_date: string;
  };
}

export interface CreateReconciliationInput {
  institution_id: string;
  reconciliation_date: string;
  source: ReconciliationSource;
  external_reference?: string;
  external_amount: number;
  external_date?: string;
  external_description?: string;
  batch_id?: string;
}

export interface ReconciliationFilters {
  status?: ReconciliationStatus;
  source?: ReconciliationSource;
  dateFrom?: string;
  dateTo?: string;
}

export interface ReconciliationSummary {
  total_records: number;
  matched: number;
  unmatched: number;
  exceptions: number;
  duplicates: number;
  total_external_amount: number;
  total_matched_amount: number;
  variance: number;
}

export function useReconciliationRecords(institutionId: string | null, filters?: ReconciliationFilters) {
  return useQuery({
    queryKey: ['reconciliation-records', institutionId, filters],
    queryFn: async (): Promise<ReconciliationRecord[]> => {
      if (!institutionId) return [];
      
      let query = supabase
        .from('reconciliation_records')
        .select(`
          *,
          matched_payment:student_payments(id, amount, receipt_number, payment_date)
        `)
        .eq('institution_id', institutionId)
        .order('reconciliation_date', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.source) {
        query = query.eq('source', filters.source);
      }
      if (filters?.dateFrom) {
        query = query.gte('reconciliation_date', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('reconciliation_date', filters.dateTo);
      }

      const { data, error } = await query.limit(500);

      if (error) throw error;
      return (data || []) as ReconciliationRecord[];
    },
    enabled: !!institutionId,
  });
}

export function useReconciliationSummary(institutionId: string | null, date?: string) {
  return useQuery({
    queryKey: ['reconciliation-summary', institutionId, date],
    queryFn: async (): Promise<ReconciliationSummary> => {
      if (!institutionId) {
        return {
          total_records: 0,
          matched: 0,
          unmatched: 0,
          exceptions: 0,
          duplicates: 0,
          total_external_amount: 0,
          total_matched_amount: 0,
          variance: 0,
        };
      }
      
      let query = supabase
        .from('reconciliation_records')
        .select('status, external_amount, matched_payment_id')
        .eq('institution_id', institutionId);

      if (date) {
        query = query.eq('reconciliation_date', date);
      }

      const { data, error } = await query;

      if (error) throw error;

      const records = data || [];
      const matched = records.filter(r => r.status === 'matched');
      
      return {
        total_records: records.length,
        matched: matched.length,
        unmatched: records.filter(r => r.status === 'unmatched').length,
        exceptions: records.filter(r => r.status === 'exception').length,
        duplicates: records.filter(r => r.status === 'duplicate').length,
        total_external_amount: records.reduce((sum, r) => sum + r.external_amount, 0),
        total_matched_amount: matched.reduce((sum, r) => sum + r.external_amount, 0),
        variance: records.filter(r => r.status !== 'matched').reduce((sum, r) => sum + r.external_amount, 0),
      };
    },
    enabled: !!institutionId,
  });
}

export function useCreateReconciliationRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateReconciliationInput) => {
      const { data, error } = await supabase
        .from('reconciliation_records')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reconciliation-records', variables.institution_id] });
      queryClient.invalidateQueries({ queryKey: ['reconciliation-summary', variables.institution_id] });
    },
  });
}

export function useBulkCreateReconciliationRecords() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ records, institutionId }: { records: CreateReconciliationInput[]; institutionId: string }) => {
      const { data, error } = await supabase
        .from('reconciliation_records')
        .insert(records)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reconciliation-records', variables.institutionId] });
      queryClient.invalidateQueries({ queryKey: ['reconciliation-summary', variables.institutionId] });
      toast.success('Bank statement imported successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to import statement: ${error.message}`);
    },
  });
}

export function useMatchReconciliationRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      institutionId, 
      paymentId 
    }: { 
      id: string; 
      institutionId: string; 
      paymentId: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('reconciliation_records')
        .update({
          matched_payment_id: paymentId,
          status: 'matched',
          reconciled_by: user?.id,
          reconciled_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reconciliation-records', variables.institutionId] });
      queryClient.invalidateQueries({ queryKey: ['reconciliation-summary', variables.institutionId] });
      toast.success('Record matched successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to match record: ${error.message}`);
    },
  });
}

export function useMarkAsException() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      institutionId, 
      exception_type,
      exception_notes 
    }: { 
      id: string; 
      institutionId: string; 
      exception_type: string;
      exception_notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('reconciliation_records')
        .update({
          status: 'exception',
          exception_type,
          exception_notes,
          reconciled_by: user?.id,
          reconciled_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reconciliation-records', variables.institutionId] });
      queryClient.invalidateQueries({ queryKey: ['reconciliation-summary', variables.institutionId] });
      toast.success('Marked as exception');
    },
    onError: (error: Error) => {
      toast.error(`Failed to mark as exception: ${error.message}`);
    },
  });
}

export function useIgnoreReconciliationRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, institutionId }: { id: string; institutionId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('reconciliation_records')
        .update({
          status: 'ignored',
          reconciled_by: user?.id,
          reconciled_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reconciliation-records', variables.institutionId] });
      queryClient.invalidateQueries({ queryKey: ['reconciliation-summary', variables.institutionId] });
      toast.success('Record ignored');
    },
    onError: (error: Error) => {
      toast.error(`Failed to ignore record: ${error.message}`);
    },
  });
}
