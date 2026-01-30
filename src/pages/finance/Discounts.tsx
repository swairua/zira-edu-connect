import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DiscountsContent } from '@/components/finance/content/DiscountsContent';

export default function Discounts() {
  return (
    <DashboardLayout title="Discounts & Bursaries" subtitle="Manage fee discounts and bursary programs">
      <DiscountsContent />
    </DashboardLayout>
  );
}
