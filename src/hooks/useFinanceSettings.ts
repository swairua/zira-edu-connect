import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FinanceModuleSettings, InstitutionSettings } from '@/types/institution-settings';
import type { Json } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { DEFAULT_FINANCE_SETTINGS } from '@/types/institution-settings';

export function useFinanceSettings(institutionId: string | undefined) {
  const { data: institutionSettings, ...rest } = useQuery({
    queryKey: ['institution-settings', institutionId],
    queryFn: async () => {
      if (!institutionId) return null;
      
      const { data, error } = await supabase
        .from('institutions')
        .select('settings')
        .eq('id', institutionId)
        .single();

      if (error) throw error;
      return data?.settings as InstitutionSettings | null;
    },
    enabled: !!institutionId,
    staleTime: 5 * 60 * 1000,
  });

  const financeSettings: FinanceModuleSettings = {
    ...DEFAULT_FINANCE_SETTINGS,
    ...(institutionSettings?.finance || {}),
  };

  return {
    data: financeSettings,
    ...rest,
  };
}

export function useUpdateFinanceSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ institutionId, settings }: { 
      institutionId: string; 
      settings: Partial<FinanceModuleSettings>;
    }) => {
      // Get current settings
      const { data: current } = await supabase
        .from('institutions')
        .select('settings')
        .eq('id', institutionId)
        .single();

      const currentSettings = (current?.settings || {}) as InstitutionSettings;
      
      // Merge new finance settings
      const updatedSettings: InstitutionSettings = {
        ...currentSettings,
        finance: {
          ...DEFAULT_FINANCE_SETTINGS,
          ...(currentSettings.finance || {}),
          ...settings,
        },
      };

      const { data, error } = await supabase
        .from('institutions')
        .update({ settings: updatedSettings as unknown as Json })
        .eq('id', institutionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['institution-settings', variables.institutionId] });
      toast.success('Finance settings updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update settings: ' + error.message);
    },
  });
}
