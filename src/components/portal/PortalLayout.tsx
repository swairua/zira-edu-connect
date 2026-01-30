import { ReactNode } from 'react';
import { useStaffProfile } from '@/hooks/useStaffProfile';
import { useDemoMode } from '@/hooks/useDemoMode';
import { useAuth } from '@/hooks/useAuth';
import { UnifiedPortalLayout } from '@/components/layout/UnifiedPortalLayout';
import { DemoModeBanner } from '@/components/shared/DemoModeBanner';
import { PortalType } from '@/config/portalBranding';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { useRealtimeNotificationToasts } from '@/hooks/useRealtimeNotificationToasts';
import {
  FINANCE_ROLES,
  HR_ROLES,
  hasAnyRole,
  hasRole,
} from '@/lib/roles';

interface PortalLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function PortalLayout({ children, title, subtitle }: PortalLayoutProps) {
  const { data: profile, isLoading } = useStaffProfile();
  const { isDemoMode } = useDemoMode();
  const { userRoles, user } = useAuth();

  // Enable realtime toast notifications for staff
  useRealtimeNotificationToasts({
    userId: user?.id || null,
    enabled: !!user?.id,
    playSound: true,
    vibrate: true,
  });

  const userInitials = profile
    ? `${profile.first_name[0]}${profile.last_name[0]}`
    : '??';

  const userName = profile
    ? `${profile.first_name} ${profile.last_name}`
    : undefined;

  // Determine portal type based on user role (only staff-related portals)
  // Use centralized role definitions for consistency
  const getPortalType = (): 'teacher' | 'staff' | 'finance' => {
    if (hasAnyRole(userRoles, FINANCE_ROLES)) return 'finance';
    if (hasRole(userRoles, 'teacher')) return 'teacher';
    return 'staff';
  };

  const portalType = getPortalType();

  const rightContent = (
    <div className="flex items-center gap-2">
      <NotificationCenter />
    </div>
  );

  return (
    <UnifiedPortalLayout
      portalType={portalType}
      title={title}
      subtitle={subtitle}
      userName={userName}
      userInitials={userInitials}
      institutionName={profile?.institution?.name || 'Staff Portal'}
      isLoading={isLoading}
      rightContent={rightContent}
      headerBanner={isDemoMode ? <DemoModeBanner portalType={portalType} /> : undefined}
    >
      {children}
    </UnifiedPortalLayout>
  );
}
