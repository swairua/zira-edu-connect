import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useHRStaffAttendance } from '@/hooks/useHRStaffAttendance';
import { useStaff } from '@/hooks/useStaff';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { Users } from 'lucide-react';

interface BulkAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
}

export function BulkAttendanceDialog({ open, onOpenChange, date }: BulkAttendanceDialogProps) {
  const [status, setStatus] = useState<'present' | 'absent' | 'late'>('present');
  const [checkIn, setCheckIn] = useState('09:00');
  
  const { userRoles } = useAuth();
  const institutionId = userRoles.find(r => r.institution_id)?.institution_id || null;
  const { data: staff = [] } = useStaff(institutionId);
  const { bulkMarkAttendance } = useHRStaffAttendance(date);

  const handleSubmit = async () => {
    const records = staff
      .filter(s => s.is_active)
      .map(s => ({
        staff_id: s.id,
        status,
        check_in: status === 'present' || status === 'late' ? checkIn : undefined,
      }));
    
    await bulkMarkAttendance.mutateAsync(records);
    onOpenChange(false);
  };

  const activeStaffCount = staff.filter(s => s.is_active).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark Bulk Attendance</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{activeStaffCount} Staff Members</p>
              <p className="text-sm text-muted-foreground">
                For {format(date, 'EEEE, MMMM dd, yyyy')}
              </p>
            </div>
          </div>
          
          <div>
            <Label>Status for All</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {(status === 'present' || status === 'late') && (
            <div>
              <Label>Check-in Time</Label>
              <Input
                type="time"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            disabled={bulkMarkAttendance.isPending}
          >
            Mark All {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
