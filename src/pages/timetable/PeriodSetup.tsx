import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, Plus, Edit, Trash2, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';
import { useTimeSlots, useCreateTimeSlot, useUpdateTimeSlot, useDeleteTimeSlot, useTimeSlotUsage } from '@/hooks/useTimeSlots';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { AddTimeSlotDialog } from '@/components/timetable/AddTimeSlotDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { TimeSlot } from '@/types/timetable';

export default function PeriodSetup() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editSlot, setEditSlot] = useState<TimeSlot | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: timeSlots, isLoading } = useTimeSlots();
  const createMutation = useCreateTimeSlot();
  const updateMutation = useUpdateTimeSlot();
  const deleteMutation = useDeleteTimeSlot();
  
  // Fetch usage for the slot being deleted
  const { data: usageData, isLoading: isLoadingUsage } = useTimeSlotUsage(deleteId);

  const sortedSlots = [...(timeSlots || [])].sort((a, b) => a.sequence_order - b.sequence_order);

  const handleSave = async (data: Partial<TimeSlot>) => {
    try {
      if (editSlot) {
        await updateMutation.mutateAsync({ id: editSlot.id, ...data });
        toast.success('Time slot updated successfully');
      } else {
        const nextOrder = sortedSlots.length > 0 
          ? Math.max(...sortedSlots.map(s => s.sequence_order)) + 1 
          : 1;
        await createMutation.mutateAsync({ 
          ...data, 
          sequence_order: data.sequence_order || nextOrder 
        } as Omit<TimeSlot, 'id' | 'created_at' | 'updated_at' | 'institution_id'>);
        toast.success('Time slot created successfully');
      }
      setDialogOpen(false);
      setEditSlot(null);
    } catch (error) {
      toast.error('Failed to save time slot');
    }
  };

  const handleDelete = async () => {
    if (!deleteId || (usageData?.count && usageData.count > 0)) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('Time slot deleted successfully');
      setDeleteId(null);
    } catch (error) {
      toast.error('Failed to delete time slot');
    }
  };

  const handleEdit = (slot: TimeSlot) => {
    setEditSlot(slot);
    setDialogOpen(true);
  };

  const moveSlot = async (slot: TimeSlot, direction: 'up' | 'down') => {
    const index = sortedSlots.findIndex(s => s.id === slot.id);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (swapIndex < 0 || swapIndex >= sortedSlots.length) return;
    
    const swapSlot = sortedSlots[swapIndex];
    
    try {
      await updateMutation.mutateAsync({ id: slot.id, sequence_order: swapSlot.sequence_order });
      await updateMutation.mutateAsync({ id: swapSlot.id, sequence_order: slot.sequence_order });
      toast.success('Order updated');
    } catch (error) {
      toast.error('Failed to reorder');
    }
  };

  const getSlotTypeColor = (type: string) => {
    switch (type) {
      case 'lesson': return 'default';
      case 'break': return 'secondary';
      case 'lunch': return 'outline';
      case 'assembly': return 'default';
      default: return 'secondary';
    }
  };

  const isInUse = usageData?.count && usageData.count > 0;

  return (
    <DashboardLayout title="Period Setup">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Period Setup</h1>
            <p className="text-muted-foreground">Define time slots and breaks for the school day</p>
          </div>
          <Button onClick={() => { setEditSlot(null); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Time Slot
          </Button>
        </div>

        {/* Time Slots Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Slots ({sortedSlots.length})
            </CardTitle>
            <CardDescription>
              Define the periods, breaks, and other time slots for scheduling
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : sortedSlots.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Order</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Applies To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSlots.map((slot, index) => (
                    <TableRow key={slot.id}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            disabled={index === 0}
                            onClick={() => moveSlot(slot, 'up')}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            disabled={index === sortedSlots.length - 1}
                            onClick={() => moveSlot(slot, 'down')}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{slot.name}</TableCell>
                      <TableCell>{slot.start_time}</TableCell>
                      <TableCell>{slot.end_time}</TableCell>
                      <TableCell>
                        <Badge variant={getSlotTypeColor(slot.slot_type)}>
                          {slot.slot_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">{slot.applies_to.replace('_', ' ')}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={slot.is_active ? 'default' : 'secondary'}>
                            {slot.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {slot.usage_count && slot.usage_count > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {slot.usage_count} {slot.usage_count === 1 ? 'entry' : 'entries'}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(slot)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteId(slot.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No time slots configured</p>
                <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Time Slot
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <AddTimeSlotDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          timeSlot={editSlot}
          onSave={handleSave}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                {isInUse && <AlertTriangle className="h-5 w-5 text-destructive" />}
                {isInUse ? 'Cannot Delete Time Slot' : 'Delete Time Slot?'}
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div>
                  {isLoadingUsage ? (
                    <span>Checking dependencies...</span>
                  ) : isInUse ? (
                    <div className="space-y-2">
                      <p className="text-destructive font-medium">
                        This time slot is used in {usageData.count} timetable {usageData.count === 1 ? 'entry' : 'entries'}.
                      </p>
                      {usageData.timetables.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Used in: {usageData.timetables.join(', ')}
                        </p>
                      )}
                      <p className="text-sm">
                        You must remove or reassign these entries before deleting this slot.
                      </p>
                    </div>
                  ) : (
                    <span>This will permanently delete the time slot. This action cannot be undone.</span>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              {!isInUse && (
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isLoadingUsage || deleteMutation.isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
