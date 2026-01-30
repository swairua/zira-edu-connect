import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useParentAuth } from '@/contexts/ParentAuthContext';
import { ParentProvider } from '@/contexts/ParentContext';
import { Loader2 } from 'lucide-react';

interface ParentRouteProps {
  children: React.ReactNode;
}

export function ParentRoute({ children }: ParentRouteProps) {
  const { user, loading: authLoading, hasRole } = useAuth();
  const { isAuthenticated: parentSessionAuth, isLoading: parentSessionLoading } = useParentAuth();

  // Wait for both auth systems to complete loading
  if (authLoading || parentSessionLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow access if parent session token is valid (demo/OTP mode)
  if (parentSessionAuth) {
    return (
      <ParentProvider>
        {children}
      </ParentProvider>
    );
  }

  // Allow access if Supabase user has parent role
  if (user && hasRole('parent')) {
    return (
      <ParentProvider>
        {children}
      </ParentProvider>
    );
  }

  // Not authenticated at all
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Authenticated but not a parent
  return <Navigate to="/" replace />;
}
