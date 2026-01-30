import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function PWAUpdatePrompt() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showReload, setShowReload] = useState(false);

  useEffect(() => {
    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available
                setWaitingWorker(newWorker);
                setShowReload(true);
              }
            });
          }
        });
      });

      // Check for updates on focus (when user returns to the app)
      const checkForUpdates = () => {
        navigator.serviceWorker.ready.then((registration) => {
          registration.update();
        });
      };

      window.addEventListener('focus', checkForUpdates);
      
      // Also check periodically (every 5 minutes)
      const interval = setInterval(checkForUpdates, 5 * 60 * 1000);

      return () => {
        window.removeEventListener('focus', checkForUpdates);
        clearInterval(interval);
      };
    }
  }, []);

  useEffect(() => {
    if (showReload) {
      toast.info('A new version is available!', {
        duration: Infinity,
        action: {
          label: 'Refresh',
          onClick: handleRefresh,
        },
        description: 'Click refresh to update the app.',
      });
    }
  }, [showReload]);

  const handleRefresh = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    // Reload the page to get the new content
    window.location.reload();
  };

  // This component doesn't render anything visible - it manages updates via toast
  return null;
}

// Utility function to clear all caches - used during logout
export async function clearAllCaches(): Promise<void> {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
      console.log('All caches cleared');
    } catch (error) {
      console.error('Failed to clear caches:', error);
    }
  }
}
