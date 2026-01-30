import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface InstitutionSmsSettings {
  id: string;
  institution_id: string;
  institution_name: string;
  transactional_sender_id: string | null;
  promotional_sender_id: string | null;
  is_active: boolean;
}

export function useInstitutionSmsSettings() {
  const queryClient = useQueryClient();

  // Fetch all institution-specific SMS settings (not platform defaults)
  const { data: institutionSettings, isLoading, error } = useQuery({
    queryKey: ['sms-settings-institutions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sms_settings')
        .select(`
          id,
          institution_id,
          transactional_sender_id,
          promotional_sender_id,
          is_active,
          institutions!inner(name)
        `)
        .not('institution_id', 'is', null)
        .eq('is_active', true);

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        institution_id: item.institution_id,
        institution_name: item.institutions?.name || 'Unknown',
        transactional_sender_id: item.transactional_sender_id,
        promotional_sender_id: item.promotional_sender_id,
        is_active: item.is_active,
      })) as InstitutionSmsSettings[];
    },
  });

  // Add or update institution-specific settings
  const upsertSettings = useMutation({
    mutationFn: async (data: {
      institution_id: string;
      transactional_sender_id: string;
      promotional_sender_id: string;
    }) => {
      // Check if settings exist for this institution
      const { data: existing } = await supabase
        .from('sms_settings')
        .select('id')
        .eq('institution_id', data.institution_id)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('sms_settings')
          .update({
            transactional_sender_id: data.transactional_sender_id,
            promotional_sender_id: data.promotional_sender_id,
            is_active: true,
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new institution-specific settings
        const { error } = await supabase
          .from('sms_settings')
          .insert({
            institution_id: data.institution_id,
            provider: 'roberms',
            api_url: 'https://endpint.roberms.com/roberms/bulk_api/',
            sender_name: data.transactional_sender_id || 'SCHOOL',
            username: 'ZIRA TECH',
            transactional_sender_id: data.transactional_sender_id,
            promotional_sender_id: data.promotional_sender_id,
            is_active: true,
          } as any);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-settings-institutions'] });
      toast.success('Institution SMS settings saved');
    },
    onError: (error) => {
      console.error('Error saving institution SMS settings:', error);
      toast.error('Failed to save institution SMS settings');
    },
  });

  // Delete institution-specific settings (revert to platform defaults)
  const deleteSettings = useMutation({
    mutationFn: async (institutionId: string) => {
      const { error } = await supabase
        .from('sms_settings')
        .delete()
        .eq('institution_id', institutionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-settings-institutions'] });
      toast.success('Institution will now use platform defaults');
    },
    onError: (error) => {
      console.error('Error removing institution SMS settings:', error);
      toast.error('Failed to remove institution SMS settings');
    },
  });

  return {
    institutionSettings: institutionSettings || [],
    isLoading,
    error,
    upsertSettings,
    deleteSettings,
  };
}
