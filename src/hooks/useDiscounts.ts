import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FeeDiscount {
  id: string;
  institution_id: string;
  name: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  amount: number;
  criteria: Record<string, unknown>;
  applicable_fee_items: string[];
  applicable_classes: string[];
  start_date: string | null;
  end_date: string | null;
  max_usage: number | null;
  current_usage: number;
  is_active: boolean;
  requires_approval: boolean;
  created_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDiscountInput {
  institution_id: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  amount: number;
  applicable_fee_items?: string[];
  applicable_classes?: string[];
  start_date?: string;
  end_date?: string;
  max_usage?: number;
  requires_approval?: boolean;
}

export function useDiscounts(institutionId: string | null) {
  return useQuery({
    queryKey: ['fee-discounts', institutionId],
    queryFn: async (): Promise<FeeDiscount[]> => {
      if (!institutionId) return [];
      
      const { data, error } = await supabase
        .from('fee_discounts')
        .select('*')
        .eq('institution_id', institutionId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return (data || []) as FeeDiscount[];
    },
    enabled: !!institutionId,
  });
}

export function useCreateDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDiscountInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('fee_discounts')
        .insert({
          ...input,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fee-discounts', variables.institution_id] });
      toast.success('Discount created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create discount: ${error.message}`);
    },
  });
}

export function useUpdateDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, institutionId, ...updates }: { id: string; institutionId: string; name?: string; amount?: number; is_active?: boolean }) => {
      const { data, error } = await supabase
        .from('fee_discounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fee-discounts', variables.institutionId] });
      toast.success('Discount updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update discount: ${error.message}`);
    },
  });
}

export function useDeleteDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, institutionId }: { id: string; institutionId: string }) => {
      const { error } = await supabase
        .from('fee_discounts')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fee-discounts', variables.institutionId] });
      toast.success('Discount deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete discount: ${error.message}`);
    },
  });
}

export function useApproveDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, institutionId }: { id: string; institutionId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('fee_discounts')
        .update({ 
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fee-discounts', variables.institutionId] });
      toast.success('Discount approved');
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve discount: ${error.message}`);
    },
  });
}
