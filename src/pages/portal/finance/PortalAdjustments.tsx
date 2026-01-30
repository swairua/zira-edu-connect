import { PortalLayout } from '@/components/portal/PortalLayout';
import { AdjustmentsContent } from '@/components/finance/content/AdjustmentsContent';

export default function PortalAdjustments() {
  return (
    <PortalLayout title="Financial Adjustments" subtitle="Manage fee adjustments and approvals">
      <AdjustmentsContent />
    </PortalLayout>
  );
}
