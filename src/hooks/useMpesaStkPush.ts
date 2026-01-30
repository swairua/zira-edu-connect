import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MpesaStkRequest {
  id: string;
  institution_id: string;
  student_id: string;
  invoice_id: string | null;
  phone_number: string;
  amount: number;
  checkout_request_id: string | null;
  merchant_request_id: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'timeout' | 'cancelled';
  triggered_by: 'parent' | 'system' | 'admin';
  result_code: string | null;
  result_desc: string | null;
  mpesa_receipt: string | null;
  transaction_date: string | null;
  callback_received_at: string | null;
  retry_count: number;
  created_at: string;
  updated_at: string;
  students?: {
    first_name: string;
    last_name: string;
    admission_number: string;
  };
}

interface InitiateStkPushParams {
  phone: string;
  amount: number;
  invoiceId?: string;
  studentId: string;
  institutionId: string;
  triggeredBy?: 'parent' | 'system' | 'admin';
  accountReference?: string;
  transactionDesc?: string;
}

// Fetch M-PESA STK requests for an institution
export function useMpesaStkRequests(institutionId: string | null, options?: { status?: string; limit?: number }) {
  return useQuery({
    queryKey: ['mpesa-stk-requests', institutionId, options],
    queryFn: async () => {
      if (!institutionId) return [];

      let query = supabase
        .from('mpesa_stk_requests')
        .select(`
          *,
          students (first_name, last_name, admission_number)
        `)
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false });

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MpesaStkRequest[];
    },
    enabled: !!institutionId,
  });
}

// Fetch single STK request by ID
export function useMpesaStkRequest(requestId: string | null) {
  return useQuery({
    queryKey: ['mpesa-stk-request', requestId],
    queryFn: async () => {
      if (!requestId) return null;

      const { data, error } = await supabase
        .from('mpesa_stk_requests')
        .select(`
          *,
          students (first_name, last_name, admission_number)
        `)
        .eq('id', requestId)
        .single();

      if (error) throw error;
      return data as MpesaStkRequest;
    },
    enabled: !!requestId,
    refetchInterval: (query) => {
      const data = query.state.data as MpesaStkRequest | null;
      // Poll every 3 seconds while processing
      if (data?.status === 'processing' || data?.status === 'pending') {
        return 3000;
      }
      return false;
    },
  });
}

// Initiate STK Push
export function useInitiateStkPush() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: InitiateStkPushParams) => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('mpesa-stk-push', {
        body: params,
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to initiate M-PESA payment');
      }

      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mpesa-stk-requests', variables.institutionId] });
      toast.success('M-PESA payment request sent. Check your phone for the prompt.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to initiate M-PESA payment');
    },
  });
}

// Check STK request status manually
export function useCheckStkStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('mpesa-query-status', {
        body: { requestId },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to check payment status');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mpesa-stk-requests'] });
      queryClient.invalidateQueries({ queryKey: ['mpesa-stk-request'] });
    },
  });
}
