import { PortalLayout } from '@/components/portal/PortalLayout';
import { DiscountsContent } from '@/components/finance/content/DiscountsContent';

export default function PortalDiscounts() {
  return (
    <PortalLayout title="Discounts & Bursaries" subtitle="Manage student discounts">
      <DiscountsContent />
    </PortalLayout>
  );
}
