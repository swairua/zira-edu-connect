import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { useTeacherClasses } from '@/hooks/useStaffProfile';
import { useTeacherAttendance, AttendanceRecord } from '@/hooks/useTeacherAttendance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarIcon, Check, X, Clock, AlertCircle, Users, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export default function TeacherAttendance() {
  const { data: classes = [], isLoading: isLoadingClasses } = useTeacherClasses();
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<Map<string, AttendanceStatus>>(new Map());

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const { students, isLoadingStudents, existingAttendance, saveAttendance, isSaving, summary } = 
    useTeacherAttendance(selectedClassId, dateStr);

  // Get unique classes (remove duplicates from same class with different subjects)
  const uniqueClasses = classes.reduce((acc, curr) => {
    if (!acc.find(c => c.class_id === curr.class_id)) {
      acc.push(curr);
    }
    return acc;
  }, [] as typeof classes);

  // Initialize attendance from existing records
  useEffect(() => {
    if (existingAttendance.length > 0) {
      const records = new Map<string, AttendanceStatus>();
      existingAttendance.forEach(record => {
        records.set(record.student_id, record.status as AttendanceStatus);
      });
      setAttendanceRecords(records);
    } else if (students.length > 0) {
      // Default all to present if no existing records
      const records = new Map<string, AttendanceStatus>();
      students.forEach(student => {
        records.set(student.id, 'present');
      });
      setAttendanceRecords(records);
    }
  }, [existingAttendance, students]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceRecords(prev => {
      const updated = new Map(prev);
      updated.set(studentId, status);
      return updated;
    });
  };

  const handleSave = async () => {
    const records: AttendanceRecord[] = Array.from(attendanceRecords.entries()).map(([studentId, status]) => ({
      student_id: studentId,
      status,
    }));
    await saveAttendance(records);
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return <Check className="h-4 w-4" />;
      case 'absent':
        return <X className="h-4 w-4" />;
      case 'late':
        return <Clock className="h-4 w-4" />;
      case 'excused':
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'absent':
        return 'bg-red-500 hover:bg-red-600 text-white';
      case 'late':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      case 'excused':
        return 'bg-blue-500 hover:bg-blue-600 text-white';
    }
  };

  return (
    <PortalLayout title="Attendance" subtitle="Mark and manage student attendance">
      <div className="space-y-6">

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Select Class</label>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueClasses.map((tc) => (
                      <SelectItem key={tc.class_id} value={tc.class_id}>
                        {tc.class?.name} {tc.is_class_teacher && '(Class Teacher)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Select Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(selectedDate, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      disabled={(date) => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {!selectedClassId ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a class to mark attendance</p>
              </div>
            </CardContent>
          </Card>
        ) : isLoadingStudents ? (
          <Card>
            <CardContent className="py-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-40" />
                  <div className="flex gap-2 ml-auto">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : students.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No students found in this class</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary */}
            {summary && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{summary.total}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{summary.present}</p>
                      <p className="text-xs text-muted-foreground">Present</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{summary.absent}</p>
                      <p className="text-xs text-muted-foreground">Absent</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">{summary.late}</p>
                      <p className="text-xs text-muted-foreground">Late</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{summary.excused}</p>
                      <p className="text-xs text-muted-foreground">Excused</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Student List */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Student Attendance</CardTitle>
                    <CardDescription>
                      {students.length} students • {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </CardDescription>
                  </div>
                  <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Attendance'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 pb-20 sm:pb-0">
                  {students.map((student) => {
                    const currentStatus = attendanceRecords.get(student.id) || 'present';
                    return (
                      <div
                        key={student.id}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                      >
                        {/* Student info row */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
                            <AvatarImage src={student.photo_url || undefined} />
                            <AvatarFallback className="text-xs sm:text-sm">
                              {student.first_name[0]}{student.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-sm sm:text-base">
                              {student.first_name} {student.last_name}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground">{student.admission_number}</p>
                          </div>
                        </div>
                        
                        {/* Status buttons - full width on mobile */}
                        <div className="grid grid-cols-4 sm:flex gap-1.5 sm:gap-1 w-full sm:w-auto">
                          {(['present', 'absent', 'late', 'excused'] as const).map((status) => (
                            <Button
                              key={status}
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(student.id, status)}
                              className={cn(
                                'capitalize h-9 sm:h-8 px-2 sm:px-3',
                                currentStatus === status && getStatusColor(status)
                              )}
                            >
                              {getStatusIcon(status)}
                              <span className="ml-1 text-xs hidden sm:inline">{status}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile sticky save button */}
                <div className="fixed bottom-16 left-0 right-0 p-3 bg-background/95 backdrop-blur border-t sm:hidden z-10">
                  <Button className="w-full" onClick={handleSave} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Attendance'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PortalLayout>
  );
}
