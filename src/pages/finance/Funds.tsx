import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FundsManager } from '@/components/finance/FundsManager';
import { useInstitution } from '@/contexts/InstitutionContext';

export default function Funds() {
  const { institutionId } = useInstitution();

  return (
    <DashboardLayout title="Funds Management" subtitle="Manage institutional funds and budgets">
      <FundsManager institutionId={institutionId} />
    </DashboardLayout>
  );
}
