import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { CheckCircle, XCircle, Calendar, User } from 'lucide-react';

interface LeaveApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: {
    id: string;
    staff?: { first_name: string; last_name: string };
    leave_type?: { name: string };
    start_date: string;
    end_date: string;
    days: number;
    reason?: string;
    status: string;
  } | null;
}

export function LeaveApprovalDialog({ open, onOpenChange, request }: LeaveApprovalDialogProps) {
  const [reason, setReason] = useState('');
  const { approveLeaveRequest, rejectLeaveRequest } = useLeaveRequests();
  const { user } = useAuth();
  const { can } = usePermissions();
  const canApproveLeave = can('staff_hr', 'approve');

  if (!request) return null;

  const handleApprove = async () => {
    await approveLeaveRequest.mutateAsync({ id: request.id, approvedBy: user?.id || '' });
    setReason('');
    onOpenChange(false);
  };

  const handleReject = async () => {
    if (!reason.trim()) return;
    await rejectLeaveRequest.mutateAsync({ id: request.id, reason });
    setReason('');
    onOpenChange(false);
  };

  const isPending = request.status === 'pending';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Leave Request Details</DialogTitle>
        </DialogHeader>
        
        <DialogBody>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {request.staff?.first_name} {request.staff?.last_name}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline">{request.leave_type?.name}</Badge>
              <Badge variant={
                request.status === 'approved' ? 'default' :
                request.status === 'rejected' ? 'destructive' : 'secondary'
              }>
                {request.status}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(request.start_date), 'MMM dd, yyyy')} - {format(new Date(request.end_date), 'MMM dd, yyyy')}
              </span>
              <span className="font-medium">({request.days} days)</span>
            </div>
            
            {request.reason && (
              <div className="rounded-lg bg-muted p-3">
                <Label className="text-xs text-muted-foreground">Reason</Label>
                <p className="mt-1 text-sm">{request.reason}</p>
              </div>
            )}
            
            {isPending && (
              <div>
                <Label htmlFor="rejection-reason">Rejection Reason (required for rejection)</Label>
                <Textarea
                  id="rejection-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason if rejecting..."
                  className="mt-1.5"
                />
              </div>
            )}
          </div>
        </DialogBody>
        
        {isPending && canApproveLeave && (
          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!reason.trim() || rejectLeaveRequest.isPending}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button
              onClick={handleApprove}
              disabled={approveLeaveRequest.isPending}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
