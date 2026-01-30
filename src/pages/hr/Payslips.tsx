import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Search, Eye, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePayslips, usePayrollRuns } from '@/hooks/usePayroll';
import { PayslipViewDialog } from '@/components/hr/PayslipViewDialog';
import { Link, useSearchParams } from 'react-router-dom';
import type { Payslip } from '@/hooks/usePayroll';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Payslips() {
  const [searchParams] = useSearchParams();
  const runId = searchParams.get('run');
  const { data: payslips, isLoading } = usePayslips(runId || undefined);
  const { data: runs } = usePayrollRuns();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRunId, setSelectedRunId] = useState<string>(runId || 'all');
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'sent':
        return <Badge className="bg-blue-500">Sent</Badge>;
      case 'generated':
        return <Badge variant="outline">Generated</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredPayslips = payslips?.filter(p => {
    const matchesSearch = searchTerm === '' ||
      `${p.staff?.first_name} ${p.staff?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.staff?.employee_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRun = selectedRunId === 'all' || p.payroll_run_id === selectedRunId;
    
    return matchesSearch && matchesRun;
  }) || [];

  return (
    <DashboardLayout title="Payslips">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/hr/payroll">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Payslips</h1>
            <p className="text-muted-foreground">View and download staff payslips</p>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Payslips</CardTitle>
            <div className="flex items-center gap-4">
              <Select value={selectedRunId} onValueChange={setSelectedRunId}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Periods</SelectItem>
                  {runs?.filter(r => r.status === 'completed').map(run => (
                    <SelectItem key={run.id} value={run.id}>
                      {MONTHS[run.month - 1]} {run.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredPayslips.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm || selectedRunId !== 'all'
                  ? 'No matching payslips found'
                  : 'No payslips generated yet'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Basic</TableHead>
                    <TableHead className="text-right">Allowances</TableHead>
                    <TableHead className="text-right">Gross</TableHead>
                    <TableHead className="text-right">Deductions</TableHead>
                    <TableHead className="text-right">Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayslips.map((payslip) => (
                    <TableRow key={payslip.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {payslip.staff?.first_name} {payslip.staff?.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {payslip.staff?.employee_number}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {payslip.payroll_run && (
                          <span>{MONTHS[payslip.payroll_run.month - 1]} {payslip.payroll_run.year}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(payslip.basic_salary)}</TableCell>
                      <TableCell className="text-right text-green-600">
                        +{formatCurrency(payslip.total_allowances)}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(payslip.gross_salary)}</TableCell>
                      <TableCell className="text-right text-destructive">
                        -{formatCurrency(payslip.total_deductions)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(payslip.net_salary)}
                      </TableCell>
                      <TableCell>{getStatusBadge(payslip.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedPayslip(payslip)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <PayslipViewDialog
          open={!!selectedPayslip}
          onOpenChange={(open) => !open && setSelectedPayslip(null)}
          payslip={selectedPayslip}
        />
      </div>
    </DashboardLayout>
  );
}
