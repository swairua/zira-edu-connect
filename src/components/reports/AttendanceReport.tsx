import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Calendar, UserCheck, UserX, Clock } from 'lucide-react';
import { useAttendance } from '@/hooks/useAttendance';
import { useClasses } from '@/hooks/useClasses';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

interface AttendanceReportProps {
  institutionId: string | null;
  academicYearId?: string;
  classId?: string;
}

export function AttendanceReport({ institutionId, academicYearId, classId }: AttendanceReportProps) {
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  
  const { data: records, isLoading: attendanceLoading } = useAttendance(
    institutionId, 
    classId || '', 
    format(subDays(today, 30), 'yyyy-MM-dd')
  );
  const { data: classes, isLoading: classesLoading } = useClasses(institutionId);

  const isLoading = attendanceLoading || classesLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  // Calculate statistics
  const totalRecords = records?.length || 0;
  const presentCount = records?.filter(r => r.status === 'present').length || 0;
  const absentCount = records?.filter(r => r.status === 'absent').length || 0;
  const lateCount = records?.filter(r => r.status === 'late').length || 0;
  const attendanceRate = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;

  // Status distribution for pie chart
  const statusData = [
    { name: 'Present', value: presentCount, color: 'hsl(142, 76%, 36%)' },
    { name: 'Absent', value: absentCount, color: 'hsl(0, 84%, 60%)' },
    { name: 'Late', value: lateCount, color: 'hsl(38, 92%, 50%)' },
  ].filter(d => d.value > 0);

  // Daily attendance trend (last 14 days)
  const dailyData = [];
  for (let i = 13; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayRecords = records?.filter(r => r.date === dateStr) || [];
    const dayPresent = dayRecords.filter(r => r.status === 'present').length;
    const dayTotal = dayRecords.length;
    
    dailyData.push({
      date: format(date, 'MMM d'),
      rate: dayTotal > 0 ? (dayPresent / dayTotal) * 100 : 0,
      present: dayPresent,
      total: dayTotal,
    });
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceRate.toFixed(1)}%</div>
            <Progress value={attendanceRate} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentCount}</div>
            <p className="text-xs text-muted-foreground">
              {totalRecords > 0 ? `${((presentCount / totalRecords) * 100).toFixed(1)}%` : '0%'} of records
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <UserX className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{absentCount}</div>
            <p className="text-xs text-muted-foreground">
              {totalRecords > 0 ? `${((absentCount / totalRecords) * 100).toFixed(1)}%` : '0%'} of records
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{lateCount}</div>
            <p className="text-xs text-muted-foreground">
              {totalRecords > 0 ? `${((lateCount / totalRecords) * 100).toFixed(1)}%` : '0%'} of records
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Attendance Trend</CardTitle>
            <CardDescription>Attendance rate over the last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis domain={[0, 100]} className="text-xs" tickFormatter={(v) => `${v}%`} />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Attendance Rate']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary) / 0.2)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Breakdown by attendance status</CardDescription>
          </CardHeader>
          <CardContent>
            {totalRecords > 0 ? (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                No attendance data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Attendance by Class */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance by Class</CardTitle>
          <CardDescription>Class-wise attendance summary (last 30 days)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead className="text-right">Total Records</TableHead>
                <TableHead className="text-right">Present</TableHead>
                <TableHead className="text-right">Absent</TableHead>
                <TableHead className="text-right">Late</TableHead>
                <TableHead className="text-right">Rate</TableHead>
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
                  const classRecords = records?.filter(r => r.class_id === cls.id) || [];
                  const classPresent = classRecords.filter(r => r.status === 'present').length;
                  const classAbsent = classRecords.filter(r => r.status === 'absent').length;
                  const classLate = classRecords.filter(r => r.status === 'late').length;
                  const classRate = classRecords.length > 0 ? (classPresent / classRecords.length) * 100 : 0;
                  
                  return (
                    <TableRow key={cls.id}>
                      <TableCell className="font-medium">{cls.name}</TableCell>
                      <TableCell className="text-right">{classRecords.length}</TableCell>
                      <TableCell className="text-right text-green-600">{classPresent}</TableCell>
                      <TableCell className="text-right text-destructive">{classAbsent}</TableCell>
                      <TableCell className="text-right text-orange-500">{classLate}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={classRate >= 90 ? 'default' : classRate >= 75 ? 'secondary' : 'destructive'}>
                          {classRate.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
