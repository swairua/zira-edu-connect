import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';

export interface SetupProgress {
  hasAcademicYear: boolean;
  hasCurrentTerm: boolean;
  hasClasses: boolean;
  hasSubjects: boolean;
  hasFeeItems: boolean;
  hasStudents: boolean;
  hasStaff: boolean;
  completionPercentage: number;
}

export interface InstitutionDashboardStats {
  totalStudents: number;
  activeStudents: number;
  newStudentsThisMonth: number;
  totalStaff: number;
  teachingStaff: number;
  expectedFees: number;
  collectedFees: number;
  outstandingBalance: number;
  collectionRate: number;
  totalClasses: number;
  totalSubjects: number;
  currentTermName: string | null;
  setupProgress: SetupProgress;
}

export interface RecentActivity {
  id: string;
  type: 'payment' | 'enrollment' | 'attendance';
  title: string;
  description: string;
  timestamp: string;
}

export function useInstitutionDashboard() {
  const { institutionId } = useInstitution();

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['institution-dashboard-stats', institutionId],
    queryFn: async (): Promise<InstitutionDashboardStats> => {
      if (!institutionId) throw new Error('No institution ID');

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Parallel queries for all stats
      const [
        studentsResult,
        newStudentsResult,
        staffResult,
        classesResult,
        subjectsResult,
        currentTermResult,
        academicYearResult,
        feeItemsResult,
        invoicesResult,
        paymentsResult,
      ] = await Promise.all([
        // Total active students
        supabase
          .from('students')
          .select('id', { count: 'exact', head: true })
          .eq('institution_id', institutionId)
          .eq('status', 'active'),
        // New students this month
        supabase
          .from('students')
          .select('id', { count: 'exact', head: true })
          .eq('institution_id', institutionId)
          .gte('created_at', startOfMonth.toISOString()),
        // Staff count
        supabase
          .from('staff')
          .select('id, department', { count: 'exact' })
          .eq('institution_id', institutionId)
          .eq('is_active', true),
        // Classes count
        supabase
          .from('classes')
          .select('id', { count: 'exact', head: true })
          .eq('institution_id', institutionId),
        // Subjects count
        supabase
          .from('subjects')
          .select('id', { count: 'exact', head: true })
          .eq('institution_id', institutionId),
        // Current term
        supabase
          .from('terms')
          .select('name')
          .eq('institution_id', institutionId)
          .eq('is_current', true)
          .maybeSingle(),
        // Academic year
        supabase
          .from('academic_years')
          .select('id', { count: 'exact', head: true })
          .eq('institution_id', institutionId),
        // Fee items
        supabase
          .from('fee_items')
          .select('id', { count: 'exact', head: true })
          .eq('institution_id', institutionId),
        // Total invoices (expected fees)
        supabase
          .from('student_invoices')
          .select('total_amount')
          .eq('institution_id', institutionId)
          .in('status', ['posted', 'partially_paid', 'paid']),
        // Total payments (collected fees)
        supabase
          .from('student_payments')
          .select('amount')
          .eq('institution_id', institutionId)
          .eq('status', 'completed'),
      ]);

      const totalStudents = studentsResult.count || 0;
      const newStudentsThisMonth = newStudentsResult.count || 0;
      const totalStaff = staffResult.count || 0;
      const teachingStaff = staffResult.data?.filter(s => s.department === 'Teaching')?.length || 0;
      const totalClasses = classesResult.count || 0;
      const totalSubjects = subjectsResult.count || 0;
      const currentTermName = currentTermResult.data?.name || null;
      const hasAcademicYear = (academicYearResult.count || 0) > 0;
      const hasFeeItems = (feeItemsResult.count || 0) > 0;

      const expectedFees = invoicesResult.data?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;
      const collectedFees = paymentsResult.data?.reduce((sum, pay) => sum + (pay.amount || 0), 0) || 0;
      const outstandingBalance = expectedFees - collectedFees;
      const collectionRate = expectedFees > 0 ? (collectedFees / expectedFees) * 100 : 0;

      // Calculate setup progress
      const setupChecks = [
        hasAcademicYear,
        !!currentTermName,
        totalClasses > 0,
        totalSubjects > 0,
        hasFeeItems,
        totalStudents > 0,
        totalStaff > 0,
      ];
      const completedChecks = setupChecks.filter(Boolean).length;
      const completionPercentage = Math.round((completedChecks / setupChecks.length) * 100);

      return {
        totalStudents,
        activeStudents: totalStudents,
        newStudentsThisMonth,
        totalStaff,
        teachingStaff,
        expectedFees,
        collectedFees,
        outstandingBalance,
        collectionRate,
        totalClasses,
        totalSubjects,
        currentTermName,
        setupProgress: {
          hasAcademicYear,
          hasCurrentTerm: !!currentTermName,
          hasClasses: totalClasses > 0,
          hasSubjects: totalSubjects > 0,
          hasFeeItems,
          hasStudents: totalStudents > 0,
          hasStaff: totalStaff > 0,
          completionPercentage,
        },
      };
    },
    enabled: !!institutionId,
    staleTime: 30000,
  });

  const { data: recentActivity = [], isLoading: isLoadingActivity } = useQuery({
    queryKey: ['institution-recent-activity', institutionId],
    queryFn: async (): Promise<RecentActivity[]> => {
      if (!institutionId) return [];

      const [paymentsResult, enrollmentsResult] = await Promise.all([
        supabase
          .from('student_payments')
          .select(`
            id,
            amount,
            payment_date,
            students!inner(first_name, last_name)
          `)
          .eq('institution_id', institutionId)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('students')
          .select('id, first_name, last_name, created_at, classes(name)')
          .eq('institution_id', institutionId)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      const activities: RecentActivity[] = [];

      // Add payments
      paymentsResult.data?.forEach((payment: any) => {
        activities.push({
          id: payment.id,
          type: 'payment',
          title: 'Payment Received',
          description: `${payment.students?.first_name} ${payment.students?.last_name} - KES ${payment.amount.toLocaleString()}`,
          timestamp: payment.payment_date,
        });
      });

      // Add enrollments
      enrollmentsResult.data?.forEach((student: any) => {
        activities.push({
          id: student.id,
          type: 'enrollment',
          title: 'New Student',
          description: `${student.first_name} ${student.last_name}${student.classes?.name ? ` - ${student.classes.name}` : ''}`,
          timestamp: student.created_at,
        });
      });

      // Sort by timestamp
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 8);
    },
    enabled: !!institutionId,
    staleTime: 30000,
  });

  return {
    stats,
    isLoadingStats,
    recentActivity,
    isLoadingActivity,
  };
}
