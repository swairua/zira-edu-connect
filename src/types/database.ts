// Database types that map to Supabase schema
// These are used for type safety when working with the database

export type InstitutionType = 'primary' | 'secondary' | 'tvet' | 'college' | 'university';

export type InstitutionStatus = 'active' | 'suspended' | 'pending' | 'trial' | 'churned' | 'expired';

export type SubscriptionPlanType = 'starter' | 'professional' | 'enterprise' | 'custom';

export type AppRole = 
  | 'super_admin' 
  | 'support_admin'
  | 'institution_owner'
  | 'institution_admin' 
  | 'finance_officer'
  | 'academic_director'
  | 'ict_admin'
  | 'teacher' 
  | 'accountant' 
  | 'bursar'
  | 'hr_manager' 
  | 'parent' 
  | 'student';

export type CountryCode = 'KE' | 'UG' | 'TZ' | 'RW' | 'NG' | 'GH' | 'ZA';

export interface SubscriptionPlan {
  id: SubscriptionPlanType;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  max_students: number;
  max_staff: number;
  features: string[];
  modules: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type OwnershipType = 'public' | 'private';

export interface Institution {
  id: string;
  name: string;
  code: string;
  type: InstitutionType;
  status: InstitutionStatus;
  subscription_plan: SubscriptionPlanType;
  ownership_type: OwnershipType | null;
  country: CountryCode;
  county: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  student_count: number;
  staff_count: number;
  enabled_modules: string[];
  settings: Record<string, unknown>;
  curriculum: string | null;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  institution_id: string | null;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  institution_id: string | null;
  granted_by: string | null;
  granted_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  institution_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  permission_used: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  request_id: string | null;
  user_agent: string | null;
  created_at: string;
}

// New canonical entities

export interface Staff {
  id: string;
  institution_id: string;
  user_id: string | null;
  employee_number: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  designation: string | null;
  employment_type: 'permanent' | 'contract' | 'temporary';
  date_joined: string | null;
  date_left: string | null;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AcademicYear {
  id: string;
  institution_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Term {
  id: string;
  academic_year_id: string;
  institution_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  sequence_order: number;
  created_at: string;
  updated_at: string;
}

export interface Class {
  id: string;
  institution_id: string;
  name: string;
  level: string;
  stream: string | null;
  academic_year_id: string | null;
  class_teacher_id: string | null;
  capacity: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  institution_id: string;
  code: string;
  name: string;
  category: 'core' | 'elective' | 'optional';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  institution_id: string;
  user_id: string | null;
  admission_number: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  date_of_birth: string | null;
  gender: string | null;
  nationality: string | null;
  class_id: string | null;
  admission_date: string | null;
  status: 'active' | 'graduated' | 'transferred' | 'suspended' | 'withdrawn';
  photo_url: string | null;
  medical_info: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Parent {
  id: string;
  institution_id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string;
  alternate_phone: string | null;
  relationship_type: 'father' | 'mother' | 'guardian' | 'other';
  occupation: string | null;
  address: string | null;
  is_primary_contact: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface StudentParent {
  id: string;
  student_id: string;
  parent_id: string;
  institution_id: string;
  relationship: string;
  is_primary: boolean;
  can_pickup: boolean;
  emergency_contact: boolean;
  created_at: string;
}

export interface FeeItem {
  id: string;
  institution_id: string;
  name: string;
  description: string | null;
  amount: number;
  currency: string;
  category: 'tuition' | 'boarding' | 'transport' | 'uniform' | 'other';
  applicable_to: string[];
  academic_year_id: string | null;
  term_id: string | null;
  is_mandatory: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentInvoice {
  id: string;
  invoice_number: string;
  institution_id: string;
  student_id: string;
  academic_year_id: string | null;
  term_id: string | null;
  total_amount: number;
  currency: string;
  due_date: string;
  status: 'draft' | 'posted' | 'partially_paid' | 'paid' | 'cancelled';
  posted_at: string | null;
  posted_by: string | null;
  cancelled_at: string | null;
  cancelled_by: string | null;
  cancellation_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceLine {
  id: string;
  invoice_id: string;
  fee_item_id: string | null;
  description: string;
  quantity: number;
  unit_amount: number;
  total_amount: number;
  created_at: string;
}

export interface StudentPayment {
  id: string;
  institution_id: string;
  student_id: string;
  receipt_number: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_date: string;
  transaction_reference: string | null;
  status: 'pending' | 'confirmed' | 'reversed';
  received_by: string | null;
  reversed_at: string | null;
  reversed_by: string | null;
  reversal_reason: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface PaymentAllocation {
  id: string;
  payment_id: string;
  invoice_id: string;
  amount: number;
  created_at: string;
}

// Helper types for inserts
export type InstitutionInsert = Omit<Institution, 'id' | 'created_at' | 'updated_at' | 'student_count' | 'staff_count'> & {
  id?: string;
  student_count?: number;
  staff_count?: number;
};

export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type UserRoleInsert = Omit<UserRole, 'id' | 'granted_at'> & {
  id?: string;
  granted_at?: string;
};

export type StudentInsert = Omit<Student, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type StaffInsert = Omit<Staff, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

// Country display data
export const countryOptions: { value: CountryCode; label: string; flag: string }[] = [
  { value: 'KE', label: 'Kenya', flag: '🇰🇪' },
  { value: 'UG', label: 'Uganda', flag: '🇺🇬' },
  { value: 'TZ', label: 'Tanzania', flag: '🇹🇿' },
  { value: 'RW', label: 'Rwanda', flag: '🇷🇼' },
  { value: 'NG', label: 'Nigeria', flag: '🇳🇬' },
  { value: 'GH', label: 'Ghana', flag: '🇬🇭' },
  { value: 'ZA', label: 'South Africa', flag: '🇿🇦' },
];

export const institutionTypeLabels: Record<InstitutionType, string> = {
  primary: 'Primary School',
  secondary: 'Secondary School',
  tvet: 'TVET Institution',
  college: 'College',
  university: 'University',
};

export const statusVariants: Record<InstitutionStatus, 'success' | 'warning' | 'info' | 'destructive' | 'secondary'> = {
  active: 'success',
  suspended: 'destructive',
  pending: 'warning',
  trial: 'info',
  churned: 'secondary',
  expired: 'destructive',
};

export const roleLabels: Record<AppRole, string> = {
  super_admin: 'Super Admin',
  support_admin: 'Support Admin',
  institution_owner: 'Institution Owner',
  institution_admin: 'School/College Admin',
  finance_officer: 'Finance Officer',
  academic_director: 'Academic Director',
  ict_admin: 'ICT/System Admin',
  teacher: 'Teacher',
  accountant: 'Accountant',
  bursar: 'Bursar',
  hr_manager: 'HR Officer',
  parent: 'Parent',
  student: 'Student',
};
