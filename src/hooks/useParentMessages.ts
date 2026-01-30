import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParentAuth } from '@/contexts/ParentAuthContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface Staff {
  id: string;
  first_name: string;
  last_name: string;
  designation: string | null;
}

export interface MessageThread {
  id: string;
  subject: string | null;
  last_message_at: string;
  created_at: string;
  staff: Staff;
  unread_count: number;
}

export interface ThreadMessage {
  id: string;
  sender_type: 'parent' | 'staff';
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

// Get the appropriate auth token for API calls
// Only uses OTP token if parent session is actively verified (not just localStorage presence)
async function getAuthToken(): Promise<string | null> {
  // Check if we're in an active OTP session by checking both token AND session verified flag
  const otpToken = localStorage.getItem('parent_session_token');
  const isOtpSessionActive = localStorage.getItem('parent_session_verified') === 'true';
  
  if (otpToken && isOtpSessionActive) {
    return otpToken;
  }

  // Fall back to Supabase Auth session
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

async function fetchWithAuth(endpoint: string, options?: RequestInit) {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/parent-messages${endpoint}`, {
    ...options,
    headers: {
      ...options?.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
}

// Hook to check if parent is authenticated via any method
function useParentAuthenticated() {
  const { isAuthenticated: isOtpAuth } = useParentAuth();
  const { user, hasRole } = useAuth();
  
  // Parent is authenticated if OTP login or Supabase Auth with parent role
  const isSupabaseParent = !!user && hasRole('parent');
  
  return isOtpAuth || isSupabaseParent;
}

export function useParentThreads() {
  const isAuthenticated = useParentAuthenticated();

  return useQuery({
    queryKey: ['parent-threads'],
    queryFn: async () => {
      const data = await fetchWithAuth('?action=list');
      return (data.threads || []) as MessageThread[];
    },
    enabled: isAuthenticated,
  });
}

export function useParentThreadMessages(threadId: string | null) {
  const isAuthenticated = useParentAuthenticated();

  return useQuery({
    queryKey: ['parent-thread-messages', threadId],
    queryFn: async () => {
      if (!threadId) return { thread: null, messages: [] };
      const data = await fetchWithAuth(`?action=thread&thread_id=${threadId}`);
      return {
        thread: data.thread,
        messages: (data.messages || []) as ThreadMessage[],
      };
    },
    enabled: isAuthenticated && !!threadId,
  });
}

export function useSendParentMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ threadId, content }: { threadId: string; content: string }) => {
      return fetchWithAuth('?action=send', {
        method: 'POST',
        body: JSON.stringify({ thread_id: threadId, content }),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['parent-thread-messages', variables.threadId] });
      queryClient.invalidateQueries({ queryKey: ['parent-threads'] });
    },
  });
}

export function useParentNotificationsOTP() {
  const isAuthenticated = useParentAuthenticated();

  return useQuery({
    queryKey: ['parent-notifications-otp'],
    queryFn: async () => {
      const data = await fetchWithAuth('?action=notifications');
      return data.notifications || [];
    },
    enabled: isAuthenticated,
  });
}

export function useMarkParentNotificationReadOTP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId?: string) => {
      return fetchWithAuth('?action=mark_read', {
        method: 'POST',
        body: JSON.stringify({ notification_id: notificationId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-notifications-otp'] });
    },
  });
}

export function useParentUnreadThreadCount() {
  const { data: threads = [] } = useParentThreads();
  return threads.reduce((count, thread) => count + thread.unread_count, 0);
}
