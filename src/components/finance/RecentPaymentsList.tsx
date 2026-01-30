import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { CreditCard, Banknote, Smartphone, Building } from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  payment_method: string | null;
  transaction_ref: string | null;
  created_at: string;
  student_fee_accounts: {
    student_name: string;
    class: string | null;
  } | null;
}

interface RecentPaymentsListProps {
  payments: Payment[];
  isLoading: boolean;
  currency?: string;
}

const methodIcons: Record<string, typeof CreditCard> = {
  card: CreditCard,
  mpesa: Smartphone,
  bank_transfer: Building,
  cash: Banknote,
};

const methodLabels: Record<string, string> = {
  card: 'Card',
  mpesa: 'M-Pesa',
  bank_transfer: 'Bank Transfer',
  cash: 'Cash',
};

function formatCurrency(amount: number, currency: string = 'KES'): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function RecentPaymentsList({ payments, isLoading, currency = 'KES' }: RecentPaymentsListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recent Payments</CardTitle>
          <Badge variant="outline" className="text-xs">
            Live
            <span className="ml-1.5 h-2 w-2 animate-pulse rounded-full bg-success" />
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px] pr-4">
          {payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CreditCard className="mb-2 h-8 w-8" />
              <p>No recent payments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => {
                const method = payment.payment_method || 'cash';
                const Icon = methodIcons[method] || Banknote;
                const student = payment.student_fee_accounts;

                return (
                  <div key={payment.id} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/10">
                      <Icon className="h-5 w-5 text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {student?.student_name || 'Unknown Student'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{methodLabels[method] || method}</span>
                        {payment.transaction_ref && (
                          <>
                            <span>•</span>
                            <span className="truncate">{payment.transaction_ref}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium text-success">
                        +{formatCurrency(payment.amount, currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(payment.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
