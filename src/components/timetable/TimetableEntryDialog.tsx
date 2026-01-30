import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Trash2, AlertTriangle, AlertCircle } from 'lucide-react';
import { useSubjects } from '@/hooks/useSubjects';
import { useTeachers } from '@/hooks/useStaff';
import { useRooms } from '@/hooks/useRooms';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useCreateTimetableEntry, useUpdateTimetableEntry, useDeleteTimetableEntry } from '@/hooks/useTimetables';
import { useClashDetection } from '@/hooks/useClashDetection';
import { toast } from 'sonner';
import type { TimetableEntry } from '@/types/timetable';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TimetableEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timetableId: string;
  classId: string;
  entry: TimetableEntry | null;
  dayOfWeek?: number;
  timeSlotId?: string;
}

export function TimetableEntryDialog({
  open,
  onOpenChange,
  timetableId,
  classId,
  entry,
  dayOfWeek,
  timeSlotId,
}: TimetableEntryDialogProps) {
  const { institutionId } = useInstitution();
  const [formData, setFormData] = useState({
    subject_id: '',
    teacher_id: '',
    room_id: '',
    is_double_period: false,
  });

  const subjectsQuery = useSubjects(institutionId);
  const teachersQuery = useTeachers(institutionId);
  const roomsQuery = useRooms();
  
  const subjects = subjectsQuery.data;
  const teachers = teachersQuery.data;
  const rooms = roomsQuery.data;
  const subjectsLoading = subjectsQuery.isLoading;
  const teachersLoading = teachersQuery.isLoading;
  const roomsLoading = roomsQuery.isLoading;
  
  const createMutation = useCreateTimetableEntry();
  const updateMutation = useUpdateTimetableEntry();
  const deleteMutation = useDeleteTimetableEntry();

  // Real-time clash detection
  const { data: clashResult, isLoading: clashLoading } = useClashDetection({
    timetableId,
    teacherId: formData.teacher_id || undefined,
    roomId: formData.room_id || undefined,
    dayOfWeek: dayOfWeek || entry?.day_of_week || 0,
    timeSlotId: timeSlotId || entry?.time_slot_id || '',
    excludeEntryId: entry?.id,
  });

  const hasClash = clashResult?.hasTeacherClash || clashResult?.hasRoomClash;

  useEffect(() => {
    if (entry) {
      setFormData({
        subject_id: entry.subject_id,
        teacher_id: entry.teacher_id,
        room_id: entry.room_id || 'none',
        is_double_period: entry.is_double_period,
      });
    } else {
      setFormData({
        subject_id: '',
        teacher_id: '',
        room_id: 'none',
        is_double_period: false,
      });
    }
  }, [entry, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject_id || !formData.teacher_id) {
      toast.error('Please select subject and teacher');
      return;
    }

    // Warn if there are clashes but allow submission (let database constraints handle it)
    if (hasClash) {
      const proceed = window.confirm(
        'There are scheduling conflicts. The save may fail. Continue anyway?'
      );
      if (!proceed) return;
    }

    try {
      const roomIdValue = formData.room_id === 'none' ? null : formData.room_id;
      
      if (entry) {
        await updateMutation.mutateAsync({
          id: entry.id,
          subject_id: formData.subject_id,
          teacher_id: formData.teacher_id,
          room_id: roomIdValue,
        });
        toast.success('Entry updated successfully');
      } else {
        if (!dayOfWeek || !timeSlotId) {
          toast.error('Missing slot information');
          return;
        }
        await createMutation.mutateAsync({
          timetable_id: timetableId,
          class_id: classId,
          subject_id: formData.subject_id,
          teacher_id: formData.teacher_id,
          room_id: roomIdValue,
          time_slot_id: timeSlotId,
          day_of_week: dayOfWeek,
          is_double_period: formData.is_double_period,
        });
        toast.success('Entry created successfully');
      }
      onOpenChange(false);
    } catch (error: any) {
      if (error.message?.includes('clash') || error.code === '23505') {
        toast.error('Scheduling conflict: This teacher or room is already booked');
      } else {
        toast.error('Failed to save entry');
      }
    }
  };

  const handleDelete = async () => {
    if (!entry) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this entry?');
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(entry.id);
      toast.success('Entry deleted successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to delete entry');
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{entry ? 'Edit Timetable Entry' : 'Add Timetable Entry'}</DialogTitle>
        </DialogHeader>
        
        <DialogBody>
          {/* Real-time clash warnings */}
          {clashResult?.hasTeacherClash && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Teacher Conflict</AlertTitle>
              <AlertDescription>
                This teacher is already scheduled for{' '}
                <strong>{clashResult.teacherClashDetails?.subjectName}</strong> in{' '}
                <strong>{clashResult.teacherClashDetails?.className}</strong> at this time.
              </AlertDescription>
            </Alert>
          )}
          
          {clashResult?.hasRoomClash && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Room Conflict</AlertTitle>
              <AlertDescription>
                This room is already booked by{' '}
                <strong>{clashResult.roomClashDetails?.teacherName}</strong> for{' '}
                <strong>{clashResult.roomClashDetails?.className}</strong> at this time.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Select
              value={formData.subject_id}
              onValueChange={(value) => setFormData({ ...formData, subject_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjectsLoading ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">Loading...</div>
                ) : subjects?.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">No subjects found</div>
                ) : (
                  subjects?.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher">
              Teacher *
              {clashLoading && formData.teacher_id && (
                <Loader2 className="h-3 w-3 animate-spin inline ml-2" />
              )}
            </Label>
            <Select
              value={formData.teacher_id}
              onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}
            >
              <SelectTrigger className={clashResult?.hasTeacherClash ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachersLoading ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">Loading...</div>
                ) : teachers?.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">No teachers found</div>
                ) : (
                  teachers?.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.first_name} {teacher.last_name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="room">
              Room (Optional)
              {clashLoading && formData.room_id && (
                <Loader2 className="h-3 w-3 animate-spin inline ml-2" />
              )}
            </Label>
            <Select
              value={formData.room_id}
              onValueChange={(value) => setFormData({ ...formData, room_id: value })}
            >
              <SelectTrigger className={clashResult?.hasRoomClash ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select room" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No room assigned</SelectItem>
                {roomsLoading ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">Loading...</div>
                ) : (
                  rooms?.filter(r => r.is_active).map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name} {room.capacity && `(${room.capacity})`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {!entry && (
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is_double_period">Double Period</Label>
                <p className="text-xs text-muted-foreground">
                  This entry will span two consecutive periods
                </p>
              </div>
              <Switch
                id="is_double_period"
                checked={formData.is_double_period}
                onCheckedChange={(checked) => setFormData({ ...formData, is_double_period: checked })}
              />
            </div>
          )}

          <DialogFooter className="flex justify-between">
            {entry && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                variant={hasClash ? 'destructive' : 'default'}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {entry ? 'Update' : 'Add'}
                {hasClash && ' (Override)'}
              </Button>
            </div>
          </DialogFooter>
        </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
