import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
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
import { PermissionGate } from '@/components/auth/PermissionGate';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useClasses } from '@/hooks/useClasses';
import { useStudents } from '@/hooks/useStudents';
import { useAttendance, useMarkAttendance, AttendanceStatus } from '@/hooks/useAttendance';
import { Calendar, CheckCircle, XCircle, Clock, Users, Save } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function Attendance() {
  const { institutionId, institution } = useInstitution();
  const { data: classes = [] } = useClasses(institutionId);
  
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [attendanceState, setAttendanceState] = useState<Record<string, AttendanceStatus>>({});

  const { data: students = [], isLoading: studentsLoading } = useStudents(institutionId, {
    classId: selectedClassId || undefined,
    status: 'active',
  });

  const { data: existingAttendance = [], isLoading: attendanceLoading } = useAttendance(
    institutionId,
    selectedClassId || undefined,
    selectedDate
  );

  const markAttendance = useMarkAttendance();

  // Initialize attendance state from existing data
  useEffect(() => {
    if (students.length === 0) return;
    
    const initialState: Record<string, AttendanceStatus> = {};
    students.forEach((student) => {
      const existing = existingAttendance.find((a) => a.student_id === student.id);
      initialState[student.id] = (existing?.status as AttendanceStatus) || 'present';
    });
    setAttendanceState(initialState);
  }, [students, existingAttendance]);

  const toggleStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceState((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAllPresent = () => {
    const newState: Record<string, AttendanceStatus> = {};
    students.forEach((student) => {
      newState[student.id] = 'present';
    });
    setAttendanceState(newState);
  };

  const handleSave = async () => {
    if (!institutionId || !selectedClassId) return;

    const records = Object.entries(attendanceState).map(([studentId, status]) => ({
      student_id: studentId,
      status,
    }));

    try {
      await markAttendance.mutateAsync({
        institutionId,
        classId: selectedClassId,
        date: selectedDate,
        records,
      });
    } catch (error) {
      // Error handled in hook
    }
  };

  // Stats
  const presentCount = Object.values(attendanceState).filter((s) => s === 'present').length;
  const absentCount = Object.values(attendanceState).filter((s) => s === 'absent').length;
  const lateCount = Object.values(attendanceState).filter((s) => s === 'late').length;

  const isLoading = studentsLoading || attendanceLoading;

  return (
    <DashboardLayout title="Attendance" subtitle="Track student attendance">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
            <p className="text-muted-foreground">
              Record daily attendance for {institution?.name || 'your institution'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Class</label>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
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

        {/* Stats */}
        {selectedClassId && (
          <div className="grid gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-xl font-bold">{students.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Present</p>
                    <p className="text-xl font-bold">{presentCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                    <XCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Absent</p>
                    <p className="text-xl font-bold">{absentCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Late</p>
                    <p className="text-xl font-bold">{lateCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Attendance Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Attendance Sheet</CardTitle>
                <CardDescription>
                  {selectedClassId
                    ? `${students.length} students in class`
                    : 'Select a class to view students'}
                </CardDescription>
              </div>
              {selectedClassId && students.length > 0 && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={markAllPresent}>
                    Mark All Present
                  </Button>
                  <PermissionGate domain="academics" action="edit">
                    <Button onClick={handleSave} disabled={markAttendance.isPending}>
                      <Save className="mr-2 h-4 w-4" />
                      {markAttendance.isPending ? 'Saving...' : 'Save Attendance'}
                    </Button>
                  </PermissionGate>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedClassId ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">Select a class</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Choose a class to record attendance
                </p>
              </div>
            ) : isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : students.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No students</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  No students found in this class
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Admission No.</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead className="text-center">Present</TableHead>
                    <TableHead className="text-center">Absent</TableHead>
                    <TableHead className="text-center">Late</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{student.admission_number}</TableCell>
                      <TableCell>
                        {student.first_name} {student.middle_name} {student.last_name}
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={attendanceState[student.id] === 'present'}
                          onCheckedChange={() => toggleStatus(student.id, 'present')}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={attendanceState[student.id] === 'absent'}
                          onCheckedChange={() => toggleStatus(student.id, 'absent')}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={attendanceState[student.id] === 'late'}
                          onCheckedChange={() => toggleStatus(student.id, 'late')}
                        />
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
