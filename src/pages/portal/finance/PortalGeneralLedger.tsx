import { PortalLayout } from '@/components/portal/PortalLayout';
import { GeneralLedgerReport } from '@/components/finance/GeneralLedgerReport';
import { useStaffProfile } from '@/hooks/useStaffProfile';

export default function PortalGeneralLedger() {
  const { data: profile } = useStaffProfile();
  const institutionId = profile?.institution_id || null;

  return (
    <PortalLayout title="General Ledger" subtitle="Account transaction details">
      <GeneralLedgerReport institutionId={institutionId} />
    </PortalLayout>
  );
}
