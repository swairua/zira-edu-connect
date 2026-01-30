import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, TrendingDown, DollarSign, Save, FileDown } from 'lucide-react';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useFinanceDashboard } from '@/hooks/useFinanceDashboard';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { useClasses } from '@/hooks/useClasses';
import { FeeCollectionReport } from '@/components/reports/FeeCollectionReport';
import { SaveReportDialog } from '@/components/reports/SaveReportDialog';
import { ReportExportButton } from '@/components/reports/ReportExportButton';
import { useStudentPayments } from '@/hooks/useStudentPayments';

export default function FinancialReports() {
  const { institution } = useInstitution();
  const institutionId = institution?.id || null;
  
  const [academicYearId, setAcademicYearId] = useState<string>('');
  const [classId, setClassId] = useState<string>('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  
  const { stats, isLoadingStats } = useFinanceDashboard(institutionId);
  const { data: academicYears = [] } = useAcademicYears(institutionId);
  const { data: classes = [] } = useClasses(institutionId);
  const { data: payments = [] } = useStudentPayments(institutionId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Prepare export data
  const exportData = payments.map(p => ({
    'Receipt No': p.receipt_number || '-',
    'Student': p.student?.first_name && p.student?.last_name 
      ? `${p.student.first_name} ${p.student.last_name}` 
      : '-',
    'Amount': p.amount,
    'Method': p.payment_method || '-',
    'Date': p.payment_date,
    'Status': p.status,
  }));

  return (
    <DashboardLayout title="Financial Reports">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
            <p className="text-muted-foreground">
              Comprehensive financial analytics and reports
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setSaveDialogOpen(true)}>
              <Save className="mr-2 h-4 w-4" />
              Save Report
            </Button>
            <ReportExportButton
              data={exportData}
              filename="financial-report"
              title="Financial Report"
              reportType="financial"
            />
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <Select value={academicYearId} onValueChange={setAcademicYearId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Academic Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Academic Years</SelectItem>
                  {academicYears.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Classes" />
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
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Collections</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? '--' : formatCurrency(stats?.todayCollections || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.yesterdayCollections && stats.yesterdayCollections > 0 && (
                  <>Yesterday: {formatCurrency(stats.yesterdayCollections)}</>
                )}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {isLoadingStats ? '--%' : `${(stats?.collectionRate || 0).toFixed(1)}%`}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {isLoadingStats ? '--' : formatCurrency(stats?.overdueAmount || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.overdueCount || 0} overdue invoices
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Adjustments</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? '--' : stats?.pendingAdjustments || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fee Collection Report Component */}
        <FeeCollectionReport
          institutionId={institutionId}
          academicYearId={academicYearId !== 'all' ? academicYearId : undefined}
          classId={classId !== 'all' ? classId : undefined}
        />
      </div>

      {/* Save Report Dialog */}
      <SaveReportDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        reportType="financial"
        config={{ academicYearId, classId }}
      />
    </DashboardLayout>
  );
}
