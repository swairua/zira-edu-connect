import { Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useInstitution } from '@/contexts/InstitutionContext';
import { Loader2 } from 'lucide-react';
import type { PermissionDomain, PermissionAction } from '@/types/permissions';
import {
  ADMIN_DASHBOARD_ROLES,
  hasAnyRole,
  hasRole as hasRoleUtil,
  isParentOnly,
} from '@/lib/roles';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Require super admin role */
  requireSuperAdmin?: boolean;
  /** Require support admin or super admin role */
  requireSupportAdmin?: boolean;
  /** Required permission (domain + action) */
  permission?: { domain: PermissionDomain; action: PermissionAction };
  /** Required role name */
  requiredRole?: string;
  /** Redirect path when access denied (default: '/') */
  redirectTo?: string;
  /** Require institution context (for school-level routes) */
  requiresInstitution?: boolean;
}

const LOADING_TIMEOUT_MS = 10000; // 10 seconds

export function ProtectedRoute({ 
  children, 
  requireSuperAdmin = false,
  requireSupportAdmin = false,
  permission,
  requiredRole,
  redirectTo = '/',
  requiresInstitution = false,
}: ProtectedRouteProps) {
  const { user, loading, rolesLoading, isSuperAdmin, isSupportAdmin, hasRole, userRoles } = useAuth();
  const { institutionId, isLoading: institutionLoading } = useInstitution();
  const { can, isLoading: permissionsLoading } = usePermissions(institutionId);
  const location = useLocation();
  const [timedOut, setTimedOut] = useState(false);

  // Add timeout to prevent indefinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, LOADING_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, []);

  // Calculate if we're still loading (with timeout override)
  const isStillLoading = !timedOut && (loading || rolesLoading || permissionsLoading || institutionLoading);

  // Show loading while checking auth or roles (unless timed out)
  if (isStillLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if user is parent-only (has parent role but no admin/staff roles)
  const parentOnly = isParentOnly(userRoles, isSuperAdmin, isSupportAdmin);
  if (parentOnly) {
    return <Navigate to="/parent" replace />;
  }

  // NOTE: Staff-only redirect removed - staff should use StaffRoute for portal routes
  // If they hit a ProtectedRoute without permission, the permission check below handles it

  // Check super admin requirement
  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check support admin requirement (super admins also pass this check)
  if (requireSupportAdmin && !isSuperAdmin && !isSupportAdmin) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check institution context requirement for school-level routes
  // Super admins and support admins bypass this check (they can access any institution)
  if (requiresInstitution && !institutionId && !isSuperAdmin && !isSupportAdmin) {
    return <Navigate to="/" replace />;
  }

  // Check specific role requirement
  if (requiredRole && !isSuperAdmin && !hasRole(requiredRole)) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check permission requirement
  if (permission && !isSuperAdmin) {
    const hasPermission = can(permission.domain, permission.action);
    if (!hasPermission) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <>{children}</>;
}
