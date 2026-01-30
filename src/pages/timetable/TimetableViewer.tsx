import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Users, MapPin, Printer, Edit, Download } from 'lucide-react';
import { useTimetable, useTimetableEntries } from '@/hooks/useTimetables';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { useClasses } from '@/hooks/useClasses';
import { useInstitution } from '@/contexts/InstitutionContext';
import { generateTimetablePDF } from '@/lib/pdf-generators';
import type { TimetableEntry, DayOfWeek } from '@/types/timetable';

const DAYS: { value: DayOfWeek; label: string; short: string }[] = [
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
];

// Helper to get teacher initials
const getTeacherInitials = (teacher: { first_name?: string; last_name?: string } | null | undefined): string => {
  if (!teacher) return '';
  const first = teacher.first_name?.[0] || '';
  const last = teacher.last_name?.[0] || '';
  return `${first}${last}`.toUpperCase();
};

// Helper to get subject abbreviation (first 4 chars or acronym)
const getSubjectAbbr = (name: string | undefined): string => {
  if (!name) return '';
  // If name has multiple words, use initials
  const words = name.split(' ');
  if (words.length > 1) {
    return words.map(w => w[0]).join('').toUpperCase().slice(0, 4);
  }
  return name.slice(0, 4).toUpperCase();
};

export default function TimetableViewer() {
  const { id } = useParams<{ id: string }>();
  const { institution } = useInstitution();
  const { data: timetable, isLoading: loadingTimetable } = useTimetable(id);
  const { data: timeSlots, isLoading: loadingSlots } = useTimeSlots();
  const { data: classes, isLoading: loadingClasses } = useClasses(institution?.id || null);
  const { data: entries, isLoading: loadingEntries } = useTimetableEntries(id);

  const [selectedClassId, setSelectedClassId] = useState<string>('');

  // Filter to lesson slots only
  const lessonSlots = useMemo(() => {
    if (!timeSlots) return [];
    return timeSlots
      .filter(s => s.slot_type === 'lesson' && s.is_active)
      .sort((a, b) => a.sequence_order - b.sequence_order);
  }, [timeSlots]);

  // Filter active classes
  const activeClasses = useMemo(() => {
    if (!classes) return [];
    return classes.filter(c => c.is_active).sort((a, b) => {
      if (a.level !== b.level) return a.level.localeCompare(b.level);
      return a.name.localeCompare(b.name);
    });
  }, [classes]);

  // Get selected class entries
  const classEntries = useMemo(() => {
    if (!entries || !selectedClassId) return [];
    return entries.filter(e => e.class_id === selectedClassId);
  }, [entries, selectedClassId]);

  // Get entry for specific day and time slot
  const getEntry = (dayOfWeek: DayOfWeek, timeSlotId: string): TimetableEntry | undefined => {
    return classEntries.find(
      e => e.day_of_week === dayOfWeek && e.time_slot_id === timeSlotId
    );
  };

  // Auto-select first class if none selected
  useMemo(() => {
    if (!selectedClassId && activeClasses.length > 0) {
      setSelectedClassId(activeClasses[0].id);
    }
  }, [activeClasses, selectedClassId]);

  const selectedClass = activeClasses.find(c => c.id === selectedClassId);
  const isLoading = loadingTimetable || loadingSlots || loadingClasses || loadingEntries;

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!timetable) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Timetable not found</p>
          <Button className="mt-4" asChild>
            <Link to="/timetable/manage">Back to Timetables</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header - Hidden on Print */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/timetable/manage">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{timetable.name}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="capitalize">{timetable.timetable_type.replace('_', ' ')}</span>
              <Badge variant={timetable.status === 'published' ? 'default' : 'secondary'}>
                {timetable.status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              if (!selectedClass || !timetable) return;
              
              // Build entries map for quick lookup
              const entriesMap = new Map();
              classEntries.forEach(entry => {
                entriesMap.set(`${entry.day_of_week}-${entry.time_slot_id}`, {
                  subject: entry.subject,
                  teacher: entry.teacher,
                  room: entry.room
                });
              });
              
              generateTimetablePDF({
                timetable,
                className: selectedClass.name + (selectedClass.stream ? ` (${selectedClass.stream})` : ''),
                classLevel: selectedClass.level,
                timeSlots: lessonSlots.map(s => ({ id: s.id, name: s.name, start_time: s.start_time, end_time: s.end_time })),
                days: DAYS,
                entries: entriesMap,
                institutionName: institution?.name || 'School'
              });
            }}
            disabled={!selectedClass}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button asChild>
            <Link to={`/timetable/${id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Class Selector - Hidden on Print */}
      <Card className="print:hidden">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[250px]">
              <label className="text-sm font-medium mb-2 block">Select Class</label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a class..." />
                </SelectTrigger>
                <SelectContent>
                  {activeClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} {cls.stream && `(${cls.stream})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedClass && (
              <div className="text-sm text-muted-foreground">
                Level: {selectedClass.level} • {classEntries.length} scheduled lessons
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ===== PRINT-ONLY COMPACT TIMETABLE ===== */}
      <div className="hidden print:block">
        {/* Print Header */}
        <div className="timetable-print-header flex justify-between items-start">
          <div>
            <h1>{institution?.name || 'School Timetable'}</h1>
            <p>{timetable.name} • {timetable.timetable_type.replace('_', ' ')}</p>
          </div>
          <div className="text-right">
            <h1>{selectedClass?.name} {selectedClass?.stream && `(${selectedClass.stream})`}</h1>
            <p>Level: {selectedClass?.level}</p>
          </div>
        </div>

        {/* Compact Print Table */}
        {lessonSlots.length > 0 && selectedClassId && (
          <table className="timetable-print-table">
            <thead>
              <tr>
                <th className="w-[60px] text-left">Time</th>
                {DAYS.map((day) => (
                  <th key={day.value} className="text-center">
                    {day.short}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lessonSlots.map((slot) => (
                <tr key={slot.id}>
                  <td className="text-[10px] leading-tight">
                    <div className="font-semibold">{slot.name}</div>
                    <div>{slot.start_time?.slice(0, 5)}-{slot.end_time?.slice(0, 5)}</div>
                  </td>
                  {DAYS.map((day) => {
                    const entry = getEntry(day.value, slot.id);
                    return (
                      <td key={day.value}>
                        {entry ? (
                          <div className="timetable-print-cell">
                            <div className="subject-name">{entry.subject?.name || 'No Subject'}</div>
                            <div className="teacher-name">
                              {entry.teacher ? `${entry.teacher.first_name} ${entry.teacher.last_name}` : ''}
                            </div>
                            {entry.room?.name && (
                              <div className="room-name">📍 {entry.room.name}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-center block">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ===== SCREEN-ONLY FULL TIMETABLE ===== */}
      <Card className="print:hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {selectedClass?.name} Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedClassId ? (
            <div className="text-center py-12 text-muted-foreground">
              Select a class to view its timetable
            </div>
          ) : lessonSlots.length === 0 ? (
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
                    <tr key={slot.id}>
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
                                <div className="font-medium">{entry.subject?.name}</div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Users className="h-3 w-3" />
                                  {entry.teacher?.first_name} {entry.teacher?.last_name}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {entry.room?.name || 'No room'}
                                </div>
                                {entry.is_double_period && (
                                  <Badge variant="secondary" className="mt-1 text-xs">
                                    Double Period
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
    </div>
  );
}
