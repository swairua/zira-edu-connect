import { useEffect, useState, useCallback } from 'react';
import {
  initializePushNotifications,
  setupPushNotificationListeners,
  removePushNotificationListeners,
  getAndStoreFCMToken,
} from '@/services/pushNotification';

interface NotificationEvent {
  title: string;
  message: string;
  data?: Record<string, string>;
}

/**
 * Hook to manage push notifications
 * Initializes push notifications on mount and handles incoming notifications
 */
export function usePushNotifications() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastNotification, setLastNotification] = useState<NotificationEvent | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Initialize push notifications
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        await initializePushNotifications();
        setupPushNotificationListeners();
        
        if (isMounted) {
          setIsInitialized(true);
        }
      } catch (err) {
        console.error('Push notification initialization error:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      }
    };

    initialize();

    // Listen for push notifications
    const handleNotification = (event: Event) => {
      const customEvent = event as CustomEvent<NotificationEvent>;
      if (isMounted) {
        setLastNotification(customEvent.detail);
      }
    };

    window.addEventListener('push-notification', handleNotification);

    return () => {
      isMounted = false;
      window.removeEventListener('push-notification', handleNotification);
      removePushNotificationListeners();
    };
  }, []);

  // Refresh FCM token
  const refreshToken = useCallback(async () => {
    try {
      const token = await getAndStoreFCMToken();
      return token;
    } catch (err) {
      console.error('Failed to refresh FCM token:', err);
      throw err;
    }
  }, []);

  return {
    isInitialized,
    lastNotification,
    error,
    refreshToken,
  };
}
