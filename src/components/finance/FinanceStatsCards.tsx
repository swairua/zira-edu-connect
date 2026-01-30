import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users,
  AlertTriangle,
  Percent
} from 'lucide-react';
import type { FinanceStats } from '@/hooks/useFinance';

interface FinanceStatsCardsProps {
  stats: FinanceStats | undefined;
  isLoading: boolean;
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

export function FinanceStatsCards({ stats, isLoading, currency = 'KES' }: FinanceStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="p-3 sm:p-4">
              <Skeleton className="h-4 w-20 sm:w-24 mb-2" />
              <Skeleton className="h-6 sm:h-8 w-16 sm:w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Fees',
      value: formatCurrency(stats?.totalFees || 0, currency),
      icon: DollarSign,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Collected',
      value: formatCurrency(stats?.totalCollected || 0, currency),
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Outstanding',
      value: formatCurrency(stats?.totalOutstanding || 0, currency),
      icon: TrendingDown,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Collection Rate',
      value: `${(stats?.collectionRate || 0).toFixed(1)}%`,
      icon: Percent,
      color: 'text-info',
      bgColor: 'bg-info/10',
      progress: stats?.collectionRate,
    },
    {
      title: 'Total Students',
      value: stats?.studentCount?.toLocaleString() || '0',
      icon: Users,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'Defaulters',
      value: stats?.defaulterCount?.toLocaleString() || '0',
      icon: AlertTriangle,
      color: stats?.defaulterCount ? 'text-destructive' : 'text-success',
      bgColor: stats?.defaulterCount ? 'bg-destructive/10' : 'bg-success/10',
    },
  ];

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="relative overflow-hidden">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg flex-shrink-0 ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${card.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{card.title}</p>
                  <p className="text-base sm:text-lg font-bold truncate">{card.value}</p>
                  {card.progress !== undefined && (
                    <Progress value={card.progress} className="mt-1 h-1" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
