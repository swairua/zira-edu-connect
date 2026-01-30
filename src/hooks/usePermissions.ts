import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Permission, PermissionDomain, PermissionAction } from '@/types/permissions';

export function usePermissions(institutionId?: string) {
  const { user, isSuperAdmin } = useAuth();

  const { data: permissions = [], isLoading, error } = useQuery({
    queryKey: ['user-permissions', user?.id, institutionId],
    queryFn: async () => {
      if (!user) return [];

      // Super admins have all permissions - return early
      if (isSuperAdmin) {
        const { data } = await supabase
          .from('permissions')
          .select('domain, action, name');
        
        return (data || []).map(p => ({
          domain: p.domain as PermissionDomain,
          action: p.action as PermissionAction,
          permission_name: p.name,
        }));
      }

      // Use the database function to get user permissions
      const { data, error } = await supabase
        .rpc('get_user_permissions', {
          _user_id: user.id,
          _institution_id: institutionId || null,
        });

      if (error) {
        console.error('Error fetching permissions:', error);
        return [];
      }

      return (data || []).map((p: { domain: string; action: string; permission_name: string }) => ({
        domain: p.domain as PermissionDomain,
        action: p.action as PermissionAction,
        permission_name: p.permission_name,
      }));
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  /**
   * Check if user has a specific permission
   */
  const can = (domain: PermissionDomain, action: PermissionAction): boolean => {
    if (isSuperAdmin) return true;
    return permissions.some(p => p.domain === domain && p.action === action);
  };

  /**
   * Check if user has any of the specified actions on a domain
   */
  const canAny = (domain: PermissionDomain, actions: PermissionAction[]): boolean => {
    if (isSuperAdmin) return true;
    return actions.some(action => can(domain, action));
  };

  /**
   * Check if user has all of the specified actions on a domain
   */
  const canAll = (domain: PermissionDomain, actions: PermissionAction[]): boolean => {
    if (isSuperAdmin) return true;
    return actions.every(action => can(domain, action));
  };

  /**
   * Check if user can access a domain at all (has any permission)
   */
  const canAccessDomain = (domain: PermissionDomain): boolean => {
    if (isSuperAdmin) return true;
    return permissions.some(p => p.domain === domain);
  };

  /**
   * Get all permissions for a specific domain
   */
  const getDomainPermissions = (domain: PermissionDomain): PermissionAction[] => {
    if (isSuperAdmin) {
      return ['view', 'create', 'edit', 'approve', 'delete', 'export'];
    }
    return permissions
      .filter(p => p.domain === domain)
      .map(p => p.action);
  };

  return {
    permissions,
    isLoading,
    error: error as Error | null,
    can,
    canAny,
    canAll,
    canAccessDomain,
    getDomainPermissions,
    isSuperAdmin,
  };
}
