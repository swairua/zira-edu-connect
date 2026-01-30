import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react';
import { useActivityEvents } from '@/hooks/useActivityEvents';
import { useActivities } from '@/hooks/useActivities';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import CreateEventDialog from '@/components/activities/CreateEventDialog';

const typeColors: Record<string, string> = {
  practice: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  competition: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  performance: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  tournament: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  meeting: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function ActivityEvents() {
  const { activities, isLoading: activitiesLoading } = useActivities();
  const [selectedActivity, setSelectedActivity] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  const { events, isLoading } = useActivityEvents(
    selectedActivity !== 'all' ? selectedActivity : undefined
  );

  const filteredEvents = selectedActivity === 'all' 
    ? events 
    : events.filter(e => e.activity_id === selectedActivity);

  // Group events by date
  const eventsByDate = filteredEvents.reduce((acc, event) => {
    const date = event.event_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {} as Record<string, typeof events>);

  if (activitiesLoading || isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <DashboardLayout title="Events" subtitle="Manage competitions, practices, and performances">
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">
            Manage competitions, practices, and performances
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Select value={selectedActivity} onValueChange={setSelectedActivity}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Filter by activity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              {activities.map((activity) => (
                <SelectItem key={activity.id} value={activity.id}>
                  {activity.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {Object.entries(eventsByDate).map(([date, dateEvents]) => (
          <div key={date}>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {format(new Date(date), 'EEEE, MMMM d, yyyy')}
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dateEvents.map((event) => (
                <Card key={event.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{event.event_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {event.activity?.name}
                        </p>
                      </div>
                      <Badge className={statusColors[event.status]}>
                        {event.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <Badge variant="outline" className={typeColors[event.event_type]}>
                        {event.event_type}
                      </Badge>
                      
                      {(event.start_time || event.end_time) && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {event.start_time && format(new Date(`1970-01-01T${event.start_time}`), 'h:mm a')}
                          {event.end_time && ` - ${format(new Date(`1970-01-01T${event.end_time}`), 'h:mm a')}`}
                        </div>
                      )}
                      
                      {event.location && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                      )}
                      
                      {event.description && (
                        <p className="text-muted-foreground line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(eventsByDate).length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No events found. Create your first event to get started.
            </CardContent>
          </Card>
        )}
      </div>

        <CreateEventDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          activities={activities}
        />
      </div>
    </DashboardLayout>
  );
}
