import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useStaffProfile } from '@/hooks/useStaffProfile';

export interface StaffThread {
  id: string;
  subject: string | null;
  last_message_at: string;
  created_at: string;
  parent: {
    id: string;
    first_name: string;
    last_name: string;
  };
  unread_count: number;
}

export interface StaffThreadMessage {
  id: string;
  sender_type: 'parent' | 'staff';
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export function useStaffThreads() {
  const { data: staffProfile } = useStaffProfile();

  return useQuery({
    queryKey: ['staff-threads', staffProfile?.id],
    queryFn: async () => {
      if (!staffProfile?.id) return [];

      const { data: threads, error } = await supabase
        .from('message_threads')
        .select(`
          id,
          subject,
          last_message_at,
          created_at,
          parent:parent_id (
            id,
            first_name,
            last_name
          )
        `)
        .eq('staff_id', staffProfile.id)
        .eq('is_archived', false)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Get unread counts for each thread (messages from parents not yet read)
      const threadIds = threads?.map(t => t.id) || [];
      let unreadCounts: Record<string, number> = {};

      if (threadIds.length > 0) {
        const { data: unreadData } = await supabase
          .from('thread_messages')
          .select('thread_id')
          .in('thread_id', threadIds)
          .eq('is_read', false)
          .eq('sender_type', 'parent');

        unreadData?.forEach(msg => {
          unreadCounts[msg.thread_id] = (unreadCounts[msg.thread_id] || 0) + 1;
        });
      }

      return (threads || []).map(t => ({
        ...t,
        unread_count: unreadCounts[t.id] || 0
      })) as StaffThread[];
    },
    enabled: !!staffProfile?.id,
  });
}

export function useStaffThreadMessages(threadId: string | null) {
  const { data: staffProfile } = useStaffProfile();

  return useQuery({
    queryKey: ['staff-thread-messages', threadId],
    queryFn: async () => {
      if (!threadId || !staffProfile?.id) return { thread: null, messages: [] };

      // Fetch thread with parent info
      const { data: thread, error: threadError } = await supabase
        .from('message_threads')
        .select(`
          id,
          subject,
          parent:parent_id (
            id,
            first_name,
            last_name
          )
        `)
        .eq('id', threadId)
        .eq('staff_id', staffProfile.id)
        .single();

      if (threadError) throw threadError;

      // Fetch messages
      const { data: messages, error: messagesError } = await supabase
        .from('thread_messages')
        .select('id, sender_type, sender_id, content, is_read, created_at')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // Mark parent messages as read
      await supabase
        .from('thread_messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('thread_id', threadId)
        .eq('sender_type', 'parent')
        .eq('is_read', false);

      return {
        thread,
        messages: (messages || []) as StaffThreadMessage[],
      };
    },
    enabled: !!threadId && !!staffProfile?.id,
  });
}

export function useSendStaffMessage() {
  const queryClient = useQueryClient();
  const { data: staffProfile } = useStaffProfile();

  return useMutation({
    mutationFn: async ({ threadId, content }: { threadId: string; content: string }) => {
      if (!staffProfile?.id) throw new Error('Not authenticated');

      // Get thread info for notification
      const { data: thread, error: threadError } = await supabase
        .from('message_threads')
        .select('parent_id, institution_id')
        .eq('id', threadId)
        .eq('staff_id', staffProfile.id)
        .single();

      if (threadError || !thread) throw new Error('Thread not found');

      // Insert message
      const { data: message, error: insertError } = await supabase
        .from('thread_messages')
        .insert({
          thread_id: threadId,
          sender_type: 'staff',
          sender_id: staffProfile.id,
          content,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update thread last_message_at
      await supabase
        .from('message_threads')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', threadId);

      // Create notification for parent
      await supabase
        .from('in_app_notifications')
        .insert({
          institution_id: thread.institution_id,
          parent_id: thread.parent_id,
          user_type: 'parent',
          type: 'info',
          title: 'New Message from Teacher',
          message: `${staffProfile.first_name} ${staffProfile.last_name}: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`,
          reference_type: 'thread_message',
          reference_id: message.id,
        });

      return message;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staff-thread-messages', variables.threadId] });
      queryClient.invalidateQueries({ queryKey: ['staff-threads'] });
    },
  });
}

export function useStaffUnreadThreadCount() {
  const { data: threads = [] } = useStaffThreads();
  return threads.reduce((count, thread) => count + thread.unread_count, 0);
}
