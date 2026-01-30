import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, DoorOpen, Plus, Grid3X3, Users, AlertTriangle, CheckCircle, Eye, UserSearch, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTimetables } from '@/hooks/useTimetables';
import { useRooms } from '@/hooks/useRooms';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function TimetableDashboard() {
  const timetablesQuery = useTimetables();
  const roomsQuery = useRooms();
  const slotsQuery = useTimeSlots();

  const timetables = timetablesQuery.data;
  const rooms = roomsQuery.data;
  const timeSlots = slotsQuery.data;
  const isLoading = timetablesQuery.isLoading || roomsQuery.isLoading || slotsQuery.isLoading;
  
  const publishedTimetables = timetables?.filter(t => t.status === 'published') || [];
  const draftTimetables = timetables?.filter(t => t.status === 'draft') || [];
  const activeRooms = rooms?.filter(r => r.is_active) || [];
  const lessonSlots = timeSlots?.filter(s => s.slot_type === 'lesson' && s.is_active) || [];

  const stats = [
    { 
      label: 'Published Timetables', 
      value: publishedTimetables.length, 
      icon: CheckCircle, 
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    { 
      label: 'Draft Timetables', 
      value: draftTimetables.length, 
      icon: AlertTriangle, 
      color: 'text-amber-600',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30'
    },
    { 
      label: 'Active Rooms', 
      value: activeRooms.length, 
      icon: DoorOpen, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    { 
      label: 'Time Slots', 
      value: lessonSlots.length, 
      icon: Clock, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
  ];

  return (
    <DashboardLayout title="Timetable Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Timetable Management</h1>
            <p className="text-muted-foreground">Manage class schedules, rooms, and time slots</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/timetable/view">
                <Eye className="mr-2 h-4 w-4" />
                Master View
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/timetable/periods">
                <Clock className="mr-2 h-4 w-4" />
                Periods
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/timetable/rooms">
                <DoorOpen className="mr-2 h-4 w-4" />
                Rooms
              </Link>
            </Button>
            <Button asChild>
              <Link to="/timetable/create">
                <Plus className="mr-2 h-4 w-4" />
                New Timetable
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    {isLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <p className="text-2xl font-bold">{stat.value}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Master Timetable View
              </CardTitle>
              <CardDescription>See all classes at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/timetable/view">View Master Timetable</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="h-5 w-5 text-primary" />
                Week Block View
              </CardTitle>
              <CardDescription>All classes for the entire week</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/timetable/week-block">View Week Block</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserSearch className="h-5 w-5 text-primary" />
                Teacher Schedules
              </CardTitle>
              <CardDescription>Look up any teacher's timetable</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/timetable/teachers">View Teacher Schedules</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Room Schedules
              </CardTitle>
              <CardDescription>View room availability & usage</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/timetable/room-schedule">View Room Schedules</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Management Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="h-5 w-5 text-primary" />
                Manage Timetables
              </CardTitle>
              <CardDescription>View and edit all timetables</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/timetable/manage">View All Timetables</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DoorOpen className="h-5 w-5 text-primary" />
                Room Management
              </CardTitle>
              <CardDescription>Configure classrooms and venues</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/timetable/rooms">Manage Rooms</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Period Setup
              </CardTitle>
              <CardDescription>Define time slots and breaks</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/timetable/periods">Configure Periods</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Timetables */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Timetables</CardTitle>
            <CardDescription>Latest timetables created or updated</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : timetables && timetables.length > 0 ? (
              <div className="space-y-3">
                {timetables.slice(0, 5).map((timetable) => (
                  <div
                    key={timetable.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{timetable.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {timetable.timetable_type} • Updated {format(new Date(timetable.updated_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={timetable.status === 'published' ? 'default' : 'secondary'}
                      >
                        {timetable.status}
                      </Badge>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/timetable/${timetable.id}`}>Edit</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No timetables created yet</p>
                <Button className="mt-4" asChild>
                  <Link to="/timetable/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Timetable
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
