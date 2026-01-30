import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Mail, UserPlus, Info } from 'lucide-react';
import type { Staff } from '@/hooks/useStaff';
import { STAFF_ROLES, getSuggestedRole } from '@/lib/staff-utils';

interface CreateStaffLoginDialogProps {
  staff: Staff;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateStaffLoginDialog({ staff, open, onOpenChange, onSuccess }: CreateStaffLoginDialogProps) {
  const [role, setRole] = useState<string>('teacher');
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Auto-suggest role based on department when dialog opens
  useEffect(() => {
    if (open && staff.department) {
      const suggestedRole = getSuggestedRole(staff.department);
      setRole(suggestedRole);
    }
  }, [open, staff.department]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!staff.email) {
      toast.error('Staff member must have an email address');
      return;
    }

    setIsCreating(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-institution-user', {
        body: {
          email: staff.email,
          firstName: staff.first_name,
          lastName: staff.last_name,
          role: role,
          institutionId: staff.institution_id,
          sendWelcomeEmail: sendWelcomeEmail,
          staffId: staff.id, // Link to staff record
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success('Login credentials created successfully', {
        description: sendWelcomeEmail 
          ? 'Welcome email sent with login instructions' 
          : 'Staff member can now log in with the default password',
      });
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating login:', error);
      toast.error('Failed to create login', { description: error.message });
    } finally {
      setIsCreating(false);
    }
  };

  const suggestedRole = getSuggestedRole(staff.department);
  const isSuggestedRole = role === suggestedRole;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create Login for {staff.first_name} {staff.last_name}
          </DialogTitle>
          <DialogDescription>
            Create a user account so this staff member can log in to the system.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Email</Label>
            <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{staff.email || 'No email set'}</span>
            </div>
          </div>

          {staff.department && (
            <div className="space-y-2">
              <Label className="text-muted-foreground">Department</Label>
              <div className="rounded-md border bg-muted/50 px-3 py-2">
                <span className="text-sm">{staff.department}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
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
            {isSuggestedRole && staff.department && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Info className="h-3 w-3" />
                <span>Suggested based on {staff.department} department</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="send-email" className="text-base">Send Welcome Email</Label>
              <p className="text-sm text-muted-foreground">
                Email login instructions and a temporary password
              </p>
            </div>
            <Switch
              id="send-email"
              checked={sendWelcomeEmail}
              onCheckedChange={setSendWelcomeEmail}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !staff.email}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Login
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
