import { ReactNode } from 'react';
import { useStaffProfile } from '@/hooks/useStaffProfile';
import { UnifiedPortalLayout } from '@/components/layout/UnifiedPortalLayout';

interface StaffLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function StaffLayout({ children, title, subtitle }: StaffLayoutProps) {
  const { data: profile, isLoading } = useStaffProfile();

  const userInitials = profile
    ? `${profile.first_name[0]}${profile.last_name[0]}`
    : '??';

  const userName = profile
    ? `${profile.first_name} ${profile.last_name}`
    : undefined;

  return (
    <UnifiedPortalLayout
      portalType="staff"
      title={title}
      subtitle={subtitle}
      userName={userName}
      userInitials={userInitials}
      institutionName={profile?.institution?.name || 'Staff Portal'}
      isLoading={isLoading}
    >
      {children}
    </UnifiedPortalLayout>
  );
}
