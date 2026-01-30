import { Navigate } from 'react-router-dom';
import { useGroup } from '@/contexts/GroupContext';
import { Skeleton } from '@/components/ui/skeleton';

interface GroupRouteProps {
  children: React.ReactNode;
}

export function GroupRoute({ children }: GroupRouteProps) {
  const { isGroupUser, isLoading } = useGroup();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-full max-w-md p-8">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!isGroupUser) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
