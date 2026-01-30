import { StudentLayout } from '@/components/student/StudentLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useStudent } from '@/contexts/StudentContext';
import { useStudentAttendance } from '@/hooks/useStudentData';
import { useStudentAuth } from '@/contexts/StudentAuthContext';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { User, GraduationCap, Calendar, LogOut, CheckCircle2, XCircle, Key } from 'lucide-react';
import { ChangePasswordDialog } from '@/components/settings/ChangePasswordDialog';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export default function StudentProfilePage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { logout: studentLogout, isAuthenticated: isOtpAuthenticated } = useStudentAuth();
  const { studentProfile } = useStudent();
  
  const startDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(new Date()), 'yyyy-MM-dd');
  const { data: attendance = [] } = useStudentAttendance(startDate, endDate);

  const presentDays = attendance.filter(a => a.status === 'present').length;
  const absentDays = attendance.filter(a => a.status === 'absent').length;
  const lateDays = attendance.filter(a => a.status === 'late').length;
  const totalDays = attendance.length;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  const handleLogout = async () => {
    if (isOtpAuthenticated) {
      studentLogout();
    } else {
      await signOut();
    }
    navigate('/auth');
  };

  const getInitials = () => {
    if (!studentProfile) return 'S';
    return `${studentProfile.first_name[0]}${studentProfile.last_name[0]}`.toUpperCase();
  };

  return (
    <StudentLayout title="Profile">
      <div className="p-4 space-y-4">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={studentProfile?.photo_url || undefined} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-xl font-bold">
                {studentProfile?.first_name} {studentProfile?.middle_name || ''} {studentProfile?.last_name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {studentProfile?.admission_number}
              </p>
              <Badge variant="secondary" className="mt-2">
                <GraduationCap className="h-3 w-3 mr-1" />
                {studentProfile?.class_name || 'No class assigned'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Full Name</span>
              <span className="text-sm font-medium">
                {studentProfile?.first_name} {studentProfile?.middle_name || ''} {studentProfile?.last_name}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Admission Number</span>
              <span className="text-sm font-medium">{studentProfile?.admission_number}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Class</span>
              <span className="text-sm font-medium">{studentProfile?.class_name || '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Date of Birth</span>
              <span className="text-sm font-medium">
                {studentProfile?.date_of_birth 
                  ? format(new Date(studentProfile.date_of_birth), 'dd MMMM yyyy')
                  : '-'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Gender</span>
              <span className="text-sm font-medium capitalize">{studentProfile?.gender || '-'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={studentProfile?.status === 'active' ? 'default' : 'secondary'}>
                {studentProfile?.status || 'active'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              This Month's Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-3">
                <CheckCircle2 className="h-5 w-5 mx-auto text-green-600 dark:text-green-400" />
                <p className="text-xl font-bold mt-1 text-green-600 dark:text-green-400">{presentDays}</p>
                <p className="text-xs text-muted-foreground">Present</p>
              </div>
              <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-3">
                <XCircle className="h-5 w-5 mx-auto text-red-600 dark:text-red-400" />
                <p className="text-xl font-bold mt-1 text-red-600 dark:text-red-400">{absentDays}</p>
                <p className="text-xs text-muted-foreground">Absent</p>
              </div>
              <div className="rounded-lg bg-yellow-100 dark:bg-yellow-900/30 p-3">
                <Calendar className="h-5 w-5 mx-auto text-yellow-600 dark:text-yellow-400" />
                <p className="text-xl font-bold mt-1 text-yellow-600 dark:text-yellow-400">{lateDays}</p>
                <p className="text-xs text-muted-foreground">Late</p>
              </div>
            </div>
            {totalDays > 0 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Attendance Rate: <span className="font-semibold text-foreground">{attendanceRate}%</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security - only show for email-authenticated students */}
        {!isOtpAuthenticated && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="h-4 w-4" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Update your password</span>
                <ChangePasswordDialog trigger={
                  <Button variant="outline" size="sm">Change Password</Button>
                } />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Logout Button */}
        <Button 
          variant="outline" 
          className="w-full text-destructive hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </StudentLayout>
  );
}
