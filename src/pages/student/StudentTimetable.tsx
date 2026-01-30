import { StudentLayout } from '@/components/student/StudentLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { useStudent } from '@/contexts/StudentContext';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const DAYS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
];

interface TimetableEntry {
  id: string;
  day_of_week: number;
  time_slot_id: string;
  subjects?: { name: string };
  staff?: { first_name: string; last_name: string };
  rooms?: { name: string };
  time_slots?: { 
    id: string;
    name: string; 
    start_time: string; 
    end_time: string; 
    sequence_order: number;
    slot_type: string;
  };
}

interface TimeSlot {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  sequence_order: number;
  slot_type: string;
  is_active: boolean;
}

export default function StudentTimetable() {
  const { studentProfile } = useStudent();
  const student = studentProfile;

  // Check if we're in demo/OTP mode
  const isTokenMode = typeof window !== 'undefined' && !!localStorage.getItem('student_session_token');

  // Fetch timetable data - use API in token mode, direct query otherwise
  const { data: timetableData, isLoading } = useQuery({
    queryKey: ['student-timetable', student?.id, student?.class_id, isTokenMode],
    queryFn: async () => {
      if (isTokenMode) {
        // Use backend API for demo/OTP mode
        const token = localStorage.getItem('student_session_token');
        const { data, error } = await supabase.functions.invoke('student-data-api', {
          body: { type: 'timetable' },
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (error) throw error;
        return data?.data || data || { timetable: null, timeSlots: [], entries: [] };
      } else {
        // Direct query for authenticated users
        if (!student?.class_id || !student?.institution_id) {
          return { timetable: null, timeSlots: [], entries: [] };
        }

        // Get published timetable
        const { data: timetable } = await supabase
          .from('timetables')
          .select('id, name, status')
          .eq('institution_id', student.institution_id)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!timetable) {
          return { timetable: null, timeSlots: [], entries: [] };
        }

        // Get time slots
        const { data: timeSlots } = await supabase
          .from('time_slots')
          .select('*')
          .eq('institution_id', student.institution_id)
          .eq('is_active', true)
          .order('sequence_order', { ascending: true });

        // Get entries for the class
        const { data: entries } = await supabase
          .from('timetable_entries')
          .select(`
            id,
            day_of_week,
            time_slot_id,
            subjects:subject_id(name),
            staff:teacher_id(first_name, last_name),
            rooms:room_id(name),
            time_slots:time_slot_id(id, name, start_time, end_time, sequence_order, slot_type)
          `)
          .eq('timetable_id', timetable.id)
          .eq('class_id', student.class_id);

        return {
          timetable,
          timeSlots: timeSlots || [],
          entries: entries || [],
        };
      }
    },
    enabled: isTokenMode || (!!student?.class_id && !!student?.institution_id),
  });

  const timeSlots: TimeSlot[] = timetableData?.timeSlots || [];
  const entries: TimetableEntry[] = timetableData?.entries || [];

  const lessonSlots = timeSlots
    .filter(s => s.slot_type === 'lesson' && s.is_active)
    .sort((a, b) => a.sequence_order - b.sequence_order);

  const getEntry = (dayOfWeek: number, timeSlotId: string) => {
    return entries.find(e => e.day_of_week === dayOfWeek && e.time_slot_id === timeSlotId);
  };

  const today = new Date().getDay();
  const currentDay = today === 0 ? 7 : today;

  return (
    <StudentLayout title="My Timetable">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Class Timetable
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : lessonSlots.length > 0 && entries.length > 0 ? (
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
                            day.value === currentDay ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-muted/50'
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
                                day.value === currentDay ? 'bg-indigo-50 dark:bg-indigo-900/10' : ''
                              }`}
                            >
                              {entry ? (
                                <div className="p-1 rounded bg-indigo-100 dark:bg-indigo-900/30 min-h-[40px]">
                                  <div className="font-medium text-xs truncate text-indigo-900 dark:text-indigo-100">
                                    {entry.subjects?.name}
                                  </div>
                                  <div className="text-[10px] text-indigo-700 dark:text-indigo-300 truncate">
                                    {entry.staff?.first_name?.charAt(0)}. {entry.staff?.last_name}
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
                <p className="text-muted-foreground">
                  {timetableData?.timetable ? 'No classes scheduled for your class yet' : 'No published timetable available'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Classes */}
        {entries.length > 0 && (
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
                      <div className="text-sm text-muted-foreground w-14">
                        {entry.time_slots?.start_time?.slice(0, 5)}
                      </div>
                      <div>
                        <div className="font-medium">{entry.subjects?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {entry.staff?.first_name} {entry.staff?.last_name}
                        </div>
                      </div>
                    </div>
                    {entry.rooms?.name && (
                      <Badge variant="outline">{entry.rooms.name}</Badge>
                    )}
                  </div>
                )) || (
                <p className="text-center text-muted-foreground py-4">No classes today</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </StudentLayout>
  );
}
