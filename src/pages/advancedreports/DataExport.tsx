import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, FileSpreadsheet, FileText, Database, Loader2, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useStudents } from '@/hooks/useStudents';
import { useStaff } from '@/hooks/useStaff';
import { useStudentPayments } from '@/hooks/useStudentPayments';
import { useAttendance } from '@/hooks/useAttendance';
import { useExams } from '@/hooks/useExams';
import { useSavedReports } from '@/hooks/useSavedReports';
import { useAuth } from '@/hooks/useAuth';
import { 
  exportToCSV, 
  exportToPDF, 
  formatStudentData, 
  formatStaffData, 
  formatPaymentData, 
  formatAttendanceData,
} from '@/lib/report-export';
import { toast } from 'sonner';
import { format } from 'date-fns';

type DataType = 'students' | 'staff' | 'fees' | 'attendance';
type ExportFormat = 'csv' | 'pdf';

export default function DataExport() {
  const { userRoles } = useAuth();
  const institutionId = userRoles.find(r => r.institution_id)?.institution_id || null;
  
  const [dataType, setDataType] = useState<DataType | ''>('');
  const [exportFormat, setExportFormat] = useState<ExportFormat | ''>('');
  const [isExporting, setIsExporting] = useState(false);

  const studentsQuery = useStudents(institutionId);
  const staffQuery = useStaff(institutionId);
  const paymentsQuery = useStudentPayments(institutionId);
  const attendanceQuery = useAttendance(institutionId);
  const { recentExports, createExport } = useSavedReports();

  const students = studentsQuery.data || [];
  const staff = staffQuery.data || [];
  const payments = paymentsQuery.data || [];
  const attendance = attendanceQuery.data || [];
  const isLoading = studentsQuery.isLoading || staffQuery.isLoading || paymentsQuery.isLoading || attendanceQuery.isLoading;

  const getExportData = (): { data: Record<string, unknown>[]; title: string } => {
    switch (dataType) {
      case 'students':
        return { data: formatStudentData(students), title: 'Students Report' };
      case 'staff':
        return { data: formatStaffData(staff), title: 'Staff Report' };
      case 'fees':
        return { data: formatPaymentData(payments || []), title: 'Fee Payments Report' };
      case 'attendance':
        return { data: formatAttendanceData(attendance || []), title: 'Attendance Report' };
      default:
        return { data: [], title: '' };
    }
  };

  const getRecordCount = (): number => {
    switch (dataType) {
      case 'students': return students.length;
      case 'staff': return staff.length;
      case 'fees': return payments?.length || 0;
      case 'attendance': return attendance?.length || 0;
      default: return 0;
    }
  };

  const handleExport = async () => {
    if (!dataType || !exportFormat) {
      toast.error('Please select data type and format');
      return;
    }

    const { data, title } = getExportData();
    
    if (data.length === 0) {
      toast.error('No data available to export');
      return;
    }

    setIsExporting(true);
    try {
      const filename = `${dataType}-export-${format(new Date(), 'yyyy-MM-dd')}`;
      
      if (exportFormat === 'csv') {
        exportToCSV(data, filename);
      } else {
        exportToPDF(title, data);
      }

      // Track the export
      await createExport.mutateAsync({
        report_type: dataType,
        format: exportFormat,
        file_name: `${filename}.${exportFormat}`,
      });

      toast.success(`${title} exported successfully`);
    } catch (error) {
      toast.error('Export failed');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const dataTypeLabels: Record<DataType, string> = {
    students: 'Students',
    staff: 'Staff',
    fees: 'Fee Payments',
    attendance: 'Attendance',
  };

  return (
    <DashboardLayout title="Data Export">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Export</h1>
          <p className="text-muted-foreground">
            Export your data to CSV or PDF formats
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>
                Select the data type and format to export
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Data Type</Label>
                <Select value={dataType} onValueChange={(v) => setDataType(v as DataType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select data to export" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="students">Students</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="fees">Fee Payments</SelectItem>
                    <SelectItem value="results">Exam Results</SelectItem>
                    <SelectItem value="attendance">Attendance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dataType && (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  {isLoading ? 'Loading...' : `${getRecordCount()} records available`}
                </div>
              )}

              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as ExportFormat)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select export format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (.csv)</SelectItem>
                    <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full" 
                onClick={handleExport}
                disabled={!dataType || !exportFormat || isExporting || isLoading}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Export Types Info */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileSpreadsheet className="h-5 w-5 text-green-600" />
                  CSV Export
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Raw data format, compatible with Excel, Google Sheets, and all spreadsheet applications
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-5 w-5 text-red-600" />
                  PDF Export
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Formatted report with headers, ready for printing and sharing
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Exports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Exports</CardTitle>
            <CardDescription>
              Your export history from the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentExports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No exports yet. Create your first export above.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentExports.map((exp) => (
                    <TableRow key={exp.id}>
                      <TableCell className="font-medium">{exp.file_name || 'Unknown'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {dataTypeLabels[exp.report_type as DataType] || exp.report_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="uppercase">
                          {exp.format}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {exp.status === 'completed' ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            Completed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-yellow-600">
                            <Clock className="h-4 w-4" />
                            {exp.status}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(exp.created_at), 'MMM d, yyyy h:mm a')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
