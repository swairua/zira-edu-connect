import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { VoteheadsManager } from '@/components/finance/VoteheadsManager';
import { useInstitution } from '@/contexts/InstitutionContext';

export default function Voteheads() {
  const { institutionId } = useInstitution();

  return (
    <DashboardLayout title="Voteheads" subtitle="Manage expenditure categories">
      <VoteheadsManager institutionId={institutionId} />
    </DashboardLayout>
  );
}
