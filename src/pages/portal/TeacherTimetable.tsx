import { PortalLayout } from '@/components/portal/PortalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { useStaffProfile } from '@/hooks/useStaffProfile';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useInstitution } from '@/contexts/InstitutionContext';
import type { TimetableEntryWithJoins } from '@/types/timetable';

const DAYS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
];

export default function TeacherTimetable() {
  const profileQuery = useStaffProfile();
  const slotsQuery = useTimeSlots();
  const profile = profileQuery.data;
  const timeSlots = slotsQuery.data;
  const profileLoading = profileQuery.isLoading;
  const slotsLoading = slotsQuery.isLoading;
  const { institutionId } = useInstitution();

  const { data: entries, isLoading: entriesLoading } = useQuery({
    queryKey: ['teacher-timetable', profile?.id, institutionId],
    queryFn: async () => {
      if (!profile?.id || !institutionId) return [];
      
      const { data, error } = await supabase
        .from('timetable_entries')
        .select(`
          *,
          classes:class_id(name, stream),
          subjects:subject_id(name),
          rooms:room_id(name),
          time_slots:time_slot_id(name, start_time, end_time, sequence_order),
          timetables:timetable_id(status)
        `)
        .eq('teacher_id', profile.id)
        .eq('institution_id', institutionId);

      if (error) throw error;
      
      // Filter to only published timetables
      return (data as TimetableEntryWithJoins[])?.filter(e => e.timetables?.status === 'published') || [];
    },
    enabled: !!profile?.id && !!institutionId,
  });

  const isLoading = profileLoading || slotsLoading || entriesLoading;

  const lessonSlots = timeSlots?.filter(s => s.slot_type === 'lesson' && s.is_active)
    .sort((a, b) => a.sequence_order - b.sequence_order) || [];

  const getEntry = (dayOfWeek: number, timeSlotId: string): TimetableEntryWithJoins | undefined => {
    return entries?.find(e => e.day_of_week === dayOfWeek && e.time_slot_id === timeSlotId);
  };

  // Get current day for highlighting
  const today = new Date().getDay();
  const currentDay = today === 0 ? 7 : today; // Convert Sunday from 0 to 7

  const getClassName = (entry: TimetableEntryWithJoins): string => {
    if (!entry.classes) return '';
    return entry.classes.stream 
      ? `${entry.classes.name} (${entry.classes.stream})`
      : entry.classes.name;
  };

  return (
    <PortalLayout title="My Timetable">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : lessonSlots.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border bg-muted/50 p-2 text-left text-sm font-medium w-20">
                        <Clock className="h-4 w-4 inline mr-1" />
                        Time
                      </th>
                      {DAYS.map((day) => (
                        <th 
                          key={day.value} 
                          className={`border p-2 text-center text-sm font-medium min-w-[100px] ${
                            day.value === currentDay ? 'bg-primary/10' : 'bg-muted/50'
                          }`}
                        >
                          {day.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lessonSlots.map((slot) => (
                      <tr key={slot.id}>
                        <td className="border bg-muted/30 p-2 text-xs">
                          <div className="font-medium">{slot.name}</div>
                          <div className="text-muted-foreground">
                            {slot.start_time.slice(0, 5)}
                          </div>
                        </td>
                        {DAYS.map((day) => {
                          const entry = getEntry(day.value, slot.id);
                          return (
                            <td
                              key={`${day.value}-${slot.id}`}
                              className={`border p-1 ${
                                day.value === currentDay ? 'bg-primary/5' : ''
                              }`}
                            >
                              {entry ? (
                                <div className="p-2 rounded bg-primary/10 border border-primary/20 min-h-[50px]">
                                  <div className="font-medium text-xs truncate">
                                    {entry.subjects?.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {getClassName(entry)}
                                  </div>
                                  {entry.rooms?.name && (
                                    <Badge variant="outline" className="text-[10px] mt-1">
                                      {entry.rooms.name}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <div className="min-h-[50px]" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No timetable published yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Schedule Summary */}
        {entries && entries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Classes</CardTitle>
            </CardHeader>
            <CardContent>
              {entries
                .filter(e => e.day_of_week === currentDay)
                .sort((a, b) => 
                  (a.time_slots?.sequence_order || 0) - (b.time_slots?.sequence_order || 0)
                )
                .map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between py-3 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-muted-foreground w-16">
                        {entry.time_slots?.start_time?.slice(0, 5)}
                      </div>
                      <div>
                        <div className="font-medium">{entry.subjects?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {getClassName(entry)}
                        </div>
                      </div>
                    </div>
                    {entry.rooms?.name && (
                      <Badge variant="outline">{entry.rooms.name}</Badge>
                    )}
                  </div>
                ))}
              {entries.filter(e => e.day_of_week === currentDay).length === 0 && (
                <p className="text-center text-muted-foreground py-4">No classes today</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PortalLayout>
  );
}
