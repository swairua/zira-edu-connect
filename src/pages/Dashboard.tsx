import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentInstitutions } from '@/components/dashboard/RecentInstitutions';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { CountryDistribution } from '@/components/dashboard/CountryDistribution';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useSuperAdminMetrics } from '@/hooks/useSuperAdminMetrics';
import { Building2, Users, UserCog, TrendingUp, Ticket, DollarSign, TrendingDown, BarChart3 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();
  const { 
    businessMetrics,
    isLoadingBusinessMetrics,
    revenueByCountry, 
    topInstitutions,
    tierDistribution,
  } = useSuperAdminMetrics();

  const mrr = businessMetrics?.mrr || 0;
  const mrrGrowthRate = businessMetrics?.mrrGrowthRate || 0;
  const activeCount = businessMetrics?.activeCount || 0;
  const churnRate = businessMetrics?.churnRate || 0;

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toLocaleString()}`;
  };

  return (
    <DashboardLayout 
      title="Super Admin Dashboard" 
      subtitle="Welcome back! Here's what's happening across your platform."
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="Total Institutions"
                value={stats?.totalInstitutions || 0}
                icon={<Building2 className="h-6 w-6" />}
                variant="primary"
              />
              <StatCard
                title="Active Institutions"
                value={stats?.activeInstitutions || 0}
                icon={<TrendingUp className="h-6 w-6" />}
                variant="success"
              />
              <StatCard
                title="Total Students"
                value={(stats?.totalStudents || 0).toLocaleString()}
                icon={<Users className="h-6 w-6" />}
                variant="info"
              />
              <StatCard
                title="Total Staff"
                value={(stats?.totalStaff || 0).toLocaleString()}
                icon={<UserCog className="h-6 w-6" />}
                variant="warning"
              />
            </>
          )}
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          {isLoadingBusinessMetrics ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="Monthly Revenue (MRR)"
                value={formatCurrency(mrr)}
                icon={<DollarSign className="h-6 w-6" />}
                change={mrrGrowthRate}
                changeLabel="vs last month"
                variant="success"
              />
              <StatCard
                title="Active Subscriptions"
                value={activeCount}
                icon={<TrendingUp className="h-6 w-6" />}
                variant="info"
              />
              <StatCard
                title="Churn Rate"
                value={`${churnRate.toFixed(1)}%`}
                icon={<TrendingDown className="h-6 w-6" />}
                variant={churnRate > 5 ? 'warning' : 'success'}
              />
              <StatCard
                title="Pending Tickets"
                value={stats?.pendingTickets || 0}
                icon={<Ticket className="h-6 w-6" />}
              />
            </>
          )}
        </div>

        {/* Revenue by Country & Tier Distribution */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Revenue by Country
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoadingBusinessMetrics ? (
                <Skeleton className="h-20" />
              ) : revenueByCountry.length === 0 ? (
                <p className="text-sm text-muted-foreground">No revenue data</p>
              ) : (
                revenueByCountry.slice(0, 5).map((item) => (
                  <div key={item.country} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{item.country}</span>
                      <span className="font-medium">{formatCurrency(item.revenue)}</span>
                    </div>
                    <Progress value={(item.revenue / (revenueByCountry[0]?.revenue || 1)) * 100} className="h-1.5" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Subscription Tiers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoadingBusinessMetrics ? (
                <Skeleton className="h-20" />
              ) : tierDistribution.length === 0 ? (
                <p className="text-sm text-muted-foreground">No subscription data</p>
              ) : (
                tierDistribution.map((tier) => (
                  <div key={tier.tier} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{tier.tier.replace('_', ' ')}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{tier.count}</span>
                      <span className="text-muted-foreground text-xs">
                        ({tier.percentage.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <RevenueChart />
          <CountryDistribution />
          <QuickActions />
        </div>

        {/* Recent Institutions */}
        <RecentInstitutions />
      </div>
    </DashboardLayout>
  );
}
