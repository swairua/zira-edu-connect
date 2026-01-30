import { Building2, Users, DollarSign, TrendingUp, Globe, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGroup } from '@/contexts/GroupContext';
import { useGroupCampuses } from '@/hooks/useGroupCampuses';

export default function GroupDashboard() {
  const { group, groupId, isLoading: isLoadingGroup, groupRole } = useGroup();
  const { campuses, groupStats, isLoading: isLoadingCampuses } = useGroupCampuses(groupId ?? undefined);

  const isLoading = isLoadingGroup || isLoadingCampuses;

  if (isLoading) {
    return (
      <DashboardLayout title="Group Dashboard" subtitle="Loading...">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  if (!group) {
    return (
      <DashboardLayout title="Group Dashboard" subtitle="No group found">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Globe className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Group Access</h3>
            <p className="text-muted-foreground text-center max-w-md">
              You don't have access to any institution groups. Contact your administrator
              if you believe this is an error.
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title={group.name} 
      subtitle="Multi-campus overview and consolidated metrics"
    >
      <div className="space-y-6">
        {/* Role Badge */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">
            {groupRole?.replace(/_/g, ' ')}
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campuses</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{groupStats.campusCount}</div>
              <p className="text-xs text-muted-foreground">
                Active institutions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {groupStats.totalStudents.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all campuses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {groupStats.totalStaff.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Teachers & administrators
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscription</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {group.subscription_plan}
              </div>
              <p className="text-xs text-muted-foreground">
                Group plan
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Campus List - Show top 5 with link to all */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Campuses</CardTitle>
              <CardDescription>
                {campuses.length > 5 
                  ? `Top 5 of ${campuses.length} institutions in the ${group.name} network`
                  : `All institutions in the ${group.name} network`
                }
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/group/campuses">
                {campuses.length > 5 ? `View All ${campuses.length}` : 'Manage Campuses'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {campuses.slice(0, 5).map((campus) => (
                <Card key={campus.id} className="relative">
                  {campus.is_headquarters && (
                    <Badge 
                      className="absolute top-2 right-2" 
                      variant="default"
                    >
                      HQ
                    </Badge>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {campus.name}
                    </CardTitle>
                    <CardDescription>
                      {campus.campus_code || campus.code}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Students</span>
                      <span className="font-medium">{campus.student_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Staff</span>
                      <span className="font-medium">{campus.staff_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant={campus.status === 'active' ? 'default' : 'secondary'}>
                        {campus.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {campuses.length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No campuses in this group yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
            <Link to="/group/reports">
              <TrendingUp className="h-5 w-5" />
              <span>View Reports</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
            <Link to="/group/settings">
              <Globe className="h-5 w-5" />
              <span>Group Settings</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
            <Link to="/group/users">
              <Users className="h-5 w-5" />
              <span>Manage Users</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
            <Link to="/group/campuses">
              <Building2 className="h-5 w-5" />
              <span>Manage Campuses</span>
            </Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
