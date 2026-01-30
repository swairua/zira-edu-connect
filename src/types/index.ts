// Re-export all database types for convenience
export * from './database';

// Legacy types kept for backwards compatibility during migration
// These will be phased out as we fully integrate with Supabase

export type UserRole = 
  | 'super_admin' 
  | 'institution_admin' 
  | 'teacher' 
  | 'accountant' 
  | 'hr_manager' 
  | 'parent' 
  | 'student';

// Dashboard stats type (computed from database)
export interface DashboardStats {
  totalInstitutions: number;
  activeInstitutions: number;
  totalStudents: number;
  totalStaff: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  newInstitutionsThisMonth: number;
  pendingTickets: number;
}
