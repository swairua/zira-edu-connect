import { ParentLayout } from '@/components/parent/ParentLayout';
import { NoStudentLinked } from '@/components/parent/NoStudentLinked';
import { ParentNotificationSettings } from '@/components/parent/ParentNotificationSettings';
import { useParent } from '@/contexts/ParentContext';
import { useStudentAttendanceSummary } from '@/hooks/useParentData';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { User, GraduationCap, Calendar, LogOut, BarChart3, Key } from 'lucide-react';
import { ChangePasswordDialog } from '@/components/settings/ChangePasswordDialog';

export default function ParentProfile() {
  const { selectedStudent, parentProfile, isLoading: parentLoading } = useParent();
  const { signOut } = useAuth();
  
  const { 
    data: attendance,
    refetch: refetchAttendance,
    isLoading: attendanceLoading,
  } = useStudentAttendanceSummary(selectedStudent?.id || null);

  const getInitials = () => {
    if (!selectedStudent) return 'S';
    return `${selectedStudent.first_name[0]}${selectedStudent.last_name[0]}`.toUpperCase();
  };

  // Show no student linked message
  if (!parentLoading && !selectedStudent) {
    return (
      <ParentLayout title="Profile">
        <div className="p-4 space-y-4">
          <NoStudentLinked />
          
          {/* Parent Info - still show even without linked student */}
          {parentProfile && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" aria-hidden="true" />
                  Your Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{parentProfile.first_name} {parentProfile.last_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{parentProfile.phone}</span>
                </div>
                {parentProfile.email && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{parentProfile.email}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          <Button 
            variant="outline" 
            className="w-full gap-2" 
            onClick={signOut}
            aria-label="Sign out of your account"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign Out
          </Button>
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout 
      title="Profile"
      onRefresh={() => refetchAttendance()}
      isRefreshing={attendanceLoading}
    >
      <div className="space-y-4 p-4">
        {/* Student Info */}
        {selectedStudent && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20">
                  <AvatarImage 
                    src={selectedStudent.photo_url || undefined} 
                    alt={`${selectedStudent.first_name}'s photo`}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="mt-4 text-xl font-semibold">
                  {selectedStudent.first_name} {selectedStudent.middle_name || ''} {selectedStudent.last_name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedStudent.admission_number}
                </p>
              </div>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-muted-foreground">Class</p>
                    <p className="text-sm font-medium">{selectedStudent.class_name || 'Not assigned'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="text-sm font-medium capitalize">{selectedStudent.status || 'Active'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Attendance Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
              Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendance ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Attendance Rate</span>
                  <span 
                    className="text-lg font-bold text-primary"
                    aria-label={`${attendance.attendanceRate} percent attendance`}
                  >
                    {attendance.attendanceRate}%
                  </span>
                </div>
                <Progress 
                  value={attendance.attendanceRate} 
                  className="h-2"
                  aria-label="Attendance rate progress"
                />
                <div className="grid grid-cols-4 gap-2 pt-2" role="list" aria-label="Attendance breakdown">
                  <div className="text-center" role="listitem">
                    <p className="text-lg font-semibold text-success">{attendance.present}</p>
                    <p className="text-xs text-muted-foreground">Present</p>
                  </div>
                  <div className="text-center" role="listitem">
                    <p className="text-lg font-semibold text-destructive">{attendance.absent}</p>
                    <p className="text-xs text-muted-foreground">Absent</p>
                  </div>
                  <div className="text-center" role="listitem">
                    <p className="text-lg font-semibold text-warning">{attendance.late}</p>
                    <p className="text-xs text-muted-foreground">Late</p>
                  </div>
                  <div className="text-center" role="listitem">
                    <p className="text-lg font-semibold text-muted-foreground">{attendance.excused}</p>
                    <p className="text-xs text-muted-foreground">Excused</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-sm text-muted-foreground">
                  No attendance records available yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Parent Info */}
        {parentProfile && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="h-4 w-4" aria-hidden="true" />
                Your Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{parentProfile.first_name} {parentProfile.last_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium">{parentProfile.phone}</span>
              </div>
              {parentProfile.email && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{parentProfile.email}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notification Preferences */}
        <ParentNotificationSettings />

        {/* Security */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Key className="h-4 w-4" aria-hidden="true" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Password</span>
              <ChangePasswordDialog trigger={
                <Button variant="outline" size="sm">Change</Button>
              } />
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button 
          variant="outline" 
          className="w-full gap-2" 
          onClick={signOut}
          aria-label="Sign out of your account"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign Out
        </Button>
      </div>
    </ParentLayout>
  );
}
