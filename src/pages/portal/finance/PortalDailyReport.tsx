import { PortalLayout } from '@/components/portal/PortalLayout';
import { DailyReportContent } from '@/components/finance/content/DailyReportContent';

export default function PortalDailyReport() {
  return (
    <PortalLayout title="Daily Collection Report" subtitle="Track daily payment collections">
      <DailyReportContent />
    </PortalLayout>
  );
}
