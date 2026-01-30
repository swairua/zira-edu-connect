import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';
import { toast } from 'sonner';

export interface BoardingFeeConfig {
  id: string;
  institution_id: string;
  hostel_id: string | null;
  room_type: string | null;
  academic_year_id: string | null;
  term_id: string | null;
  fee_amount: number;
  deposit_amount: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  hostel?: {
    id: string;
    name: string;
    code: string;
  };
  academic_year?: {
    id: string;
    name: string;
  };
  term?: {
    id: string;
    name: string;
  };
}

export function useBoardingFeeConfigs() {
  const { institution } = useInstitution();

  return useQuery({
    queryKey: ['boarding-fee-configs', institution?.id],
    queryFn: async () => {
      if (!institution?.id) return [];

      const { data, error } = await supabase
        .from('boarding_fee_configs')
        .select(`
          *,
          hostel:hostels(id, name, code),
          academic_year:academic_years(id, name),
          term:terms(id, name)
        `)
        .eq('institution_id', institution.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BoardingFeeConfig[];
    },
    enabled: !!institution?.id,
  });
}

export function useCreateBoardingFeeConfig() {
  const queryClient = useQueryClient();
  const { institution } = useInstitution();

  return useMutation({
    mutationFn: async (data: {
      hostel_id?: string;
      room_type?: string;
      academic_year_id?: string;
      term_id?: string;
      fee_amount: number;
      deposit_amount?: number;
    }) => {
      if (!institution?.id) throw new Error('No institution selected');

      const { data: config, error } = await supabase
        .from('boarding_fee_configs')
        .insert({
          institution_id: institution.id,
          currency: 'KES',
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      return config;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boarding-fee-configs'] });
      toast.success('Boarding fee configuration created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create configuration');
    },
  });
}

export function useUpdateBoardingFeeConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      hostel_id?: string | null;
      room_type?: string | null;
      academic_year_id?: string | null;
      term_id?: string | null;
      fee_amount?: number;
      deposit_amount?: number;
      is_active?: boolean;
    }) => {
      const { data: config, error } = await supabase
        .from('boarding_fee_configs')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return config;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boarding-fee-configs'] });
      toast.success('Configuration updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update configuration');
    },
  });
}

export function useDeleteBoardingFeeConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('boarding_fee_configs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boarding-fee-configs'] });
      toast.success('Configuration deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete configuration');
    },
  });
}
