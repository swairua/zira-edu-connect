// Permission types for RBAC system

export type PermissionAction = 'view' | 'create' | 'edit' | 'approve' | 'delete' | 'export';

export type PermissionDomain = 
  | 'students' 
  | 'academics' 
  | 'finance' 
  | 'staff_hr' 
  | 'communication' 
  | 'reports' 
  | 'system_settings'
  | 'platform'
  | 'transport'
  | 'library'
  | 'activities'
  | 'uniforms'
  | 'timetable';

export interface Permission {
  domain: PermissionDomain;
  action: PermissionAction;
  permission_name: string;
}

export interface UserPermissions {
  permissions: Permission[];
  isLoading: boolean;
  error: Error | null;
}

// Role hierarchy for display purposes
// Re-exported from centralized roles.ts for backward compatibility
import { ROLE_HIERARCHY, ROLE_LABELS } from '@/lib/roles';
export const roleHierarchy = ROLE_HIERARCHY;
export const roleLabels = ROLE_LABELS;

export const domainLabels: Record<PermissionDomain, string> = {
  students: 'Students',
  academics: 'Academics',
  finance: 'Finance',
  staff_hr: 'Staff & HR',
  communication: 'Communication',
  reports: 'Reports & Exports',
  system_settings: 'System Settings',
  platform: 'Platform Administration',
  transport: 'Transport',
  library: 'Library',
  activities: 'Activities & Sports',
  uniforms: 'Uniform Store',
  timetable: 'Timetable Management',
};

export const actionLabels: Record<PermissionAction, string> = {
  view: 'View',
  create: 'Create',
  edit: 'Edit',
  approve: 'Approve',
  delete: 'Delete',
  export: 'Export',
};
