import { PortalLayout } from '@/components/portal/PortalLayout';
import { FundsManager } from '@/components/finance/FundsManager';
import { useStaffProfile } from '@/hooks/useStaffProfile';

export default function PortalFunds() {
  const { data: profile } = useStaffProfile();
  const institutionId = profile?.institution_id || null;

  return (
    <PortalLayout title="Funds Management" subtitle="Manage institutional funds and budgets">
      <FundsManager institutionId={institutionId} />
    </PortalLayout>
  );
}
