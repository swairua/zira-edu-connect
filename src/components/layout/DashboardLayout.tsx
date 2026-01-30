import { ReactNode } from 'react';
import { useDemoMode } from '@/hooks/useDemoMode';
import { AdminLayout } from './AdminLayout';
import { DemoBanner } from '@/components/demo/DemoBanner';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function DashboardLayout({ children, title, subtitle, actions }: DashboardLayoutProps) {
  const { isDemoMode } = useDemoMode();

  return (
    <AdminLayout
      title={title}
      subtitle={subtitle}
      actions={actions}
      headerBanner={isDemoMode ? <DemoBanner /> : undefined}
    >
      {children}
    </AdminLayout>
  );
}
