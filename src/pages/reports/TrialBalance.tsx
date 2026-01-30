import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TrialBalanceReport } from '@/components/finance/TrialBalanceReport';
import { useInstitution } from '@/contexts/InstitutionContext';

export default function TrialBalance() {
  const { institutionId } = useInstitution();

  return (
    <DashboardLayout title="Trial Balance" subtitle="Account balances summary">
      <TrialBalanceReport institutionId={institutionId} />
    </DashboardLayout>
  );
}
