import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { StudentPayment } from '@/hooks/useStudentPayments';
import { format } from 'date-fns';
import { Receipt, Smartphone, CreditCard, Banknote, User, Calendar, FileText } from 'lucide-react';

interface PaymentDetailsDialogProps {
  payment: StudentPayment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReverse?: () => void;
  canReverse?: boolean;
}

export function PaymentDetailsDialog({
  payment,
  open,
  onOpenChange,
  onReverse,
  canReverse = false,
}: PaymentDetailsDialogProps) {
  if (!payment) return null;

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'mpesa':
        return <Smartphone className="h-5 w-5" />;
      case 'bank':
        return <CreditCard className="h-5 w-5" />;
      default:
        return <Banknote className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Payment Details
          </DialogTitle>
          <DialogDescription>
            Receipt: {payment.receipt_number}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto pr-4">
          <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge
              variant={
                payment.status === 'confirmed'
                  ? 'default'
                  : payment.status === 'reversed'
                  ? 'destructive'
                  : 'secondary'
              }
              className="text-sm"
            >
              {payment.status}
            </Badge>
          </div>

          {/* Amount */}
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="text-3xl font-bold">KES {payment.amount.toLocaleString()}</p>
          </div>

          {/* Details Grid */}
          <div className="grid gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Student</p>
                <p className="font-medium">
                  {payment.student?.first_name} {payment.student?.last_name}
                </p>
                <p className="text-sm text-muted-foreground">{payment.student?.admission_number}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                {getMethodIcon(payment.payment_method)}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="font-medium capitalize">{payment.payment_method}</p>
                {payment.transaction_reference && (
                  <p className="text-sm text-muted-foreground">Ref: {payment.transaction_reference}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Calendar className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Date</p>
                <p className="font-medium">{format(new Date(payment.payment_date), 'EEEE, MMMM d, yyyy')}</p>
              </div>
            </div>
          </div>

          {/* Allocations */}
          {payment.allocations && payment.allocations.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Invoice Allocations
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payment.allocations.map((alloc) => (
                    <TableRow key={alloc.id}>
                      <TableCell>{alloc.invoice?.invoice_number || 'N/A'}</TableCell>
                      <TableCell className="text-right font-medium">
                        KES {alloc.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Notes */}
          {payment.notes && (
            <div className="space-y-2">
              <h4 className="font-medium">Notes</h4>
              <p className="text-sm text-muted-foreground rounded-lg border p-3">
                {payment.notes}
              </p>
            </div>
          )}

          {/* Reversal Info */}
          {payment.status === 'reversed' && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4 space-y-2">
              <h4 className="font-medium text-destructive">Reversal Information</h4>
              <div className="text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">Reversed on:</span>{' '}
                  {payment.reversed_at ? format(new Date(payment.reversed_at), 'dd MMM yyyy HH:mm') : 'N/A'}
                </p>
                <p>
                  <span className="text-muted-foreground">Reason:</span>{' '}
                  {payment.reversal_reason || 'Not specified'}
                </p>
              </div>
            </div>
          )}

          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex justify-end gap-2 flex-shrink-0 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {canReverse && payment.status === 'confirmed' && onReverse && (
            <Button variant="destructive" onClick={onReverse}>
              Reverse Payment
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
