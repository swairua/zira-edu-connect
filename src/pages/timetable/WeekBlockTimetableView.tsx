import { useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ArrowLeft, Download, Printer, LayoutGrid } from 'lucide-react';
import { useTimetables, useTimetableEntries } from '@/hooks/useTimetables';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { useClasses } from '@/hooks/useClasses';
import { useInstitution } from '@/contexts/InstitutionContext';
import type { TimetableEntry, TimeSlot } from '@/types/timetable';
import { cn } from '@/lib/utils';
import { generateWeekBlockTimetablePDF } from '@/lib/pdf-generators';
import { toast } from 'sonner';

const DAYS = [
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
];

// Helper to get numeric code from employee_number (last 2 digits)
const getNumericCode = (empNumber?: string): string => {
  if (!empNumber) return '--';
  const num = empNumber.replace(/\D/g, '');
  return num.slice(-2).padStart(2, '0');
};

// Helper to get initials from name
const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

// Get slot type styling
const getSlotTypeStyle = (slotType: string) => {
  switch (slotType) {
    case 'break':
      return 'bg-amber-100 border-amber-300 text-amber-800';
    case 'lunch':
      return 'bg-orange-100 border-orange-300 text-orange-800';
    case 'assembly':
      return 'bg-purple-100 border-purple-300 text-purple-800';
    case 'prep':
      return 'bg-emerald-100 border-emerald-300 text-emerald-800';
    default:
      return '';
  }
};

const getSlotLabel = (slotType: string) => {
  switch (slotType) {
    case 'break': return '☕ Break';
    case 'lunch': return '🍽️ Lunch';
    case 'assembly': return '📢 Assembly';
    case 'prep': return '📚 Prep';
    default: return '';
  }
};

export default function WeekBlockTimetableView() {
  const [selectedTimetableId, setSelectedTimetableId] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  const { institution } = useInstitution();
  const { data: timetables = [], isLoading: loadingTimetables } = useTimetables();
  const { data: timeSlots = [], isLoading: loadingSlots } = useTimeSlots();
  const { data: allClasses = [], isLoading: loadingClasses } = useClasses(institution?.id || null);
  const { data: entries = [], isLoading: loadingEntries } = useTimetableEntries(selectedTimetableId || undefined);

  // Map classes data
  const classes = useMemo(() => {
    return allClasses.map(c => ({
      id: c.id,
      name: c.name,
      level: c.level,
      stream: c.stream,
      is_active: c.is_active ?? true,
    }));
  }, [allClasses]);

  // Get the published or first timetable
  const publishedTimetable = useMemo(() => {
    if (selectedTimetableId) {
      return timetables.find(t => t.id === selectedTimetableId);
    }
    return timetables.find(t => t.status === 'published') || timetables[0];
  }, [timetables, selectedTimetableId]);

  // Initialize selectedTimetableId once
  useMemo(() => {
    if (!selectedTimetableId && publishedTimetable) {
      setSelectedTimetableId(publishedTimetable.id);
    }
  }, [publishedTimetable, selectedTimetableId]);

  // All time slots (including breaks)
  const allSlots = useMemo(() => {
    return timeSlots
      .filter(s => s.is_active)
      .sort((a, b) => a.sequence_order - b.sequence_order);
  }, [timeSlots]);

  // Unique levels for filter
  const uniqueLevels = useMemo(() => {
    const levels = new Set(classes.filter(c => c.is_active).map(c => c.level).filter(Boolean));
    return Array.from(levels).sort();
  }, [classes]);

  // Filtered classes
  const filteredClasses = useMemo(() => {
    return classes
      .filter(c => c.is_active)
      .filter(c => levelFilter === 'all' || c.level === levelFilter)
      .sort((a, b) => {
        const levelCompare = (a.level || '').localeCompare(b.level || '');
        if (levelCompare !== 0) return levelCompare;
        return a.name.localeCompare(b.name);
      });
  }, [classes, levelFilter]);

  // Get entry for a specific class, day, and slot
  const getEntry = (classId: string, dayOfWeek: number, slotId: string): TimetableEntry | undefined => {
    return entries.find(e => 
      e.class_id === classId && 
      e.day_of_week === dayOfWeek && 
      e.time_slot_id === slotId
    );
  };

  // Format class name
  const getClassName = (cls: { name: string; stream?: string }): string => {
    return cls.stream ? `${cls.name} ${cls.stream}` : cls.name;
  };

  // Generate PDF export using professional HTML print window
  const handleDownloadPDF = useCallback(() => {
    if (!publishedTimetable || filteredClasses.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      generateWeekBlockTimetablePDF({
        timetableName: publishedTimetable.name,
        institutionName: institution?.name || 'School',
        classes: filteredClasses,
        timeSlots: allSlots,
        days: DAYS,
        getEntry,
        levelFilter: levelFilter !== 'all' ? levelFilter : undefined,
      });
      toast.success('PDF preview opened - use browser print to save');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    }
  }, [publishedTimetable, filteredClasses, allSlots, institution, levelFilter, getEntry]);

  // Handle print - same as PDF but faster
  const handlePrint = useCallback(() => {
    handleDownloadPDF();
  }, [handleDownloadPDF]);

  const isLoading = loadingTimetables || loadingSlots || loadingClasses || loadingEntries;

  if (isLoading) {
    return (
      <DashboardLayout title="Week Block View">
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Week Block Timetable"
      subtitle="View all classes across the entire week"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/timetable">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">
                {publishedTimetable?.name || 'Select a Timetable'}
              </h2>
              {publishedTimetable && (
                <Badge variant={publishedTimetable.status === 'published' ? 'default' : 'secondary'}>
                  {publishedTimetable.status}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-4">
              <div className="w-48">
                <label className="text-sm font-medium mb-1 block">Timetable</label>
                <Select value={selectedTimetableId} onValueChange={setSelectedTimetableId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timetable" />
                  </SelectTrigger>
                  <SelectContent>
                    {timetables.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} {t.status === 'published' && '✓'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-40">
                <label className="text-sm font-medium mb-1 block">Level</label>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {uniqueLevels.map(level => (
                      <SelectItem key={level} value={level!}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Week Block Grid */}
        <Card className="print:shadow-none print:border-none">
          <CardHeader className="print:hidden">
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5" />
              Full Week Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="w-full">
              <div className="min-w-[1200px]">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr>
                      <th className="border bg-muted/50 p-2 text-left font-medium sticky left-0 z-10 bg-muted min-w-[100px]">
                        Class
                      </th>
                      {DAYS.map(day => (
                        <th key={day.value} className="border bg-muted/50 p-2 text-center font-medium min-w-[180px]">
                          {day.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClasses.map(cls => (
                      <tr key={cls.id}>
                        <td className="border p-2 font-medium sticky left-0 bg-background z-10 align-top">
                          {getClassName(cls)}
                        </td>
                        {DAYS.map(day => (
                          <td key={day.value} className="border p-1 align-top">
                            <div className="space-y-0.5">
                              {allSlots.map(slot => {
                                const isNonLesson = slot.slot_type !== 'lesson';
                                const entry = isNonLesson ? null : getEntry(cls.id, day.value, slot.id);
                                
                                // Non-lesson slots (breaks, lunch, etc.)
                                if (isNonLesson) {
                                  return (
                                    <div
                                      key={slot.id}
                                      className={cn(
                                        "px-1 py-0.5 rounded text-[10px] text-center font-medium border",
                                        getSlotTypeStyle(slot.slot_type)
                                      )}
                                    >
                                      {getSlotLabel(slot.slot_type)}
                                    </div>
                                  );
                                }

                                // Lesson slot with entry
                                if (entry) {
                                  const teacherCode = entry.teacher?.employee_number 
                                    ? `${getInitials(entry.teacher.first_name, entry.teacher.last_name)}-${getNumericCode(entry.teacher.employee_number)}`
                                    : getInitials(entry.teacher?.first_name || '', entry.teacher?.last_name || '');
                                  
                                  return (
                                    <div
                                      key={slot.id}
                                      className="px-1 py-0.5 rounded text-[10px] bg-primary/10 border border-primary/20"
                                      title={`${slot.name}: ${entry.subject?.name || 'N/A'} - ${entry.teacher?.first_name} ${entry.teacher?.last_name} (${entry.teacher?.employee_number || 'N/A'})`}
                                    >
                                      <span className="font-medium">{entry.subject?.name?.substring(0, 8) || 'N/A'}</span>
                                      <span className="text-muted-foreground ml-1">({teacherCode})</span>
                                    </div>
                                  );
                                }

                                // Empty lesson slot
                                return (
                                  <div
                                    key={slot.id}
                                    className="px-1 py-0.5 rounded text-[10px] bg-muted/30 text-muted-foreground text-center"
                                  >
                                    -
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="print:hidden">
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="font-medium">Legend:</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-amber-100 border border-amber-300" />
                <span>Break</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-orange-100 border border-orange-300" />
                <span>Lunch</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-purple-100 border border-purple-300" />
                <span>Assembly</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-300" />
                <span>Prep</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-primary/10 border border-primary/20" />
                <span>Lesson</span>
              </div>
              <span className="text-muted-foreground ml-4">Teacher codes: Initials-EmployeeNo (e.g., JO-001)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
