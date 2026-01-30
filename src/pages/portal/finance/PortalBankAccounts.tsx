import { PortalLayout } from '@/components/portal/PortalLayout';
import { BankAccountsManager } from '@/components/finance/BankAccountsManager';
import { useStaffProfile } from '@/hooks/useStaffProfile';

export default function PortalBankAccounts() {
  const { data: profile } = useStaffProfile();
  const institutionId = profile?.institution_id || null;

  return (
    <PortalLayout title="Bank Accounts" subtitle="Manage institutional bank accounts">
      <BankAccountsManager institutionId={institutionId} />
    </PortalLayout>
  );
}
