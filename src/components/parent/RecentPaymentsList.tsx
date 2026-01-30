import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Receipt, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface Payment {
  id: string;
  receipt_number: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string | null;
  currency: string | null;
}

interface RecentPaymentsListProps {
  payments: Payment[];
  isLoading: boolean;
  limit?: number;
  showViewAll?: boolean;
}

export function RecentPaymentsList({
  payments,
  isLoading,
  limit = 3,
  showViewAll = true,
}: RecentPaymentsListProps) {
  const formatCurrency = (amount: number, currency = 'KES') => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const displayPayments = payments.slice(0, limit);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Recent Payments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (displayPayments.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Receipt className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">No payments yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold">Recent Payments</CardTitle>
        {showViewAll && payments.length > limit && (
          <Link 
            to="/parent/fees" 
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {displayPayments.map((payment) => (
          <div key={payment.id} className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/10">
              <Receipt className="h-5 w-5 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{payment.receipt_number}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(payment.payment_date), 'MMM d, yyyy')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-success">
                {formatCurrency(payment.amount, payment.currency || 'KES')}
              </p>
              <Badge variant="outline" className="text-xs">
                {payment.payment_method}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
