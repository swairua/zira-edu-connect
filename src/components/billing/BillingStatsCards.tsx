import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import type { BillingStats } from '@/hooks/useBilling';

interface BillingStatsCardsProps {
  stats: BillingStats | undefined;
  isLoading: boolean;
}

const formatCurrency = (amount: number, currency: string = 'KES') => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount / 100); // Assuming amounts are stored in cents
};

export function BillingStatsCards({ stats, isLoading }: BillingStatsCardsProps) {
  const cards = [
    {
      title: 'Total Revenue',
      value: stats ? formatCurrency(stats.totalRevenue) : '-',
      icon: DollarSign,
      description: 'All time collected',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Paid This Month',
      value: stats ? formatCurrency(stats.paidThisMonth) : '-',
      icon: TrendingUp,
      description: 'Current month',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Pending Amount',
      value: stats ? formatCurrency(stats.pendingAmount) : '-',
      icon: Clock,
      description: `${stats?.invoiceCount || 0} invoices`,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Overdue Amount',
      value: stats ? formatCurrency(stats.overdueAmount) : '-',
      icon: AlertTriangle,
      description: `${stats?.overdueCount || 0} overdue`,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate flex-1 min-w-0">
              {card.title}
            </CardTitle>
            <div className={`rounded-lg p-1.5 sm:p-2 flex-shrink-0 ${card.bgColor}`}>
              <card.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-6 sm:h-8 w-20 sm:w-28" />
            ) : (
              <>
                <div className="text-lg sm:text-xl md:text-2xl font-bold truncate">{card.value}</div>
                <p className="text-xs text-muted-foreground truncate">{card.description}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
