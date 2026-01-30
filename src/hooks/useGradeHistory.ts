import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getGradeFromScore, CountryCode } from '@/lib/country-config';
import { toast } from 'sonner';

export interface GradeChangeLog {
  id: string;
  institution_id: string;
  entity_type: 'exam_score' | 'assignment_submission';
  entity_id: string;
  student_id: string;
  subject_id: string | null;
  exam_id: string | null;
  assignment_id: string | null;
  old_marks: number | null;
  new_marks: number | null;
  old_grade: string | null;
  new_grade: string | null;
  old_feedback: string | null;
  new_feedback: string | null;
  change_reason: string;
  changed_by: string;
  changed_at: string;
  requires_approval: boolean;
  approval_status: 'not_required' | 'pending' | 'approved' | 'rejected';
  approved_by: string | null;
  approved_at: string | null;
  // Joined data
  student?: {
    first_name: string;
    last_name: string;
    admission_number: string;
  };
  subject?: {
    id: string;
    name: string;
  };
  changer?: {
    first_name: string | null;
    last_name: string | null;
  };
  approver?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export interface GradeChangeInput {
  entityType: 'exam_score' | 'assignment_submission';
  entityId: string;
  studentId: string;
  subjectId?: string;
  examId?: string;
  assignmentId?: string;
  oldMarks: number | null;
  newMarks: number;
  oldGrade?: string | null;
  oldFeedback?: string | null;
  newFeedback?: string;
  changeReason: string;
  requiresApproval?: boolean;
}

// Fetch grade change history for an institution
export function useGradeHistory(institutionId: string | null, filters?: {
  studentId?: string;
  examId?: string;
  assignmentId?: string;
  approvalStatus?: string;
}) {
  return useQuery({
    queryKey: ['grade-history', institutionId, filters],
    queryFn: async () => {
      if (!institutionId) return [];

      let query = supabase
        .from('grade_change_logs')
        .select(`
          *,
          student:students(first_name, last_name, admission_number),
          subject:subjects(id, name)
        `)
        .eq('institution_id', institutionId)
        .order('changed_at', { ascending: false });

      if (filters?.studentId) {
        query = query.eq('student_id', filters.studentId);
      }
      if (filters?.examId) {
        query = query.eq('exam_id', filters.examId);
      }
      if (filters?.assignmentId) {
        query = query.eq('assignment_id', filters.assignmentId);
      }
      if (filters?.approvalStatus) {
        query = query.eq('approval_status', filters.approvalStatus);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching grade history:', error);
        return [];
      }

      return (data || []) as unknown as GradeChangeLog[];
    },
    enabled: !!institutionId,
  });
}

// Create a grade change log entry
export function useLogGradeChange(institutionId: string | null, countryCode: CountryCode = 'KE') {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: GradeChangeInput) => {
      if (!user || !institutionId) throw new Error('Not authenticated');

      const newGrade = getGradeFromScore(input.newMarks, countryCode);

      const { data, error } = await supabase
        .from('grade_change_logs')
        .insert({
          institution_id: institutionId,
          entity_type: input.entityType,
          entity_id: input.entityId,
          student_id: input.studentId,
          subject_id: input.subjectId || null,
          exam_id: input.examId || null,
          assignment_id: input.assignmentId || null,
          old_marks: input.oldMarks,
          new_marks: input.newMarks,
          old_grade: input.oldGrade || null,
          new_grade: newGrade,
          old_feedback: input.oldFeedback || null,
          new_feedback: input.newFeedback || null,
          change_reason: input.changeReason,
          changed_by: user.id,
          requires_approval: input.requiresApproval ?? false,
          approval_status: input.requiresApproval ? 'pending' : 'not_required',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grade-history'] });
    },
    onError: (error: any) => {
      console.error('Failed to log grade change:', error);
    },
  });
}

// Approve or reject a grade change
export function useProcessGradeChange() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      changeLogId, 
      action 
    }: { 
      changeLogId: string; 
      action: 'approve' | 'reject';
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('grade_change_logs')
        .update({
          approval_status: action === 'approve' ? 'approved' : 'rejected',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', changeLogId)
        .select()
        .single();

      if (error) throw error;

      // If approved, apply the grade change
      if (action === 'approve') {
        if (data.entity_type === 'assignment_submission') {
          await supabase
            .from('assignment_submissions')
            .update({
              marks: data.new_marks,
              grade: data.new_grade,
              feedback: data.new_feedback,
            })
            .eq('id', data.entity_id);
        }
        // Add similar logic for exam_scores if needed
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['grade-history'] });
      queryClient.invalidateQueries({ queryKey: ['submissions-to-grade'] });
      toast.success(
        variables.action === 'approve' 
          ? 'Grade change approved' 
          : 'Grade change rejected'
      );
    },
    onError: (error: any) => {
      toast.error('Failed to process grade change', { description: error.message });
    },
  });
}

// Get pending grade change requests count
export function usePendingGradeChangesCount(institutionId: string | null) {
  return useQuery({
    queryKey: ['pending-grade-changes-count', institutionId],
    queryFn: async () => {
      if (!institutionId) return 0;

      const { count, error } = await supabase
        .from('grade_change_logs')
        .select('*', { count: 'exact', head: true })
        .eq('institution_id', institutionId)
        .eq('approval_status', 'pending');

      if (error) {
        console.error('Error fetching pending count:', error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!institutionId,
  });
}
