import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ReconciliationContent } from '@/components/finance/content/ReconciliationContent';

export default function Reconciliation() {
  return (
    <DashboardLayout title="Reconciliation" subtitle="Bank and M-Pesa payment reconciliation">
      <ReconciliationContent />
    </DashboardLayout>
  );
}
