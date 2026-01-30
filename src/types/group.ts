export type GroupRole = 
  | 'group_owner'
  | 'group_finance_admin'
  | 'group_academic_admin'
  | 'group_hr_admin'
  | 'group_viewer';

export type SharedServiceType = 
  | 'finance'
  | 'messaging'
  | 'reporting'
  | 'fee_structure'
  | 'academic_calendar'
  | 'staff_management';

export interface InstitutionGroup {
  id: string;
  name: string;
  code: string;
  logo_url: string | null;
  primary_country: string;
  subscription_plan: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface GroupSharedService {
  id: string;
  group_id: string;
  service_type: SharedServiceType;
  is_centralized: boolean;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface GroupUserRole {
  id: string;
  user_id: string;
  group_id: string;
  role: GroupRole;
  campus_access: string[] | null;
  granted_by: string | null;
  granted_at: string;
}

export interface GroupCampus {
  id: string;
  name: string;
  code: string;
  campus_code: string | null;
  is_headquarters: boolean;
  status: string;
  student_count: number;
  staff_count: number;
  country: string;
}

// Permission checks for group roles
export const GROUP_ROLE_PERMISSIONS: Record<GroupRole, {
  canManageSettings: boolean;
  canManageUsers: boolean;
  canManageCampuses: boolean;
  canViewFinance: boolean;
  canManageFinance: boolean;
  canViewAcademics: boolean;
  canManageAcademics: boolean;
  canViewHR: boolean;
  canManageHR: boolean;
}> = {
  group_owner: {
    canManageSettings: true,
    canManageUsers: true,
    canManageCampuses: true,
    canViewFinance: true,
    canManageFinance: true,
    canViewAcademics: true,
    canManageAcademics: true,
    canViewHR: true,
    canManageHR: true,
  },
  group_finance_admin: {
    canManageSettings: false,
    canManageUsers: false,
    canManageCampuses: false,
    canViewFinance: true,
    canManageFinance: true,
    canViewAcademics: false,
    canManageAcademics: false,
    canViewHR: false,
    canManageHR: false,
  },
  group_academic_admin: {
    canManageSettings: false,
    canManageUsers: false,
    canManageCampuses: false,
    canViewFinance: false,
    canManageFinance: false,
    canViewAcademics: true,
    canManageAcademics: true,
    canViewHR: false,
    canManageHR: false,
  },
  group_hr_admin: {
    canManageSettings: false,
    canManageUsers: false,
    canManageCampuses: false,
    canViewFinance: false,
    canManageFinance: false,
    canViewAcademics: false,
    canManageAcademics: false,
    canViewHR: true,
    canManageHR: true,
  },
  group_viewer: {
    canManageSettings: false,
    canManageUsers: false,
    canManageCampuses: false,
    canViewFinance: true,
    canManageFinance: false,
    canViewAcademics: true,
    canManageAcademics: false,
    canViewHR: true,
    canManageHR: false,
  },
};
