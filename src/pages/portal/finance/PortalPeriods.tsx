import { PortalLayout } from '@/components/portal/PortalLayout';
import { PeriodsContent } from '@/components/finance/content/PeriodsContent';

export default function PortalPeriods() {
  return (
    <PortalLayout title="Financial Periods" subtitle="Manage period locks and controls">
      <PeriodsContent />
    </PortalLayout>
  );
}
