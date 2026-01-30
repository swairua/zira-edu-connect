import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GeneralLedgerReport } from '@/components/finance/GeneralLedgerReport';
import { useInstitution } from '@/contexts/InstitutionContext';

export default function GeneralLedger() {
  const { institutionId } = useInstitution();

  return (
    <DashboardLayout title="General Ledger" subtitle="Account transaction details">
      <GeneralLedgerReport institutionId={institutionId} />
    </DashboardLayout>
  );
}
