import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Shield } from 'lucide-react';
import type { Staff } from '@/hooks/useStaff';
import { logAuditEvent } from '@/hooks/useAuditLogs';

interface EditStaffRoleDialogProps {
  staff: Staff;
  currentRole: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const STAFF_ROLES = [
  { value: 'teacher', label: 'Teacher', description: 'Can manage classes, grades, and assignments' },
  { value: 'finance_officer', label: 'Finance Officer', description: 'Can manage fees, payments, and invoices' },
  { value: 'accountant', label: 'Accountant', description: 'Can view and manage financial records' },
  { value: 'hr_manager', label: 'HR Manager', description: 'Can manage staff records' },
  { value: 'academic_director', label: 'Academic Director', description: 'Can manage academic setup and results' },
  { value: 'ict_admin', label: 'ICT Admin', description: 'Can manage system settings' },
  { value: 'institution_admin', label: 'Institution Admin', description: 'Full institution management access' },
];

export function EditStaffRoleDialog({ staff, currentRole, open, onOpenChange, onSuccess }: EditStaffRoleDialogProps) {
  const [role, setRole] = useState<string>(currentRole);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (open) {
      setRole(currentRole);
    }
  }, [open, currentRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!staff.user_id) {
      toast.error('Staff member does not have a user account');
      return;
    }

    if (role === currentRole) {
      onOpenChange(false);
      return;
    }

    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: role as any })
        .eq('user_id', staff.user_id)
        .eq('institution_id', staff.institution_id);

      if (error) throw error;

      // Log the role change
      await logAuditEvent({
        action: 'UPDATE',
        entityType: 'user_roles',
        entityId: staff.user_id,
        institutionId: staff.institution_id,
        metadata: {
          staff_id: staff.id,
          staff_name: `${staff.first_name} ${staff.last_name}`,
          old_role: currentRole,
          new_role: role,
        },
      });

      toast.success('Role updated successfully', {
        description: `${staff.first_name} ${staff.last_name} is now a ${STAFF_ROLES.find(r => r.value === role)?.label}`,
      });
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role', { description: error.message });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Change Role for {staff.first_name} {staff.last_name}
          </DialogTitle>
          <DialogDescription>
            Update the system role for this staff member. This will change their access permissions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Current Role</Label>
            <div className="rounded-md border bg-muted/50 px-3 py-2">
              <span className="text-sm font-medium">
                {STAFF_ROLES.find(r => r.value === currentRole)?.label || currentRole}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-role">New Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="new-role">
                <SelectValue placeholder="Select new role" />
              </SelectTrigger>
              <SelectContent>
                {STAFF_ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    <div className="flex flex-col">
                      <span>{r.label}</span>
                      <span className="text-xs text-muted-foreground">{r.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating || role === currentRole}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Role
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
