import { ParentLayout } from '@/components/parent/ParentLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';
import { useParent } from '@/contexts/ParentContext';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import type { TimetableEntryWithJoins } from '@/types/timetable';

const DAYS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
];

export default function ParentTimetable() {
  const { selectedStudent } = useParent();
  const slotsQuery = useTimeSlots();
  const timeSlots = slotsQuery.data;
  const slotsLoading = slotsQuery.isLoading;

  const { data: entries, isLoading: entriesLoading } = useQuery({
    queryKey: ['class-timetable', selectedStudent?.class_id, selectedStudent?.institution_id],
    queryFn: async () => {
      if (!selectedStudent?.class_id || !selectedStudent?.institution_id) return [];
      
      const { data, error } = await supabase
        .from('timetable_entries')
        .select(`
          *,
          subjects:subject_id(name),
          staff:teacher_id(first_name, last_name),
          rooms:room_id(name),
          time_slots:time_slot_id(name, start_time, end_time, sequence_order),
          timetables:timetable_id(status)
        `)
        .eq('class_id', selectedStudent.class_id)
        .eq('institution_id', selectedStudent.institution_id);

      if (error) throw error;
      
      // Filter to only published timetables
      return (data as TimetableEntryWithJoins[])?.filter(e => e.timetables?.status === 'published') || [];
    },
    enabled: !!selectedStudent?.class_id && !!selectedStudent?.institution_id,
  });

  const isLoading = slotsLoading || entriesLoading;

  const lessonSlots = timeSlots?.filter(s => s.slot_type === 'lesson' && s.is_active)
    .sort((a, b) => a.sequence_order - b.sequence_order) || [];

  const getEntry = (dayOfWeek: number, timeSlotId: string): TimetableEntryWithJoins | undefined => {
    return entries?.find(e => e.day_of_week === dayOfWeek && e.time_slot_id === timeSlotId);
  };

  const today = new Date().getDay();
  const currentDay = today === 0 ? 7 : today;

  const getTeacherName = (entry: TimetableEntryWithJoins): string => {
    if (!entry.staff) return '';
    const firstName = entry.staff.first_name || '';
    const lastName = entry.staff.last_name || '';
    return firstName ? `${firstName.charAt(0)}. ${lastName}` : lastName;
  };

  if (!selectedStudent) {
    return (
      <ParentLayout title="Timetable">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Please select a student to view their timetable</p>
          </CardContent>
        </Card>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout title="Timetable">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {selectedStudent.first_name}'s Class Timetable
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : lessonSlots.length > 0 && entries && entries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="border bg-muted/50 p-2 text-left font-medium w-16">
                        <Clock className="h-4 w-4" />
                      </th>
                      {DAYS.map((day) => (
                        <th 
                          key={day.value} 
                          className={`border p-2 text-center font-medium ${
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
                        <td className="border bg-muted/30 p-1 text-xs">
                          <div className="font-medium">{slot.start_time.slice(0, 5)}</div>
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
                                <div className="p-1 rounded bg-primary/10 min-h-[40px]">
                                  <div className="font-medium text-xs truncate">
                                    {entry.subjects?.name}
                                  </div>
                                  <div className="text-[10px] text-muted-foreground truncate">
                                    {getTeacherName(entry)}
                                  </div>
                                </div>
                              ) : (
                                <div className="min-h-[40px]" />
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
                <p className="text-muted-foreground">No timetable available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ParentLayout>
  );
}
