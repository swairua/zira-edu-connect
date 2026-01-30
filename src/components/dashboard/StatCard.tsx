import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info';
}

const variantStyles = {
  default: 'border-l-primary',
  primary: 'border-l-primary',
  success: 'border-l-success',
  warning: 'border-l-warning',
  info: 'border-l-info',
};

const iconBgStyles = {
  default: 'bg-primary/10 text-primary',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-info/10 text-info',
};

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  variant = 'default',
}: StatCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-l-4 p-3 sm:p-4 md:p-6 transition-all duration-200 hover:shadow-lifted',
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
          <p className="font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground truncate">
            {value}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              {isPositive && (
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-success flex-shrink-0" />
              )}
              {isNegative && (
                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-destructive flex-shrink-0" />
              )}
              <span
                className={cn(
                  'text-xs sm:text-sm font-medium',
                  isPositive && 'text-success',
                  isNegative && 'text-destructive',
                  !isPositive && !isNegative && 'text-muted-foreground'
                )}
              >
                {isPositive && '+'}
                {change}%
              </span>
              {changeLabel && (
                <span className="text-xs sm:text-sm text-muted-foreground truncate">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        <div
          className={cn(
            'flex h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 items-center justify-center rounded-lg sm:rounded-xl flex-shrink-0',
            iconBgStyles[variant]
          )}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}
