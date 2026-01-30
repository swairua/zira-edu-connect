import { PushNotifications, Token, PushNotificationSchema } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

/**
 * Check if running on a native platform
 */
function isNativePlatform(): boolean {
  const platform = Capacitor.getPlatform();
  return platform === 'ios' || platform === 'android';
}

/**
 * Initialize push notifications
 * Handles permission requests and token registration
 */
export async function initializePushNotifications() {
  try {
    // Only initialize on native platforms
    if (!isNativePlatform()) {
      console.log('Push notifications only available on native platforms (iOS/Android)');
      return;
    }

    // Request notification permission
    const permStatus = await PushNotifications.checkPermissions();
    
    if (permStatus.receive === 'denied') {
      // Request permission
      const result = await PushNotifications.requestPermissions();
      if (result.receive === 'denied') {
        console.warn('Notification permissions denied');
        return;
      }
    }

    // Register for push notifications
    await PushNotifications.register();
    
    // Fetch and store FCM token
    const token = await getAndStoreFCMToken();
    console.log('Push notifications initialized with token:', token);
  } catch (error) {
    console.error('Failed to initialize push notifications:', error);
  }
}

/**
 * Get FCM token and store it in Supabase
 */
export async function getAndStoreFCMToken(): Promise<string | null> {
  try {
    // Get the token from the device
    const { token } = await PushNotifications.getDeliveryTokens();
    
    if (!token) {
      console.warn('No FCM token available');
      return null;
    }

    // Store token in Supabase for the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('No authenticated user to store FCM token');
      return token;
    }

    // Store/update FCM token in users table
    await supabase
      .from('users')
      .update({
        fcm_token: token,
        fcm_token_updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    console.log('FCM token stored successfully');
    return token;
  } catch (error) {
    console.error('Failed to get and store FCM token:', error);
    return null;
  }
}

/**
 * Setup push notification listeners
 */
export function setupPushNotificationListeners() {
  // Handle token refresh
  PushNotifications.addListener('registration', (event: Token) => {
    console.log('Push registration successful, token:', event.value);
    storeTokenIfNeeded(event.value);
  });

  // Handle registration error
  PushNotifications.addListener('registrationError', (error: any) => {
    console.error('Push registration error:', error);
  });

  // Handle incoming notifications (foreground)
  PushNotifications.addListener(
    'pushNotificationReceived',
    async (notification: PushNotificationSchema) => {
      console.log('Push notification received:', notification);
      handleNotificationInForeground(notification);
    }
  );

  // Handle notification tap (background)
  PushNotifications.addListener(
    'pushNotificationActionPerformed',
    async (notification: PushNotificationSchema) => {
      console.log('Push notification action performed:', notification);
      handleNotificationTap(notification);
    }
  );
}

/**
 * Store token if the user is authenticated
 */
async function storeTokenIfNeeded(token: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase
        .from('users')
        .update({
          fcm_token: token,
          fcm_token_updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
    }
  } catch (error) {
    console.error('Failed to store FCM token:', error);
  }
}

/**
 * Handle notification received while app is in foreground
 */
function handleNotificationInForeground(notification: PushNotificationSchema) {
  // Display notification to user (custom in-app toast)
  const title = notification.title || 'Notification';
  const message = notification.body || '';
  
  // You can dispatch a custom event or use a state management solution
  window.dispatchEvent(
    new CustomEvent('push-notification', {
      detail: { title, message, data: notification.data },
    })
  );

  // Optional: Play a sound or vibrate
  if ('vibrate' in navigator) {
    navigator.vibrate([200, 100, 200]);
  }
}

/**
 * Handle notification tap
 */
function handleNotificationTap(notification: PushNotificationSchema) {
  console.log('User tapped notification:', notification);
  
  // Handle navigation based on notification data
  const data = notification.data as Record<string, string> | undefined;
  if (data?.redirectUrl) {
    window.location.href = data.redirectUrl;
  }
}

/**
 * Remove all push notification listeners
 */
export function removePushNotificationListeners() {
  PushNotifications.removeAllListeners();
}

/**
 * Request notification permission and return status
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const result = await PushNotifications.requestPermissions();
    return result.receive !== 'denied';
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return false;
  }
}
