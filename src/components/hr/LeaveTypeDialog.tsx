import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useLeaveTypes, LeaveType } from '@/hooks/useLeaveTypes';

interface LeaveTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaveType?: LeaveType | null;
}

export function LeaveTypeDialog({ open, onOpenChange, leaveType }: LeaveTypeDialogProps) {
  const [name, setName] = useState('');
  const [daysAllowed, setDaysAllowed] = useState(0);
  const [carryForward, setCarryForward] = useState(false);
  const [requiresApproval, setRequiresApproval] = useState(true);
  
  const { createLeaveType, updateLeaveType } = useLeaveTypes();
  const isEditing = !!leaveType;

  useEffect(() => {
    if (leaveType) {
      setName(leaveType.name);
      setDaysAllowed(leaveType.days_allowed);
      setCarryForward(leaveType.carry_forward);
      setRequiresApproval(leaveType.requires_approval);
    } else {
      setName('');
      setDaysAllowed(0);
      setCarryForward(false);
      setRequiresApproval(true);
    }
  }, [leaveType, open]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    
    if (isEditing && leaveType) {
      await updateLeaveType.mutateAsync({
        id: leaveType.id,
        name,
        days_allowed: daysAllowed,
        carry_forward: carryForward,
        requires_approval: requiresApproval,
      });
    } else {
      await createLeaveType.mutateAsync({
        name,
        days_allowed: daysAllowed,
        carry_forward: carryForward,
        requires_approval: requiresApproval,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Leave Type' : 'Add Leave Type'}</DialogTitle>
        </DialogHeader>
        
        <DialogBody>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Leave Type Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Annual Leave"
              />
            </div>
            
            <div>
              <Label htmlFor="days">Days Allowed Per Year</Label>
              <Input
                id="days"
                type="number"
                min={0}
                value={daysAllowed}
                onChange={(e) => setDaysAllowed(parseInt(e.target.value) || 0)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Carry Forward</Label>
                <p className="text-xs text-muted-foreground">Allow unused days to carry to next year</p>
              </div>
              <Switch checked={carryForward} onCheckedChange={setCarryForward} />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Requires Approval</Label>
                <p className="text-xs text-muted-foreground">Requests need manager approval</p>
              </div>
              <Switch checked={requiresApproval} onCheckedChange={setRequiresApproval} />
            </div>
          </div>
        </DialogBody>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            disabled={!name.trim() || createLeaveType.isPending || updateLeaveType.isPending}
          >
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
