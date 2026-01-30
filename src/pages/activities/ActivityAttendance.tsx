import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Calendar, Save } from 'lucide-react';
import { useActivityAttendance } from '@/hooks/useActivityAttendance';
import { useActivityEnrollments } from '@/hooks/useActivityEnrollments';
import { useActivities } from '@/hooks/useActivities';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const statusColors: Record<string, string> = {
  present: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  absent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  excused: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  late: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

export default function ActivityAttendance() {
  const { activities, isLoading: activitiesLoading } = useActivities();
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});

  const { enrollments } = useActivityEnrollments(selectedActivity || undefined);
  const { attendance, bulkMarkAttendance, isLoading } = useActivityAttendance(
    selectedActivity || undefined,
    selectedDate
  );

  const activeEnrollments = enrollments.filter(e => e.status === 'active');

  // Initialize attendance data from existing records
  const getStudentStatus = (studentId: string) => {
    if (attendanceData[studentId]) return attendanceData[studentId];
    const record = attendance.find(a => a.student_id === studentId);
    return record?.status || '';
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    if (!selectedActivity || !selectedDate) return;

    const records = Object.entries(attendanceData)
      .filter(([_, status]) => status)
      .map(([studentId, status]) => ({
        activity_id: selectedActivity,
        student_id: studentId,
        attendance_date: selectedDate,
        status,
      }));

    if (records.length > 0) {
      await bulkMarkAttendance.mutateAsync(records);
      setAttendanceData({});
    }
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
    <DashboardLayout title="Attendance" subtitle="Mark attendance for activity sessions">
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">
            Mark attendance for activity sessions
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Activity & Date</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] space-y-2">
              <Label>Activity</Label>
              <Select value={selectedActivity} onValueChange={setSelectedActivity}>
                <SelectTrigger>
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
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedActivity && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Attendance for {format(new Date(selectedDate), 'MMMM d, yyyy')}
            </CardTitle>
            <Button onClick={handleSave} disabled={bulkMarkAttendance.isPending}>
              <Save className="mr-2 h-4 w-4" />
              Save Attendance
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Admission No.</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeEnrollments.map((enrollment) => {
                    const currentStatus = getStudentStatus(enrollment.student_id);
                    return (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-medium">
                          {enrollment.student?.first_name} {enrollment.student?.last_name}
                        </TableCell>
                        <TableCell>{enrollment.student?.admission_number}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {['present', 'absent', 'late', 'excused'].map((status) => (
                              <Badge
                                key={status}
                                variant={currentStatus === status ? 'default' : 'outline'}
                                className={`cursor-pointer capitalize ${
                                  currentStatus === status ? statusColors[status] : ''
                                }`}
                                onClick={() => handleStatusChange(enrollment.student_id, status)}
                              >
                                {status}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {activeEnrollments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        No enrolled students in this activity
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
      </div>
    </DashboardLayout>
  );
}
