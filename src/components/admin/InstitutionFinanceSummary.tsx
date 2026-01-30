import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { usePermissions } from '@/hooks/usePermissions';
import { cn } from '@/lib/utils';

interface InstitutionFinanceSummaryProps {
  expectedFees: number;
  collectedFees: number;
  outstandingBalance: number;
  collectionRate: number;
  currency?: string;
}

export function InstitutionFinanceSummary({
  expectedFees,
  collectedFees,
  outstandingBalance,
  collectionRate,
  currency = 'KES',
}: InstitutionFinanceSummaryProps) {
  const { can } = usePermissions();

  if (!can('finance', 'view')) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${currency} ${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${currency} ${(amount / 1000).toFixed(1)}K`;
    }
    return `${currency} ${amount.toLocaleString()}`;
  };

  const isHealthy = collectionRate >= 70;
  const isWarning = collectionRate >= 50 && collectionRate < 70;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Finance Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Collection Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Collection Rate</span>
            <span className={cn(
              'text-sm font-semibold flex items-center gap-1',
              isHealthy && 'text-green-600',
              isWarning && 'text-yellow-600',
              !isHealthy && !isWarning && 'text-red-600'
            )}>
              {isHealthy ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {collectionRate.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={collectionRate} 
            className={cn(
              'h-2',
              isHealthy && '[&>div]:bg-green-500',
              isWarning && '[&>div]:bg-yellow-500',
              !isHealthy && !isWarning && '[&>div]:bg-red-500'
            )}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Expected</p>
            <p className="text-sm font-semibold">{formatCurrency(expectedFees)}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-green-500/10">
            <p className="text-xs text-muted-foreground">Collected</p>
            <p className="text-sm font-semibold text-green-600">{formatCurrency(collectedFees)}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-red-500/10">
            <p className="text-xs text-muted-foreground">Outstanding</p>
            <p className="text-sm font-semibold text-red-600">{formatCurrency(outstandingBalance)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
