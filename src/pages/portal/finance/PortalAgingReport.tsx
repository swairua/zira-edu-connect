import { PortalLayout } from '@/components/portal/PortalLayout';
import { AgingReportContent } from '@/components/finance/content/AgingReportContent';

export default function PortalAgingReport() {
  return (
    <PortalLayout title="Aging Report" subtitle="Analyze overdue balances by age">
      <AgingReportContent />
    </PortalLayout>
  );
}
