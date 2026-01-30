import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Wallet, Users, TrendingUp, Calendar, Play, Settings, ArrowRight, FileText, Plus, Minus } from 'lucide-react';
import { usePayrollDashboard, usePayrollRuns } from '@/hooks/usePayroll';
import { Link } from 'react-router-dom';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PayrollOverview() {
  const { data: dashboard, isLoading } = usePayrollDashboard();
  const { data: runs } = usePayrollRuns();

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-KE', { 
      style: 'currency', 
      currency: 'KES',
      minimumFractionDigits: 0 
    }).format(amount);
  };

  const getNextPayDate = () => {
    if (!dashboard?.settings?.pay_day) return 'Not configured';
    const now = new Date();
    const payDay = dashboard.settings.pay_day;
    let nextDate = new Date(now.getFullYear(), now.getMonth(), payDay);
    if (nextDate <= now) {
      nextDate = new Date(now.getFullYear(), now.getMonth() + 1, payDay);
    }
    return nextDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const recentRuns = runs?.slice(0, 3) || [];

  return (
    <DashboardLayout title="Payroll">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payroll</h1>
            <p className="text-muted-foreground">
              Manage staff salaries, allowances, deductions, and payslips
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/hr/payroll/runs">
              <Button>
                <Play className="h-4 w-4 mr-2" />
                Run Payroll
              </Button>
            </Link>
            <Link to="/hr/payroll/settings">
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Staff on Payroll</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{dashboard?.staffOnPayroll || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">With salary configured</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Gross</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">
                  {dashboard?.projectedGross ? formatCurrency(dashboard.projectedGross) : '--'}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Projected basic salaries</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Processed</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : dashboard?.latestRun ? (
                <>
                  <div className="text-2xl font-bold">
                    {formatCurrency(dashboard.latestRun.total_net)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {MONTHS[dashboard.latestRun.month - 1]} {dashboard.latestRun.year}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-muted-foreground">--</div>
                  <p className="text-xs text-muted-foreground">No payroll processed yet</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Pay Date</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{getNextPayDate()}</div>
              )}
              <p className="text-xs text-muted-foreground">
                {dashboard?.settings ? `Day ${dashboard.settings.pay_day} monthly` : 'Configure in settings'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link to="/hr/payroll/salaries" className="block">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Staff Salaries</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage basic salaries for all staff members
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/hr/payroll/allowances" className="block">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-base">Allowances</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Configure allowance types and assignments
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/hr/payroll/deductions" className="block">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Minus className="h-5 w-5 text-destructive" />
                  <CardTitle className="text-base">Deductions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Set up deduction types like tax and pension
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/hr/payroll/payslips" className="block">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-base">Payslips</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View and download generated payslips
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Payroll Runs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Payroll Runs</CardTitle>
              <CardDescription>Latest processed payrolls</CardDescription>
            </div>
            <Link to="/hr/payroll/runs">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentRuns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No payroll runs yet</p>
                <Link to="/hr/payroll/runs">
                  <Button variant="outline" className="mt-4">
                    <Play className="h-4 w-4 mr-2" />
                    Run First Payroll
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRuns.map((run) => (
                  <div key={run.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <div className="font-medium">
                        {MONTHS[run.month - 1]} {run.year}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {run.total_staff} staff • Net: {formatCurrency(run.total_net)}
                      </div>
                    </div>
                    <Badge 
                      variant={run.status === 'completed' ? 'default' : 'outline'}
                      className={run.status === 'completed' ? 'bg-green-500' : ''}
                    >
                      {run.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
