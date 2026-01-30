import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Users, CheckCircle } from 'lucide-react';
import { useStudentPayments } from '@/hooks/useStudentPayments';
import { useFeeCollectionStats } from '@/hooks/useFeeCollectionStats';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface FeeCollectionReportProps {
  institutionId: string | null;
  academicYearId?: string;
  classId?: string;
}

const STATUS_COLORS = {
  paid: 'hsl(142, 76%, 36%)',
  partial: 'hsl(38, 92%, 50%)',
  defaulter: 'hsl(0, 84%, 60%)',
};

export function FeeCollectionReport({ institutionId, academicYearId, classId }: FeeCollectionReportProps) {
  const { data: payments = [], isLoading: paymentsLoading } = useStudentPayments(institutionId);
  const { data: feeStats, isLoading: statsLoading } = useFeeCollectionStats(institutionId, classId);

  const isLoading = paymentsLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[120px] w-full" />
          ))}
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  const {
    totalFees = 0,
    totalPaid = 0,
    outstanding = 0,
    collectionRate = 0,
    totalStudents = 0,
    paidInFull = 0,
    partialPayments = 0,
    defaulters = 0,
    classStats = [],
  } = feeStats || {};

  // Payment method breakdown from actual payments
  const paymentMethodData = payments?.reduce((acc, payment) => {
    if (payment.status === 'completed') {
      const method = payment.payment_method || 'Other';
      acc[method] = (acc[method] || 0) + payment.amount;
    }
    return acc;
  }, {} as Record<string, number>) || {};

  const methodChartData = Object.entries(paymentMethodData).map(([method, amount]) => ({
    method: method.charAt(0).toUpperCase() + method.slice(1).replace('_', ' '),
    amount,
  }));

  // Monthly collection trend (last 6 months)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(new Date(), i));
    const monthEnd = endOfMonth(subMonths(new Date(), i));
    
    const monthlyPayments = payments?.filter(p => {
      if (p.status !== 'completed') return false;
      const paymentDate = new Date(p.payment_date);
      return paymentDate >= monthStart && paymentDate <= monthEnd;
    }) || [];
    
    const monthlyTotal = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
    
    monthlyData.push({
      month: format(monthStart, 'MMM'),
      amount: monthlyTotal,
    });
  }

  // Status distribution for pie chart
  const statusData = [
    { name: 'Paid in Full', value: paidInFull, color: STATUS_COLORS.paid },
    { name: 'Partial Payment', value: partialPayments, color: STATUS_COLORS.partial },
    { name: 'Defaulters', value: defaulters, color: STATUS_COLORS.defaulter },
  ].filter(d => d.value > 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalFees)}</div>
            <p className="text-xs text-muted-foreground">{totalStudents} students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
            <p className="text-xs text-muted-foreground">{collectionRate}% collection rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(outstanding)}</div>
            <p className="text-xs text-muted-foreground">Pending collection</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Defaulters</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{defaulters}</div>
            <p className="text-xs text-muted-foreground">Students with {'<'}50% paid</p>
          </CardContent>
        </Card>
      </div>

      {/* Collection Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Collection Progress</CardTitle>
          <CardDescription>Overall fee collection status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Collection Rate</span>
              <span className="font-medium">{collectionRate}%</span>
            </div>
            <Progress value={collectionRate} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Collected: {formatCurrency(totalPaid)}</span>
              <span>Target: {formatCurrency(totalFees)}</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-3">
                <CheckCircle className="mx-auto h-5 w-5 text-green-600" />
                <p className="mt-1 text-lg font-bold text-green-600">{paidInFull}</p>
                <p className="text-xs text-muted-foreground">Paid in Full</p>
              </div>
              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/30 p-3">
                <Users className="mx-auto h-5 w-5 text-yellow-600" />
                <p className="mt-1 text-lg font-bold text-yellow-600">{partialPayments}</p>
                <p className="text-xs text-muted-foreground">Partial</p>
              </div>
              <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3">
                <AlertTriangle className="mx-auto h-5 w-5 text-red-600" />
                <p className="mt-1 text-lg font-bold text-red-600">{defaulters}</p>
                <p className="text-xs text-muted-foreground">Defaulters</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Collection Trend</CardTitle>
            <CardDescription>Monthly collection over last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyData.some(d => d.amount > 0) ? (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis 
                      className="text-xs" 
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Collected']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                No payment data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>By Payment Method</CardTitle>
            <CardDescription>Collection breakdown by method</CardDescription>
          </CardHeader>
          <CardContent>
            {methodChartData.length > 0 ? (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={methodChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      type="number" 
                      className="text-xs"
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    />
                    <YAxis dataKey="method" type="category" className="text-xs" width={80} />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Amount']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                No payment data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Collection by Class */}
      <Card>
        <CardHeader>
          <CardTitle>Collection by Class</CardTitle>
          <CardDescription>Fee collection status per class</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead className="text-right">Students</TableHead>
                <TableHead className="text-right">Invoiced</TableHead>
                <TableHead className="text-right">Collected</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Defaulters</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No fee data available
                  </TableCell>
                </TableRow>
              ) : (
                classStats.map((cls) => (
                  <TableRow key={cls.classId}>
                    <TableCell className="font-medium">{cls.className}</TableCell>
                    <TableCell className="text-right">{cls.studentCount}</TableCell>
                    <TableCell className="text-right">{formatCurrency(cls.totalFees)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(cls.totalPaid)}</TableCell>
                    <TableCell className="text-right text-destructive">{formatCurrency(cls.outstanding)}</TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant={cls.collectionRate >= 80 ? 'default' : cls.collectionRate >= 50 ? 'secondary' : 'destructive'}
                      >
                        {cls.collectionRate}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {cls.defaulterCount > 0 ? (
                        <span className="text-destructive font-medium">{cls.defaulterCount}</span>
                      ) : (
                        <span className="text-green-600">0</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
