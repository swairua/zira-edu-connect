import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Percent,
  Receipt
} from 'lucide-react';
import { useFinanceDashboard } from '@/hooks/useFinanceDashboard';

interface FinanceStatsWidgetProps {
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

export function FinanceStatsWidget({ institutionId, currency = 'KES' }: FinanceStatsWidgetProps) {
  const { stats, isLoadingStats } = useFinanceDashboard(institutionId);

  if (isLoadingStats) {
    return (
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-3 sm:p-4 sm:pt-6">
              <Skeleton className="h-4 w-20 sm:w-24 mb-2" />
              <Skeleton className="h-6 sm:h-8 w-16 sm:w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const todayChange = stats?.yesterdayCollections 
    ? ((stats.todayCollections - stats.yesterdayCollections) / stats.yesterdayCollections) * 100 
    : 0;

  const cards = [
    {
      title: "Today's Collections",
      value: formatCurrency(stats?.todayCollections || 0, currency),
      subtitle: todayChange !== 0 ? `${todayChange > 0 ? '+' : ''}${todayChange.toFixed(0)}% vs yesterday` : 'vs yesterday',
      icon: DollarSign,
      color: 'text-success',
      bgColor: 'bg-success/10',
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
      title: 'Overdue (90+ days)',
      value: formatCurrency(stats?.overdueAmount || 0, currency),
      subtitle: `${stats?.overdueCount || 0} students`,
      icon: AlertTriangle,
      color: stats?.overdueCount ? 'text-destructive' : 'text-muted-foreground',
      bgColor: stats?.overdueCount ? 'bg-destructive/10' : 'bg-muted/10',
    },
    {
      title: 'Pending Adjustments',
      value: stats?.pendingAdjustments || 0,
      icon: Receipt,
      color: stats?.pendingAdjustments ? 'text-warning' : 'text-muted-foreground',
      bgColor: stats?.pendingAdjustments ? 'bg-warning/10' : 'bg-muted/10',
    },
  ];

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="relative overflow-hidden">
            <CardContent className="p-3 sm:p-4 sm:pt-6">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg flex-shrink-0 ${card.bgColor}`}>
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${card.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{card.title}</p>
                  <p className="text-lg sm:text-2xl font-bold truncate">{card.value}</p>
                  {card.subtitle && (
                    <p className="text-xs text-muted-foreground truncate">{card.subtitle}</p>
                  )}
                  {card.progress !== undefined && (
                    <Progress value={card.progress} className="mt-1 h-1.5" />
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
