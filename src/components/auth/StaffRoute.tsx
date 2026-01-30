import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { Loader2 } from 'lucide-react';
import type { PermissionDomain, PermissionAction } from '@/types/permissions';
import {
  STAFF_PORTAL_ROLES,
  FINANCE_ROLES,
  ACADEMIC_ROLES,
  hasAnyRole,
} from '@/lib/roles';

interface StaffRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  /** Required permission for this route */
  permission?: { domain: PermissionDomain; action: PermissionAction };
}

export function StaffRoute({ children, requiredRole, permission }: StaffRouteProps) {
  const { user, loading, rolesLoading, userRoles, isSuperAdmin } = useAuth();
  const { can, isLoading: permissionsLoading } = usePermissions();

  if (loading || rolesLoading || permissionsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Super admins bypass all checks
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // Check if user has any staff portal role
  const hasStaffRole = hasAnyRole(userRoles, STAFF_PORTAL_ROLES);
  
  if (!hasStaffRole) {
    console.warn('[StaffRoute] Access denied - user lacks staff portal role', {
      path: window.location.pathname,
      userRoles: userRoles.map(r => r.role),
    });
    return <Navigate to="/" replace />;
  }

  // Check for specific required role if specified
  if (requiredRole && !userRoles.some(r => r.role === requiredRole)) {
    return <Navigate to="/portal" replace />;
  }

  // Check permission if specified
  if (permission) {
    const hasPermission = can(permission.domain, permission.action);
    if (!hasPermission) {
      return <Navigate to="/portal" replace />;
    }
  }

  return <>{children}</>;
}

// Helper to check if user has finance access
export function useHasFinanceAccess() {
  const { userRoles, isSuperAdmin } = useAuth();
  if (isSuperAdmin) return true;
  return hasAnyRole(userRoles, FINANCE_ROLES);
}

// Helper to check if user has academic access
export function useHasAcademicAccess() {
  const { userRoles, isSuperAdmin } = useAuth();
  if (isSuperAdmin) return true;
  return hasAnyRole(userRoles, ACADEMIC_ROLES);
}
