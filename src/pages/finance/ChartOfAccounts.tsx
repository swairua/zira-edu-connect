import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ChartOfAccountsView } from '@/components/finance/ChartOfAccountsView';
import { useInstitution } from '@/contexts/InstitutionContext';

export default function ChartOfAccounts() {
  const { institutionId } = useInstitution();

  return (
    <DashboardLayout title="Chart of Accounts" subtitle="Manage ledger accounts and load templates">
      <ChartOfAccountsView institutionId={institutionId} />
    </DashboardLayout>
  );
}
