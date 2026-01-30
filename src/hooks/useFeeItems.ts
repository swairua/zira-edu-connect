import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FeeItem {
  id: string;
  institution_id: string;
  name: string;
  description?: string | null;
  amount: number;
  currency?: string | null;
  category?: string | null;
  applicable_to?: string[] | null;
  academic_year_id?: string | null;
  term_id?: string | null;
  is_mandatory?: boolean | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  // Joined data
  academic_year?: {
    id: string;
    name: string;
  } | null;
  term?: {
    id: string;
    name: string;
  } | null;
}

export interface CreateFeeItemInput {
  institution_id: string;
  name: string;
  description?: string;
  amount: number;
  currency?: string;
  category?: string;
  applicable_to?: string[];
  academic_year_id?: string;
  term_id?: string;
  is_mandatory?: boolean;
}

export function useFeeItems(institutionId: string | null, termId?: string) {
  return useQuery({
    queryKey: ['fee-items', institutionId, termId],
    queryFn: async () => {
      if (!institutionId) return [];

      let query = supabase
        .from('fee_items')
        .select(`
          *,
          academic_year:academic_years(id, name),
          term:terms(id, name)
        `)
        .eq('institution_id', institutionId)
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (termId) {
        query = query.eq('term_id', termId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as FeeItem[];
    },
    enabled: !!institutionId,
  });
}

export function useCreateFeeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateFeeItemInput) => {
      const { data, error } = await supabase
        .from('fee_items')
        .insert({
          ...input,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['fee-items', data.institution_id] });
      toast.success('Fee item created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create fee item', { description: error.message });
    },
  });
}

export function useUpdateFeeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FeeItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('fee_items')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['fee-items'] });
      toast.success('Fee item updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update fee item', { description: error.message });
    },
  });
}

export function useDeleteFeeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feeItemId: string) => {
      // Soft delete
      const { error } = await supabase
        .from('fee_items')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', feeItemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-items'] });
      toast.success('Fee item removed');
    },
    onError: (error: Error) => {
      toast.error('Failed to remove fee item', { description: error.message });
    },
  });
}

export function useFeeCategories() {
  return [
    { value: 'tuition', label: 'Tuition' },
    { value: 'boarding', label: 'Boarding' },
    { value: 'transport', label: 'Transport' },
    { value: 'uniform', label: 'Uniform' },
    { value: 'books', label: 'Books & Materials' },
    { value: 'examination', label: 'Examination' },
    { value: 'activity', label: 'Activity Fee' },
    { value: 'other', label: 'Other' },
  ];
}
