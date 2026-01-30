import { PortalLayout } from '@/components/portal/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useFinanceDashboard } from '@/hooks/useFinanceDashboard';
import { useFinanceSettings } from '@/hooks/useFinanceSettings';
import { 
  Wallet, 
  TrendingUp, 
  AlertTriangle, 
  Clock,
  CreditCard,
  FileText,
  Bell,
  BarChart3,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Banknote,
  Receipt,
  Calculator,
  Shield,
  Calendar,
  Smartphone,
  Gavel,
  Settings,
  BookOpen,
  Building,
  Landmark,
  FileBarChart,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function FinanceDashboard() {
  const { institutionId } = useInstitution();
  const { data: financeSettings } = useFinanceSettings(institutionId);
  const { 
    stats, 
    isLoadingStats, 
    todayPayments, 
    isLoadingTodayPayments,
    criticalDefaulters,
    isLoadingDefaulters,
    pendingAdjustments,
    isLoadingAdjustments
  } = useFinanceDashboard(institutionId);

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  return (
    <PortalLayout title="Finance Dashboard" subtitle="Overview of daily financial operations">
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          {isLoadingStats ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-28" />
              ))}
            </>
          ) : (
            <>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                      <Wallet className="h-6 w-6 text-success" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Today's Collections</p>
                      <p className="text-2xl font-bold">{formatCurrency(stats?.todayCollections || 0)}</p>
                      {stats?.yesterdayCollections !== undefined && (
                        <div className="flex items-center gap-1 text-xs">
                          {(stats.todayCollections || 0) >= stats.yesterdayCollections ? (
                            <>
                              <ArrowUpRight className="h-3 w-3 text-success" />
                              <span className="text-success">vs yesterday</span>
                            </>
                          ) : (
                            <>
                              <ArrowDownRight className="h-3 w-3 text-destructive" />
                              <span className="text-destructive">vs yesterday</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                      <Clock className="h-6 w-6 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Adjustments</p>
                      <p className="text-2xl font-bold">{stats?.pendingAdjustments || 0}</p>
                      <p className="text-xs text-muted-foreground">Awaiting approval</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                      <AlertTriangle className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Overdue Amount</p>
                      <p className="text-2xl font-bold">{formatCurrency(stats?.overdueAmount || 0)}</p>
                      <p className="text-xs text-destructive">{stats?.overdueCount || 0} students</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Collection Rate</p>
                      <p className="text-2xl font-bold">{(stats?.collectionRate || 0).toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">This term</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common finance operations</CardDescription>
            </div>
            <Link to="/portal/settings">
              <Badge variant="outline" className="gap-1">
                <Settings className="h-3 w-3" />
                Configure
              </Badge>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                to="/portal/payments"
                className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
              >
                <CreditCard className="h-5 w-5 text-primary" />
                <span className="font-medium">Record Payment</span>
              </Link>
              <Link
                to="/portal/invoices"
                className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
              >
                <FileText className="h-5 w-5 text-primary" />
                <span className="font-medium">Generate Invoices</span>
              </Link>
              <Link
                to="/portal/vouchers/new"
                className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
              >
                <Receipt className="h-5 w-5 text-primary" />
                <span className="font-medium">New Voucher</span>
              </Link>
              <Link
                to="/portal/daily-report"
                className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
              >
                <BarChart3 className="h-5 w-5 text-primary" />
                <span className="font-medium">Daily Report</span>
              </Link>
              
              {/* Dynamic actions based on settings */}
              {financeSettings?.mpesa_enabled && (
                <Link
                  to="/portal/mpesa"
                  className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/5 p-4 hover:bg-success/10 transition-colors"
                >
                  <Smartphone className="h-5 w-5 text-success" />
                  <span className="font-medium">M-PESA</span>
                </Link>
              )}
              {financeSettings?.reminders_enabled && (
                <Link
                  to="/portal/reminders"
                  className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 hover:bg-primary/10 transition-colors"
                >
                  <Bell className="h-5 w-5 text-primary" />
                  <span className="font-medium">Reminders</span>
                </Link>
              )}
              {financeSettings?.penalties_enabled && (
                <Link
                  to="/portal/penalties"
                  className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/5 p-4 hover:bg-warning/10 transition-colors"
                >
                  <Gavel className="h-5 w-5 text-warning" />
                  <span className="font-medium">Penalties</span>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Setup & Reports Quick Links */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Setup Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Setup</CardTitle>
              <CardDescription>Configure finance module</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                <Link
                  to="/portal/chart-of-accounts"
                  className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Chart of Accounts</span>
                </Link>
                <Link
                  to="/portal/funds"
                  className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Funds</span>
                </Link>
                <Link
                  to="/portal/voteheads"
                  className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Voteheads</span>
                </Link>
                <Link
                  to="/portal/bank-accounts"
                  className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Bank Accounts</span>
                </Link>
                <Link
                  to="/portal/capitation"
                  className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <Landmark className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Capitation</span>
                </Link>
                <Link
                  to="/portal/periods"
                  className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Period Locks</span>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Reports Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Reports</CardTitle>
              <CardDescription>Financial statements & analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                <Link
                  to="/portal/trial-balance"
                  className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Trial Balance</span>
                </Link>
                <Link
                  to="/portal/general-ledger"
                  className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <FileBarChart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">General Ledger</span>
                </Link>
                <Link
                  to="/portal/daily-report"
                  className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Daily Report</span>
                </Link>
                <Link
                  to="/portal/aging"
                  className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Aging Report</span>
                </Link>
                <Link
                  to="/portal/reconciliation"
                  className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Reconciliation</span>
                </Link>
                <Link
                  to="/portal/adjustments"
                  className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Adjustments</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Today's Payments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="h-5 w-5" />
                  Today's Payments
                </CardTitle>
                <CardDescription>Payments received today</CardDescription>
              </div>
              <Link to="/portal/payments">
                <Badge variant="outline">View All</Badge>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoadingTodayPayments ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : todayPayments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No payments received today yet.
                </p>
              ) : (
                <ScrollArea className="h-[280px]">
                  <div className="space-y-3">
                    {todayPayments.map(payment => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                            <CreditCard className="h-5 w-5 text-success" />
                          </div>
                          <div>
                            <p className="font-medium">{payment.studentName}</p>
                            <p className="text-sm text-muted-foreground">
                              {payment.method} • {format(new Date(payment.createdAt), 'HH:mm')}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-success">
                          +{formatCurrency(payment.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Pending Adjustments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pending Approvals
                </CardTitle>
                <CardDescription>Adjustments awaiting review</CardDescription>
              </div>
              <Link to="/portal/adjustments">
                <Badge variant="outline">View All</Badge>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoadingAdjustments ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : pendingAdjustments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mb-2 text-success" />
                  <p>No pending adjustments</p>
                </div>
              ) : (
                <ScrollArea className="h-[280px]">
                  <div className="space-y-3">
                    {pendingAdjustments.map(adj => (
                      <div
                        key={adj.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                            <Calculator className="h-5 w-5 text-warning" />
                          </div>
                          <div>
                            <p className="font-medium capitalize">{adj.type.replace('_', ' ')}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-[180px]">
                              {adj.reason}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="shrink-0">
                          {formatCurrency(adj.amount)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Critical Defaulters */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Critical Defaulters (90+ Days)
              </CardTitle>
              <CardDescription>Students requiring immediate attention</CardDescription>
            </div>
            <Link to="/portal/aging">
              <Badge variant="outline">View Aging Report</Badge>
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
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mb-2 text-success" />
                <p>No critical defaulters</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {criticalDefaulters.slice(0, 6).map(student => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-3"
                  >
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {student.className || 'No class'} • {student.daysOverdue} days
                      </p>
                    </div>
                    <p className="font-semibold text-destructive">
                      {formatCurrency(student.balance)}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {criticalDefaulters.length > 6 && (
              <div className="mt-4 text-center">
                <Link to="/portal/aging">
                  <Button variant="outline" size="sm">
                    View All {criticalDefaulters.length} Defaulters
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
