import { PortalLayout } from '@/components/portal/PortalLayout';
import { TrialBalanceReport } from '@/components/finance/TrialBalanceReport';
import { useStaffProfile } from '@/hooks/useStaffProfile';

export default function PortalTrialBalance() {
  const { data: profile } = useStaffProfile();
  const institutionId = profile?.institution_id || null;

  return (
    <PortalLayout title="Trial Balance" subtitle="Account balances summary">
      <TrialBalanceReport institutionId={institutionId} />
    </PortalLayout>
  );
}
