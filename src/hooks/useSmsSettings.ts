import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SmsSettings {
  id: string;
  institution_id: string | null;
  provider: string;
  api_url: string;
  sender_name: string;
  transactional_sender_id: string | null;
  promotional_sender_id: string | null;
  transactional_sender_type: number;
  promotional_sender_type: number;
  is_active: boolean;
}

export function useSmsSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['sms-settings-platform'],
    queryFn: async () => {
      // Always fetch platform-wide settings (institution_id IS NULL)
      const { data, error } = await supabase
        .from('sms_settings')
        .select('*')
        .is('institution_id', null)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as SmsSettings | null;
    },
  });

  const updateSenderIds = useMutation({
    mutationFn: async (data: {
      transactional_sender_id: string;
      promotional_sender_id: string;
    }) => {
      // Check if platform settings exist
      const { data: existing } = await supabase
        .from('sms_settings')
        .select('id')
        .is('institution_id', null)
        .maybeSingle();

      if (existing) {
        // Update existing platform settings
        const { error } = await supabase
          .from('sms_settings')
          .update({
            transactional_sender_id: data.transactional_sender_id,
            promotional_sender_id: data.promotional_sender_id,
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new platform settings
        const { error } = await supabase
          .from('sms_settings')
          .insert({
            institution_id: null,
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
      queryClient.invalidateQueries({ queryKey: ['sms-settings-platform'] });
      toast.success('Platform SMS Sender IDs updated successfully');
    },
    onError: (error) => {
      console.error('Error updating sender IDs:', error);
      toast.error('Failed to update SMS settings');
    },
  });

  return {
    settings,
    isLoading,
    error,
    updateSenderIds,
  };
}
