import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Users, 
  Calendar, 
  TrendingUp, 
  Plus, 
  ArrowRight,
  Volleyball,
  Music,
  BookOpen,
  Heart
} from 'lucide-react';
import { useActivityDashboard } from '@/hooks/useActivityDashboard';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const categoryIcons: Record<string, React.ReactNode> = {
  sports: <Volleyball className="h-4 w-4" />,
  arts: <Music className="h-4 w-4" />,
  academic: <BookOpen className="h-4 w-4" />,
  social: <Heart className="h-4 w-4" />,
  other: <Trophy className="h-4 w-4" />,
};

const categoryColors: Record<string, string> = {
  sports: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  arts: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  academic: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  social: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

export default function ActivitiesDashboard() {
  const navigate = useNavigate();
  const { stats, recentEnrollments, upcomingEvents, isLoading } = useActivityDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout title="Activities & Sports" subtitle="Manage clubs, teams, and extracurricular activities">
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activities & Sports</h1>
          <p className="text-muted-foreground">
            Manage clubs, teams, and extracurricular activities
          </p>
        </div>
        <Button onClick={() => navigate('/activities/create')}>
          <Plus className="mr-2 h-4 w-4" />
          New Activity
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActivities}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeActivities} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">
              Active participants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled activities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(stats.categoryCounts).length}</div>
            <p className="text-xs text-muted-foreground">
              Activity types
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">By Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.categoryCounts).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={categoryColors[category]}>
                      {categoryIcons[category]}
                      <span className="ml-1 capitalize">{category}</span>
                    </Badge>
                  </div>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
              {Object.keys(stats.categoryCounts).length === 0 && (
                <p className="text-sm text-muted-foreground">No activities yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">By Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.typeCounts).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="capitalize">{type}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
              {Object.keys(stats.typeCounts).length === 0 && (
                <p className="text-sm text-muted-foreground">No activities yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent & Upcoming */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Enrollments</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/activities/enrollments')}>
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEnrollments.map((enrollment: any) => (
                <div key={enrollment.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">
                      {enrollment.student?.first_name} {enrollment.student?.last_name}
                    </p>
                    <p className="text-muted-foreground">{enrollment.activity?.name}</p>
                  </div>
                  <Badge variant="secondary">{enrollment.status}</Badge>
                </div>
              ))}
              {recentEnrollments.length === 0 && (
                <p className="text-sm text-muted-foreground">No recent enrollments</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Upcoming Events</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/activities/events')}>
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event: any) => (
                <div key={event.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{event.event_name}</p>
                    <p className="text-muted-foreground">{event.activity?.name}</p>
                  </div>
                  <Badge variant="outline">
                    {format(new Date(event.event_date), 'MMM d')}
                  </Badge>
                </div>
              ))}
              {upcomingEvents.length === 0 && (
                <p className="text-sm text-muted-foreground">No upcoming events</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate('/activities/list')}>
              <Trophy className="mr-2 h-4 w-4" />
              View All Activities
            </Button>
            <Button variant="outline" onClick={() => navigate('/activities/enrollments')}>
              <Users className="mr-2 h-4 w-4" />
              Manage Enrollments
            </Button>
            <Button variant="outline" onClick={() => navigate('/activities/attendance')}>
              <Calendar className="mr-2 h-4 w-4" />
              Mark Attendance
            </Button>
            <Button variant="outline" onClick={() => navigate('/activities/reports')}>
              <TrendingUp className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </div>
        </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
