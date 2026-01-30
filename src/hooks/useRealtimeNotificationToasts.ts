import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { playNotificationSound, vibrateDevice } from '@/lib/notification-sounds';

interface NotificationPayload {
  id: string;
  title: string;
  message: string;
  type: string;
  priority?: string;
  parent_id?: string;
  student_id?: string;
  user_id?: string;
}

interface UseRealtimeNotificationToastsOptions {
  parentId?: string | null;
  studentId?: string | null;
  userId?: string | null;
  enabled?: boolean;
  playSound?: boolean;
  vibrate?: boolean;
}

/**
 * Hook to subscribe to realtime notifications and show toast alerts
 * Works for parent, student, and staff portals
 */
export function useRealtimeNotificationToasts({
  parentId,
  studentId,
  userId,
  enabled = true,
  playSound = true,
  vibrate = true,
}: UseRealtimeNotificationToastsOptions) {
  const hasSubscribed = useRef(false);

  useEffect(() => {
    // Determine which filter to use based on user type
    const filterColumn = parentId ? 'parent_id' : studentId ? 'student_id' : userId ? 'user_id' : null;
    const filterValue = parentId || studentId || userId;

    if (!enabled || !filterColumn || !filterValue) {
      return;
    }

    // Avoid duplicate subscriptions
    if (hasSubscribed.current) {
      return;
    }

    hasSubscribed.current = true;

    const channelName = `notification-toasts-${filterColumn}-${filterValue}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'in_app_notifications',
          filter: `${filterColumn}=eq.${filterValue}`,
        },
        (payload) => {
          const notification = payload.new as NotificationPayload;
          
          // Determine toast variant based on priority/type
          const isUrgent = notification.priority === 'urgent' || 
                          notification.priority === 'high' ||
                          notification.type === 'fee_reminder' ||
                          notification.type === 'payment_overdue';

          // Play sound and vibrate for urgent notifications
          if (isUrgent) {
            if (playSound) {
              playNotificationSound('urgent');
            }
            if (vibrate) {
              vibrateDevice('urgent');
            }
          } else {
            if (playSound) {
              playNotificationSound('default');
            }
            if (vibrate) {
              vibrateDevice('default');
            }
          }

          // Show toast based on type
          const toastIcon = getToastIcon(notification.type);
          
          if (isUrgent) {
            toast.error(notification.title, {
              description: notification.message,
              icon: toastIcon,
              duration: 8000, // Longer duration for urgent
              action: {
                label: 'View',
                onClick: () => {
                  // Could dispatch navigation event here
                },
              },
            });
          } else {
            toast.info(notification.title, {
              description: notification.message,
              icon: toastIcon,
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      hasSubscribed.current = false;
      supabase.removeChannel(channel);
    };
  }, [parentId, studentId, userId, enabled, playSound, vibrate]);
}

function getToastIcon(type: string): string {
  switch (type) {
    case 'results_published':
    case 'grade':
      return '🎓';
    case 'payment_received':
      return '💳';
    case 'fee_reminder':
    case 'payment_overdue':
      return '⚠️';
    case 'invoice':
      return '📄';
    case 'message':
      return '💬';
    case 'assignment':
    case 'assignment_due':
      return '📝';
    case 'attendance':
      return '📅';
    case 'announcement':
      return '📢';
    case 'transport':
      return '🚌';
    default:
      return '🔔';
  }
}
