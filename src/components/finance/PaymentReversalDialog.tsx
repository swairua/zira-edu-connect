import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useReversePayment, StudentPayment } from '@/hooks/useStudentPayments';
import { useCreateAdjustment } from '@/hooks/useFinancialAdjustments';
import { useAuth } from '@/hooks/useAuth';
import { useInstitution } from '@/contexts/InstitutionContext';
import { AlertTriangle, Loader2, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';

interface PaymentReversalDialogProps {
  payment: StudentPayment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  approvalThreshold?: number; // Amount above which requires approval
}

export function PaymentReversalDialog({
  payment,
  open,
  onOpenChange,
  approvalThreshold = 10000, // Default 10,000 KES
}: PaymentReversalDialogProps) {
  const { user, isSuperAdmin } = useAuth();
  const { institutionId } = useInstitution();
  const reversePayment = useReversePayment();
  const createAdjustment = useCreateAdjustment();
  
  const [reason, setReason] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const requiresApproval = payment && payment.amount >= approvalThreshold && !isSuperAdmin;

  const handleReverse = async () => {
    if (!payment || !user?.id || !reason) return;

    if (requiresApproval && institutionId) {
      // Create adjustment request instead of direct reversal
      await createAdjustment.mutateAsync({
        institution_id: institutionId,
        adjustment_type: 'reversal',
        entity_type: 'payment',
        entity_id: payment.id,
        student_id: payment.student_id,
        old_amount: payment.amount,
        new_amount: 0,
        adjustment_amount: -payment.amount,
        reason,
      });
      onOpenChange(false);
      setReason('');
    } else {
      // Direct reversal for amounts below threshold or super admin
      await reversePayment.mutateAsync({
        paymentId: payment.id,
        userId: user.id,
        reason,
      });
      onOpenChange(false);
      setReason('');
    }
  };

  if (!payment) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Reverse Payment
            </DialogTitle>
            <DialogDescription>
              This action will reverse the payment and update related invoice balances.
              {requiresApproval && ' This reversal requires admin approval.'}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 overflow-y-auto pr-4">
            <div className="space-y-4 py-4">
              {/* Payment Details */}
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Receipt Number</span>
                <span className="font-medium">{payment.receipt_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Student</span>
                <span className="font-medium">
                  {payment.student?.first_name} {payment.student?.last_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-lg">KES {payment.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span>{format(new Date(payment.payment_date), 'dd MMM yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <Badge variant="outline" className="capitalize">{payment.payment_method}</Badge>
              </div>
            </div>

            {/* Approval Warning */}
            {requiresApproval && (
              <div className="flex items-start gap-3 rounded-lg border border-warning bg-warning/10 p-4">
                <ShieldAlert className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-warning">Approval Required</p>
                  <p className="text-sm text-muted-foreground">
                    Payments above KES {approvalThreshold.toLocaleString()} require admin approval.
                    Your request will be submitted for review.
                  </p>
                </div>
              </div>
            )}

            {/* Reason Input */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Reversal *</Label>
              <Textarea
                id="reason"
                placeholder="Provide a detailed reason for this reversal..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="flex-shrink-0">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowConfirmDialog(true)}
              disabled={!reason.trim()}
            >
              {requiresApproval ? 'Request Approval' : 'Reverse Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {requiresApproval ? 'Submit Reversal Request?' : 'Confirm Payment Reversal'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {requiresApproval ? (
                <>
                  Your reversal request for <strong>KES {payment.amount.toLocaleString()}</strong> will
                  be submitted for admin approval. You'll be notified once it's reviewed.
                </>
              ) : (
                <>
                  This will immediately reverse the payment of <strong>KES {payment.amount.toLocaleString()}</strong>.
                  This action cannot be undone and will affect the student's balance.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReverse}
              disabled={reversePayment.isPending || createAdjustment.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {(reversePayment.isPending || createAdjustment.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {requiresApproval ? 'Submit Request' : 'Reverse Payment'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
