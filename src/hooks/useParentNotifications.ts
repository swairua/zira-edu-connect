import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface ParentNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  reference_type?: string;
  reference_id?: string;
}

export function useParentNotifications(parentId: string | null) {
  return useQuery({
    queryKey: ['parent-notifications', parentId],
    queryFn: async () => {
      if (!parentId) return [];

      const { data, error } = await supabase
        .from('in_app_notifications')
        .select('*')
        .eq('parent_id', parentId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data || []) as ParentNotification[];
    },
    enabled: !!parentId,
  });
}

export function useParentUnreadCount(parentId: string | null) {
  return useQuery({
    queryKey: ['parent-notifications-unread', parentId],
    queryFn: async () => {
      if (!parentId) return 0;

      const { count, error } = await supabase
        .from('in_app_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', parentId)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!parentId,
  });
}

export function useMarkParentNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('in_app_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['parent-notifications-unread'] });
    },
  });
}

export function useMarkAllParentNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (parentId: string) => {
      const { error } = await supabase
        .from('in_app_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('parent_id', parentId)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['parent-notifications-unread'] });
    },
  });
}

export function useParentNotificationSubscription(parentId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!parentId) return;

    const channel = supabase
      .channel(`parent-notifications-${parentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'in_app_notifications',
          filter: `parent_id=eq.${parentId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['parent-notifications', parentId] });
          queryClient.invalidateQueries({ queryKey: ['parent-notifications-unread', parentId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [parentId, queryClient]);
}
