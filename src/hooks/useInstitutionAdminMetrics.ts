import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TodayAttendance {
  present: number;
  absent: number;
  late: number;
  total: number;
  rate: number;
}

export interface RecentEnrollment {
  id: string;
  name: string;
  className: string | null;
  enrolledAt: string;
}

export interface PendingApproval {
  id: string;
  type: 'grade' | 'adjustment';
  description: string;
  submittedAt: string;
}

export interface ClassInsight {
  classId: string;
  className: string;
  studentCount: number;
  attendanceRate: number;
  needsAttention: boolean;
}

export function useInstitutionAdminMetrics(institutionId?: string) {
  const todayAttendanceQuery = useQuery({
    queryKey: ['institution-today-attendance', institutionId],
    queryFn: async (): Promise<TodayAttendance> => {
      if (!institutionId) return { present: 0, absent: 0, late: 0, total: 0, rate: 0 };

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('attendance')
        .select('status')
        .eq('institution_id', institutionId)
        .eq('date', today);

      if (error) throw error;

      const present = data?.filter(a => a.status === 'present').length || 0;
      const absent = data?.filter(a => a.status === 'absent').length || 0;
      const late = data?.filter(a => a.status === 'late').length || 0;
      const total = data?.length || 0;
      const rate = total > 0 ? ((present + late) / total) * 100 : 0;

      return { present, absent, late, total, rate };
    },
    enabled: !!institutionId,
  });

  const recentEnrollmentsQuery = useQuery({
    queryKey: ['institution-recent-enrollments', institutionId],
    queryFn: async (): Promise<RecentEnrollment[]> => {
      if (!institutionId) return [];

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('students')
        .select('id, first_name, last_name, created_at, classes(name)')
        .eq('institution_id', institutionId)
        .gte('created_at', oneWeekAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      return (data || []).map((s: any) => ({
        id: s.id,
        name: `${s.first_name} ${s.last_name}`,
        className: s.classes?.name || null,
        enrolledAt: s.created_at,
      }));
    },
    enabled: !!institutionId,
  });

  const pendingApprovalsQuery = useQuery({
    queryKey: ['institution-pending-approvals', institutionId],
    queryFn: async (): Promise<PendingApproval[]> => {
      if (!institutionId) return [];

      const approvals: PendingApproval[] = [];

      // Get pending grade approvals
      const { data: gradeApprovals } = await supabase
        .from('grade_approvals')
        .select('id, entity_type, submitted_at, classes(name), subjects(name)')
        .eq('institution_id', institutionId)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false })
        .limit(5);

      gradeApprovals?.forEach((ga: any) => {
        approvals.push({
          id: ga.id,
          type: 'grade',
          description: `${ga.entity_type} grades - ${ga.classes?.name || ''} ${ga.subjects?.name || ''}`,
          submittedAt: ga.submitted_at || '',
        });
      });

      // Get pending financial adjustments
      const { data: adjustments } = await supabase
        .from('financial_adjustments')
        .select('id, adjustment_type, reason, requested_at')
        .eq('institution_id', institutionId)
        .eq('status', 'pending')
        .order('requested_at', { ascending: false })
        .limit(5);

      adjustments?.forEach(adj => {
        approvals.push({
          id: adj.id,
          type: 'adjustment',
          description: `${adj.adjustment_type}: ${adj.reason}`.slice(0, 50),
          submittedAt: adj.requested_at || '',
        });
      });

      return approvals.slice(0, 5);
    },
    enabled: !!institutionId,
  });

  const classInsightsQuery = useQuery({
    queryKey: ['institution-class-insights', institutionId],
    queryFn: async (): Promise<ClassInsight[]> => {
      if (!institutionId) return [];

      // Get classes with student counts
      const { data: classes, error } = await supabase
        .from('classes')
        .select(`
          id,
          name,
          students(id)
        `)
        .eq('institution_id', institutionId)
        .eq('is_active', true);

      if (error) throw error;

      // Get today's attendance for each class
      const today = new Date().toISOString().split('T')[0];
      
      const insights: ClassInsight[] = [];

      for (const cls of classes || []) {
        const studentCount = (cls as any).students?.length || 0;
        
        if (studentCount > 0) {
          const { data: attendance } = await supabase
            .from('attendance')
            .select('status')
            .eq('class_id', cls.id)
            .eq('date', today);

          const presentCount = attendance?.filter(a => a.status === 'present' || a.status === 'late').length || 0;
          const attendanceRate = attendance && attendance.length > 0 
            ? (presentCount / attendance.length) * 100 
            : 100;

          insights.push({
            classId: cls.id,
            className: cls.name,
            studentCount,
            attendanceRate,
            needsAttention: attendanceRate < 80,
          });
        }
      }

      return insights.sort((a, b) => a.attendanceRate - b.attendanceRate);
    },
    enabled: !!institutionId,
  });

  return {
    todayAttendance: todayAttendanceQuery.data || { present: 0, absent: 0, late: 0, total: 0, rate: 0 },
    isLoadingTodayAttendance: todayAttendanceQuery.isLoading,
    recentEnrollments: recentEnrollmentsQuery.data || [],
    isLoadingRecentEnrollments: recentEnrollmentsQuery.isLoading,
    pendingApprovals: pendingApprovalsQuery.data || [],
    isLoadingPendingApprovals: pendingApprovalsQuery.isLoading,
    classInsights: classInsightsQuery.data || [],
    isLoadingClassInsights: classInsightsQuery.isLoading,
  };
}
