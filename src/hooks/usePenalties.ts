import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LatePenalty {
  id: string;
  institution_id: string;
  fee_item_id: string | null;
  name: string;
  grace_period_days: number;
  penalty_type: 'percentage' | 'fixed';
  penalty_amount: number;
  max_penalty: number | null;
  is_compounding: boolean;
  apply_per: 'invoice' | 'installment' | 'day';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePenaltyInput {
  institution_id: string;
  fee_item_id?: string;
  name: string;
  grace_period_days?: number;
  penalty_type: 'percentage' | 'fixed';
  penalty_amount: number;
  max_penalty?: number;
  is_compounding?: boolean;
  apply_per?: 'invoice' | 'installment' | 'day';
}

export function usePenalties(institutionId: string | null) {
  return useQuery({
    queryKey: ['late-penalties', institutionId],
    queryFn: async (): Promise<LatePenalty[]> => {
      if (!institutionId) return [];
      
      const { data, error } = await supabase
        .from('late_payment_penalties')
        .select('*')
        .eq('institution_id', institutionId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return (data || []) as LatePenalty[];
    },
    enabled: !!institutionId,
  });
}

export function useCreatePenalty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePenaltyInput) => {
      const { data, error } = await supabase
        .from('late_payment_penalties')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['late-penalties', variables.institution_id] });
      toast.success('Penalty rule created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create penalty: ${error.message}`);
    },
  });
}

export function useUpdatePenalty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, institutionId, ...updates }: Partial<LatePenalty> & { id: string; institutionId: string }) => {
      const { data, error } = await supabase
        .from('late_payment_penalties')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['late-penalties', variables.institutionId] });
      toast.success('Penalty rule updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update penalty: ${error.message}`);
    },
  });
}

export function useDeletePenalty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, institutionId }: { id: string; institutionId: string }) => {
      const { error } = await supabase
        .from('late_payment_penalties')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['late-penalties', variables.institutionId] });
      toast.success('Penalty rule deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete penalty: ${error.message}`);
    },
  });
}

// Calculate penalty for a given overdue amount and days
export function calculatePenalty(
  penalty: LatePenalty,
  overdueAmount: number,
  daysOverdue: number
): number {
  if (daysOverdue <= penalty.grace_period_days) return 0;
  
  const effectiveDays = daysOverdue - penalty.grace_period_days;
  let penaltyAmount = 0;

  if (penalty.penalty_type === 'fixed') {
    if (penalty.apply_per === 'day') {
      penaltyAmount = penalty.penalty_amount * effectiveDays;
    } else {
      penaltyAmount = penalty.penalty_amount;
    }
  } else {
    // Percentage
    if (penalty.is_compounding && penalty.apply_per === 'day') {
      // Compound interest
      penaltyAmount = overdueAmount * (Math.pow(1 + penalty.penalty_amount / 100, effectiveDays) - 1);
    } else if (penalty.apply_per === 'day') {
      penaltyAmount = overdueAmount * (penalty.penalty_amount / 100) * effectiveDays;
    } else {
      penaltyAmount = overdueAmount * (penalty.penalty_amount / 100);
    }
  }

  // Apply max penalty cap if set
  if (penalty.max_penalty && penaltyAmount > penalty.max_penalty) {
    penaltyAmount = penalty.max_penalty;
  }

  return Math.round(penaltyAmount);
}
