import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Users, MapPin, Clock, Hash } from 'lucide-react';
import { useTimetables, useTimetableEntries } from '@/hooks/useTimetables';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { useClasses } from '@/hooks/useClasses';
import { useInstitution } from '@/contexts/InstitutionContext';
import type { TimetableEntry, DayOfWeek, TimeSlot } from '@/types/timetable';
import { cn } from '@/lib/utils';
import { formatTeacherCode, getSlotTypeStyle, getSlotLabel, isNonLessonSlot } from '@/lib/timetable-utils';

const DAYS: { value: DayOfWeek; label: string }[] = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
];

export default function MasterTimetableView() {
  const { institution } = useInstitution();
  const { data: timetables, isLoading: loadingTimetables } = useTimetables();
  const { data: timeSlots, isLoading: loadingSlots } = useTimeSlots();
  const { data: classes, isLoading: loadingClasses } = useClasses(institution?.id || null);

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(
    Math.min(Math.max(new Date().getDay(), 1), 5) as DayOfWeek
  );
  const [selectedTimetableId, setSelectedTimetableId] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  // Get published timetable
  const publishedTimetable = useMemo(() => {
    if (!timetables) return null;
    if (selectedTimetableId) {
      return timetables.find(t => t.id === selectedTimetableId) || null;
    }
    return timetables.find(t => t.status === 'published') || timetables[0] || null;
  }, [timetables, selectedTimetableId]);

  // Fetch entries for selected timetable
  const { data: allEntries, isLoading: loadingEntries } = useTimetableEntries(publishedTimetable?.id);

  // All active time slots (including breaks)
  const allSlots = useMemo(() => {
    if (!timeSlots) return [];
    return timeSlots
      .filter(s => s.is_active)
      .sort((a, b) => a.sequence_order - b.sequence_order);
  }, [timeSlots]);

  // Get unique levels for filtering
  const levels = useMemo(() => {
    if (!classes) return [];
    const uniqueLevels = [...new Set(classes.map(c => c.level))];
    return uniqueLevels.sort();
  }, [classes]);

  // Filter classes by level
  const filteredClasses = useMemo(() => {
    if (!classes) return [];
    let filtered = classes.filter(c => c.is_active);
    if (levelFilter !== 'all') {
      filtered = filtered.filter(c => c.level === levelFilter);
    }
    return filtered.sort((a, b) => {
      if (a.level !== b.level) return a.level.localeCompare(b.level);
      return a.name.localeCompare(b.name);
    });
  }, [classes, levelFilter]);

  // Get entry for specific class, day, and time slot
  const getEntry = (classId: string, timeSlotId: string): TimetableEntry | undefined => {
    if (!allEntries) return undefined;
    return allEntries.find(
      e => e.class_id === classId && e.day_of_week === selectedDay && e.time_slot_id === timeSlotId
    );
  };

  const isLoading = loadingTimetables || loadingSlots || loadingClasses || loadingEntries;

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold">Master Timetable View</h1>
            <p className="text-sm text-muted-foreground">
              All classes at a glance • {publishedTimetable?.name || 'No timetable selected'}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            {/* Day Selector */}
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm font-medium mb-2 block">Day</label>
              <Select
                value={String(selectedDay)}
                onValueChange={(v) => setSelectedDay(Number(v) as DayOfWeek)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((day) => (
                    <SelectItem key={day.value} value={String(day.value)}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Level Filter */}
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm font-medium mb-2 block">Level</label>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
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

      {/* Legend for slot types */}
      <div className="flex flex-wrap gap-3 text-sm px-1">
        <span className="font-medium">Legend:</span>
        <div className="flex items-center gap-1">
          <div className={cn("w-4 h-4 rounded border", getSlotTypeStyle('break'))} />
          <span>Break</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={cn("w-4 h-4 rounded border", getSlotTypeStyle('lunch'))} />
          <span>Lunch</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={cn("w-4 h-4 rounded border", getSlotTypeStyle('assembly'))} />
          <span>Assembly</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={cn("w-4 h-4 rounded border", getSlotTypeStyle('prep'))} />
          <span>Prep</span>
        </div>
        <span className="text-muted-foreground ml-2">Teacher code: Initials-EmployeeNo (e.g., JO-001)</span>
      </div>

      {/* Master Grid */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {DAYS.find(d => d.value === selectedDay)?.label} Schedule
            <Badge variant="outline" className="ml-2">
              {filteredClasses.length} classes
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredClasses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No classes found. Add classes in Class Setup first.
            </div>
          ) : allSlots.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No time slots configured. Set up periods first.
            </div>
          ) : (
            <ScrollArea className="w-full">
              <div className="min-w-[800px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border p-2 text-left font-medium min-w-[100px] sticky left-0 bg-muted/50 z-10">
                        Time
                      </th>
                      {filteredClasses.map((cls) => (
                        <th
                          key={cls.id}
                          className="border p-2 text-center font-medium min-w-[120px]"
                        >
                          <div className="text-sm">{cls.name}</div>
                          {cls.stream && (
                            <div className="text-xs text-muted-foreground">{cls.stream}</div>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allSlots.map((slot) => {
                      const isNonLesson = isNonLessonSlot(slot.slot_type);
                      
                      // Non-lesson slot row (break, lunch, etc.) - spans all columns
                      if (isNonLesson) {
                        return (
                          <tr key={slot.id} className={cn("", getSlotTypeStyle(slot.slot_type))}>
                            <td className="border p-2 text-sm sticky left-0 z-10" style={{ backgroundColor: 'inherit' }}>
                              <div className="font-medium">{slot.name}</div>
                              <div className="text-xs opacity-75">
                                {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                              </div>
                            </td>
                            <td 
                              colSpan={filteredClasses.length} 
                              className="border p-2 text-center font-medium"
                            >
                              {getSlotLabel(slot.slot_type)}
                            </td>
                          </tr>
                        );
                      }
                      
                      // Lesson slot row
                      return (
                        <tr key={slot.id} className="hover:bg-muted/30">
                          <td className="border p-2 text-sm sticky left-0 bg-background z-10">
                            <div className="font-medium">{slot.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                            </div>
                          </td>
                          {filteredClasses.map((cls) => {
                            const entry = getEntry(cls.id, slot.id);
                            const teacherCode = entry?.teacher 
                              ? formatTeacherCode(entry.teacher.first_name, entry.teacher.last_name, entry.teacher.employee_number)
                              : '';
                            
                            return (
                              <td key={cls.id} className="border p-1">
                                {entry ? (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <button className="w-full p-2 rounded bg-primary/10 hover:bg-primary/20 transition-colors text-left">
                                        <div className="font-medium text-sm truncate">
                                          {entry.subject?.name || 'Subject'}
                                        </div>
                                        <div className="text-xs text-muted-foreground truncate">
                                          {teacherCode} • {entry.room?.name || 'No room'}
                                        </div>
                                      </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64">
                                      <div className="space-y-2">
                                        <h4 className="font-semibold">{entry.subject?.name}</h4>
                                        <div className="text-sm space-y-1">
                                          <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            {entry.teacher?.first_name} {entry.teacher?.last_name}
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Hash className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">Staff #:</span>
                                            {entry.teacher?.employee_number || 'N/A'}
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            {entry.room?.name || 'No room assigned'}
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                                          </div>
                                          {entry.is_double_period && (
                                            <Badge variant="secondary">Double Period</Badge>
                                          )}
                                        </div>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                ) : (
                                  <div className="h-14 flex items-center justify-center text-muted-foreground text-xs">
                                    —
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
