import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Receipt, 
  Download, 
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { useInstitutionInvoices, useInstitutionPayments } from '@/hooks/useInstitutionBilling';
import { useInstitution } from '@/contexts/InstitutionContext';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const statusConfig = {
  pending: { icon: Clock, color: 'text-warning', bg: 'bg-warning/10', label: 'Pending' },
  paid: { icon: CheckCircle2, color: 'text-primary', bg: 'bg-primary/10', label: 'Paid' },
  overdue: { icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Overdue' },
  cancelled: { icon: XCircle, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Cancelled' },
  completed: { icon: CheckCircle2, color: 'text-primary', bg: 'bg-primary/10', label: 'Completed' },
  processing: { icon: Clock, color: 'text-warning', bg: 'bg-warning/10', label: 'Processing' },
  failed: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Failed' },
};

export function BillingHistoryCard() {
  const { institutionId } = useInstitution();
  const { data: invoices, isLoading: invoicesLoading } = useInstitutionInvoices(institutionId);
  const { data: payments, isLoading: paymentsLoading } = useInstitutionPayments(institutionId);

  const isLoading = invoicesLoading || paymentsLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasHistory = (invoices?.length || 0) > 0 || (payments?.length || 0) > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Receipt className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>Your invoices and payment records</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!hasHistory ? (
          <div className="py-8 text-center text-muted-foreground">
            <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No billing history yet</p>
            <p className="text-sm">Your invoices and payments will appear here</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {/* Invoices Section */}
              {invoices && invoices.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">INVOICES</h4>
                  {invoices.map((invoice) => {
                    const status = statusConfig[invoice.status as keyof typeof statusConfig] || statusConfig.pending;
                    const StatusIcon = status.icon;

                    return (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-lg", status.bg)}>
                            <StatusIcon className={cn("h-4 w-4", status.color)} />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{invoice.invoice_number}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(invoice.created_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-medium">
                              KES {invoice.total_amount.toLocaleString()}
                            </p>
                            <Badge variant="outline" className={cn("text-xs", status.color)}>
                              {status.label}
                            </Badge>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Payments Section */}
              {payments && payments.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">PAYMENTS</h4>
                  {payments.map((payment) => {
                    const status = statusConfig[payment.status as keyof typeof statusConfig] || statusConfig.pending;
                    const StatusIcon = status.icon;

                    return (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-lg", status.bg)}>
                            <StatusIcon className={cn("h-4 w-4", status.color)} />
                          </div>
                          <div>
                            <p className="font-medium text-sm capitalize">
                              {payment.payment_type.replace(/_/g, ' ')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(payment.created_at), 'MMM d, yyyy')} via {payment.payment_method.toUpperCase()}
                            </p>
                            {payment.mpesa_receipt && (
                              <p className="text-xs text-muted-foreground">
                                Receipt: {payment.mpesa_receipt}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            KES {payment.amount.toLocaleString()}
                          </p>
                          <Badge variant="outline" className={cn("text-xs", status.color)}>
                            {status.label}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
