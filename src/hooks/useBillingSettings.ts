import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type BillingCycle = 'monthly' | 'termly' | 'annual';

export interface BillingSettings {
  id: string;
  monthly_enabled: boolean;
  termly_enabled: boolean;
  annual_enabled: boolean;
  default_billing_cycle: BillingCycle;
  monthly_grace_days: number;
  termly_grace_days: number;
  annual_grace_days: number;
  annual_discount_percent: number;
  termly_discount_percent: number;
  updated_at: string;
  updated_by: string | null;
}

export function useBillingSettings() {
  return useQuery({
    queryKey: ['billing-settings'],
    queryFn: async (): Promise<BillingSettings | null> => {
      const { data, error } = await supabase
        .from('billing_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        // If no settings exist, return defaults
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      return data as BillingSettings;
    },
  });
}

export function useUpdateBillingSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<BillingSettings>) => {
      // First get the existing settings ID
      const { data: existing } = await supabase
        .from('billing_settings')
        .select('id')
        .limit(1)
        .single();

      if (!existing) {
        throw new Error('Billing settings not found');
      }

      const { data, error } = await supabase
        .from('billing_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Settings updated',
        description: 'Billing settings have been saved.',
      });
      queryClient.invalidateQueries({ queryKey: ['billing-settings'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useEnabledBillingCycles() {
  const { data: settings, isLoading, isError } = useBillingSettings();
  
  // If still loading, return loading state
  if (isLoading) {
    return { cycles: ['annual'] as BillingCycle[], isLoading: true, isError: false };
  }
  
  // If error or no settings, return defaults but mark as loaded (prevent infinite loading)
  if (isError || !settings) {
    return { cycles: ['annual'] as BillingCycle[], isLoading: false, isError: isError };
  }
  
  const enabledCycles: BillingCycle[] = [];
  
  if (settings.annual_enabled) enabledCycles.push('annual');
  if (settings.termly_enabled) enabledCycles.push('termly');
  if (settings.monthly_enabled) enabledCycles.push('monthly');

  return { 
    cycles: enabledCycles.length > 0 ? enabledCycles : ['annual'] as BillingCycle[],
    isLoading: false,
    isError: false
  };
}

export function getBillingCycleLabel(cycle: BillingCycle): string {
  switch (cycle) {
    case 'monthly': return 'Monthly';
    case 'termly': return 'Termly (3x/year)';
    case 'annual': return 'Annual';
  }
}

export function getBillingCycleShort(cycle: BillingCycle): string {
  switch (cycle) {
    case 'monthly': return '/mo';
    case 'termly': return '/term';
    case 'annual': return '/yr';
  }
}
