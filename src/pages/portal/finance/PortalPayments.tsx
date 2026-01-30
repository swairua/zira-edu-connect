import { PortalLayout } from '@/components/portal/PortalLayout';
import { PaymentsContent } from '@/components/finance/content/PaymentsContent';

export default function PortalPayments() {
  return (
    <PortalLayout title="Payments" subtitle="Record and manage student payments">
      <PaymentsContent />
    </PortalLayout>
  );
}
