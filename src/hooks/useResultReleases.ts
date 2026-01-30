import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface ResultRelease {
  id: string;
  institution_id: string;
  release_type: 'exam' | 'assignment' | 'term_report' | 'class_results';
  exam_id: string | null;
  assignment_id: string | null;
  class_id: string | null;
  subject_id: string | null;
  term_id: string | null;
  academic_year_id: string | null;
  released_at: string;
  released_by: string;
  notify_parents: boolean;
  notify_students: boolean;
  notes: string | null;
  created_at: string;
  // Joined data
  exam?: {
    id: string;
    name: string;
  };
  assignment?: {
    id: string;
    title: string;
  };
  class?: {
    id: string;
    name: string;
  };
  subject?: {
    id: string;
    name: string;
  };
  term?: {
    id: string;
    name: string;
  };
  releaser?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export interface CreateReleaseInput {
  releaseType: 'exam' | 'assignment' | 'term_report' | 'class_results';
  examId?: string;
  assignmentId?: string;
  classId?: string;
  subjectId?: string;
  termId?: string;
  academicYearId?: string;
  notifyParents?: boolean;
  notifyStudents?: boolean;
  notes?: string;
}

// Fetch all releases for an institution
export function useResultReleases(institutionId: string | null) {
  return useQuery({
    queryKey: ['result-releases', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];

      const { data, error } = await supabase
        .from('result_releases')
        .select(`
          *,
          exam:exams(id, name),
          assignment:assignments(id, title),
          class:classes(id, name),
          subject:subjects(id, name),
          term:terms(id, name)
        `)
        .eq('institution_id', institutionId)
        .order('released_at', { ascending: false });

      if (error) {
        console.error('Error fetching result releases:', error);
        return [];
      }

      return (data || []) as unknown as ResultRelease[];
    },
    enabled: !!institutionId,
  });
}

// Check if specific results are released
export function useIsResultReleased(
  examId?: string | null,
  assignmentId?: string | null,
  classId?: string | null
) {
  return useQuery({
    queryKey: ['is-result-released', examId, assignmentId, classId],
    queryFn: async () => {
      let query = supabase.from('result_releases').select('id');

      if (examId) {
        query = query.eq('exam_id', examId);
      }
      if (assignmentId) {
        query = query.eq('assignment_id', assignmentId);
      }
      if (classId) {
        query = query.eq('class_id', classId);
      }

      const { data, error } = await query.limit(1);

      if (error) {
        console.error('Error checking release status:', error);
        return false;
      }

      return data && data.length > 0;
    },
    enabled: !!(examId || assignmentId),
  });
}

// Create a new result release
export function useCreateResultRelease(institutionId: string | null) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateReleaseInput) => {
      if (!user || !institutionId) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('result_releases')
        .insert({
          institution_id: institutionId,
          release_type: input.releaseType,
          exam_id: input.examId || null,
          assignment_id: input.assignmentId || null,
          class_id: input.classId || null,
          subject_id: input.subjectId || null,
          term_id: input.termId || null,
          academic_year_id: input.academicYearId || null,
          released_by: user.id,
          notify_parents: input.notifyParents ?? true,
          notify_students: input.notifyStudents ?? true,
          notes: input.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      // If releasing assignment results, update submission visibility
      if (input.assignmentId) {
        await supabase
          .from('assignment_submissions')
          .update({ feedback_visible: true })
          .eq('assignment_id', input.assignmentId)
          .in('grading_status', ['approved', 'locked']);
      }

      // Log to audit
      await supabase.from('audit_logs').insert({
        action: 'results_released',
        entity_type: input.releaseType,
        entity_id: input.examId || input.assignmentId || input.classId || '',
        user_id: user.id,
        institution_id: institutionId,
        new_values: {
          release_type: input.releaseType,
          notify_parents: input.notifyParents,
          notify_students: input.notifyStudents,
        },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['result-releases'] });
      queryClient.invalidateQueries({ queryKey: ['is-result-released'] });
      toast.success('Results released successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to release results', { description: error.message });
    },
  });
}

// Revoke a result release
export function useRevokeResultRelease() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (releaseId: string) => {
      if (!user) throw new Error('Not authenticated');

      // Get release details first
      const { data: release } = await supabase
        .from('result_releases')
        .select('*')
        .eq('id', releaseId)
        .single();

      if (!release) throw new Error('Release not found');

      // Delete the release
      const { error } = await supabase
        .from('result_releases')
        .delete()
        .eq('id', releaseId);

      if (error) throw error;

      // If was an assignment release, hide feedback again
      if (release.assignment_id) {
        await supabase
          .from('assignment_submissions')
          .update({ feedback_visible: false })
          .eq('assignment_id', release.assignment_id);
      }

      // Log to audit
      await supabase.from('audit_logs').insert({
        action: 'results_revoked',
        entity_type: release.release_type,
        entity_id: release.exam_id || release.assignment_id || release.class_id || '',
        user_id: user.id,
        institution_id: release.institution_id,
        old_values: { release_id: releaseId },
      });

      return release;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['result-releases'] });
      queryClient.invalidateQueries({ queryKey: ['is-result-released'] });
      toast.success('Results revoked');
    },
    onError: (error: any) => {
      toast.error('Failed to revoke release', { description: error.message });
    },
  });
}

// Get release stats for dashboard
export function useReleaseStats(institutionId: string | null) {
  return useQuery({
    queryKey: ['release-stats', institutionId],
    queryFn: async () => {
      if (!institutionId) return null;

      const { data, error } = await supabase
        .from('result_releases')
        .select('release_type')
        .eq('institution_id', institutionId);

      if (error) throw error;

      const stats = {
        exam: 0,
        assignment: 0,
        term_report: 0,
        class_results: 0,
        total: data?.length || 0,
      };

      data?.forEach(item => {
        if (item.release_type in stats) {
          stats[item.release_type as keyof typeof stats]++;
        }
      });

      return stats;
    },
    enabled: !!institutionId,
  });
}
