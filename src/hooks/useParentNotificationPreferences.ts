import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NotificationPreference {
  id: string;
  parent_id: string;
  institution_id: string;
  channel: 'sms' | 'email' | 'in_app';
  is_opted_in: boolean;
  opted_out_at: string | null;
  opted_out_reason: string | null;
}

export function useParentNotificationPreferences(parentId: string | null, institutionId: string | null) {
  return useQuery({
    queryKey: ['parent-notification-preferences', parentId, institutionId],
    queryFn: async () => {
      if (!parentId || !institutionId) return [];

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('parent_id', parentId)
        .eq('institution_id', institutionId);

      if (error) throw error;
      return (data || []) as NotificationPreference[];
    },
    enabled: !!parentId && !!institutionId,
  });
}

export function useUpdateNotificationPreference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      parentId,
      institutionId,
      channel,
      isOptedIn,
      reason,
    }: {
      parentId: string;
      institutionId: string;
      channel: 'sms' | 'email' | 'in_app';
      isOptedIn: boolean;
      reason?: string;
    }) => {
      // Check if preference exists
      const { data: existing } = await supabase
        .from('notification_preferences')
        .select('id')
        .eq('parent_id', parentId)
        .eq('institution_id', institutionId)
        .eq('channel', channel)
        .maybeSingle();

      const updateData = {
        is_opted_in: isOptedIn,
        opted_out_at: isOptedIn ? null : new Date().toISOString(),
        opted_out_reason: isOptedIn ? null : reason || null,
        updated_at: new Date().toISOString(),
      };

      if (existing) {
        const { error } = await supabase
          .from('notification_preferences')
          .update(updateData)
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notification_preferences')
          .insert({
            parent_id: parentId,
            institution_id: institutionId,
            channel,
            is_opted_in: isOptedIn,
            opted_out_at: isOptedIn ? null : new Date().toISOString(),
            opted_out_reason: isOptedIn ? null : reason || null,
          });

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['parent-notification-preferences', variables.parentId, variables.institutionId],
      });
      toast.success('Notification preference updated');
    },
    onError: (error) => {
      console.error('Failed to update preference:', error);
      toast.error('Failed to update preference');
    },
  });
}

// Helper to get preference status for a channel
export function getPreferenceStatus(
  preferences: NotificationPreference[],
  channel: 'sms' | 'email' | 'in_app'
): boolean {
  const pref = preferences.find(p => p.channel === channel);
  // Default to opted-in if no preference exists
  return pref?.is_opted_in ?? true;
}
