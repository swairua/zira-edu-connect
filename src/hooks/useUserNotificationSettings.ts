import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface NotificationSettings {
  email_notifications: boolean;
  payment_alerts: boolean;
  system_updates: boolean;
  sms_notifications: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  email_notifications: true,
  payment_alerts: true,
  system_updates: false,
  sms_notifications: false,
};

export function useUserNotificationSettings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-notification-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return DEFAULT_SETTINGS;

      const { data, error } = await supabase
        .from('profiles')
        .select('notification_settings')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching notification settings:', error);
        return DEFAULT_SETTINGS;
      }

      const rawSettings = data?.notification_settings as Record<string, unknown> | null;
      if (!rawSettings) return DEFAULT_SETTINGS;
      
      return {
        email_notifications: Boolean(rawSettings.email_notifications ?? DEFAULT_SETTINGS.email_notifications),
        payment_alerts: Boolean(rawSettings.payment_alerts ?? DEFAULT_SETTINGS.payment_alerts),
        system_updates: Boolean(rawSettings.system_updates ?? DEFAULT_SETTINGS.system_updates),
        sms_notifications: Boolean(rawSettings.sms_notifications ?? DEFAULT_SETTINGS.sms_notifications),
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateNotificationSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: NotificationSettings) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ notification_settings: settings as unknown as Json })
        .eq('id', user.id);

      if (error) throw error;
      return settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notification-settings', user?.id] });
      toast.success('Notification preferences saved');
    },
    onError: (error) => {
      toast.error('Failed to save preferences: ' + error.message);
    },
  });
}
