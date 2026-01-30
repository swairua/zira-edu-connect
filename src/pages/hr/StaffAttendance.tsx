import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, UserCheck, UserX, TrendingUp, CalendarIcon, Users } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useHRStaffAttendance } from '@/hooks/useHRStaffAttendance';
import { useStaff } from '@/hooks/useStaff';
import { useAuth } from '@/hooks/useAuth';
import { AttendanceTable } from '@/components/hr/AttendanceTable';
import { MarkAttendanceDialog } from '@/components/hr/MarkAttendanceDialog';
import { BulkAttendanceDialog } from '@/components/hr/BulkAttendanceDialog';

export default function StaffAttendance() {
  const [date, setDate] = useState<Date>(new Date());
  const [markDialogOpen, setMarkDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  
  const { userRoles } = useAuth();
  const institutionId = userRoles.find(r => r.institution_id)?.institution_id || null;
  const { data: staff = [] } = useStaff(institutionId);
  const { attendanceRecords, attendanceStats = { present: 0, absent: 0, late: 0, onLeave: 0 }, isLoading, markAttendance } = useHRStaffAttendance(date);

  // Merge staff with attendance records
  const mergedRecords = staff
    .filter(s => s.is_active)
    .map(s => {
      const record = attendanceRecords.find(r => r.staff_id === s.id);
      return {
        staff_id: s.id,
        staff: { id: s.id, first_name: s.first_name, last_name: s.last_name, department: s.department },
        status: record?.status || 'absent',
        check_in: record?.check_in,
        check_out: record?.check_out,
        notes: record?.notes,
        id: record?.id,
      };
    });

  const handleUpdateStatus = async (staffId: string, status: string) => {
    await markAttendance.mutateAsync({
      staff_id: staffId,
      status,
    });
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setMarkDialogOpen(true);
  };

  const activeStaff = staff.filter(s => s.is_active).length;
  const attendanceRate = activeStaff > 0 
    ? Math.round((attendanceStats.present / activeStaff) * 100) 
    : 0;

  return (
    <DashboardLayout title="Staff Attendance">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Staff Attendance</h1>
            <p className="text-muted-foreground">
              Track staff clock-in/out times and attendance
            </p>
          </div>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full sm:w-[200px] justify-start text-left font-normal")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" onClick={() => setBulkDialogOpen(true)}>
              <Users className="mr-2 h-4 w-4" />
              Bulk Mark
            </Button>
            <Button onClick={() => { setEditingRecord(null); setMarkDialogOpen(true); }}>
              Mark Attendance
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{attendanceStats.present}</div>
              )}
              <p className="text-xs text-muted-foreground">of {activeStaff} staff</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absent</CardTitle>
              <UserX className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{attendanceStats.absent}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{attendanceStats.late}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{attendanceRate}%</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Attendance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance for {format(date, 'EEEE, MMMM dd, yyyy')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <AttendanceTable
                records={mergedRecords}
                onUpdateStatus={handleUpdateStatus}
                onEdit={handleEdit}
                isUpdating={markAttendance.isPending}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <MarkAttendanceDialog open={markDialogOpen} onOpenChange={setMarkDialogOpen} date={date} />
      <BulkAttendanceDialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen} date={date} />
    </DashboardLayout>
  );
}
