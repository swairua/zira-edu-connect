import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FeeInstallment {
  id: string;
  institution_id: string;
  fee_item_id: string;
  installment_number: number;
  due_date: string;
  amount: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateInstallmentInput {
  institution_id: string;
  fee_item_id: string;
  installment_number: number;
  due_date: string;
  amount: number;
  description?: string;
}

export function useInstallments(feeItemId: string | null) {
  return useQuery({
    queryKey: ['fee-installments', feeItemId],
    queryFn: async (): Promise<FeeInstallment[]> => {
      if (!feeItemId) return [];
      
      const { data, error } = await supabase
        .from('fee_installments')
        .select('*')
        .eq('fee_item_id', feeItemId)
        .eq('is_active', true)
        .order('installment_number');

      if (error) throw error;
      return data || [];
    },
    enabled: !!feeItemId,
  });
}

export function useCreateInstallment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateInstallmentInput) => {
      const { data, error } = await supabase
        .from('fee_installments')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fee-installments', variables.fee_item_id] });
      toast.success('Installment created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create installment: ${error.message}`);
    },
  });
}

export function useUpdateInstallment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, feeItemId, ...updates }: Partial<FeeInstallment> & { id: string; feeItemId: string }) => {
      const { data, error } = await supabase
        .from('fee_installments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fee-installments', variables.feeItemId] });
      toast.success('Installment updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update installment: ${error.message}`);
    },
  });
}

export function useDeleteInstallment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, feeItemId }: { id: string; feeItemId: string }) => {
      const { error } = await supabase
        .from('fee_installments')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fee-installments', variables.feeItemId] });
      toast.success('Installment deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete installment: ${error.message}`);
    },
  });
}
