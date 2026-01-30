// Department to Role mapping for smart role suggestions
export const DEPARTMENT_ROLE_MAP: Record<string, string> = {
  'Teaching': 'teacher',
  'Academic': 'teacher',
  'Finance': 'accountant',
  'Administration': 'institution_admin',
  'IT': 'ict_admin',
  'Support': 'hr_manager',
  'HR': 'hr_manager',
};

// Get suggested role based on department
export function getSuggestedRole(department: string | null | undefined): string {
  if (!department) return 'teacher';
  return DEPARTMENT_ROLE_MAP[department] || 'teacher';
}

// Department-based designation suggestions
export const DEPARTMENT_DESIGNATIONS: Record<string, string[]> = {
  'Teaching': [
    'Teacher',
    'Senior Teacher',
    'Head of Department',
    'Subject Lead',
    'Class Teacher',
    'Deputy Head of Department',
  ],
  'Academic': [
    'Academic Director',
    'Dean of Studies',
    'Examination Officer',
    'Curriculum Coordinator',
    'Head of Academics',
  ],
  'Finance': [
    'Accountant',
    'Finance Officer',
    'Bursar',
    'Cashier',
    'Finance Manager',
    'Accounts Clerk',
  ],
  'Administration': [
    'Principal',
    'Deputy Principal',
    'Administrator',
    'Executive Director',
    'School Manager',
    'Operations Manager',
  ],
  'IT': [
    'ICT Administrator',
    'Systems Administrator',
    'IT Support',
    'Technical Officer',
    'Network Administrator',
  ],
  'Support': [
    'Secretary',
    'Administrative Assistant',
    'Receptionist',
    'Office Assistant',
    'Records Clerk',
  ],
  'HR': [
    'HR Manager',
    'HR Officer',
    'Recruitment Officer',
    'Staff Welfare Officer',
  ],
};

// Get designation suggestions for a department
export function getDesignationSuggestions(department: string | null | undefined): string[] {
  if (!department) return [];
  return DEPARTMENT_DESIGNATIONS[department] || [];
}

// Re-export staff roles from centralized roles file
export { ASSIGNABLE_STAFF_ROLES as STAFF_ROLES } from './roles';
