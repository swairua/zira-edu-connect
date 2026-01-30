import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface PendingAssignment {
  id: string;
  title: string;
  className: string;
  subjectName: string;
  dueDate: string;
  submissionCount: number;
  ungradedCount: number;
}

export interface UpcomingExam {
  id: string;
  name: string;
  startDate: string;
  status: string;
  className?: string;
}

export interface RecentSubmission {
  id: string;
  studentName: string;
  assignmentTitle: string;
  submittedAt: string;
  status: string;
}

export interface PerformanceAlert {
  id: string;
  type: 'failing' | 'attendance' | 'deadline';
  message: string;
  studentName?: string;
  className?: string;
}

export function useTeacherDashboard(staffId?: string) {
  const pendingAssignmentsQuery = useQuery({
    queryKey: ['teacher-pending-assignments', staffId],
    queryFn: async (): Promise<PendingAssignment[]> => {
      if (!staffId) return [];

      // Get teacher's classes
      const { data: classTeachers } = await supabase
        .from('class_teachers')
        .select('class_id, subject_id')
        .eq('staff_id', staffId);

      if (!classTeachers || classTeachers.length === 0) return [];

      const classIds = classTeachers.map(ct => ct.class_id);

      // Get assignments for these classes with submission counts
      const { data: assignments, error } = await supabase
        .from('assignments')
        .select(`
          id,
          title,
          due_date,
          status,
          classes(name),
          subjects(name),
          assignment_submissions(id, grading_status)
        `)
        .in('class_id', classIds)
        .eq('status', 'active')
        .order('due_date', { ascending: true })
        .limit(10);

      if (error) throw error;

      return (assignments || []).map((a: any) => ({
        id: a.id,
        title: a.title,
        className: a.classes?.name || 'Unknown',
        subjectName: a.subjects?.name || 'Unknown',
        dueDate: a.due_date,
        submissionCount: a.assignment_submissions?.length || 0,
        ungradedCount: a.assignment_submissions?.filter((s: any) => 
          s.grading_status === 'pending' || !s.grading_status
        ).length || 0,
      }));
    },
    enabled: !!staffId,
  });

  const upcomingExamsQuery = useQuery({
    queryKey: ['teacher-upcoming-exams', staffId],
    queryFn: async (): Promise<UpcomingExam[]> => {
      if (!staffId) return [];

      // Get staff's institution
      const { data: staff } = await supabase
        .from('staff')
        .select('institution_id')
        .eq('id', staffId)
        .single();

      if (!staff) return [];

      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 14);

      const { data: exams, error } = await supabase
        .from('exams')
        .select('id, name, start_date, status')
        .eq('institution_id', staff.institution_id)
        .gte('start_date', today.toISOString())
        .lte('start_date', nextWeek.toISOString())
        .in('status', ['scheduled', 'active'])
        .order('start_date', { ascending: true })
        .limit(5);

      if (error) throw error;

      return (exams || []).map(e => ({
        id: e.id,
        name: e.name,
        startDate: e.start_date || '',
        status: e.status || 'scheduled',
      }));
    },
    enabled: !!staffId,
  });

  const recentSubmissionsQuery = useQuery({
    queryKey: ['teacher-recent-submissions', staffId],
    queryFn: async (): Promise<RecentSubmission[]> => {
      if (!staffId) return [];

      // Get teacher's classes
      const { data: classTeachers } = await supabase
        .from('class_teachers')
        .select('class_id')
        .eq('staff_id', staffId);

      if (!classTeachers || classTeachers.length === 0) return [];

      const classIds = classTeachers.map(ct => ct.class_id);

      // Get recent submissions for assignments in these classes
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data: submissions, error } = await supabase
        .from('assignment_submissions')
        .select(`
          id,
          submitted_at,
          status,
          students(first_name, last_name),
          assignments!inner(title, class_id)
        `)
        .in('assignments.class_id', classIds)
        .gte('submitted_at', yesterday.toISOString())
        .order('submitted_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return (submissions || []).map((s: any) => ({
        id: s.id,
        studentName: s.students ? `${s.students.first_name} ${s.students.last_name}` : 'Unknown',
        assignmentTitle: s.assignments?.title || 'Unknown',
        submittedAt: s.submitted_at || '',
        status: s.status,
      }));
    },
    enabled: !!staffId,
  });

  const performanceAlertsQuery = useQuery({
    queryKey: ['teacher-performance-alerts', staffId],
    queryFn: async (): Promise<PerformanceAlert[]> => {
      if (!staffId) return [];

      const alerts: PerformanceAlert[] = [];

      // Get teacher's classes
      const { data: classTeachers } = await supabase
        .from('class_teachers')
        .select('class_id, classes(name)')
        .eq('staff_id', staffId);

      if (!classTeachers || classTeachers.length === 0) return [];

      const classIds = classTeachers.map(ct => ct.class_id);

      // Get assignments with upcoming deadlines (next 3 days)
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      const today = new Date();

      const { data: upcomingDeadlines } = await supabase
        .from('assignments')
        .select('id, title, due_date, classes(name)')
        .in('class_id', classIds)
        .eq('status', 'active')
        .gte('due_date', today.toISOString())
        .lte('due_date', threeDaysFromNow.toISOString());

      upcomingDeadlines?.forEach((a: any) => {
        alerts.push({
          id: `deadline-${a.id}`,
          type: 'deadline',
          message: `Assignment "${a.title}" due soon`,
          className: a.classes?.name,
        });
      });

      return alerts.slice(0, 5);
    },
    enabled: !!staffId,
  });

  return {
    pendingAssignments: pendingAssignmentsQuery.data || [],
    isLoadingPendingAssignments: pendingAssignmentsQuery.isLoading,
    upcomingExams: upcomingExamsQuery.data || [],
    isLoadingUpcomingExams: upcomingExamsQuery.isLoading,
    recentSubmissions: recentSubmissionsQuery.data || [],
    isLoadingRecentSubmissions: recentSubmissionsQuery.isLoading,
    performanceAlerts: performanceAlertsQuery.data || [],
    isLoadingPerformanceAlerts: performanceAlertsQuery.isLoading,
  };
}
