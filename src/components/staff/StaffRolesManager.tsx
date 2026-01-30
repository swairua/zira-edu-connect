import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Shield, Trash2, UserCog } from 'lucide-react';
import { useStaffRoles, useAddStaffRole, useRemoveStaffRole, ASSIGNABLE_INSTITUTION_ROLES } from '@/hooks/useStaffRoles';
import type { Staff } from '@/hooks/useStaff';
import type { Database } from '@/integrations/supabase/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type AppRole = Database['public']['Enums']['app_role'];

interface StaffRolesManagerProps {
  staff: Staff;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function StaffRolesManager({ staff, open, onOpenChange, onSuccess }: StaffRolesManagerProps) {
  const [showAddRole, setShowAddRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AppRole | ''>('');
  const [roleToRemove, setRoleToRemove] = useState<{ id: string; role: AppRole } | null>(null);
  
  const { data: roles = [], isLoading } = useStaffRoles(staff.user_id, staff.institution_id);
  const addRole = useAddStaffRole();
  const removeRole = useRemoveStaffRole();
  
  const staffName = `${staff.first_name} ${staff.last_name}`;
  
  // Get roles that aren't already assigned
  const availableRoles = ASSIGNABLE_INSTITUTION_ROLES.filter(
    r => !roles.some(ur => ur.role === r.value)
  );
  
  const handleAddRole = async () => {
    if (!selectedRole || !staff.user_id) return;
    
    await addRole.mutateAsync({
      userId: staff.user_id,
      role: selectedRole,
      institutionId: staff.institution_id,
      staffName,
    });
    
    setSelectedRole('');
    setShowAddRole(false);
    onSuccess?.();
  };
  
  const handleRemoveRole = async () => {
    if (!roleToRemove || !staff.user_id) return;
    
    await removeRole.mutateAsync({
      roleId: roleToRemove.id,
      userId: staff.user_id,
      role: roleToRemove.role,
      institutionId: staff.institution_id,
      staffName,
      remainingRolesCount: roles.length,
    });
    
    setRoleToRemove(null);
    onSuccess?.();
  };
  
  const getRoleInfo = (role: AppRole) => {
    return ASSIGNABLE_INSTITUTION_ROLES.find(r => r.value === role) || { label: role, description: '' };
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Manage Roles for {staffName}
            </DialogTitle>
            <DialogDescription>
              Assign multiple roles to this staff member. Each role grants specific permissions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Current Roles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Current Roles</h4>
                <Badge variant="secondary">{roles.length} role(s)</Badge>
              </div>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : roles.length === 0 ? (
                <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                  No roles assigned yet. Add a role below.
                </div>
              ) : (
                <div className="space-y-2">
                  {roles.map((userRole) => {
                    const roleInfo = getRoleInfo(userRole.role);
                    return (
                      <div
                        key={userRole.id}
                        className="flex items-start justify-between rounded-lg border bg-card p-3"
                      >
                        <div className="flex items-start gap-3">
                          <Shield className="mt-0.5 h-4 w-4 text-primary" />
                          <div>
                            <p className="font-medium text-sm">{roleInfo.label}</p>
                            <p className="text-xs text-muted-foreground">{roleInfo.description}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setRoleToRemove({ id: userRole.id, role: userRole.role })}
                          disabled={roles.length <= 1}
                          title={roles.length <= 1 ? 'Cannot remove the last role' : 'Remove role'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Add New Role */}
            {showAddRole ? (
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <h4 className="text-sm font-medium">Add New Role</h4>
                <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as AppRole)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.length === 0 ? (
                      <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                        All available roles are already assigned
                      </div>
                    ) : (
                      availableRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex flex-col">
                            <span>{role.label}</span>
                            <span className="text-xs text-muted-foreground">{role.description}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowAddRole(false);
                      setSelectedRole('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddRole}
                    disabled={!selectedRole || addRole.isPending}
                  >
                    {addRole.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Role
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowAddRole(true)}
                disabled={availableRoles.length === 0}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Another Role
              </Button>
            )}
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Remove Role Dialog */}
      <AlertDialog open={!!roleToRemove} onOpenChange={(open) => !open && setRoleToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the{' '}
              <strong>{roleToRemove && getRoleInfo(roleToRemove.role).label}</strong>{' '}
              role from {staffName}? This will revoke the permissions associated with this role.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveRole}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeRole.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
