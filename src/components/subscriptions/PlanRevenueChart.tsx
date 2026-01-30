import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlanRevenueStats } from '@/hooks/useSubscriptionPlans';

interface PlanRevenueChartProps {
  stats: PlanRevenueStats[] | undefined;
  isLoading: boolean;
}

export function PlanRevenueChart({ stats, isLoading }: PlanRevenueChartProps) {
  if (isLoading) {
    return (
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Revenue by Plan</CardTitle>
          <CardDescription>Monthly recurring revenue breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-3 w-3 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-2 w-full" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxRevenue = Math.max(...(stats || []).map((s) => s.monthly_revenue), 1);
  const totalRevenue = (stats || []).reduce((sum, s) => sum + s.monthly_revenue, 0);
  const totalInstitutions = (stats || []).reduce((sum, s) => sum + s.institution_count, 0);

  return (
    <Card variant="elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Revenue by Plan</CardTitle>
            <CardDescription>Monthly recurring revenue breakdown</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">KES {(totalRevenue / 1000).toFixed(0)}K</p>
            <p className="text-sm text-muted-foreground">{totalInstitutions} active institutions</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {(!stats || stats.length === 0) ? (
          <p className="text-center text-muted-foreground py-8">
            No active subscriptions yet
          </p>
        ) : (
          <div className="space-y-4">
            {stats.map((item) => (
              <div key={item.plan_id} className="flex items-center gap-4">
                <div className={`h-3 w-3 rounded-full ${item.color}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.plan_name}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.institution_count} institution{item.institution_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-muted">
                    <div
                      className={`h-2 rounded-full ${item.color} transition-all`}
                      style={{ width: `${(item.monthly_revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="w-28 text-right font-semibold">
                  KES {item.monthly_revenue > 0 ? (item.monthly_revenue / 1000).toFixed(0) + 'K' : '0'}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
