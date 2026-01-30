import { ReactNode } from 'react';
import { useStudent } from '@/contexts/StudentContext';
import { useStudentAuth } from '@/contexts/StudentAuthContext';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { UnifiedPortalLayout } from '@/components/layout/UnifiedPortalLayout';
import { DemoModeBanner } from '@/components/shared/DemoModeBanner';
import { StudentNotificationBell } from './StudentNotificationBell';
import { useRealtimeNotificationToasts } from '@/hooks/useRealtimeNotificationToasts';

interface StudentLayoutProps {
  children: ReactNode;
  title: string;
  onRefresh?: () => void;
}

export function StudentLayout({ children, title, onRefresh }: StudentLayoutProps) {
  const navigate = useNavigate();
  const { isLoading, studentProfile, isDemo } = useStudent();
  const { logout: studentLogout, isAuthenticated: isOtpAuth } = useStudentAuth();
  const { signOut } = useAuth();

  // Enable realtime toast notifications for students
  useRealtimeNotificationToasts({
    studentId: studentProfile?.id || null,
    enabled: !!studentProfile?.id,
    playSound: true,
    vibrate: true,
  });

  const handleLogout = async () => {
    if (isOtpAuth) {
      studentLogout();
    } else {
      await signOut();
    }
    navigate('/auth');
  };

  const userInitials = studentProfile
    ? `${studentProfile.first_name?.[0] || ''}${studentProfile.last_name?.[0] || ''}`
    : '??';

  const rightContent = (
    <div className="flex items-center gap-2">
      <StudentNotificationBell />
    </div>
  );

  return (
    <UnifiedPortalLayout
      portalType="student"
      title={title}
      subtitle={studentProfile?.class_name || 'No class assigned'}
      userName={studentProfile ? `${studentProfile.first_name} ${studentProfile.last_name}` : undefined}
      userInitials={userInitials}
      isLoading={isLoading}
      onRefresh={onRefresh}
      customLogout={handleLogout}
      rightContent={rightContent}
      headerBanner={isDemo ? <DemoModeBanner portalType="student" /> : undefined}
    >
      {children}
    </UnifiedPortalLayout>
  );
}
