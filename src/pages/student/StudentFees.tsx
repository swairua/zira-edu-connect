import { StudentLayout } from '@/components/student/StudentLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStudentFees } from '@/hooks/useStudentData';
import { useQueryClient } from '@tanstack/react-query';
import { Wallet, FileText, Receipt, TrendingDown, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentFees() {
  const queryClient = useQueryClient();
  const { data: fees, isLoading } = useStudentFees();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['student-fees'] });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Paid</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Partial</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Confirmed</Badge>;
      case 'reversed':
        return <Badge variant="destructive">Reversed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <StudentLayout title="Fees" onRefresh={handleRefresh}>
      <div className="p-4 space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </>
        ) : (
          <>
            {/* Balance Summary */}
            <Card className={fees?.balance && fees.balance > 0 ? 'border-destructive/50 bg-destructive/5' : 'border-green-500/50 bg-green-500/5'}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                    (fees?.balance || 0) > 0 
                      ? 'bg-destructive/10' 
                      : 'bg-green-500/10'
                  }`}>
                    <Wallet className={`h-7 w-7 ${
                      (fees?.balance || 0) > 0 
                        ? 'text-destructive' 
                        : 'text-green-600'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Balance</p>
                    <p className={`text-3xl font-bold ${
                      (fees?.balance || 0) > 0 
                        ? 'text-destructive' 
                        : 'text-green-600'
                    }`}>
                      KES {(fees?.balance || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">KES {(fees?.totalInvoiced || 0).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Total Billed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                      <TrendingDown className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">KES {(fees?.totalPaid || 0).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Total Paid</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Invoices & Payments Tabs */}
            <Tabs defaultValue="invoices">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="invoices" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Invoices
                </TabsTrigger>
                <TabsTrigger value="payments" className="gap-2">
                  <Receipt className="h-4 w-4" />
                  Payments
                </TabsTrigger>
              </TabsList>

              <TabsContent value="invoices" className="mt-4 space-y-3">
                {fees?.invoices.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
                      <h3 className="mt-4 font-semibold">No invoices</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Your invoices will appear here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  fees?.invoices.map((invoice: any) => (
                    <Card key={invoice.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{invoice.invoice_number}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Due: {format(new Date(invoice.due_date), 'dd MMM yyyy')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(invoice.terms as any)?.name} • {(invoice.academic_years as any)?.name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">
                              KES {invoice.total_amount.toLocaleString()}
                            </p>
                            <div className="mt-1">
                              {getStatusBadge(invoice.status)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="payments" className="mt-4 space-y-3">
                {fees?.payments.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <Receipt className="mx-auto h-10 w-10 text-muted-foreground" />
                      <h3 className="mt-4 font-semibold">No payments</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Your payment history will appear here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  fees?.payments.map((payment: any) => (
                    <Card key={payment.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{payment.receipt_number}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(payment.payment_date), 'dd MMM yyyy')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {payment.payment_method}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">
                              +KES {payment.amount.toLocaleString()}
                            </p>
                            <div className="mt-1">
                              {getStatusBadge(payment.status)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </StudentLayout>
  );
}
