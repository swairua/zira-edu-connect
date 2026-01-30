// Role-aware onboarding step configuration
import type { PermissionDomain } from '@/types/permissions';
import {
  ADMIN_DASHBOARD_ROLES,
  FINANCE_ROLES,
  ACADEMIC_ROLES,
  HR_ROLES,
} from '@/lib/roles';

export type OnboardingStep =
  | 'institution_profile'
  | 'academic_calendar'
  | 'class_setup'
  | 'subject_setup'
  | 'fee_structure'
  | 'data_import'
  | 'go_live';

export interface OnboardingStepConfig {
  id: OnboardingStep;
  title: string;
  description: string;
  // Which roles can see this step
  allowedRoles: readonly string[];
  // Which permission domain is required (optional, for more granular control)
  permissionDomain?: PermissionDomain;
  // Is this required to go live for users with these roles?
  requiredForGoLive: boolean;
  // Role-specific tips
  tips: {
    default: string[];
    finance?: string[];
    academic?: string[];
    admin?: string[];
    hr?: string[];
  };
}

// All admin and relevant staff roles
const ALL_ADMIN_ROLES = [...ADMIN_DASHBOARD_ROLES] as const;
const ADMIN_AND_ACADEMIC = [...ADMIN_DASHBOARD_ROLES, ...ACADEMIC_ROLES] as const;
const ADMIN_AND_FINANCE = [...ADMIN_DASHBOARD_ROLES, ...FINANCE_ROLES] as const;
const ADMIN_AND_HR = [...ADMIN_DASHBOARD_ROLES, ...HR_ROLES] as const;
const ALL_ONBOARDING_ROLES = [...ADMIN_DASHBOARD_ROLES, ...FINANCE_ROLES, ...ACADEMIC_ROLES, ...HR_ROLES] as const;

export const ONBOARDING_STEP_CONFIGS: OnboardingStepConfig[] = [
  {
    id: 'institution_profile',
    title: 'Institution Profile',
    description: "Set up your school's basic information",
    allowedRoles: ALL_ADMIN_ROLES,
    permissionDomain: 'system_settings',
    requiredForGoLive: true,
    tips: {
      default: [
        'Your school name will appear on all official documents',
        'Email is used for system notifications and parent communications',
        'Select the curriculum your school follows for proper grading',
      ],
      admin: [
        'Complete the profile before inviting other staff to onboard',
        'The curriculum selection affects grading scales and report formats',
        'Institution type determines available features and templates',
      ],
    },
  },
  {
    id: 'academic_calendar',
    title: 'Academic Calendar',
    description: 'Set up academic years and terms',
    allowedRoles: ADMIN_AND_ACADEMIC,
    permissionDomain: 'academics',
    requiredForGoLive: true,
    tips: {
      default: [
        'Use Quick Setup to create an entire year with terms in one click',
        'Create at least one academic year to proceed',
        'Mark one year as "current" for default selection',
      ],
      academic: [
        'Terms define grading periods for report cards',
        'The calendar affects exam scheduling and grade entry',
        'Ensure term dates align with your school calendar',
      ],
      admin: [
        'Academic years are required before enrolling students',
        'Consider setting up next year in advance for planning',
      ],
    },
  },
  {
    id: 'class_setup',
    title: 'Classes & Streams',
    description: 'Configure class structure for your school',
    allowedRoles: ADMIN_AND_ACADEMIC,
    permissionDomain: 'academics',
    requiredForGoLive: true,
    tips: {
      default: [
        'Use bulk creation to quickly set up multiple classes',
        'Streams help organize large classes (e.g., Grade 1 A, Grade 1 B)',
        'Capacity helps track enrollment limits',
      ],
      academic: [
        'Classes are used for timetabling and teacher assignments',
        'Consider your streaming policy when setting up',
        'You can add more classes later as enrollment grows',
      ],
      admin: [
        'Students will be assigned to these classes during enrollment',
        'Fee structures can be linked to specific class levels',
      ],
    },
  },
  {
    id: 'subject_setup',
    title: 'Subjects',
    description: 'Add subjects taught in your school',
    allowedRoles: ADMIN_AND_ACADEMIC,
    permissionDomain: 'academics',
    requiredForGoLive: true,
    tips: {
      default: [
        'Use preset subjects for quick setup',
        'Subject codes are used for reports and transcripts',
        'Categories help organize subjects by department',
      ],
      academic: [
        'Subjects are linked to teachers for workload management',
        'Each subject can have specific grading configurations',
        'Consider elective vs. core subject designations',
      ],
      admin: [
        'Fee items can be linked to optional subjects',
        'Subjects appear on report cards and transcripts',
      ],
    },
  },
  {
    id: 'fee_structure',
    title: 'Fee Structure',
    description: 'Set up tuition and other fee items',
    allowedRoles: ADMIN_AND_FINANCE,
    permissionDomain: 'finance',
    requiredForGoLive: false, // Optional for go-live
    tips: {
      default: [
        'Use Quick Setup to apply a pre-configured fee template',
        'Create separate fee items for different purposes',
        'Mandatory fees are applied to all students by default',
      ],
      finance: [
        'Set up Chart of Accounts before configuring fees',
        'Link fee items to appropriate ledger accounts for proper accounting',
        'Configure payment plans for term-based fee collection',
        'Consider fee exemption rules for sponsored students',
      ],
      admin: [
        'Fee structures determine student billing during enrollment',
        'Different class levels can have different fee amounts',
        'You can modify fee items before the next billing cycle',
      ],
    },
  },
  {
    id: 'data_import',
    title: 'Data Import',
    description: 'Import existing data from your previous system',
    allowedRoles: ALL_ONBOARDING_ROLES,
    requiredForGoLive: false,
    tips: {
      default: [
        'Download CSV templates for each data type',
        'Validate data before importing to avoid errors',
        'You can import in batches for large datasets',
      ],
      finance: [
        'Import opening balances for students with outstanding fees',
        'Historical payment records help track fee payment patterns',
        'Ensure student records exist before importing payments',
      ],
      academic: [
        'Import historical grades for transcript generation',
        'Student and class data should be imported first',
        'Attendance history is optional but useful for reports',
      ],
      hr: [
        'Import staff records with their qualifications',
        'Ensure staff IDs match any existing records',
        'Leave balance history can be imported separately',
      ],
      admin: [
        'Core data (Students, Staff) should be imported first',
        'Use rollback if import produces unexpected results',
        'Consider importing in stages: Core → Financial → Historical',
      ],
    },
  },
  {
    id: 'go_live',
    title: 'Go Live',
    description: 'Review and activate your school system',
    allowedRoles: ALL_ADMIN_ROLES, // Only admins can trigger go-live
    requiredForGoLive: true,
    tips: {
      default: [
        'Review all configuration before going live',
        'Ensure at least one admin user is set up',
        'You can still make changes after going live',
      ],
      admin: [
        'Going live enables the system for all users',
        'Parent and student portals become accessible',
        'Make sure key staff have been assigned their roles',
      ],
    },
  },
];

// Helper to get step config by ID
export function getStepConfig(stepId: OnboardingStep): OnboardingStepConfig | undefined {
  return ONBOARDING_STEP_CONFIGS.find(s => s.id === stepId);
}

// Get visible steps for a user based on their roles
export function getVisibleStepsForRoles(userRoles: { role: string }[]): OnboardingStepConfig[] {
  const userRoleNames = userRoles.map(r => r.role);
  
  return ONBOARDING_STEP_CONFIGS.filter(step => {
    return step.allowedRoles.some(allowedRole => userRoleNames.includes(allowedRole));
  });
}

// Get tips for a step based on user role category
export function getTipsForRole(
  stepId: OnboardingStep,
  userRoles: { role: string }[]
): string[] {
  const config = getStepConfig(stepId);
  if (!config) return [];

  const userRoleNames = userRoles.map(r => r.role);

  // Check role categories and return appropriate tips
  if (FINANCE_ROLES.some(r => userRoleNames.includes(r)) && config.tips.finance) {
    return config.tips.finance;
  }
  if (ACADEMIC_ROLES.some(r => userRoleNames.includes(r)) && config.tips.academic) {
    return config.tips.academic;
  }
  if (HR_ROLES.some(r => userRoleNames.includes(r)) && config.tips.hr) {
    return config.tips.hr;
  }
  if (ADMIN_DASHBOARD_ROLES.some(r => userRoleNames.includes(r)) && config.tips.admin) {
    return config.tips.admin;
  }

  return config.tips.default;
}

// Check if a user should see a specific step
export function canUserAccessStep(
  stepId: OnboardingStep,
  userRoles: { role: string }[]
): boolean {
  const config = getStepConfig(stepId);
  if (!config) return false;

  const userRoleNames = userRoles.map(r => r.role);
  return config.allowedRoles.some(role => userRoleNames.includes(role));
}

// Get required items for go-live based on user role
export function getGoLiveRequirements(userRoles: { role: string }[]): OnboardingStep[] {
  const userRoleNames = userRoles.map(r => r.role);
  
  const requirements: OnboardingStep[] = [];

  // Admins need core setup
  if (ADMIN_DASHBOARD_ROLES.some(r => userRoleNames.includes(r))) {
    requirements.push('institution_profile', 'academic_calendar', 'class_setup');
  }

  // Academic roles need academic setup
  if (ACADEMIC_ROLES.some(r => userRoleNames.includes(r))) {
    if (!requirements.includes('academic_calendar')) requirements.push('academic_calendar');
    if (!requirements.includes('class_setup')) requirements.push('class_setup');
    requirements.push('subject_setup');
  }

  // Finance roles primarily need fee structure
  if (FINANCE_ROLES.some(r => userRoleNames.includes(r))) {
    // Fee structure is optional but highlighted for finance
    // They should have academic year at minimum for invoicing
    if (!requirements.includes('academic_calendar')) requirements.push('academic_calendar');
  }

  return requirements;
}
