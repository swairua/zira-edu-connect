import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowRight, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFinanceDashboard } from '@/hooks/useFinanceDashboard';
import { format } from 'date-fns';

interface RecentPaymentsWidgetProps {
  institutionId: string;
  currency?: string;
}

function formatCurrency(amount: number, currency: string = 'KES'): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const methodColors: Record<string, string> = {
  cash: 'bg-success/10 text-success',
  mpesa: 'bg-info/10 text-info',
  bank: 'bg-primary/10 text-primary',
  cheque: 'bg-warning/10 text-warning',
};

export function RecentPaymentsWidget({ institutionId, currency = 'KES' }: RecentPaymentsWidgetProps) {
  const { todayPayments, isLoadingTodayPayments } = useFinanceDashboard(institutionId);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Today's Payments
          </CardTitle>
          <CardDescription>Recent fee collections</CardDescription>
        </div>
        <Link to="/portal/receipts">
          <Badge variant="outline">View All</Badge>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoadingTodayPayments ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : todayPayments.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">No payments received today</p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link to="/portal/receipts/new">
                Record Payment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {todayPayments.slice(0, 5).map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Receipt className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{payment.studentName}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(payment.createdAt), 'h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-success">
                    {formatCurrency(payment.amount, currency)}
                  </p>
                  <Badge 
                    variant="secondary" 
                    className={methodColors[payment.method.toLowerCase()] || ''}
                  >
                    {payment.method}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
