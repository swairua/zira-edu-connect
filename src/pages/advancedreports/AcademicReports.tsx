import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { GraduationCap, TrendingUp, Users, Award, Save } from 'lucide-react';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { useClasses } from '@/hooks/useClasses';
import { useStudents } from '@/hooks/useStudents';
import { EnrollmentReport } from '@/components/reports/EnrollmentReport';
import { ExamPerformanceReport } from '@/components/reports/ExamPerformanceReport';
import { AttendanceReport } from '@/components/reports/AttendanceReport';
import { SaveReportDialog } from '@/components/reports/SaveReportDialog';
import { ReportExportButton } from '@/components/reports/ReportExportButton';
import { formatStudentData } from '@/lib/report-export';

export default function AcademicReports() {
  const { institution } = useInstitution();
  const institutionId = institution?.id || null;
  
  const [academicYearId, setAcademicYearId] = useState<string>('');
  const [classId, setClassId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('enrollment');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  
  const { data: academicYears = [] } = useAcademicYears(institutionId);
  const { data: classes = [] } = useClasses(institutionId);
  const { data: students = [] } = useStudents(institutionId, { classId: classId !== 'all' ? classId : undefined });

  // Calculate stats
  const totalStudents = students?.length || 0;
  const activeStudents = students?.filter(s => s.status === 'active').length || 0;
  const maleStudents = students?.filter(s => s.gender === 'male').length || 0;
  const femaleStudents = students?.filter(s => s.gender === 'female').length || 0;

  // Prepare export data based on active tab
  const getExportData = () => {
    if (activeTab === 'enrollment') {
      return formatStudentData(students);
    }
    return students.map(s => ({
      'Name': `${s.first_name} ${s.last_name}`,
      'Admission No': s.admission_number || '-',
      'Class': s.class?.name || '-',
      'Gender': s.gender || '-',
      'Status': s.status,
    }));
  };

  return (
    <DashboardLayout title="Academic Reports">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Academic Reports</h1>
            <p className="text-muted-foreground">
              Performance analytics and academic trends
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setSaveDialogOpen(true)}>
              <Save className="mr-2 h-4 w-4" />
              Save Report
            </Button>
            <ReportExportButton
              data={getExportData()}
              filename={`academic-${activeTab}-report`}
              title={`Academic ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report`}
              reportType="academic"
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

        {/* Stats Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground">{activeStudents} active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gender Ratio</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{maleStudents}:{femaleStudents}</div>
              <p className="text-xs text-muted-foreground">Male : Female</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Classes</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classes.length}</div>
              <p className="text-xs text-muted-foreground">Active classes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Per Class</CardTitle>
              <Award className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {classes.length > 0 ? Math.round(totalStudents / classes.length) : 0}
              </div>
              <p className="text-xs text-muted-foreground">Students</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Reports */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="enrollment" className="mt-6">
            <EnrollmentReport
              institutionId={institutionId}
              academicYearId={academicYearId !== 'all' ? academicYearId : undefined}
              classId={classId !== 'all' ? classId : undefined}
            />
          </TabsContent>
          
          <TabsContent value="performance" className="mt-6">
            <ExamPerformanceReport
              institutionId={institutionId}
              academicYearId={academicYearId !== 'all' ? academicYearId : undefined}
              classId={classId !== 'all' ? classId : undefined}
            />
          </TabsContent>
          
          <TabsContent value="attendance" className="mt-6">
            <AttendanceReport
              institutionId={institutionId}
              academicYearId={academicYearId !== 'all' ? academicYearId : undefined}
              classId={classId !== 'all' ? classId : undefined}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Save Report Dialog */}
      <SaveReportDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        reportType="academic"
        config={{ academicYearId, classId, activeTab }}
      />
    </DashboardLayout>
  );
}
