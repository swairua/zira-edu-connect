import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useStudentAuth } from '@/contexts/StudentAuthContext';

interface StudentNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  reference_type?: string;
  reference_id?: string;
}

// For Supabase-authenticated students
export function useStudentNotifications(studentId: string | null) {
  return useQuery({
    queryKey: ['student-notifications', studentId],
    queryFn: async () => {
      if (!studentId) return [];

      const { data, error } = await supabase
        .from('in_app_notifications')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data || []) as StudentNotification[];
    },
    enabled: !!studentId,
  });
}

export function useStudentUnreadCount(studentId: string | null) {
  return useQuery({
    queryKey: ['student-notifications-unread', studentId],
    queryFn: async () => {
      if (!studentId) return 0;

      const { count, error } = await supabase
        .from('in_app_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', studentId)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!studentId,
  });
}

export function useMarkStudentNotificationRead() {
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
      queryClient.invalidateQueries({ queryKey: ['student-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['student-notifications-unread'] });
    },
  });
}

export function useMarkAllStudentNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentId: string) => {
      const { error } = await supabase
        .from('in_app_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('student_id', studentId)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['student-notifications-unread'] });
    },
  });
}

export function useStudentNotificationSubscription(studentId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!studentId) return;

    const channel = supabase
      .channel(`student-notifications-${studentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'in_app_notifications',
          filter: `student_id=eq.${studentId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['student-notifications', studentId] });
          queryClient.invalidateQueries({ queryKey: ['student-notifications-unread', studentId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentId, queryClient]);
}

// For OTP-authenticated students (via edge function)
export function useStudentNotificationsOTP() {
  const { student, isAuthenticated } = useStudentAuth();

  return useQuery({
    queryKey: ['student-notifications-otp', student?.id],
    queryFn: async () => {
      if (!student?.id) return [];

      const token = localStorage.getItem('student_session_token');
      if (!token) return [];

      const { data, error } = await supabase.functions.invoke('get-student-notifications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (error) throw error;
      return (data?.notifications || []) as StudentNotification[];
    },
    enabled: isAuthenticated && !!student?.id,
  });
}

export function useMarkStudentNotificationReadOTP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId?: string) => {
      const token = localStorage.getItem('student_session_token');
      if (!token) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('mark-student-notification-read', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: { notificationId }, // If undefined, marks all as read
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-notifications-otp'] });
    },
  });
}
