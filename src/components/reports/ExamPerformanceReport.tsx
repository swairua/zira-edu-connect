import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { GraduationCap, TrendingUp, Award, BarChart3, CheckCircle } from 'lucide-react';
import { useExamPerformanceStats } from '@/hooks/useExamPerformanceStats';
import { useExams } from '@/hooks/useExams';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ExamPerformanceReportProps {
  institutionId: string | null;
  academicYearId?: string;
  classId?: string;
  examId?: string;
}

const GRADE_COLORS: Record<string, string> = {
  A: 'hsl(142, 76%, 36%)',
  B: 'hsl(200, 95%, 50%)',
  C: 'hsl(38, 92%, 50%)',
  D: 'hsl(30, 95%, 50%)',
  E: 'hsl(0, 84%, 60%)',
};

export function ExamPerformanceReport({ institutionId, academicYearId, classId, examId }: ExamPerformanceReportProps) {
  const { data: exams, isLoading: examsLoading } = useExams(institutionId, academicYearId);
  const { data: stats, isLoading: statsLoading } = useExamPerformanceStats(institutionId, examId, classId);

  const isLoading = examsLoading || statsLoading;

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

  const publishedExams = exams?.filter(e => e.status === 'published') || [];
  const totalExams = exams?.length || 0;

  const {
    subjectStats = [],
    classStats = [],
    gradeDistribution = [],
    overallAverage = 0,
    totalStudents = 0,
    topPerformers = 0,
    passRate = 0,
  } = stats || {};

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exams Conducted</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExams}</div>
            <p className="text-xs text-muted-foreground">{publishedExams.length} published</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallAverage}%</div>
            <p className="text-xs text-muted-foreground">{totalStudents} students assessed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{topPerformers}</div>
            <p className="text-xs text-muted-foreground">Students with A grade</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{passRate}%</div>
            <p className="text-xs text-muted-foreground">Students scoring 50%+</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Subject Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
            <CardDescription>Average scores by subject</CardDescription>
          </CardHeader>
          <CardContent>
            {subjectStats.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" domain={[0, 100]} className="text-xs" />
                    <YAxis dataKey="subjectCode" type="category" className="text-xs" width={50} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `${value}%`, 
                        name === 'average' ? 'Average' : name
                      ]}
                      labelFormatter={(label) => {
                        const subject = subjectStats.find(s => s.subjectCode === label);
                        return subject?.subjectName || label;
                      }}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="average" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Average" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No subject data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>Number of students per grade</CardDescription>
          </CardHeader>
          <CardContent>
            {gradeDistribution.length > 0 && gradeDistribution.some(g => g.count > 0) ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="grade" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      formatter={(value: number, name: string, props: any) => [
                        `${value} (${props.payload.percentage}%)`, 
                        'Students'
                      ]}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {gradeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={GRADE_COLORS[entry.grade] || 'hsl(var(--primary))'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No grade data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Class Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Class</CardTitle>
          <CardDescription>Average scores and rankings per class</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead className="text-right">Students</TableHead>
                <TableHead className="text-right">Average Score</TableHead>
                <TableHead className="text-right">Pass Rate</TableHead>
                <TableHead className="text-right">Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No exam data available
                  </TableCell>
                </TableRow>
              ) : (
                classStats.map((cls, index) => (
                  <TableRow key={cls.classId}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {index === 0 && <Award className="h-4 w-4 text-yellow-500" />}
                        {cls.className}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{cls.studentCount}</TableCell>
                    <TableCell className="text-right font-medium">{cls.average}%</TableCell>
                    <TableCell className="text-right">
                      <span className={cls.passRate >= 80 ? 'text-green-600' : cls.passRate >= 60 ? 'text-yellow-600' : 'text-destructive'}>
                        {cls.passRate}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant={
                          cls.average >= 70 ? 'default' : 
                          cls.average >= 50 ? 'secondary' : 
                          'destructive'
                        }
                      >
                        {cls.average >= 70 ? 'Excellent' : cls.average >= 50 ? 'Good' : 'Needs Improvement'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Subject Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Analysis</CardTitle>
          <CardDescription>Detailed performance metrics per subject</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead className="text-right">Average</TableHead>
                <TableHead className="text-right">Highest</TableHead>
                <TableHead className="text-right">Lowest</TableHead>
                <TableHead className="text-right">Pass Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjectStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No subject data available
                  </TableCell>
                </TableRow>
              ) : (
                subjectStats.map((subject) => (
                  <TableRow key={subject.subjectId}>
                    <TableCell className="font-medium">{subject.subjectName}</TableCell>
                    <TableCell className="text-right">{subject.average}%</TableCell>
                    <TableCell className="text-right text-green-600">{subject.highest}%</TableCell>
                    <TableCell className="text-right text-destructive">{subject.lowest}%</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">
                        {subject.passRate}%
                      </Badge>
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
