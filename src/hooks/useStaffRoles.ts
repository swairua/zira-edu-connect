import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logAuditEvent } from '@/hooks/useAuditLogs';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  institution_id: string | null;
  granted_by: string | null;
  granted_at: string | null;
}

export const ASSIGNABLE_INSTITUTION_ROLES: { value: AppRole; label: string; description: string }[] = [
  { value: 'institution_owner', label: 'Institution Owner', description: 'Full ownership and administrative access' },
  { value: 'institution_admin', label: 'Institution Admin', description: 'Full institution management access' },
  { value: 'academic_director', label: 'Academic Director', description: 'Manages academic setup and results' },
  { value: 'finance_officer', label: 'Finance Officer', description: 'Manages fees, payments, and invoices' },
  { value: 'accountant', label: 'Accountant', description: 'Views and manages financial records' },
  { value: 'bursar', label: 'Bursar', description: 'Manages school finances and payments' },
  { value: 'hr_manager', label: 'HR Manager', description: 'Manages staff records and payroll' },
  { value: 'ict_admin', label: 'ICT Admin', description: 'Manages system settings and technical configuration' },
  { value: 'teacher', label: 'Teacher', description: 'Manages classes, grades, and assignments' },
  { value: 'coach', label: 'Coach', description: 'Manages sports activities and teams' },
  { value: 'librarian', label: 'Librarian', description: 'Manages library resources and book loans' },
];

/**
 * Hook to fetch all roles for a specific user at a specific institution
 */
export function useStaffRoles(userId: string | null, institutionId: string | null) {
  return useQuery({
    queryKey: ['staff-roles', userId, institutionId],
    queryFn: async () => {
      if (!userId || !institutionId) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('institution_id', institutionId);
      
      if (error) throw error;
      return data as UserRole[];
    },
    enabled: !!userId && !!institutionId,
  });
}

/**
 * Hook to add a role to a staff member
 */
export function useAddStaffRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      role, 
      institutionId,
      staffName 
    }: { 
      userId: string; 
      role: AppRole; 
      institutionId: string;
      staffName: string;
    }) => {
      // Check if role already exists
      const { data: existing } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role', role)
        .eq('institution_id', institutionId)
        .maybeSingle();
      
      if (existing) {
        throw new Error('This role is already assigned to this staff member');
      }
      
      // Get current user for granted_by
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role,
          institution_id: institutionId,
          granted_by: user?.id || null,
          granted_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Log audit event
      await logAuditEvent({
        action: 'CREATE',
        entityType: 'user_roles',
        entityId: data.id,
        institutionId,
        metadata: {
          user_id: userId,
          staff_name: staffName,
          role_added: role,
        },
      });
      
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staff-roles', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      const roleLabel = ASSIGNABLE_INSTITUTION_ROLES.find(r => r.value === variables.role)?.label || variables.role;
      toast.success('Role added', {
        description: `${roleLabel} role has been assigned to ${variables.staffName}`,
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to add role', { description: error.message });
    },
  });
}

/**
 * Hook to remove a role from a staff member
 */
export function useRemoveStaffRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      roleId, 
      userId, 
      role,
      institutionId,
      staffName,
      remainingRolesCount,
    }: { 
      roleId: string;
      userId: string; 
      role: AppRole; 
      institutionId: string;
      staffName: string;
      remainingRolesCount: number;
    }) => {
      // Prevent removing the last role
      if (remainingRolesCount <= 1) {
        throw new Error('Cannot remove the last role. Staff members must have at least one role.');
      }
      
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);
      
      if (error) throw error;
      
      // Log audit event
      await logAuditEvent({
        action: 'DELETE',
        entityType: 'user_roles',
        entityId: roleId,
        institutionId,
        metadata: {
          user_id: userId,
          staff_name: staffName,
          role_removed: role,
        },
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staff-roles', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      const roleLabel = ASSIGNABLE_INSTITUTION_ROLES.find(r => r.value === variables.role)?.label || variables.role;
      toast.success('Role removed', {
        description: `${roleLabel} role has been removed from ${variables.staffName}`,
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to remove role', { description: error.message });
    },
  });
}
