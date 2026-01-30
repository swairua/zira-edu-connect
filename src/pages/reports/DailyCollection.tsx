import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { 
  Calendar, 
  Download, 
  RefreshCw, 
  DollarSign,
  CreditCard,
  Smartphone,
  Banknote,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface DailyCollectionSummary {
  date: string;
  total_amount: number;
  payment_count: number;
  cash_amount: number;
  bank_amount: number;
  mpesa_amount: number;
  other_amount: number;
}

export default function DailyCollection() {
  const { institutionId } = useInstitution();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dateRange, setDateRange] = useState<'7' | '14' | '30'>('7');

  // Fetch daily collection data
  const { data: collections = [], isLoading, refetch } = useQuery({
    queryKey: ['daily-collections', institutionId, selectedDate, dateRange],
    queryFn: async () => {
      if (!institutionId) return [];

      const endDate = new Date(selectedDate);
      const startDate = subDays(endDate, parseInt(dateRange));

      const { data, error } = await supabase
        .from('student_payments')
        .select('*')
        .eq('institution_id', institutionId)
        .gte('created_at', startOfDay(startDate).toISOString())
        .lte('created_at', endOfDay(endDate).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by date
      const grouped: Record<string, DailyCollectionSummary> = {};
      
      data?.forEach((payment) => {
        const date = format(new Date(payment.created_at!), 'yyyy-MM-dd');
        if (!grouped[date]) {
          grouped[date] = {
            date,
            total_amount: 0,
            payment_count: 0,
            cash_amount: 0,
            bank_amount: 0,
            mpesa_amount: 0,
            other_amount: 0,
          };
        }
        grouped[date].total_amount += payment.amount;
        grouped[date].payment_count += 1;

        const method = payment.payment_method?.toLowerCase() || '';
        if (method.includes('cash')) {
          grouped[date].cash_amount += payment.amount;
        } else if (method.includes('bank') || method.includes('transfer')) {
          grouped[date].bank_amount += payment.amount;
        } else if (method.includes('mpesa') || method.includes('mobile')) {
          grouped[date].mpesa_amount += payment.amount;
        } else {
          grouped[date].other_amount += payment.amount;
        }
      });

      return Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date));
    },
    enabled: !!institutionId,
  });

  // Calculate totals
  const totals = collections.reduce(
    (acc, day) => ({
      total: acc.total + day.total_amount,
      count: acc.count + day.payment_count,
      cash: acc.cash + day.cash_amount,
      bank: acc.bank + day.bank_amount,
      mpesa: acc.mpesa + day.mpesa_amount,
    }),
    { total: 0, count: 0, cash: 0, bank: 0, mpesa: 0 }
  );

  // Compare with previous period
  const midPoint = Math.floor(collections.length / 2);
  const recentTotal = collections.slice(0, midPoint).reduce((sum, d) => sum + d.total_amount, 0);
  const previousTotal = collections.slice(midPoint).reduce((sum, d) => sum + d.total_amount, 0);
  const changePercent = previousTotal > 0 ? ((recentTotal - previousTotal) / previousTotal) * 100 : 0;

  return (
    <DashboardLayout title="Daily Collection Report" subtitle="Track daily payment collections">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
            <Select value={dateRange} onValueChange={(v: '7' | '14' | '30') => setDateRange(v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Collected</p>
                  <p className="text-2xl font-bold">KES {totals.total.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                  <Banknote className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cash</p>
                  <p className="text-2xl font-bold">KES {totals.cash.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <CreditCard className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bank</p>
                  <p className="text-2xl font-bold">KES {totals.bank.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                  <Smartphone className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">M-Pesa</p>
                  <p className="text-2xl font-bold">KES {totals.mpesa.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${changePercent >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                  {changePercent >= 0 ? (
                    <TrendingUp className="h-6 w-6 text-success" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-destructive" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trend</p>
                  <p className={`text-2xl font-bold ${changePercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Breakdown Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Breakdown</CardTitle>
            <CardDescription>
              Payment collections by day and payment method
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(7)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : collections.length === 0 ? (
              <div className="py-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No collections found</h3>
                <p className="text-sm text-muted-foreground">
                  No payments recorded in the selected period
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Payments</TableHead>
                    <TableHead className="text-right">Cash</TableHead>
                    <TableHead className="text-right">Bank</TableHead>
                    <TableHead className="text-right">M-Pesa</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collections.map((day) => (
                    <TableRow key={day.date}>
                      <TableCell className="font-medium">
                        {format(new Date(day.date), 'EEE, MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{day.payment_count}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        KES {day.cash_amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        KES {day.bank_amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        KES {day.mpesa_amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        KES {day.total_amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Totals Row */}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">{totals.count}</TableCell>
                    <TableCell className="text-right">KES {totals.cash.toLocaleString()}</TableCell>
                    <TableCell className="text-right">KES {totals.bank.toLocaleString()}</TableCell>
                    <TableCell className="text-right">KES {totals.mpesa.toLocaleString()}</TableCell>
                    <TableCell className="text-right">KES {totals.total.toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
