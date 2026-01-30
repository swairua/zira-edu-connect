import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BankAccountsManager } from '@/components/finance/BankAccountsManager';
import { useInstitution } from '@/contexts/InstitutionContext';

export default function BankAccounts() {
  const { institutionId } = useInstitution();

  return (
    <DashboardLayout title="Bank Accounts" subtitle="Manage institutional bank accounts">
      <BankAccountsManager institutionId={institutionId} />
    </DashboardLayout>
  );
}
