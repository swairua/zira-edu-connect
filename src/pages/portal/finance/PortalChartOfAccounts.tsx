import { PortalLayout } from '@/components/portal/PortalLayout';
import { ChartOfAccountsView } from '@/components/finance/ChartOfAccountsView';
import { useStaffProfile } from '@/hooks/useStaffProfile';

export default function PortalChartOfAccounts() {
  const { data: profile } = useStaffProfile();
  const institutionId = profile?.institution_id || null;

  return (
    <PortalLayout title="Chart of Accounts" subtitle="Manage ledger accounts">
      <ChartOfAccountsView institutionId={institutionId} />
    </PortalLayout>
  );
}
