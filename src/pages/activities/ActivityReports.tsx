import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';
import { useActivities } from '@/hooks/useActivities';
import { useActivityEnrollments } from '@/hooks/useActivityEnrollments';
import { useActivityAttendance } from '@/hooks/useActivityAttendance';
import { Skeleton } from '@/components/ui/skeleton';

export default function ActivityReports() {
  const { activities, isLoading: activitiesLoading } = useActivities();
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const { enrollments } = useActivityEnrollments(selectedActivity || undefined);
  const { attendance } = useActivityAttendance(selectedActivity || undefined);

  const activeEnrollments = enrollments.filter(e => e.status === 'active');

  // Calculate attendance stats per student
  const attendanceStats = activeEnrollments.map(enrollment => {
    const studentAttendance = attendance.filter(a => a.student_id === enrollment.student_id);
    const present = studentAttendance.filter(a => a.status === 'present').length;
    const absent = studentAttendance.filter(a => a.status === 'absent').length;
    const late = studentAttendance.filter(a => a.status === 'late').length;
    const total = studentAttendance.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    return {
      ...enrollment,
      present,
      absent,
      late,
      total,
      attendanceRate: rate,
    };
  });

  const handleExport = () => {
    const csv = [
      ['Student Name', 'Admission No.', 'Present', 'Absent', 'Late', 'Total Sessions', 'Attendance Rate'],
      ...attendanceStats.map(s => [
        `${s.student?.first_name} ${s.student?.last_name}`,
        s.student?.admission_number,
        s.present,
        s.absent,
        s.late,
        s.total,
        `${s.attendanceRate}%`,
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-report-${selectedActivity}.csv`;
    a.click();
  };

  if (activitiesLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <DashboardLayout title="Reports" subtitle="View participation and attendance reports">
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            View participation and attendance reports
          </p>
        </div>
        {selectedActivity && (
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <Select value={selectedActivity} onValueChange={setSelectedActivity}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select an activity" />
            </SelectTrigger>
            <SelectContent>
              {activities.map((activity) => (
                <SelectItem key={activity.id} value={activity.id}>
                  {activity.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedActivity ? (
        <>
          {/* Summary Cards */}
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeEnrollments.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {attendance.length > 0 
                    ? [...new Set(attendance.map(a => a.attendance_date))].length 
                    : 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {attendanceStats.length > 0
                    ? Math.round(attendanceStats.reduce((sum, s) => sum + s.attendanceRate, 0) / attendanceStats.length)
                    : 0}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Attendances</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {attendance.filter(a => a.status === 'present').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Report */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Participation Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Admission No.</TableHead>
                    <TableHead className="text-center">Present</TableHead>
                    <TableHead className="text-center">Absent</TableHead>
                    <TableHead className="text-center">Late</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceStats.map((stat) => (
                    <TableRow key={stat.id}>
                      <TableCell className="font-medium">
                        {stat.student?.first_name} {stat.student?.last_name}
                      </TableCell>
                      <TableCell>{stat.student?.admission_number}</TableCell>
                      <TableCell className="text-center text-green-600">{stat.present}</TableCell>
                      <TableCell className="text-center text-red-600">{stat.absent}</TableCell>
                      <TableCell className="text-center text-orange-600">{stat.late}</TableCell>
                      <TableCell className="text-center">{stat.total}</TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={stat.attendanceRate >= 80 ? 'default' : stat.attendanceRate >= 50 ? 'secondary' : 'destructive'}
                        >
                          {stat.attendanceRate}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {attendanceStats.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Select an activity to view reports
          </CardContent>
        </Card>
      )}
      </div>
    </DashboardLayout>
  );
}
