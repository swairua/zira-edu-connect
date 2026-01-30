import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';
import { toast } from 'sonner';
import type { LessonPlanStatus } from '@/types/lesson-plans';

// Database row type for approval views
interface LessonPlanApprovalRow {
  id: string;
  institution_id: string;
  teacher_id: string;
  subject_id: string;
  class_id: string;
  lesson_date: string;
  topic: string;
  sub_topic: string | null;
  status: LessonPlanStatus;
  submitted_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  duration_minutes: number;
  week_number: number | null;
  lesson_number: number | null;
  strand_id: string | null;
  sub_strand_id: string | null;
  lesson_objectives: unknown;
  introduction: string | null;
  lesson_development: unknown;
  conclusion: string | null;
  teaching_aids: unknown;
  teaching_methods: string[] | null;
  core_competencies: string[];
  values: string[];
  assessment_methods: unknown;
  created_at: string;
  subject?: { id: string; name: string; code: string } | null;
  class?: { id: string; name: string; level: string } | null;
  teacher?: { id: string; first_name: string; last_name: string } | null;
  strand?: { id: string; name: string; strand_number: number } | null;
  sub_strand?: { id: string; name: string; sub_strand_number: number } | null;
  approver?: { id: string; first_name: string; last_name: string } | null;
}

// Fetch approval statistics
export function useLessonPlanApprovalStats() {
  const { institutionId } = useInstitution();

  return useQuery({
    queryKey: ['lesson-plan-approval-stats', institutionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_plans')
        .select('status')
        .eq('institution_id', institutionId);

      if (error) throw error;

      return {
        pending: data.filter(p => p.status === 'submitted').length,
        approved: data.filter(p => p.status === 'approved').length,
        rejected: data.filter(p => p.status === 'rejected').length,
        draft: data.filter(p => p.status === 'draft').length,
        total: data.length,
      };
    },
    enabled: !!institutionId,
  });
}

// Fetch lesson plans for approval review
export function useLessonPlansForApproval(status?: LessonPlanStatus) {
  const { institutionId } = useInstitution();

  return useQuery({
    queryKey: ['lesson-plans-for-approval', institutionId, status],
    queryFn: async () => {
      let query = supabase
        .from('lesson_plans')
        .select(`
          id,
          institution_id,
          teacher_id,
          subject_id,
          class_id,
          lesson_date,
          topic,
          sub_topic,
          status,
          submitted_at,
          approved_by,
          approved_at,
          rejection_reason,
          duration_minutes,
          week_number,
          lesson_number,
          strand_id,
          sub_strand_id,
          lesson_objectives,
          introduction,
          lesson_development,
          conclusion,
          teaching_aids,
          teaching_methods,
          core_competencies,
          values,
          assessment_methods,
          created_at,
          subject:subjects(id, name, code),
          class:classes(id, name, level),
          teacher:staff!lesson_plans_teacher_id_fkey(id, first_name, last_name),
          strand:cbc_strands(id, name, strand_number),
          sub_strand:cbc_sub_strands(id, name, sub_strand_number),
          approver:staff!lesson_plans_approved_by_fkey(id, first_name, last_name)
        `)
        .eq('institution_id', institutionId)
        .order('submitted_at', { ascending: false, nullsFirst: false });

      if (status) {
        query = query.eq('status', status);
      } else {
        // Exclude drafts when showing all
        query = query.neq('status', 'draft');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as LessonPlanApprovalRow[];
    },
    enabled: !!institutionId,
  });
}

// Fetch single lesson plan for detailed review
export function useLessonPlanForReview(id?: string) {
  return useQuery({
    queryKey: ['lesson-plan-review', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('lesson_plans')
        .select(`
          *,
          subject:subjects(id, name, code),
          class:classes(id, name, level),
          teacher:staff!lesson_plans_teacher_id_fkey(id, first_name, last_name),
          strand:cbc_strands(*),
          sub_strand:cbc_sub_strands(*, strand:cbc_strands(*)),
          approver:staff!lesson_plans_approved_by_fkey(id, first_name, last_name)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

// Approve lesson plan
export function useApproveLessonPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, approverId }: { id: string; approverId: string }) => {
      const { data, error } = await supabase
        .from('lesson_plans')
        .update({
          status: 'approved',
          approved_by: approverId,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-plans'] });
      queryClient.invalidateQueries({ queryKey: ['lesson-plans-for-approval'] });
      queryClient.invalidateQueries({ queryKey: ['lesson-plan-approval-stats'] });
      toast.success('Lesson plan approved');
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve: ${error.message}`);
    },
  });
}

// Reject lesson plan
export function useRejectLessonPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, approverId, reason }: { id: string; approverId: string; reason: string }) => {
      const { data, error } = await supabase
        .from('lesson_plans')
        .update({
          status: 'rejected',
          approved_by: approverId,
          approved_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-plans'] });
      queryClient.invalidateQueries({ queryKey: ['lesson-plans-for-approval'] });
      queryClient.invalidateQueries({ queryKey: ['lesson-plan-approval-stats'] });
      toast.success('Lesson plan rejected');
    },
    onError: (error: Error) => {
      toast.error(`Failed to reject: ${error.message}`);
    },
  });
}
