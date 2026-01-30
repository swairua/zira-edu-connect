import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Send, Loader2, Plus } from 'lucide-react';
import { useTimetable, useTimetableEntries, usePublishTimetable } from '@/hooks/useTimetables';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { useClasses } from '@/hooks/useClasses';
import { useInstitution } from '@/contexts/InstitutionContext';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { TimetableGrid } from '@/components/timetable/TimetableGrid';
import { TimetableEntryDialog } from '@/components/timetable/TimetableEntryDialog';
import type { TimetableEntry } from '@/types/timetable';

const DAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
];

export default function TimetableEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { institutionId } = useInstitution();
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ dayOfWeek: number; timeSlotId: string } | null>(null);

  const timetableQuery = useTimetable(id!);
  const entriesQuery = useTimetableEntries(id!);
  const slotsQuery = useTimeSlots();
  const classesQuery = useClasses(institutionId);

  const timetable = timetableQuery.data;
  const entries = entriesQuery.data;
  const timeSlots = slotsQuery.data;
  const classes = classesQuery.data;
  const timetableLoading = timetableQuery.isLoading;
  const entriesLoading = entriesQuery.isLoading;
  const slotsLoading = slotsQuery.isLoading;
  const classesLoading = classesQuery.isLoading;
  const publishMutation = usePublishTimetable();

  const isLoading = timetableLoading || entriesLoading || slotsLoading || classesLoading;

  const lessonSlots = timeSlots?.filter(s => s.slot_type === 'lesson' && s.is_active)
    .sort((a, b) => a.sequence_order - b.sequence_order) || [];

  const classEntries = entries?.filter(e => e.class_id === selectedClassId) || [];

  const handlePublish = async () => {
    if (!id) return;
    try {
      await publishMutation.mutateAsync(id);
      toast.success('Timetable published successfully');
    } catch (error) {
      toast.error('Failed to publish timetable');
    }
  };

  const handleCellClick = (dayOfWeek: number, timeSlotId: string) => {
    const existingEntry = classEntries.find(
      e => e.day_of_week === dayOfWeek && e.time_slot_id === timeSlotId
    );
    
    if (existingEntry) {
      setSelectedEntry(existingEntry);
    } else {
      setSelectedEntry(null);
      setSelectedSlot({ dayOfWeek, timeSlotId });
    }
    setEntryDialogOpen(true);
  };

  const handleDialogClose = () => {
    setEntryDialogOpen(false);
    setSelectedEntry(null);
    setSelectedSlot(null);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Loading...">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!timetable) {
    return (
      <DashboardLayout title="Not Found">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Timetable not found</p>
          <Button className="mt-4" onClick={() => navigate('/timetable/manage')}>
            Back to Timetables
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Timetable Editor">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{timetable.name}</h1>
                <Badge variant={timetable.status === 'published' ? 'default' : 'secondary'}>
                  {timetable.status}
                </Badge>
              </div>
              <p className="text-muted-foreground capitalize">
                {timetable.timetable_type.replace('_', ' ')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {timetable.status === 'draft' && (
              <Button onClick={handlePublish} disabled={publishMutation.isPending}>
                {publishMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Send className="mr-2 h-4 w-4" />
                Publish
              </Button>
            )}
          </div>
        </div>

        {/* Class Selector */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select a class to edit" />
                </SelectTrigger>
                <SelectContent>
                  {classes?.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} {cls.stream && `(${cls.stream})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedClassId && (
                <p className="text-sm text-muted-foreground">
                  {classEntries.length} entries configured
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Timetable Grid */}
        {selectedClassId ? (
          <Card>
            <CardHeader>
              <CardTitle>
                {classes?.find(c => c.id === selectedClassId)?.name} Timetable
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TimetableGrid
                days={DAYS}
                timeSlots={lessonSlots}
                entries={classEntries}
                onCellClick={handleCellClick}
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">Select a class to view and edit its timetable</p>
            </CardContent>
          </Card>
        )}

        {/* Entry Dialog */}
        {selectedClassId && (
          <TimetableEntryDialog
            open={entryDialogOpen}
            onOpenChange={handleDialogClose}
            timetableId={id!}
            classId={selectedClassId}
            entry={selectedEntry}
            dayOfWeek={selectedSlot?.dayOfWeek}
            timeSlotId={selectedSlot?.timeSlotId}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
