/**
 * Centralized Role Definitions
 * Single source of truth for all role-related constants and utilities
 */

// ==================== ROLE CATEGORIES ====================

/** Platform-level admin roles (Lovable/SaaS platform admins) */
export const PLATFORM_ADMIN_ROLES = ['super_admin', 'support_admin'] as const;

/** Institution-level admin roles (school owners/admins) */
export const INSTITUTION_ADMIN_ROLES = ['institution_owner', 'institution_admin'] as const;

/** Staff portal roles (employees who use the staff portal) */
export const STAFF_PORTAL_ROLES = [
  'teacher',
  'academic_director',
  'finance_officer',
  'accountant',
  'bursar',
  'hr_manager',
  'ict_admin',
  'librarian',
  'coach',
] as const;

/** Finance-specific roles */
export const FINANCE_ROLES = ['finance_officer', 'accountant', 'bursar'] as const;

/** Academic-specific roles */
export const ACADEMIC_ROLES = ['teacher', 'academic_director'] as const;

/** HR-specific roles */
export const HR_ROLES = ['hr_manager'] as const;

/** All roles that can access the admin/institution dashboard */
export const ADMIN_DASHBOARD_ROLES = [...PLATFORM_ADMIN_ROLES, ...INSTITUTION_ADMIN_ROLES] as const;

/** All staff roles (institution admins + staff portal users) */
export const ALL_STAFF_ROLES = [...INSTITUTION_ADMIN_ROLES, ...STAFF_PORTAL_ROLES] as const;

/** End-user roles (students and parents) */
export const END_USER_ROLES = ['student', 'parent'] as const;

// ==================== TYPE DEFINITIONS ====================

export type PlatformAdminRole = typeof PLATFORM_ADMIN_ROLES[number];
export type InstitutionAdminRole = typeof INSTITUTION_ADMIN_ROLES[number];
export type StaffPortalRole = typeof STAFF_PORTAL_ROLES[number];
export type FinanceRole = typeof FINANCE_ROLES[number];
export type AcademicRole = typeof ACADEMIC_ROLES[number];
export type EndUserRole = typeof END_USER_ROLES[number];
export type AllStaffRole = typeof ALL_STAFF_ROLES[number];

// ==================== ROLE HIERARCHY ====================

/** Role hierarchy for determining role priority (higher = more privileged) */
export const ROLE_HIERARCHY: Record<string, number> = {
  super_admin: 100,
  support_admin: 90,
  institution_owner: 80,
  institution_admin: 70,
  academic_director: 65,
  finance_officer: 60,
  ict_admin: 55,
  hr_manager: 50,
  accountant: 50,
  bursar: 50,
  librarian: 45,
  coach: 45,
  teacher: 40,
  parent: 20,
  student: 10,
};

// ==================== ROLE LABELS ====================

/** Human-readable labels for all roles */
export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  support_admin: 'Support Admin',
  institution_owner: 'Institution Owner',
  institution_admin: 'School/College Admin',
  academic_director: 'Academic Director',
  finance_officer: 'Finance Officer',
  accountant: 'Accountant',
  bursar: 'Bursar',
  hr_manager: 'HR Manager',
  ict_admin: 'ICT/System Admin',
  librarian: 'Librarian',
  coach: 'Sports Coach',
  teacher: 'Teacher',
  parent: 'Parent',
  student: 'Student',
};

// ==================== STAFF ROLE OPTIONS ====================

/** Staff roles available for assignment in admin interfaces */
export const ASSIGNABLE_STAFF_ROLES = [
  { value: 'teacher', label: 'Teacher', description: 'Can manage classes, grades, and assignments' },
  { value: 'academic_director', label: 'Academic Director', description: 'Can manage academic setup and results' },
  { value: 'finance_officer', label: 'Finance Officer', description: 'Can manage fees, payments, and invoices' },
  { value: 'accountant', label: 'Accountant', description: 'Can view and manage financial records' },
  { value: 'bursar', label: 'Bursar', description: 'Can manage school financial operations' },
  { value: 'hr_manager', label: 'HR Manager', description: 'Can manage staff records and HR' },
  { value: 'ict_admin', label: 'ICT Admin', description: 'Can manage system settings' },
  { value: 'librarian', label: 'Librarian', description: 'Can manage library and book lending' },
  { value: 'coach', label: 'Sports Coach', description: 'Can manage sports activities and teams' },
  { value: 'institution_admin', label: 'Institution Admin', description: 'Full institution management access' },
] as const;

// ==================== HELPER FUNCTIONS ====================

export interface UserRole {
  role: string;
  institution_id?: string | null;
}

/**
 * Check if a role is a platform admin role
 */
export function isPlatformAdminRole(role: string): boolean {
  return (PLATFORM_ADMIN_ROLES as readonly string[]).includes(role);
}

/**
 * Check if a role is an institution admin role
 */
export function isInstitutionAdminRole(role: string): boolean {
  return (INSTITUTION_ADMIN_ROLES as readonly string[]).includes(role);
}

/**
 * Check if a role can access the admin dashboard
 */
export function isAdminDashboardRole(role: string): boolean {
  return (ADMIN_DASHBOARD_ROLES as readonly string[]).includes(role);
}

/**
 * Check if a role should use the staff portal
 */
export function isStaffPortalRole(role: string): boolean {
  return (STAFF_PORTAL_ROLES as readonly string[]).includes(role);
}

/**
 * Check if a role is finance-related
 */
export function isFinanceRole(role: string): boolean {
  return (FINANCE_ROLES as readonly string[]).includes(role);
}

/**
 * Check if a role is academic-related
 */
export function isAcademicRole(role: string): boolean {
  return (ACADEMIC_ROLES as readonly string[]).includes(role);
}

/**
 * Check if a role is HR-related
 */
export function isHrRole(role: string): boolean {
  return (HR_ROLES as readonly string[]).includes(role);
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(userRoles: UserRole[], targetRoles: readonly string[]): boolean {
  return userRoles.some(ur => targetRoles.includes(ur.role));
}

/**
 * Check if user has a specific role
 */
export function hasRole(userRoles: UserRole[], targetRole: string): boolean {
  return userRoles.some(ur => ur.role === targetRole);
}

/**
 * Get the highest priority role from a list of user roles
 */
export function getHighestRole(userRoles: UserRole[]): string | null {
  if (userRoles.length === 0) return null;
  
  return userRoles.reduce((highest, current) => {
    const currentPriority = ROLE_HIERARCHY[current.role] ?? 0;
    const highestPriority = ROLE_HIERARCHY[highest.role] ?? 0;
    return currentPriority > highestPriority ? current : highest;
  }).role;
}

/**
 * Determine the primary destination based on user roles
 * Returns the appropriate route for the user's highest-priority role
 */
export function getPrimaryDestination(
  userRoles: UserRole[],
  isSuperAdmin: boolean,
  isSupportAdmin: boolean,
  hasInstitution: boolean
): string {
  // Platform admins go to platform dashboard
  if (isSuperAdmin || isSupportAdmin) {
    return '/dashboard';
  }
  
  // Institution admins go to the dashboard
  if (hasAnyRole(userRoles, INSTITUTION_ADMIN_ROLES) && hasInstitution) {
    return '/dashboard';
  }
  
  // Staff portal users
  if (hasAnyRole(userRoles, STAFF_PORTAL_ROLES)) {
    return '/portal';
  }
  
  // Parents
  if (hasRole(userRoles, 'parent')) {
    return '/parent';
  }
  
  // Students
  if (hasRole(userRoles, 'student')) {
    return '/student';
  }
  
  // Fallback
  return '/';
}

/**
 * Determine the portal type for navigation based on user roles
 */
export type StaffPortalType = 'teacher' | 'finance' | 'hr' | 'academic' | 'staff';

export function getStaffPortalType(userRoles: UserRole[]): StaffPortalType {
  // Check in order of specificity
  if (hasAnyRole(userRoles, FINANCE_ROLES)) return 'finance';
  if (hasAnyRole(userRoles, HR_ROLES)) return 'hr';
  if (hasRole(userRoles, 'academic_director')) return 'academic';
  if (hasRole(userRoles, 'teacher')) return 'teacher';
  return 'staff';
}

/**
 * Check if user is a parent-only user (has parent role but no admin/staff roles)
 */
export function isParentOnly(userRoles: UserRole[], isSuperAdmin: boolean, isSupportAdmin: boolean): boolean {
  if (isSuperAdmin || isSupportAdmin) return false;
  
  const hasParent = hasRole(userRoles, 'parent');
  const hasAdminOrStaff = hasAnyRole(userRoles, [...ADMIN_DASHBOARD_ROLES, ...STAFF_PORTAL_ROLES]);
  
  return hasParent && !hasAdminOrStaff;
}

/**
 * Check if user is a staff-only user (has staff roles but no admin roles)
 */
export function isStaffOnly(userRoles: UserRole[], isSuperAdmin: boolean, isSupportAdmin: boolean): boolean {
  if (isSuperAdmin || isSupportAdmin) return false;
  
  const hasStaffRole = hasAnyRole(userRoles, STAFF_PORTAL_ROLES);
  const hasAdminRole = hasAnyRole(userRoles, ADMIN_DASHBOARD_ROLES);
  
  return hasStaffRole && !hasAdminRole;
}
