import { GraduationCap, Users, Wallet, TrendingUp, UserCheck, UserPlus, CheckSquare, AlertTriangle } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { OnboardingChecklist } from '@/components/admin/OnboardingChecklist';
import { OnboardingBanner } from '@/components/onboarding/OnboardingBanner';
import { InstitutionQuickActions } from '@/components/admin/InstitutionQuickActions';
import { InstitutionFinanceSummary } from '@/components/admin/InstitutionFinanceSummary';
import { InstitutionActivityFeed } from '@/components/admin/InstitutionActivityFeed';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useInstitutionDashboard } from '@/hooks/useInstitutionDashboard';
import { useInstitutionAdminMetrics } from '@/hooks/useInstitutionAdminMetrics';
import { useAuth } from '@/hooks/useAuth';
import { isStaffOnly } from '@/lib/roles';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function InstitutionDashboard() {
  const { user, userRoles, isSuperAdmin, isSupportAdmin, rolesLoading } = useAuth();
  const { institution, isLoading: isLoadingInstitution } = useInstitution();
  const { stats, isLoadingStats, recentActivity, isLoadingActivity } = useInstitutionDashboard();
  const { 
    todayAttendance, 
    recentEnrollments,
    isLoadingRecentEnrollments,
    pendingApprovals, 
    classInsights,
    isLoadingClassInsights,
  } = useInstitutionAdminMetrics(institution?.id);

  // Guard: Redirect staff-only users to portal
  if (!rolesLoading && isStaffOnly(userRoles, isSuperAdmin, isSupportAdmin)) {
    return <Navigate to="/portal" replace />;
  }

  // Show loading while checking roles
  if (rolesLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate pending approvals counts
  const pendingGradesCount = pendingApprovals.filter(p => p.type === 'grade').length;
  const pendingAdjustmentsCount = pendingApprovals.filter(p => p.type === 'adjustment').length;
  const classesNeedingAttention = classInsights.filter(c => c.needsAttention);

  // Get first name for greeting
  const firstName = user?.user_metadata?.first_name || 'there';

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `KES ${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `KES ${(amount / 1000).toFixed(1)}K`;
    }
    return `KES ${amount.toLocaleString()}`;
  };

  return (
    <DashboardLayout 
      title={`Welcome back, ${firstName}!`}
      subtitle={isLoadingInstitution ? 'Loading...' : `Here's what's happening at ${institution?.name || 'your institution'}`}
    >
      <div className="space-y-6">
        {/* Onboarding Banner - prominent CTA for incomplete setup */}
        <OnboardingBanner />

        {/* Onboarding Checklist - only show if not 100% */}
        {isLoadingStats ? (
          <Skeleton className="h-32 w-full" />
        ) : stats?.setupProgress && (
          <OnboardingChecklist progress={stats.setupProgress} />
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {isLoadingStats ? (
            <>
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </>
          ) : (
            <>
              <StatCard
                title="Total Students"
                value={stats?.totalStudents || 0}
                icon={<GraduationCap className="h-6 w-6" />}
                change={stats?.newStudentsThisMonth}
                changeLabel="new this month"
              />
              <StatCard
                title="Staff Members"
                value={stats?.totalStaff || 0}
                icon={<Users className="h-6 w-6" />}
              />
              <StatCard
                title="Today's Attendance"
                value={`${todayAttendance?.rate || 0}%`}
                icon={<UserCheck className="h-6 w-6" />}
                variant={todayAttendance?.rate >= 90 ? 'success' : todayAttendance?.rate >= 75 ? 'warning' : 'primary'}
              />
              <StatCard
                title="Collection Rate"
                value={`${(stats?.collectionRate || 0).toFixed(1)}%`}
                icon={<TrendingUp className="h-6 w-6" />}
                change={stats?.collectionRate && stats.collectionRate >= 70 ? 0 : undefined}
                changeLabel={stats?.collectionRate && stats.collectionRate >= 70 ? 'On track' : 'Needs attention'}
              />
            </>
          )}
        </div>

        {/* Quick Insights Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Recent Enrollments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingRecentEnrollments ? (
                <Skeleton className="h-16" />
              ) : recentEnrollments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent enrollments</p>
              ) : (
                <div className="space-y-2">
                  {recentEnrollments.slice(0, 3).map((student) => (
                    <div key={student.id} className="flex items-center justify-between text-sm">
                      <span>{student.name}</span>
                      <Badge variant="outline">{student.className || 'Unassigned'}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pendingGradesCount > 0 && (
                  <Link to="/grade-approvals" className="flex items-center justify-between text-sm hover:bg-muted p-1 rounded">
                    <span>Grade Approvals</span>
                    <Badge>{pendingGradesCount}</Badge>
                  </Link>
                )}
                {pendingAdjustmentsCount > 0 && (
                  <Link to="/finance/adjustments" className="flex items-center justify-between text-sm hover:bg-muted p-1 rounded">
                    <span>Financial Adjustments</span>
                    <Badge>{pendingAdjustmentsCount}</Badge>
                  </Link>
                )}
                {pendingGradesCount === 0 && pendingAdjustmentsCount === 0 && (
                  <p className="text-sm text-muted-foreground">No pending approvals</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Classes Needing Attention */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Needs Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingClassInsights ? (
                <Skeleton className="h-16" />
              ) : classesNeedingAttention.length === 0 ? (
                <p className="text-sm text-muted-foreground text-green-600">All classes performing well!</p>
              ) : (
                <div className="space-y-2">
                  {classesNeedingAttention.slice(0, 3).map((item) => (
                    <div key={item.classId} className="flex items-center justify-between text-sm">
                      <span>{item.className}</span>
                      <Badge variant="destructive">{item.attendanceRate.toFixed(0)}% att.</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Finance & Activity */}
          <div className="lg:col-span-2 space-y-6">
            {isLoadingStats ? (
              <Skeleton className="h-48" />
            ) : stats && (
              <InstitutionFinanceSummary
                expectedFees={stats.expectedFees}
                collectedFees={stats.collectedFees}
                outstandingBalance={stats.outstandingBalance}
                collectionRate={stats.collectionRate}
              />
            )}
            
            <InstitutionActivityFeed 
              activities={recentActivity} 
              isLoading={isLoadingActivity}
            />
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            <InstitutionQuickActions />
            
            {/* Term Info Card */}
            {stats?.currentTermName && (
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Current Term</p>
                <p className="text-lg font-semibold">{stats.currentTermName}</p>
                <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                  <span>{stats.totalClasses} Classes</span>
                  <span>{stats.totalSubjects} Subjects</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
