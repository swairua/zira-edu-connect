import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type AdjustmentType = 'reversal' | 'modification' | 'credit_note' | 'write_off' | 'reallocation';
export type EntityType = 'invoice' | 'payment' | 'balance';
export type AdjustmentStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface FinancialAdjustment {
  id: string;
  institution_id: string;
  adjustment_type: AdjustmentType;
  entity_type: EntityType;
  entity_id: string;
  student_id: string | null;
  old_amount: number | null;
  new_amount: number | null;
  adjustment_amount: number;
  reason: string;
  supporting_document_url: string | null;
  status: AdjustmentStatus;
  requested_by: string;
  requested_at: string;
  approved_by: string | null;
  approved_at: string | null;
  approval_notes: string | null;
  secondary_approved_by: string | null;
  secondary_approved_at: string | null;
  requires_secondary_approval: boolean;
  executed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  student?: { first_name: string; last_name: string; admission_number: string };
  requester?: { first_name: string; last_name: string; email: string };
  approver?: { first_name: string; last_name: string; email: string };
}

export interface CreateAdjustmentInput {
  institution_id: string;
  adjustment_type: AdjustmentType;
  entity_type: EntityType;
  entity_id: string;
  student_id?: string;
  old_amount?: number;
  new_amount?: number;
  adjustment_amount: number;
  reason: string;
  supporting_document_url?: string;
}

export interface AdjustmentFilters {
  status?: AdjustmentStatus;
  adjustment_type?: AdjustmentType;
  dateFrom?: string;
  dateTo?: string;
}

export function useFinancialAdjustments(institutionId: string | null, filters?: AdjustmentFilters) {
  return useQuery({
    queryKey: ['financial-adjustments', institutionId, filters],
    queryFn: async (): Promise<FinancialAdjustment[]> => {
      if (!institutionId) return [];
      
      let query = supabase
        .from('financial_adjustments')
        .select(`
          *,
          student:students(first_name, last_name, admission_number)
        `)
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.adjustment_type) {
        query = query.eq('adjustment_type', filters.adjustment_type);
      }
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as unknown as FinancialAdjustment[];
    },
    enabled: !!institutionId,
  });
}

export function usePendingAdjustments(institutionId: string | null) {
  return useQuery({
    queryKey: ['pending-adjustments', institutionId],
    queryFn: async (): Promise<FinancialAdjustment[]> => {
      if (!institutionId) return [];
      
      const { data, error } = await supabase
        .from('financial_adjustments')
        .select(`
          *,
          student:students(first_name, last_name, admission_number)
        `)
        .eq('institution_id', institutionId)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as FinancialAdjustment[];
    },
    enabled: !!institutionId,
  });
}

export function useCreateAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAdjustmentInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('financial_adjustments')
        .insert({
          ...input,
          requested_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['financial-adjustments', variables.institution_id] });
      queryClient.invalidateQueries({ queryKey: ['pending-adjustments', variables.institution_id] });
      toast.success('Adjustment request submitted for approval');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create adjustment: ${error.message}`);
    },
  });
}

export function useApproveAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      institutionId, 
      approval_notes,
      requiresSecondaryApproval = false,
      isSecondaryApproval = false
    }: { 
      id: string; 
      institutionId: string; 
      approval_notes?: string;
      requiresSecondaryApproval?: boolean;
      isSecondaryApproval?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      let updateData: any;
      
      if (isSecondaryApproval) {
        // This is the secondary/final approval
        updateData = {
          status: 'approved',
          secondary_approved_by: user?.id,
          secondary_approved_at: new Date().toISOString(),
          executed_at: new Date().toISOString(),
        };
      } else if (requiresSecondaryApproval) {
        // First approval but needs secondary - stay in pending
        updateData = {
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          approval_notes,
          requires_secondary_approval: true,
          // Status stays 'pending' until secondary approval
        };
      } else {
        // Single-level approval - approve and execute
        updateData = {
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          approval_notes,
          executed_at: new Date().toISOString(),
        };
      }
      
      const { error } = await supabase
        .from('financial_adjustments')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['financial-adjustments', variables.institutionId] });
      queryClient.invalidateQueries({ queryKey: ['pending-adjustments', variables.institutionId] });
      toast.success(variables.isSecondaryApproval ? 'Adjustment final approval granted' : 'Adjustment approved');
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve adjustment: ${error.message}`);
    },
  });
}

export function useRejectAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      institutionId, 
      approval_notes 
    }: { 
      id: string; 
      institutionId: string; 
      approval_notes: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('financial_adjustments')
        .update({
          status: 'rejected',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          approval_notes,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['financial-adjustments', variables.institutionId] });
      queryClient.invalidateQueries({ queryKey: ['pending-adjustments', variables.institutionId] });
      toast.success('Adjustment rejected');
    },
    onError: (error: Error) => {
      toast.error(`Failed to reject adjustment: ${error.message}`);
    },
  });
}

export function useCancelAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, institutionId }: { id: string; institutionId: string }) => {
      const { error } = await supabase
        .from('financial_adjustments')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .eq('status', 'pending');

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['financial-adjustments', variables.institutionId] });
      queryClient.invalidateQueries({ queryKey: ['pending-adjustments', variables.institutionId] });
      toast.success('Adjustment cancelled');
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel adjustment: ${error.message}`);
    },
  });
}
