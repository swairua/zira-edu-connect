import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { usePayslipItems, type Payslip } from '@/hooks/usePayroll';
import { Skeleton } from '@/components/ui/skeleton';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface PayslipViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payslip: Payslip | null;
}

export function PayslipViewDialog({ open, onOpenChange, payslip }: PayslipViewDialogProps) {
  const { data: items, isLoading } = usePayslipItems(payslip?.id || '');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!payslip) return null;

  const allowances = items?.filter(i => i.item_type === 'allowance') || [];
  const deductions = items?.filter(i => i.item_type === 'deduction') || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Payslip Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">
                {payslip.staff?.first_name} {payslip.staff?.last_name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {payslip.staff?.employee_number} • {payslip.staff?.department}
              </p>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="text-base">
                {payslip.payroll_run && (
                  <>{MONTHS[payslip.payroll_run.month - 1]} {payslip.payroll_run.year}</>
                )}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Earnings */}
          <div>
            <h4 className="font-medium mb-3">Earnings</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Basic Salary</span>
                <span className="font-medium">{formatCurrency(payslip.basic_salary)}</span>
              </div>
              
              {isLoading ? (
                <Skeleton className="h-6 w-full" />
              ) : (
                allowances.map((item) => (
                  <div key={item.id} className="flex justify-between text-green-600">
                    <span>{item.name}</span>
                    <span>+{formatCurrency(item.amount)}</span>
                  </div>
                ))
              )}
              
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Gross Salary</span>
                <span>{formatCurrency(payslip.gross_salary)}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <h4 className="font-medium mb-3">Deductions</h4>
            <div className="space-y-2">
              {isLoading ? (
                <Skeleton className="h-6 w-full" />
              ) : deductions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No deductions</p>
              ) : (
                deductions.map((item) => (
                  <div key={item.id} className="flex justify-between text-destructive">
                    <span>{item.name}</span>
                    <span>-{formatCurrency(item.amount)}</span>
                  </div>
                ))
              )}
              
              <Separator className="my-2" />
              <div className="flex justify-between font-medium text-destructive">
                <span>Total Deductions</span>
                <span>-{formatCurrency(payslip.total_deductions)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Net Pay */}
          <div className="rounded-lg bg-primary/10 p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Net Pay</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(payslip.net_salary)}
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
