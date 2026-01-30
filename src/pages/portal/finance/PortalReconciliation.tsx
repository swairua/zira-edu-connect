import { PortalLayout } from '@/components/portal/PortalLayout';
import { ReconciliationContent } from '@/components/finance/content/ReconciliationContent';

export default function PortalReconciliation() {
  return (
    <PortalLayout title="Reconciliation" subtitle="Match payments with bank statements">
      <ReconciliationContent />
    </PortalLayout>
  );
}
