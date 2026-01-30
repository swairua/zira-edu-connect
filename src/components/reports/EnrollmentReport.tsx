import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useStudents } from '@/hooks/useStudents';
import { useClasses } from '@/hooks/useClasses';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, UserCheck, UserX, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface EnrollmentReportProps {
  institutionId: string | null;
  academicYearId?: string;
  classId?: string;
}

export function EnrollmentReport({ institutionId, academicYearId, classId }: EnrollmentReportProps) {
  const { data: students = [], isLoading: studentsLoading } = useStudents(institutionId, { classId });
  const { data: classes = [], isLoading: classesLoading } = useClasses(institutionId);

  const isLoading = studentsLoading || classesLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  // Calculate statistics
  const totalStudents = students?.length || 0;
  const activeStudents = students?.filter(s => s.status === 'active').length || 0;
  const inactiveStudents = students?.filter(s => s.status !== 'active').length || 0;
  const maleStudents = students?.filter(s => s.gender === 'male').length || 0;
  const femaleStudents = students?.filter(s => s.gender === 'female').length || 0;

  // Gender distribution data
  const genderData = [
    { name: 'Male', value: maleStudents, color: 'hsl(var(--primary))' },
    { name: 'Female', value: femaleStudents, color: 'hsl(var(--secondary))' },
  ];

  // Class distribution data
  const classDistribution = classes?.map(cls => {
    const count = students?.filter(s => s.class_id === cls.id).length || 0;
    return {
      name: cls.name,
      students: count,
    };
  }) || [];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrolled</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeStudents}</div>
            <p className="text-xs text-muted-foreground">
              {totalStudents > 0 ? `${((activeStudents / totalStudents) * 100).toFixed(1)}%` : '0%'} of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <UserX className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{inactiveStudents}</div>
            <p className="text-xs text-muted-foreground">
              {totalStudents > 0 ? `${((inactiveStudents / totalStudents) * 100).toFixed(1)}%` : '0%'} of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gender Ratio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maleStudents}:{femaleStudents}</div>
            <p className="text-xs text-muted-foreground">Male : Female</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
            <CardDescription>Breakdown of students by gender</CardDescription>
          </CardHeader>
          <CardContent>
            {totalStudents > 0 ? (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Class Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Students by Class</CardTitle>
            <CardDescription>Distribution across classes</CardDescription>
          </CardHeader>
          <CardContent>
            {classDistribution.length > 0 ? (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classDistribution}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="students" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                No classes configured
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Enrollment by Class</CardTitle>
          <CardDescription>Detailed breakdown of enrollment per class</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Male</TableHead>
                <TableHead className="text-right">Female</TableHead>
                <TableHead className="text-right">Active</TableHead>
                <TableHead className="text-right">Inactive</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No classes found
                  </TableCell>
                </TableRow>
              ) : (
                classes?.map((cls) => {
                  const classStudents = students?.filter(s => s.class_id === cls.id) || [];
                  const classMale = classStudents.filter(s => s.gender === 'male').length;
                  const classFemale = classStudents.filter(s => s.gender === 'female').length;
                  const classActive = classStudents.filter(s => s.status === 'active').length;
                  const classInactive = classStudents.filter(s => s.status !== 'active').length;
                  
                  return (
                    <TableRow key={cls.id}>
                      <TableCell className="font-medium">{cls.name}</TableCell>
                      <TableCell className="text-right">{classStudents.length}</TableCell>
                      <TableCell className="text-right">{classMale}</TableCell>
                      <TableCell className="text-right">{classFemale}</TableCell>
                      <TableCell className="text-right text-green-600">{classActive}</TableCell>
                      <TableCell className="text-right text-destructive">{classInactive}</TableCell>
                    </TableRow>
                  );
                })
              )}
              {/* Total Row */}
              {classes && classes.length > 0 && (
                <TableRow className="font-bold bg-muted/50">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">{totalStudents}</TableCell>
                  <TableCell className="text-right">{maleStudents}</TableCell>
                  <TableCell className="text-right">{femaleStudents}</TableCell>
                  <TableCell className="text-right text-green-600">{activeStudents}</TableCell>
                  <TableCell className="text-right text-destructive">{inactiveStudents}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
