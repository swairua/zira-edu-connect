import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParent } from '@/contexts/ParentContext';
import { useAuth } from '@/hooks/useAuth';
import { UnifiedPortalLayout } from '@/components/layout/UnifiedPortalLayout';
import { DemoModeBanner } from '@/components/shared/DemoModeBanner';
import { StudentSelector } from './StudentSelector';
import { ParentNotificationBell } from './ParentNotificationBell';
import { useRealtimeNotificationToasts } from '@/hooks/useRealtimeNotificationToasts';

interface ParentLayoutProps {
  children: ReactNode;
  title?: string;
  showStudentSelector?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function ParentLayout({
  children,
  title,
  showStudentSelector = true,
  onRefresh,
  isRefreshing = false,
}: ParentLayoutProps) {
  const navigate = useNavigate();
  const { isLoading, linkedStudents, isDemo, selectedStudent, parentProfile } = useParent();
  const { signOut } = useAuth();

  // Enable realtime toast notifications for parents
  useRealtimeNotificationToasts({
    parentId: parentProfile?.id || null,
    enabled: !!parentProfile?.id,
    playSound: true,
    vibrate: true,
  });

  const handleLogout = async () => {
    localStorage.removeItem('parent_session_token');
    localStorage.removeItem('parent_session_expiry');
    await signOut();
    navigate('/auth');
  };

  const rightContent = (
    <div className="flex items-center gap-2">
      <ParentNotificationBell />
      {showStudentSelector && linkedStudents.length > 1 && <StudentSelector />}
    </div>
  );

  return (
    <UnifiedPortalLayout
      portalType="parent"
      title={title}
      isLoading={isLoading}
      onRefresh={onRefresh}
      isRefreshing={isRefreshing}
      customLogout={handleLogout}
      rightContent={rightContent}
      headerBanner={isDemo ? <DemoModeBanner portalType="parent" /> : undefined}
    >
      {children}
    </UnifiedPortalLayout>
  );
}
