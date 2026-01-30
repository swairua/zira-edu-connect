import { useQueryClient } from '@tanstack/react-query';
import { clearAllCaches } from '@/components/shared/PWAUpdatePrompt';

/**
 * Hook that provides a function to force clear all caches and refresh the app.
 * Use this when users experience stale data issues.
 */
export function useForceRefresh() {
  const queryClient = useQueryClient();
  
  const forceRefresh = async () => {
    // Clear React Query cache
    queryClient.clear();
    
    // Clear service worker caches
    await clearAllCaches();
    
    // Reload the page
    window.location.reload();
  };
  
  const invalidateAll = () => {
    // Invalidate all queries without page reload
    queryClient.invalidateQueries();
  };
  
  return { forceRefresh, invalidateAll };
}
