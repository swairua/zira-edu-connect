import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Wallet, 
  Receipt, 
  CreditCard, 
  AlertTriangle, 
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  PieChart,
  FileText,
  CheckSquare,
  Shield,
  BarChart3
} from 'lucide-react';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useFinanceDashboard } from '@/hooks/useFinanceDashboard';
import { cn } from '@/lib/utils';

export default function FinanceOverview() {
  const { institution } = useInstitution();
  const { stats, isLoadingStats, todayPayments, isLoadingTodayPayments, criticalDefaulters, isLoadingDefaulters } = useFinanceDashboard(institution?.id);
  
  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const quickActions = [
    { label: 'Fee Structure', href: '/fees', icon: Wallet, description: 'Manage fee items and installments' },
    { label: 'Invoices', href: '/invoices', icon: Receipt, description: 'View and generate invoices' },
    { label: 'Payments', href: '/payments', icon: CreditCard, description: 'Record and track payments' },
    { label: 'Discounts', href: '/finance/discounts', icon: PieChart, description: 'Manage fee discounts' },
    { label: 'Adjustments', href: '/finance/adjustments', icon: FileText, description: 'Review pending adjustments' },
    { label: 'Reconciliation', href: '/finance/reconciliation', icon: CheckSquare, description: 'Match transactions' },
    { label: 'Period Locks', href: '/finance/periods', icon: Shield, description: 'Lock financial periods' },
    { label: 'Daily Collections', href: '/reports/daily-collection', icon: BarChart3, description: 'View daily reports' },
    { label: 'Aging Report', href: '/reports/aging', icon: Clock, description: 'Outstanding balances by age' },
  ];

  return (
    <DashboardLayout title="Finance Overview" subtitle="Monitor collections, outstanding balances, and financial health">
      <div className="space-y-6">

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Today's Collections */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Collections</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{formatCurrency(stats?.todayCollections || 0)}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {(stats?.todayCollections || 0) >= (stats?.yesterdayCollections || 0) ? (
                      <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    vs {formatCurrency(stats?.yesterdayCollections || 0)} yesterday
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Collection Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{(stats?.collectionRate || 0).toFixed(1)}%</div>
                  <Progress 
                    value={stats?.collectionRate || 0} 
                    className={cn(
                      "h-2 mt-2",
                      (stats?.collectionRate || 0) >= 80 ? "[&>div]:bg-green-500" : 
                      (stats?.collectionRate || 0) >= 60 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-red-500"
                    )} 
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Overdue Amount */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue (90+ Days)</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-destructive">{formatCurrency(stats?.overdueAmount || 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.overdueCount || 0} accounts
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Pending Adjustments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Adjustments</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.pendingAdjustments || 0}</div>
                  <Link 
                    to="/finance/adjustments" 
                    className="text-xs text-primary hover:underline inline-flex items-center"
                  >
                    Review now <ChevronRight className="h-3 w-3 ml-1" />
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Actions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common finance operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.href}
                    to={action.href}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                  >
                    <div className="p-2 rounded-md bg-primary/10">
                      <action.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{action.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Today's Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Payments</CardTitle>
              <CardDescription>Recent transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTodayPayments ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : todayPayments.length > 0 ? (
                <div className="space-y-3">
                  {todayPayments.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium truncate max-w-[120px]">{payment.studentName}</p>
                        <p className="text-xs text-muted-foreground">{payment.method}</p>
                      </div>
                      <span className="font-medium text-green-600">{formatCurrency(payment.amount)}</span>
                    </div>
                  ))}
                  <Link 
                    to="/payments" 
                    className="text-sm text-primary hover:underline inline-flex items-center pt-2"
                  >
                    View all payments <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No payments recorded today</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Critical Defaulters */}
        {!isLoadingDefaulters && criticalDefaulters.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Critical Defaulters
                  </CardTitle>
                  <CardDescription>Students with outstanding balances over 90 days</CardDescription>
                </div>
                <Link 
                  to="/reports/aging" 
                  className="text-sm text-primary hover:underline inline-flex items-center"
                >
                  View aging report <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {criticalDefaulters.slice(0, 6).map((defaulter) => (
                  <div key={defaulter.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">{defaulter.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {defaulter.className && <span>{defaulter.className}</span>}
                        <Badge variant="destructive" className="text-xs">
                          {defaulter.daysOverdue}+ days
                        </Badge>
                      </div>
                    </div>
                    <span className="font-bold text-destructive">{formatCurrency(defaulter.balance)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
