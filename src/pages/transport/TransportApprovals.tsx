import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInstitution } from '@/contexts/InstitutionContext';
import { usePendingSubscriptions, useApproveSubscription, useRejectSubscription } from '@/hooks/useTransportSubscriptions';
import { usePermissions } from '@/hooks/usePermissions';
import { Clock, Check, X, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';

export default function TransportApprovals() {
  const { institution } = useInstitution();
  const { can } = usePermissions();
  const canApproveTransport = can('transport', 'approve');
  
  const { data: pending, isLoading } = usePendingSubscriptions(institution?.id);
  const approveSubscription = useApproveSubscription();
  const rejectSubscription = useRejectSubscription();

  return (
    <DashboardLayout title="Pending Approvals" subtitle="Review and approve transport subscription requests">
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : pending?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No pending approvals</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pending?.map(sub => (
              <Card key={sub.id}>
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{sub.student?.first_name} {sub.student?.last_name}</p>
                      {sub.parent_requested && <Badge variant="outline">Parent Request</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {sub.student?.admission_number} • Route: {sub.route?.name || 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {sub.subscription_type} • {sub.currency} {sub.fee_amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Requested: {format(parseISO(sub.created_at), 'dd MMM yyyy HH:mm')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {canApproveTransport && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => rejectSubscription.mutate({ id: sub.id, institutionId: institution!.id })}
                          disabled={rejectSubscription.isPending}
                        >
                          {rejectSubscription.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => approveSubscription.mutate({ id: sub.id, institutionId: institution!.id })}
                          disabled={approveSubscription.isPending}
                        >
                          {approveSubscription.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                          Approve
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
