import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import type { PermissionDomain, PermissionAction } from '@/types/permissions';

interface PermissionGateProps {
  children: ReactNode;
  /** The domain to check permission for */
  domain: PermissionDomain;
  /** The action(s) to check. If array, user must have at least one (OR logic) */
  action: PermissionAction | PermissionAction[];
  /** Whether all actions are required (AND logic). Default: false (OR logic) */
  requireAll?: boolean;
  /** Optional fallback content to show when permission denied */
  fallback?: ReactNode;
  /** Institution ID for context-specific permission check */
  institutionId?: string;
}

/**
 * Component wrapper that conditionally renders children based on user permissions.
 * 
 * @example
 * // Single permission check
 * <PermissionGate domain="finance" action="view">
 *   <FinanceData />
 * </PermissionGate>
 * 
 * @example
 * // Multiple actions (OR logic - user needs at least one)
 * <PermissionGate domain="students" action={['create', 'edit']}>
 *   <StudentForm />
 * </PermissionGate>
 * 
 * @example
 * // Multiple actions (AND logic - user needs all)
 * <PermissionGate domain="finance" action={['create', 'approve']} requireAll>
 *   <FinanceApprovalForm />
 * </PermissionGate>
 */
export function PermissionGate({
  children,
  domain,
  action,
  requireAll = false,
  fallback = null,
  institutionId,
}: PermissionGateProps) {
  const { can, canAny, canAll, isLoading } = usePermissions(institutionId);

  // While loading, don't render anything
  if (isLoading) {
    return null;
  }

  const actions = Array.isArray(action) ? action : [action];
  
  const hasPermission = requireAll 
    ? canAll(domain, actions)
    : canAny(domain, actions);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Hook-based alternative for more complex permission logic
 */
export function usePermissionCheck(
  domain: PermissionDomain,
  action: PermissionAction | PermissionAction[],
  options?: { requireAll?: boolean; institutionId?: string }
) {
  const { can, canAny, canAll, isLoading } = usePermissions(options?.institutionId);
  
  const actions = Array.isArray(action) ? action : [action];
  const hasPermission = options?.requireAll 
    ? canAll(domain, actions)
    : canAny(domain, actions);

  return { hasPermission, isLoading };
}
