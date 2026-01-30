import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeeBalanceCardProps {
  balance: number | null;
  totalInvoiced: number;
  totalPaid: number;
  isPaid: boolean;
  isLoading: boolean;
  currency?: string;
}

export function FeeBalanceCard({
  balance,
  totalInvoiced,
  totalPaid,
  isPaid,
  isLoading,
  currency = 'KES',
}: FeeBalanceCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-primary p-4 sm:p-6">
            <Skeleton className="h-4 w-20 sm:w-24 bg-white/20" />
            <Skeleton className="mt-2 h-8 sm:h-10 w-32 sm:w-40 bg-white/20" />
          </div>
          <div className="flex divide-x p-3 sm:p-4">
            <div className="flex-1 pr-3 sm:pr-4">
              <Skeleton className="h-3 w-14 sm:w-16" />
              <Skeleton className="mt-1 h-5 w-20 sm:w-24" />
            </div>
            <div className="flex-1 pl-3 sm:pl-4">
              <Skeleton className="h-3 w-14 sm:w-16" />
              <Skeleton className="mt-1 h-5 w-20 sm:w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Balance Header */}
        <div className={cn(
          'p-4 sm:p-6',
          isPaid 
            ? 'bg-gradient-to-br from-green-500 to-green-600' 
            : 'bg-gradient-primary'
        )}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-white/80">Fee Balance</p>
              <p className="mt-1 text-2xl sm:text-3xl font-bold text-white truncate">
                {formatCurrency(balance ?? 0)}
              </p>
            </div>
            <div className={cn(
              'flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full flex-shrink-0',
              isPaid ? 'bg-white/20' : 'bg-white/10'
            )}>
              {isPaid ? (
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              ) : (
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              )}
            </div>
          </div>
          
          {isPaid && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/10 px-2 sm:px-3 py-1.5 sm:py-2">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-white truncate">All fees paid</span>
            </div>
          )}
          
          {!isPaid && balance && balance > 0 && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/10 px-2 sm:px-3 py-1.5 sm:py-2">
              <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white flex-shrink-0" />
              <span className="text-xs sm:text-sm text-white/90 truncate">Outstanding balance</span>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex divide-x divide-border">
          <div className="flex-1 p-3 sm:p-4 min-w-0">
            <p className="text-xs text-muted-foreground">Total Billed</p>
            <p className="mt-0.5 text-base sm:text-lg font-semibold text-foreground truncate">
              {formatCurrency(totalInvoiced)}
            </p>
          </div>
          <div className="flex-1 p-3 sm:p-4 min-w-0">
            <p className="text-xs text-muted-foreground">Total Paid</p>
            <p className="mt-0.5 text-base sm:text-lg font-semibold text-success truncate">
              {formatCurrency(totalPaid)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
