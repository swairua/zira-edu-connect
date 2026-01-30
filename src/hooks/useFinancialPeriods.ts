import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type PeriodType = 'month' | 'term' | 'quarter' | 'year' | 'custom';

export interface FinancialPeriod {
  id: string;
  institution_id: string;
  period_name: string;
  period_type: PeriodType;
  start_date: string;
  end_date: string;
  is_locked: boolean;
  locked_at: string | null;
  locked_by: string | null;
  lock_reason: string | null;
  can_unlock: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  locker?: { first_name: string; last_name: string; email: string };
}

export interface CreatePeriodInput {
  institution_id: string;
  period_name: string;
  period_type: PeriodType;
  start_date: string;
  end_date: string;
}

export function useFinancialPeriods(institutionId: string | null) {
  return useQuery({
    queryKey: ['financial-periods', institutionId],
    queryFn: async (): Promise<FinancialPeriod[]> => {
      if (!institutionId) return [];
      
      const { data, error } = await supabase
        .from('financial_periods')
        .select('*')
        .eq('institution_id', institutionId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as FinancialPeriod[];
    },
    enabled: !!institutionId,
  });
}

export function useCurrentPeriod(institutionId: string | null) {
  return useQuery({
    queryKey: ['current-financial-period', institutionId],
    queryFn: async (): Promise<FinancialPeriod | null> => {
      if (!institutionId) return null;
      
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('financial_periods')
        .select('*')
        .eq('institution_id', institutionId)
        .lte('start_date', today)
        .gte('end_date', today)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as FinancialPeriod | null;
    },
    enabled: !!institutionId,
  });
}

export function useCreatePeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePeriodInput) => {
      const { data, error } = await supabase
        .from('financial_periods')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['financial-periods', variables.institution_id] });
      toast.success('Financial period created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create period: ${error.message}`);
    },
  });
}

export function useLockPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      institutionId, 
      lock_reason 
    }: { 
      id: string; 
      institutionId: string; 
      lock_reason?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('financial_periods')
        .update({
          is_locked: true,
          locked_at: new Date().toISOString(),
          locked_by: user?.id,
          lock_reason,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['financial-periods', variables.institutionId] });
      queryClient.invalidateQueries({ queryKey: ['current-financial-period', variables.institutionId] });
      toast.success('Period locked successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to lock period: ${error.message}`);
    },
  });
}

export function useUnlockPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, institutionId }: { id: string; institutionId: string }) => {
      const { error } = await supabase
        .from('financial_periods')
        .update({
          is_locked: false,
          locked_at: null,
          locked_by: null,
          lock_reason: null,
        })
        .eq('id', id)
        .eq('can_unlock', true);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['financial-periods', variables.institutionId] });
      queryClient.invalidateQueries({ queryKey: ['current-financial-period', variables.institutionId] });
      toast.success('Period unlocked successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to unlock period: ${error.message}`);
    },
  });
}

export function useDeletePeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, institutionId }: { id: string; institutionId: string }) => {
      const { error } = await supabase
        .from('financial_periods')
        .delete()
        .eq('id', id)
        .eq('is_locked', false);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['financial-periods', variables.institutionId] });
      toast.success('Period deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete period: ${error.message}`);
    },
  });
}

// Check if a date falls within a locked period
export function useDateLockStatus(institutionId: string | null, date: string) {
  return useQuery({
    queryKey: ['date-lock-status', institutionId, date],
    queryFn: async (): Promise<{ isLocked: boolean; period?: FinancialPeriod }> => {
      if (!institutionId || !date) return { isLocked: false };
      
      const { data, error } = await supabase
        .from('financial_periods')
        .select('*')
        .eq('institution_id', institutionId)
        .eq('is_locked', true)
        .lte('start_date', date)
        .gte('end_date', date)
        .maybeSingle();

      if (error) throw error;
      
      return {
        isLocked: !!data,
        period: data as FinancialPeriod | undefined,
      };
    },
    enabled: !!institutionId && !!date,
  });
}
