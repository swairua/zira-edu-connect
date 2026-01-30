import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, ArrowLeft, Play, Eye } from 'lucide-react';
import { usePayrollRuns, useCreatePayrollRun, useProcessPayrollRun } from '@/hooks/usePayroll';
import { ProcessPayrollDialog } from '@/components/hr/ProcessPayrollDialog';
import { Link, useNavigate } from 'react-router-dom';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PayrollRuns() {
  const { data: runs, isLoading } = usePayrollRuns();
  const createRun = useCreatePayrollRun();
  const processRun = useProcessPayrollRun();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500">Processing</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleCreateAndProcess = async (month: number, year: number) => {
    try {
      const run = await createRun.mutateAsync({ month, year });
      await processRun.mutateAsync(run.id);
      setDialogOpen(false);
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleProcess = async (runId: string) => {
    await processRun.mutateAsync(runId);
  };

  return (
    <DashboardLayout title="Payroll Runs">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/hr/payroll">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Payroll Runs</h1>
            <p className="text-muted-foreground">Process and manage monthly payroll</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Run Payroll
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payroll History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : runs?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No payroll runs yet. Click "Run Payroll" to process your first payroll.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Staff Count</TableHead>
                    <TableHead className="text-right">Gross</TableHead>
                    <TableHead className="text-right">Deductions</TableHead>
                    <TableHead className="text-right">Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Processed</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs?.map((run) => (
                    <TableRow key={run.id}>
                      <TableCell className="font-medium">
                        {MONTHS[run.month - 1]} {run.year}
                      </TableCell>
                      <TableCell className="text-right">{run.total_staff}</TableCell>
                      <TableCell className="text-right">{formatCurrency(run.total_gross)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(run.total_deductions)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(run.total_net)}</TableCell>
                      <TableCell>{getStatusBadge(run.status)}</TableCell>
                      <TableCell>
                        {run.processed_at
                          ? new Date(run.processed_at).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {run.status === 'draft' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleProcess(run.id)}
                              disabled={processRun.isPending}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Process
                            </Button>
                          )}
                          {run.status === 'completed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/hr/payroll/payslips?run=${run.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Payslips
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <ProcessPayrollDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onProcess={handleCreateAndProcess}
          isProcessing={createRun.isPending || processRun.isPending}
          existingRuns={runs || []}
        />
      </div>
    </DashboardLayout>
  );
}
