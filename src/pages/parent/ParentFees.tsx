import { ParentLayout } from '@/components/parent/ParentLayout';
import { FeeBalanceCard } from '@/components/parent/FeeBalanceCard';
import { RecentPaymentsList } from '@/components/parent/RecentPaymentsList';
import { NoStudentLinked } from '@/components/parent/NoStudentLinked';
import { ErrorCard } from '@/components/parent/ErrorCard';
import { useParent } from '@/contexts/ParentContext';
import { useStudentFeeBalance, useStudentInvoicesForParent, useStudentPaymentsForParent } from '@/hooks/useParentData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Calendar, CreditCard, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Invoice, InvoiceLine, Payment } from '@/types/parent';

export default function ParentFees() {
  const { selectedStudent, isLoading: parentLoading } = useParent();
  
  const { 
    data: feeBalance, 
    isLoading: feeLoading,
    error: feeError,
    refetch: refetchFee,
  } = useStudentFeeBalance(
    selectedStudent?.id || null,
    selectedStudent?.institution_id || null
  );
  
  const { 
    data: invoices = [], 
    isLoading: invoicesLoading,
    error: invoicesError,
    refetch: refetchInvoices,
  } = useStudentInvoicesForParent(selectedStudent?.id || null);
  
  const { 
    data: payments = [], 
    isLoading: paymentsLoading,
    error: paymentsError,
    refetch: refetchPayments,
  } = useStudentPaymentsForParent(selectedStudent?.id || null);

  const isRefreshing = feeLoading || invoicesLoading || paymentsLoading;

  const handleRefresh = () => {
    refetchFee();
    refetchInvoices();
    refetchPayments();
  };

  const formatCurrency = (amount: number, currency = 'KES') => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Show no student linked message
  if (!parentLoading && !selectedStudent) {
    return (
      <ParentLayout title="Fees">
        <div className="p-4">
          <NoStudentLinked />
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout 
      title="Fees"
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
    >
      <div className="space-y-4 p-4">
        {/* Fee Balance Card */}
        {feeError ? (
          <ErrorCard 
            title="Couldn't load balance" 
            message="We couldn't load your fee balance."
            onRetry={() => refetchFee()}
          />
        ) : (
          <FeeBalanceCard
            balance={feeBalance?.balance ?? null}
            totalInvoiced={feeBalance?.totalInvoiced ?? 0}
            totalPaid={feeBalance?.totalPaid ?? 0}
            isPaid={feeBalance?.isPaid ?? false}
            isLoading={feeLoading}
          />
        )}

        {/* Payment Instructions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4" aria-hidden="true" />
              How to Pay
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
              <Building2 className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium">Bank Transfer</p>
                <p className="text-xs text-muted-foreground">
                  Contact school for bank details. Reference: {selectedStudent?.admission_number || 'Your Admission No.'}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Contact the school office for other payment options
            </p>
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" aria-hidden="true" />
              Invoices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {invoicesError ? (
              <ErrorCard 
                title="Couldn't load invoices" 
                message="Please try again."
                onRetry={() => refetchInvoices()}
              />
            ) : invoicesLoading ? (
              [1, 2].map((i) => (
                <div key={i} className="rounded-lg border p-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-2 h-6 w-24" />
                </div>
              ))
            ) : invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No invoices found</p>
            ) : (
              (invoices as Invoice[]).map((invoice) => (
                <div 
                  key={invoice.id} 
                  className="rounded-lg border p-4"
                  role="article"
                  aria-label={`Invoice ${invoice.invoice_number}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{invoice.invoice_number}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" aria-hidden="true" />
                        Due: {format(new Date(invoice.due_date), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {formatCurrency(invoice.total_amount, invoice.currency || 'KES')}
                      </p>
                      <Badge 
                        variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                        aria-label={`Status: ${invoice.status}`}
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                  {invoice.invoice_lines?.length > 0 && (
                    <div className="mt-3 pt-3 border-t space-y-1" role="list" aria-label="Invoice line items">
                      {invoice.invoice_lines.map((line: InvoiceLine) => (
                        <div key={line.id} className="flex justify-between text-sm" role="listitem">
                          <span className="text-muted-foreground">{line.description}</span>
                          <span>{formatCurrency(line.total_amount, invoice.currency || 'KES')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        {paymentsError ? (
          <ErrorCard 
            title="Couldn't load payments" 
            message="Please try again."
            onRetry={() => refetchPayments()}
          />
        ) : (
          <RecentPaymentsList
            payments={payments as Payment[]}
            isLoading={paymentsLoading}
            limit={10}
            showViewAll={false}
          />
        )}
      </div>
    </ParentLayout>
  );
}
