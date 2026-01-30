import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface StaffModuleAccess {
  id: string;
  user_id: string;
  institution_id: string;
  module_id: string;
  granted_by: string | null;
  granted_at: string;
  expires_at: string | null;
}

interface GrantAccessParams {
  userId: string;
  institutionId: string;
  moduleId: string;
  expiresAt?: string;
}

interface RevokeAccessParams {
  userId: string;
  institutionId: string;
  moduleId: string;
}

// Default modules by role
const ROLE_DEFAULT_MODULES: Record<string, string[]> = {
  institution_owner: ['academics', 'finance', 'hr', 'communication', 'reports', 'settings', 'library', 'transport', 'hostel', 'inventory', 'activities'],
  institution_admin: ['academics', 'finance', 'hr', 'communication', 'reports', 'settings'],
  finance_officer: ['finance', 'reports'],
  accountant: ['finance'],
  bursar: ['finance', 'reports'],
  academic_director: ['academics', 'reports'],
  teacher: ['academics'],
  hr_manager: ['hr'],
  ict_admin: ['settings'],
  librarian: ['library'],
};

export function useStaffModuleAccess(userId?: string, institutionId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch modules the staff member has explicit access to
  const { data: explicitAccess = [], isLoading, error } = useQuery({
    queryKey: ['staff-module-access', userId, institutionId],
    queryFn: async () => {
      if (!userId || !institutionId) return [];

      const { data, error } = await supabase
        .from('staff_module_access')
        .select('*')
        .eq('user_id', userId)
        .eq('institution_id', institutionId);

      if (error) {
        console.error('Error fetching staff module access:', error);
        return [];
      }

      return data as StaffModuleAccess[];
    },
    enabled: !!userId && !!institutionId,
  });

  // Fetch user's roles to determine default modules
  const { data: userRoles = [] } = useQuery({
    queryKey: ['user-roles', userId, institutionId],
    queryFn: async () => {
      if (!userId) return [];

      const query = supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (institutionId) {
        query.eq('institution_id', institutionId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }

      return data.map(r => r.role);
    },
    enabled: !!userId,
  });

  // Get default modules based on role
  const roleDefaultModules = userRoles.flatMap(role => ROLE_DEFAULT_MODULES[role] || []);

  // Get explicit module IDs
  const explicitModuleIds = explicitAccess
    .filter(a => !a.expires_at || new Date(a.expires_at) > new Date())
    .map(a => a.module_id);

  // Combined accessible modules (deduplicated)
  const accessibleModules = [...new Set([...roleDefaultModules, ...explicitModuleIds])];

  // Check if user can access a specific module
  const canAccessModule = (moduleId: string): boolean => {
    return accessibleModules.includes(moduleId);
  };

  // Check if user has explicit access (not from role)
  const hasExplicitAccess = (moduleId: string): boolean => {
    return explicitModuleIds.includes(moduleId);
  };

  // Grant access mutation
  const grantAccess = useMutation({
    mutationFn: async ({ userId, institutionId, moduleId, expiresAt }: GrantAccessParams) => {
      const { error } = await supabase
        .from('staff_module_access')
        .upsert({
          user_id: userId,
          institution_id: institutionId,
          module_id: moduleId,
          granted_by: user?.id,
          expires_at: expiresAt || null,
        }, {
          onConflict: 'user_id,institution_id,module_id',
        });

      if (error) throw error;

      // Log to audit
      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        action: 'grant_module_access',
        entity_type: 'staff_module_access',
        entity_id: userId,
        institution_id: institutionId,
        metadata: { module_id: moduleId, expires_at: expiresAt },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-module-access'] });
      toast.success('Module access granted');
    },
    onError: (error) => {
      console.error('Error granting access:', error);
      toast.error('Failed to grant module access');
    },
  });

  // Revoke access mutation
  const revokeAccess = useMutation({
    mutationFn: async ({ userId, institutionId, moduleId }: RevokeAccessParams) => {
      const { error } = await supabase
        .from('staff_module_access')
        .delete()
        .eq('user_id', userId)
        .eq('institution_id', institutionId)
        .eq('module_id', moduleId);

      if (error) throw error;

      // Log to audit
      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        action: 'revoke_module_access',
        entity_type: 'staff_module_access',
        entity_id: userId,
        institution_id: institutionId,
        metadata: { module_id: moduleId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-module-access'] });
      toast.success('Module access revoked');
    },
    onError: (error) => {
      console.error('Error revoking access:', error);
      toast.error('Failed to revoke module access');
    },
  });

  return {
    accessibleModules,
    explicitAccess,
    roleDefaultModules,
    isLoading,
    error: error as Error | null,
    canAccessModule,
    hasExplicitAccess,
    grantAccess,
    revokeAccess,
  };
}

// Hook for checking current user's module access
export function useMyModuleAccess(institutionId?: string) {
  const { user } = useAuth();
  return useStaffModuleAccess(user?.id, institutionId);
}
