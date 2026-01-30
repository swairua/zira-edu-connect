import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useActivityEvents } from '@/hooks/useActivityEvents';
import type { Activity } from '@/hooks/useActivities';

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activities: Activity[];
}

export default function CreateEventDialog({ open, onOpenChange, activities }: CreateEventDialogProps) {
  const { createEvent } = useActivityEvents();
  const [formData, setFormData] = useState({
    activity_id: '',
    event_name: '',
    event_type: 'practice',
    event_date: '',
    start_time: '',
    end_time: '',
    location: '',
    description: '',
  });

  const handleSubmit = async () => {
    if (!formData.activity_id || !formData.event_name || !formData.event_date) return;
    await createEvent.mutateAsync({
      activity_id: formData.activity_id,
      event_name: formData.event_name,
      event_type: formData.event_type,
      event_date: formData.event_date,
      start_time: formData.start_time || undefined,
      end_time: formData.end_time || undefined,
      location: formData.location || undefined,
      description: formData.description || undefined,
    });
    onOpenChange(false);
    setFormData({ activity_id: '', event_name: '', event_type: 'practice', event_date: '', start_time: '', end_time: '', location: '', description: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Activity *</Label>
              <Select value={formData.activity_id} onValueChange={(v) => setFormData(p => ({ ...p, activity_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select activity" /></SelectTrigger>
                <SelectContent>
                  {activities.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Event Name *</Label>
              <Input value={formData.event_name} onChange={(e) => setFormData(p => ({ ...p, event_name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.event_type} onValueChange={(v) => setFormData(p => ({ ...p, event_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="practice">Practice</SelectItem>
                    <SelectItem value="competition">Competition</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="tournament">Tournament</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input type="date" value={formData.event_date} onChange={(e) => setFormData(p => ({ ...p, event_date: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="time" value={formData.start_time} onChange={(e) => setFormData(p => ({ ...p, start_time: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input type="time" value={formData.end_time} onChange={(e) => setFormData(p => ({ ...p, end_time: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={formData.location} onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} rows={2} />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.activity_id || !formData.event_name || !formData.event_date || createEvent.isPending}>
            {createEvent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
