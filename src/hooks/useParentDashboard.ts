import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  total: number;
  rate: number;
}

export interface RecentGrade {
  id: string;
  assessmentName: string;
  subjectName: string;
  marks: number;
  totalMarks: number;
  grade: string | null;
  date: string;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  type: 'exam' | 'assignment' | 'event';
  date: string;
  subjectName?: string;
}

export function useParentDashboard(studentId: string | null, institutionId: string | null) {
  const attendanceQuery = useQuery({
    queryKey: ['parent-attendance-summary', studentId],
    queryFn: async (): Promise<AttendanceSummary> => {
      if (!studentId) return { present: 0, absent: 0, late: 0, total: 0, rate: 0 };

      const startOfTerm = new Date();
      startOfTerm.setMonth(startOfTerm.getMonth() - 3);

      const { data, error } = await supabase
        .from('attendance')
        .select('status')
        .eq('student_id', studentId)
        .gte('date', startOfTerm.toISOString().split('T')[0]);

      if (error) throw error;

      const present = data?.filter(a => a.status === 'present').length || 0;
      const absent = data?.filter(a => a.status === 'absent').length || 0;
      const late = data?.filter(a => a.status === 'late').length || 0;
      const total = data?.length || 0;
      const rate = total > 0 ? (present / total) * 100 : 0;

      return { present, absent, late, total, rate };
    },
    enabled: !!studentId,
  });

  const recentGradesQuery = useQuery({
    queryKey: ['parent-recent-grades', studentId],
    queryFn: async (): Promise<RecentGrade[]> => {
      if (!studentId) return [];

      const { data: submissions } = await supabase
        .from('assignment_submissions')
        .select('id, marks, grade, graded_at, assignments(title, total_marks, subjects(name))')
        .eq('student_id', studentId)
        .not('marks', 'is', null)
        .order('graded_at', { ascending: false })
        .limit(5);

      return (submissions || []).map((s: any) => ({
        id: s.id,
        assessmentName: s.assignments?.title || 'Assignment',
        subjectName: s.assignments?.subjects?.name || 'Unknown',
        marks: s.marks || 0,
        totalMarks: s.assignments?.total_marks || 100,
        grade: s.grade,
        date: s.graded_at || '',
      }));
    },
    enabled: !!studentId,
  });

  const upcomingEventsQuery = useQuery({
    queryKey: ['parent-upcoming-events', studentId, institutionId],
    queryFn: async (): Promise<UpcomingEvent[]> => {
      if (!studentId || !institutionId) return [];

      const today = new Date();
      const twoWeeksFromNow = new Date();
      twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

      const events: UpcomingEvent[] = [];

      const { data: exams } = await supabase
        .from('exams')
        .select('id, name, start_date')
        .eq('institution_id', institutionId)
        .in('status', ['scheduled', 'active'])
        .gte('start_date', today.toISOString())
        .lte('start_date', twoWeeksFromNow.toISOString())
        .order('start_date', { ascending: true })
        .limit(5);

      exams?.forEach(e => {
        events.push({
          id: e.id,
          title: e.name,
          type: 'exam',
          date: e.start_date || '',
        });
      });

      return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);
    },
    enabled: !!studentId && !!institutionId,
  });

  return {
    attendance: attendanceQuery.data || { present: 0, absent: 0, late: 0, total: 0, rate: 0 },
    isLoadingAttendance: attendanceQuery.isLoading,
    recentGrades: recentGradesQuery.data || [],
    isLoadingRecentGrades: recentGradesQuery.isLoading,
    upcomingEvents: upcomingEventsQuery.data || [],
    isLoadingUpcomingEvents: upcomingEventsQuery.isLoading,
  };
}
