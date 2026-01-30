import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdjustmentsContent } from '@/components/finance/content/AdjustmentsContent';

export default function Adjustments() {
  return (
    <DashboardLayout title="Financial Adjustments" subtitle="Manage and approve financial adjustments">
      <AdjustmentsContent />
    </DashboardLayout>
  );
}
