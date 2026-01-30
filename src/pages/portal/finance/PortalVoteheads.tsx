import { PortalLayout } from '@/components/portal/PortalLayout';
import { VoteheadsManager } from '@/components/finance/VoteheadsManager';
import { useStaffProfile } from '@/hooks/useStaffProfile';

export default function PortalVoteheads() {
  const { data: profile } = useStaffProfile();
  const institutionId = profile?.institution_id || null;

  return (
    <PortalLayout title="Voteheads" subtitle="Manage expenditure categories">
      <VoteheadsManager institutionId={institutionId} />
    </PortalLayout>
  );
}
