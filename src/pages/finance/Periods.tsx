import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PeriodsContent } from '@/components/finance/content/PeriodsContent';

export default function Periods() {
  return (
    <DashboardLayout title="Financial Periods" subtitle="Manage period locks and financial controls">
      <PeriodsContent />
    </DashboardLayout>
  );
}
