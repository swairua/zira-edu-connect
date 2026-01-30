import { PortalLayout } from '@/components/portal/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useStaffProfile } from '@/hooks/useStaffProfile';
import { useAuth } from '@/hooks/useAuth';
import { hasAnyRole, FINANCE_ROLES, ACADEMIC_ROLES } from '@/lib/roles';

// Role-specific widgets
import { 
  FinanceStatsWidget, 
  TeacherStatsWidget,
  RecentPaymentsWidget,
  DefaultersWidget,
  TeacherClassesWidget,
  UpcomingExamsWidget,
  FinanceQuickActionsWidget,
  TeacherQuickActionsWidget
} from '@/components/portal/widgets';

export default function StaffDashboard() {
  const { userRoles } = useAuth();
  const { data: profile, isLoading: profileLoading } = useStaffProfile();

  const isTeacher = userRoles.some(r => r.role === 'teacher');
  const isFinance = hasAnyRole(userRoles, FINANCE_ROLES);
  const isAcademic = hasAnyRole(userRoles, ACADEMIC_ROLES);

  return (
    <PortalLayout title="Dashboard" subtitle="Welcome to your staff portal">
      <div className="space-y-6">
        {/* Role-Specific Stats */}
        {isFinance && profile?.institution_id && (
          <FinanceStatsWidget institutionId={profile.institution_id} />
        )}
        
        {(isTeacher || isAcademic) && !isFinance && (
          <TeacherStatsWidget staffId={profile?.id} />
        )}

        {/* Profile Summary */}
        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Your staff information</CardDescription>
          </CardHeader>
          <CardContent>
            {profileLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-5 w-40" />
              </div>
            ) : profile ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Employee Number</p>
                  <p className="font-medium">{profile.employee_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{profile.department || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Designation</p>
                  <p className="font-medium">{profile.designation || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{profile.email || '-'}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                No staff profile linked to your account. Contact your administrator.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Role-specific content sections */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Finance: Recent Payments & Defaulters */}
          {isFinance && profile?.institution_id && (
            <>
              <RecentPaymentsWidget institutionId={profile.institution_id} />
              <DefaultersWidget institutionId={profile.institution_id} />
            </>
          )}

          {/* Teacher: Classes & Exams */}
          {(isTeacher || isAcademic) && !isFinance && (
            <>
              <TeacherClassesWidget />
              <UpcomingExamsWidget staffId={profile?.id} />
            </>
          )}
        </div>

        {/* Role-Specific Quick Actions */}
        {isFinance ? (
          <FinanceQuickActionsWidget />
        ) : (isTeacher || isAcademic) ? (
          <TeacherQuickActionsWidget />
        ) : null}
      </div>
    </PortalLayout>
  );
}
