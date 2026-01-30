import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useInstitution } from '@/contexts/InstitutionContext';
import { 
  useReminderSchedules, 
  useCreateReminderSchedule,
  useUpdateReminderSchedule,
  useDeleteReminderSchedule,
  useToggleScheduleActive,
  ReminderSchedule 
} from '@/hooks/useReminderSchedules';
import { Bell, Plus, Edit, Trash2, Clock, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

const reminderTypes = [
  { value: 'upcoming_due', label: 'Upcoming Due Date', description: 'Send before due date' },
  { value: 'due_date', label: 'Due Date', description: 'Send on due date' },
  { value: 'overdue', label: 'Overdue', description: 'Send after due date' },
  { value: 'penalty_applied', label: 'Penalty Applied', description: 'Send when penalty is applied' },
];

const channels = [
  { value: 'sms', label: 'SMS', icon: Smartphone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'in_app', label: 'In-App', icon: Bell },
];

const templatePlaceholders = [
  '{student_name}',
  '{amount}',
  '{balance}',
  '{due_date}',
  '{invoice_number}',
  '{institution_name}',
];

export default function ReminderSchedules() {
  const { institutionId } = useInstitution();
  const { data: schedules = [], isLoading } = useReminderSchedules(institutionId);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ReminderSchedule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    reminder_type: 'upcoming_due',
    days_offset: 3,
    channels: ['sms'] as string[],
    message_template: 'Dear Parent, this is a reminder that {student_name}\'s fee balance of KES {balance} is due on {due_date}. Please make payment to avoid penalties. - {institution_name}',
    send_time: '09:00',
  });

  const createSchedule = useCreateReminderSchedule();
  const updateSchedule = useUpdateReminderSchedule();
  const deleteSchedule = useDeleteReminderSchedule();
  const toggleActive = useToggleScheduleActive();

  const handleOpenCreate = () => {
    setEditingSchedule(null);
    setFormData({
      name: '',
      reminder_type: 'upcoming_due',
      days_offset: 3,
      channels: ['sms'],
      message_template: 'Dear Parent, this is a reminder that {student_name}\'s fee balance of KES {balance} is due on {due_date}. Please make payment to avoid penalties. - {institution_name}',
      send_time: '09:00',
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (schedule: ReminderSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      name: schedule.name,
      reminder_type: schedule.reminder_type,
      days_offset: schedule.days_offset,
      channels: schedule.channels,
      message_template: schedule.message_template,
      send_time: schedule.send_time || '09:00',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionId) return;

    try {
      if (editingSchedule) {
        await updateSchedule.mutateAsync({
          id: editingSchedule.id,
          ...formData,
        });
      } else {
        await createSchedule.mutateAsync({
          institution_id: institutionId,
          ...formData,
        });
      }
      setDialogOpen(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    await deleteSchedule.mutateAsync(id);
  };

  const handleToggleChannel = (channel: string) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel],
    }));
  };

  const getTypeLabel = (type: string) => {
    return reminderTypes.find(t => t.value === type)?.label || type;
  };

  const getOffsetLabel = (type: string, offset: number) => {
    if (type === 'due_date') return 'On due date';
    if (type === 'upcoming_due') return `${Math.abs(offset)} days before`;
    if (type === 'overdue') return `${offset} days after`;
    return `${offset} days`;
  };

  return (
    <DashboardLayout title="Reminder Schedules">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Reminder Schedules</h1>
            <p className="text-muted-foreground">Configure automated payment reminders</p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Schedule
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Schedules</CardTitle>
            <CardDescription>
              Reminders are sent automatically based on invoice due dates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : schedules.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-1">No reminder schedules</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create schedules to automatically send payment reminders
                </p>
                <Button onClick={handleOpenCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Schedule
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Timing</TableHead>
                    <TableHead>Channels</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{schedule.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getTypeLabel(schedule.reminder_type)}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {getOffsetLabel(schedule.reminder_type, schedule.days_offset)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {schedule.channels.map(ch => {
                            const channel = channels.find(c => c.value === ch);
                            const Icon = channel?.icon || Bell;
                            return (
                              <Badge key={ch} variant="secondary" className="gap-1">
                                <Icon className="h-3 w-3" />
                                {channel?.label || ch}
                              </Badge>
                            );
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={schedule.is_active}
                          onCheckedChange={(checked) => toggleActive.mutate({ id: schedule.id, is_active: checked })}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(schedule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(schedule.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingSchedule ? 'Edit Reminder Schedule' : 'Create Reminder Schedule'}
              </DialogTitle>
              <DialogDescription>
                Configure when and how reminders are sent
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Schedule Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., 3-Day Due Date Reminder"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Reminder Type</Label>
                  <Select 
                    value={formData.reminder_type} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, reminder_type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {reminderTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="days">Days Offset</Label>
                  <Input
                    id="days"
                    type="number"
                    value={formData.days_offset}
                    onChange={(e) => setFormData(prev => ({ ...prev, days_offset: Number(e.target.value) }))}
                    disabled={formData.reminder_type === 'due_date'}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.reminder_type === 'upcoming_due' ? 'Days before due date' : 
                     formData.reminder_type === 'overdue' ? 'Days after due date' : 'On due date'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Channels</Label>
                <div className="flex gap-4">
                  {channels.map(channel => (
                    <div key={channel.value} className="flex items-center gap-2">
                      <Checkbox
                        id={channel.value}
                        checked={formData.channels.includes(channel.value)}
                        onCheckedChange={() => handleToggleChannel(channel.value)}
                      />
                      <Label htmlFor={channel.value} className="flex items-center gap-1 cursor-pointer">
                        <channel.icon className="h-4 w-4" />
                        {channel.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="template">Message Template</Label>
                <Textarea
                  id="template"
                  rows={4}
                  value={formData.message_template}
                  onChange={(e) => setFormData(prev => ({ ...prev, message_template: e.target.value }))}
                  required
                />
                <div className="flex flex-wrap gap-1">
                  {templatePlaceholders.map(p => (
                    <Badge 
                      key={p} 
                      variant="outline" 
                      className="cursor-pointer text-xs"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        message_template: prev.message_template + ' ' + p 
                      }))}
                    >
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createSchedule.isPending || updateSchedule.isPending}>
                  {editingSchedule ? 'Save Changes' : 'Create Schedule'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
