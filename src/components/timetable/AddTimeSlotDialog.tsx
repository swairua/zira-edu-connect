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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import type { TimeSlot } from '@/types/timetable';

interface AddTimeSlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timeSlot: TimeSlot | null;
  onSave: (data: Partial<TimeSlot>) => Promise<void>;
  isLoading: boolean;
}

export function AddTimeSlotDialog({ open, onOpenChange, timeSlot, onSave, isLoading }: AddTimeSlotDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    slot_type: 'lesson',
    start_time: '',
    end_time: '',
    applies_to: 'all',
    is_active: true,
  });

  useEffect(() => {
    if (timeSlot) {
      setFormData({
        name: timeSlot.name,
        slot_type: timeSlot.slot_type,
        start_time: timeSlot.start_time,
        end_time: timeSlot.end_time,
        applies_to: timeSlot.applies_to,
        is_active: timeSlot.is_active,
      });
    } else {
      setFormData({
        name: '',
        slot_type: 'lesson',
        start_time: '',
        end_time: '',
        applies_to: 'all',
        is_active: true,
      });
    }
  }, [timeSlot, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      name: formData.name,
      slot_type: formData.slot_type,
      start_time: formData.start_time,
      end_time: formData.end_time,
      applies_to: formData.applies_to,
      is_active: formData.is_active,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{timeSlot ? 'Edit Time Slot' : 'Add Time Slot'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <DialogBody>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Slot Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Period 1, Break, Lunch"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time *</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time *</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="slot_type">Slot Type</Label>
                  <Select
                    value={formData.slot_type}
                    onValueChange={(value) => setFormData({ ...formData, slot_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lesson">Lesson</SelectItem>
                      <SelectItem value="break">Break</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="assembly">Assembly</SelectItem>
                      <SelectItem value="prep">Prep Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="applies_to">Applies To</Label>
                  <Select
                    value={formData.applies_to}
                    onValueChange={(value) => setFormData({ ...formData, applies_to: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      <SelectItem value="day_scholars">Day Scholars Only</SelectItem>
                      <SelectItem value="boarders">Boarders Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name || !formData.start_time || !formData.end_time}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {timeSlot ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
