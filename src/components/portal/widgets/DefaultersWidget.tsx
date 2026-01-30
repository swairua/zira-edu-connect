import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFinanceDashboard } from '@/hooks/useFinanceDashboard';
import { Button } from '@/components/ui/button';

interface DefaultersWidgetProps {
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

export function DefaultersWidget({ institutionId, currency = 'KES' }: DefaultersWidgetProps) {
  const { criticalDefaulters, isLoadingDefaulters } = useFinanceDashboard(institutionId);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Critical Defaulters
          </CardTitle>
          <CardDescription>Students with 90+ days overdue</CardDescription>
        </div>
        <Link to="/portal/defaulters">
          <Badge variant="outline">View All</Badge>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoadingDefaulters ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : criticalDefaulters.length === 0 ? (
          <div className="text-center py-8">
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-success/10 mb-2">
              <AlertTriangle className="h-6 w-6 text-success" />
            </div>
            <p className="text-muted-foreground">No critical defaulters!</p>
            <p className="text-xs text-muted-foreground mt-1">All students are within acceptable payment terms</p>
          </div>
        ) : (
          <div className="space-y-3">
            {criticalDefaulters.slice(0, 5).map((defaulter) => (
              <div
                key={defaulter.id}
                className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-3"
              >
                <div>
                  <p className="font-medium">{defaulter.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{defaulter.className || 'No class'}</span>
                    <span>•</span>
                    <span className="text-destructive">{defaulter.daysOverdue} days overdue</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-destructive">
                    {formatCurrency(defaulter.balance, currency)}
                  </p>
                </div>
              </div>
            ))}
            {criticalDefaulters.length > 5 && (
              <Button asChild variant="outline" className="w-full">
                <Link to="/portal/defaulters">
                  View {criticalDefaulters.length - 5} more
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
