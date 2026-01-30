import { PortalLayout } from '@/components/portal/PortalLayout';
import { InvoiceDetailContent } from '@/components/finance/content/InvoiceDetailContent';

export default function PortalInvoiceDetail() {
  return (
    <PortalLayout title="Invoice Details" subtitle="View and manage invoice">
      <InvoiceDetailContent backPath="/portal/invoices" />
    </PortalLayout>
  );
}
