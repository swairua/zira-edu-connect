import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AppliedPenalty {
  id: string;
  institution_id: string;
  invoice_id: string;
  student_id: string;
  penalty_rule_id: string | null;
  amount: number;
  days_overdue: number;
  applied_date: string;
  applied_at: string;
  applied_by: 'system' | 'admin';
  waived: boolean;
  waived_at: string | null;
  waived_by: string | null;
  waiver_reason: string | null;
  created_at: string;
  students?: {
    first_name: string;
    last_name: string;
    admission_number: string;
  };
  student_invoices?: {
    invoice_number: string;
    total_amount: number;
    due_date: string;
  };
  late_payment_penalties?: {
    name: string;
    penalty_type: string;
  };
}

export interface PenaltyWaiverRequest {
  id: string;
  institution_id: string;
  applied_penalty_id: string;
  requested_by: string | null;
  requester_type: 'parent' | 'staff';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  applied_penalties?: AppliedPenalty;
}

// Fetch applied penalties
export function useAppliedPenalties(institutionId: string | null, options?: { studentId?: string; invoiceId?: string; includeWaived?: boolean }) {
  return useQuery({
    queryKey: ['applied-penalties', institutionId, options],
    queryFn: async () => {
      if (!institutionId) return [];

      let query = supabase
        .from('applied_penalties')
        .select(`
          *,
          students (first_name, last_name, admission_number),
          student_invoices (invoice_number, total_amount, due_date),
          late_payment_penalties (name, penalty_type)
        `)
        .eq('institution_id', institutionId)
        .order('applied_at', { ascending: false });

      if (options?.studentId) {
        query = query.eq('student_id', options.studentId);
      }

      if (options?.invoiceId) {
        query = query.eq('invoice_id', options.invoiceId);
      }

      if (!options?.includeWaived) {
        query = query.eq('waived', false);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AppliedPenalty[];
    },
    enabled: !!institutionId,
  });
}

// Fetch penalty waiver requests
export function usePenaltyWaiverRequests(institutionId: string | null, status?: string) {
  return useQuery({
    queryKey: ['penalty-waiver-requests', institutionId, status],
    queryFn: async () => {
      if (!institutionId) return [];

      let query = supabase
        .from('penalty_waiver_requests')
        .select(`
          *,
          applied_penalties (
            *,
            students (first_name, last_name, admission_number),
            student_invoices (invoice_number)
          )
        `)
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PenaltyWaiverRequest[];
    },
    enabled: !!institutionId,
  });
}

// Create waiver request
export function useCreateWaiverRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      institution_id: string;
      applied_penalty_id: string;
      reason: string;
      requester_type?: 'parent' | 'staff';
    }) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('penalty_waiver_requests')
        .insert({
          ...params,
          requested_by: user.user?.id,
          requester_type: params.requester_type || 'staff',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['penalty-waiver-requests', variables.institution_id] });
      toast.success('Waiver request submitted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit waiver request');
    },
  });
}

// Approve waiver request
export function useApproveWaiverRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, reviewNotes }: { requestId: string; reviewNotes?: string }) => {
      const { data: user } = await supabase.auth.getUser();
      
      // Get the waiver request
      const { data: request, error: fetchError } = await supabase
        .from('penalty_waiver_requests')
        .select('applied_penalty_id, institution_id')
        .eq('id', requestId)
        .single();

      if (fetchError) throw fetchError;

      // Update the waiver request
      const { error: updateError } = await supabase
        .from('penalty_waiver_requests')
        .update({
          status: 'approved',
          reviewed_by: user.user?.id,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes,
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Mark the penalty as waived
      const { error: penaltyError } = await supabase
        .from('applied_penalties')
        .update({
          waived: true,
          waived_at: new Date().toISOString(),
          waived_by: user.user?.id,
          waiver_reason: reviewNotes,
        })
        .eq('id', request.applied_penalty_id);

      if (penaltyError) throw penaltyError;

      return { requestId, institutionId: request.institution_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['penalty-waiver-requests', data.institutionId] });
      queryClient.invalidateQueries({ queryKey: ['applied-penalties', data.institutionId] });
      toast.success('Waiver approved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve waiver');
    },
  });
}

// Reject waiver request
export function useRejectWaiverRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, reviewNotes }: { requestId: string; reviewNotes?: string }) => {
      const { data: user } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('penalty_waiver_requests')
        .update({
          status: 'rejected',
          reviewed_by: user.user?.id,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes,
        })
        .eq('id', requestId)
        .select('institution_id')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['penalty-waiver-requests', data.institution_id] });
      toast.success('Waiver rejected');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject waiver');
    },
  });
}
