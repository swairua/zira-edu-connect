import { PortalLayout } from '@/components/portal/PortalLayout';
import { InvoicesContent } from '@/components/finance/content/InvoicesContent';

export default function PortalInvoices() {
  return (
    <PortalLayout title="Invoices" subtitle="Manage student invoices">
      <InvoicesContent basePath="/portal" />
    </PortalLayout>
  );
}
