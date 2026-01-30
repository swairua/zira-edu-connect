import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useClasses } from '@/hooks/useClasses';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { 
  FileText, 
  Download, 
  Users, 
  DollarSign, 
  Calendar, 
  GraduationCap,
  TrendingUp,
  PieChart,
  BarChart3,
  Printer
} from 'lucide-react';
import { EnrollmentReport } from '@/components/reports/EnrollmentReport';
import { FeeCollectionReport } from '@/components/reports/FeeCollectionReport';
import { AttendanceReport } from '@/components/reports/AttendanceReport';
import { ExamPerformanceReport } from '@/components/reports/ExamPerformanceReport';

export default function Reports() {
  const { institution } = useInstitution();
  const institutionId = institution?.id || null;
  const { data: classes = [] } = useClasses(institutionId);
  const { data: academicYears = [] } = useAcademicYears(institutionId);
  
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  const currentYear = academicYears?.find(y => y.is_current);

  // Set default year when data loads
  if (!selectedYear && currentYear) {
    setSelectedYear(currentYear.id);
  }

  const reportTypes = [
    {
      id: 'enrollment',
      label: 'Enrollment',
      icon: Users,
      description: 'Student enrollment statistics by class, gender, and status',
    },
    {
      id: 'fees',
      label: 'Fee Collection',
      icon: DollarSign,
      description: 'Fee collection summary, outstanding balances, and payment trends',
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: Calendar,
      description: 'Attendance rates by class, daily/weekly/monthly summaries',
    },
    {
      id: 'exams',
      label: 'Exam Performance',
      icon: GraduationCap,
      description: 'Exam results, class averages, and subject performance',
    },
  ];

  return (
    <DashboardLayout title="Reports">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">
              Generate and export institutional reports
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Coverage</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98%</div>
              <p className="text-xs text-muted-foreground">Complete records</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Generated</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Today</div>
              <p className="text-xs text-muted-foreground">Fee Collection Report</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trend</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+12%</div>
              <p className="text-xs text-muted-foreground">Report usage growth</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
            <CardDescription>Select academic year and class to filter reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Academic Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears?.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.name} {year.is_current && '(Current)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes?.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Tabs */}
        <Tabs defaultValue="enrollment" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            {reportTypes.map((report) => (
              <TabsTrigger key={report.id} value={report.id} className="gap-2">
                <report.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{report.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="enrollment">
            <EnrollmentReport 
              institutionId={institutionId} 
              academicYearId={selectedYear}
              classId={selectedClass !== 'all' ? selectedClass : undefined}
            />
          </TabsContent>

          <TabsContent value="fees">
            <FeeCollectionReport 
              institutionId={institutionId}
              academicYearId={selectedYear}
              classId={selectedClass !== 'all' ? selectedClass : undefined}
            />
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceReport 
              institutionId={institutionId}
              academicYearId={selectedYear}
              classId={selectedClass !== 'all' ? selectedClass : undefined}
            />
          </TabsContent>

          <TabsContent value="exams">
            <ExamPerformanceReport 
              institutionId={institutionId}
              academicYearId={selectedYear}
              classId={selectedClass !== 'all' ? selectedClass : undefined}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
