import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, BookOpen, MapPin, Clock, Calendar } from 'lucide-react';
import { useTimetables } from '@/hooks/useTimetables';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { useStaff } from '@/hooks/useStaff';
import { useInstitution } from '@/contexts/InstitutionContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import type { TimetableEntry, DayOfWeek } from '@/types/timetable';

const DAYS: { value: DayOfWeek; label: string; short: string }[] = [
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
];

export default function TeacherScheduleView() {
  const { institution } = useInstitution();
  const { data: timetables, isLoading: loadingTimetables } = useTimetables();
  const { data: timeSlots, isLoading: loadingSlots } = useTimeSlots();
  const { data: staff, isLoading: loadingStaff } = useStaff(institution?.id || null, { isActive: true });

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [selectedTimetableId, setSelectedTimetableId] = useState<string>('');

  // Get published timetable
  const publishedTimetable = useMemo(() => {
    if (!timetables) return null;
    if (selectedTimetableId) {
      return timetables.find(t => t.id === selectedTimetableId) || null;
    }
    return timetables.find(t => t.status === 'published') || timetables[0] || null;
  }, [timetables, selectedTimetableId]);

  // Fetch entries for selected teacher
  const { data: teacherEntries, isLoading: loadingEntries } = useQuery({
    queryKey: ['teacher-schedule', publishedTimetable?.id, selectedTeacherId],
    queryFn: async () => {
      if (!publishedTimetable?.id || !selectedTeacherId) return [];
      
      const { data, error } = await supabase
        .from('timetable_entries')
        .select(`
          *,
          class:classes(name, level, stream),
          subject:subjects(name, code),
          room:rooms(name),
          time_slot:time_slots(*)
        `)
        .eq('timetable_id', publishedTimetable.id)
        .eq('teacher_id', selectedTeacherId);

      if (error) throw error;
      return data as TimetableEntry[];
    },
    enabled: !!publishedTimetable?.id && !!selectedTeacherId,
  });

  // Filter to lesson slots only
  const lessonSlots = useMemo(() => {
    if (!timeSlots) return [];
    return timeSlots
      .filter(s => s.slot_type === 'lesson' && s.is_active)
      .sort((a, b) => a.sequence_order - b.sequence_order);
  }, [timeSlots]);

  // Get entry for specific day and time slot
  const getEntry = (dayOfWeek: DayOfWeek, timeSlotId: string): TimetableEntry | undefined => {
    if (!teacherEntries) return undefined;
    return teacherEntries.find(
      e => e.day_of_week === dayOfWeek && e.time_slot_id === timeSlotId
    );
  };

  // Calculate weekly stats
  const weeklyStats = useMemo(() => {
    if (!teacherEntries) return { totalLessons: 0, uniqueClasses: 0, uniqueSubjects: 0 };
    const uniqueClasses = new Set(teacherEntries.map(e => e.class_id));
    const uniqueSubjects = new Set(teacherEntries.map(e => e.subject_id));
    return {
      totalLessons: teacherEntries.length,
      uniqueClasses: uniqueClasses.size,
      uniqueSubjects: uniqueSubjects.size,
    };
  }, [teacherEntries]);

  const selectedTeacher = staff?.find(s => s.id === selectedTeacherId);
  const isLoading = loadingTimetables || loadingSlots || loadingStaff;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/timetable">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Teacher Schedule Lookup</h1>
            <p className="text-sm text-muted-foreground">
              View any teacher's complete weekly schedule
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            {/* Teacher Selector */}
            <div className="flex-1 min-w-[250px]">
              <label className="text-sm font-medium mb-2 block">Select Teacher</label>
              <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a teacher..." />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <div className="p-2 text-center text-muted-foreground">Loading...</div>
                  ) : (
                    staff?.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.first_name} {member.last_name}
                        {member.department && (
                          <span className="text-muted-foreground ml-2">
                            ({member.department})
                          </span>
                        )}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Timetable Selector */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Timetable</label>
              <Select
                value={selectedTimetableId || publishedTimetable?.id || ''}
                onValueChange={setSelectedTimetableId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timetable" />
                </SelectTrigger>
                <SelectContent>
                  {timetables?.map((tt) => (
                    <SelectItem key={tt.id} value={tt.id}>
                      {tt.name} {tt.status === 'published' && '✓'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teacher Stats & Schedule */}
      {!selectedTeacherId ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select a teacher to view their schedule</p>
          </CardContent>
        </Card>
      ) : loadingEntries ? (
        <Skeleton className="h-[500px] w-full" />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{weeklyStats.totalLessons}</div>
                    <div className="text-sm text-muted-foreground">Lessons/Week</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{weeklyStats.uniqueClasses}</div>
                    <div className="text-sm text-muted-foreground">Classes</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <BookOpen className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{weeklyStats.uniqueSubjects}</div>
                    <div className="text-sm text-muted-foreground">Subjects</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Schedule Grid */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {selectedTeacher?.first_name} {selectedTeacher?.last_name}'s Weekly Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lessonSlots.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No time slots configured. Set up periods first.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border p-3 text-left font-medium w-24">Time</th>
                        {DAYS.map((day) => (
                          <th key={day.value} className="border p-3 text-center font-medium">
                            {day.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {lessonSlots.map((slot) => (
                        <tr key={slot.id} className="hover:bg-muted/30">
                          <td className="border p-3 text-sm bg-muted/20">
                            <div className="font-medium">{slot.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                            </div>
                          </td>
                          {DAYS.map((day) => {
                            const entry = getEntry(day.value, slot.id);
                            return (
                              <td key={day.value} className="border p-2">
                                {entry ? (
                                  <div className="p-2 rounded bg-primary/10 text-sm">
                                    <div className="font-medium truncate">
                                      {entry.subject?.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {entry.class?.name}
                                      {entry.class?.stream && ` (${entry.class.stream})`}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                      <MapPin className="h-3 w-3" />
                                      {entry.room?.name || 'No room'}
                                    </div>
                                    {entry.is_double_period && (
                                      <Badge variant="secondary" className="mt-1 text-xs">
                                        Double
                                      </Badge>
                                    )}
                                  </div>
                                ) : (
                                  <div className="h-16 flex items-center justify-center text-muted-foreground text-xs">
                                    —
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
