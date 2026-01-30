import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
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
import { useClasses } from '@/hooks/useClasses';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays } from 'date-fns';
import { 
  Download, 
  RefreshCw, 
  AlertTriangle,
  Clock,
  Users,
  DollarSign,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface AgingBucket {
  label: string;
  range: string;
  count: number;
  amount: number;
  color: string;
}

interface StudentAging {
  student_id: string;
  student_name: string;
  class_name: string;
  total_due: number;
  days_overdue: number;
  bucket: string;
}

export function AgingReportContent() {
  const { institutionId } = useInstitution();
  const { data: classes = [] } = useClasses(institutionId);
  const [classFilter, setClassFilter] = useState<string>('all');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['aging-report', institutionId, classFilter],
    queryFn: async () => {
      if (!institutionId) return { buckets: [], students: [] };

      let query = supabase
        .from('student_invoices')
        .select(`
          *,
          student:students(id, first_name, last_name, class_id, classes(name)),
          payment_allocations(amount)
        `)
        .eq('institution_id', institutionId)
        .in('status', ['pending', 'partially_paid', 'overdue']);

      const { data: invoices, error } = await query;
      if (error) throw error;

      const buckets: AgingBucket[] = [
        { label: 'Current', range: '0-30 days', count: 0, amount: 0, color: 'hsl(var(--success))' },
        { label: '31-60 Days', range: '31-60 days', count: 0, amount: 0, color: 'hsl(var(--warning))' },
        { label: '61-90 Days', range: '61-90 days', count: 0, amount: 0, color: 'hsl(var(--accent))' },
        { label: '90+ Days', range: 'Over 90 days', count: 0, amount: 0, color: 'hsl(var(--destructive))' },
      ];

      const studentMap: Record<string, StudentAging> = {};

      invoices?.forEach((invoice) => {
        if (!invoice.student) return;
        
        if (classFilter !== 'all' && invoice.student.class_id !== classFilter) return;

        const dueDate = new Date(invoice.due_date);
        const daysOverdue = Math.max(0, differenceInDays(new Date(), dueDate));
        
        const paidAmount = (invoice.payment_allocations as { amount: number }[] || [])
          .reduce((sum, alloc) => sum + alloc.amount, 0);
        const balance = invoice.total_amount - paidAmount;

        if (balance <= 0) return;

        let bucketIndex = 0;
        if (daysOverdue > 90) bucketIndex = 3;
        else if (daysOverdue > 60) bucketIndex = 2;
        else if (daysOverdue > 30) bucketIndex = 1;

        buckets[bucketIndex].count += 1;
        buckets[bucketIndex].amount += balance;

        const studentId = invoice.student.id;
        if (!studentMap[studentId]) {
          studentMap[studentId] = {
            student_id: studentId,
            student_name: `${invoice.student.first_name} ${invoice.student.last_name}`,
            class_name: invoice.student.classes?.name || 'Unassigned',
            total_due: 0,
            days_overdue: 0,
            bucket: buckets[bucketIndex].label,
          };
        }
        studentMap[studentId].total_due += balance;
        studentMap[studentId].days_overdue = Math.max(studentMap[studentId].days_overdue, daysOverdue);
        
        if (studentMap[studentId].days_overdue > 90) {
          studentMap[studentId].bucket = '90+ Days';
        } else if (studentMap[studentId].days_overdue > 60) {
          studentMap[studentId].bucket = '61-90 Days';
        } else if (studentMap[studentId].days_overdue > 30) {
          studentMap[studentId].bucket = '31-60 Days';
        } else {
          studentMap[studentId].bucket = 'Current';
        }
      });

      const students = Object.values(studentMap).sort((a, b) => b.days_overdue - a.days_overdue);

      return { buckets, students };
    },
    enabled: !!institutionId,
  });

  const buckets = data?.buckets || [];
  const students = data?.students || [];
  const totalAmount = buckets.reduce((sum, b) => sum + b.amount, 0);
  const totalCount = buckets.reduce((sum, b) => sum + b.count, 0);

  const getBucketBadgeVariant = (bucket: string) => {
    switch (bucket) {
      case 'Current': return 'default';
      case '31-60 Days': return 'secondary';
      case '61-90 Days': return 'outline';
      case '90+ Days': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Aging Analysis Report</h1>
          <p className="text-muted-foreground">Outstanding balances by age</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                <DollarSign className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Outstanding</p>
                <p className="text-2xl font-bold">KES {totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                <Users className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Students with Balance</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue Invoices</p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Aging Distribution</CardTitle>
            <CardDescription>Outstanding amounts by age bucket</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={buckets.filter(b => b.amount > 0)}
                      dataKey="amount"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {buckets.map((bucket, index) => (
                        <Cell key={`cell-${index}`} fill={bucket.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `KES ${value.toLocaleString()}`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bucket Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Bucket Summary</CardTitle>
            <CardDescription>Breakdown by aging period</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {buckets.map((bucket, index) => (
                  <div key={bucket.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: bucket.color }}
                        />
                        <span className="font-medium">{bucket.label}</span>
                        <span className="text-sm text-muted-foreground">({bucket.range})</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">KES {bucket.amount.toLocaleString()}</span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          ({bucket.count} invoices)
                        </span>
                      </div>
                    </div>
                    <Progress 
                      value={totalAmount > 0 ? (bucket.amount / totalAmount) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Student List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Student Breakdown</CardTitle>
              <CardDescription>
                Individual student balances sorted by days overdue
              </CardDescription>
            </div>
            {students.filter(s => s.days_overdue > 90).length > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {students.filter(s => s.days_overdue > 90).length} critical
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="py-12 text-center">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No outstanding balances</h3>
              <p className="text-sm text-muted-foreground">
                All students are up to date with payments
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Days Overdue</TableHead>
                  <TableHead>Aging Bucket</TableHead>
                  <TableHead className="text-right">Amount Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.slice(0, 50).map((student) => (
                  <TableRow key={student.student_id}>
                    <TableCell className="font-medium">{student.student_name}</TableCell>
                    <TableCell>{student.class_name}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={student.days_overdue > 90 ? 'destructive' : student.days_overdue > 30 ? 'secondary' : 'outline'}
                      >
                        {student.days_overdue} days
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getBucketBadgeVariant(student.bucket)}>
                        {student.bucket}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      KES {student.total_due.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
