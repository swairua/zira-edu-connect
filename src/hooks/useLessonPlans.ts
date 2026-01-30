import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LessonPlanStatus } from '@/types/lesson-plans';
import { toast } from 'sonner';
import { useInstitution } from '@/contexts/InstitutionContext';

// Database row type (matches Supabase schema)
interface LessonPlanRow {
  id: string;
  institution_id: string;
  teacher_id: string;
  subject_id: string;
  class_id: string;
  academic_year_id: string | null;
  term_id: string | null;
  lesson_date: string;
  week_number: number | null;
  lesson_number: number | null;
  duration_minutes: number;
  timetable_entry_id: string | null;
  strand_id: string | null;
  sub_strand_id: string | null;
  scheme_entry_id: string | null;
  topic: string;
  sub_topic: string | null;
  lesson_objectives: unknown;
  introduction: string | null;
  lesson_development: unknown;
  conclusion: string | null;
  teaching_aids: unknown;
  learning_resources: unknown;
  teaching_methods: string[] | null;
  core_competencies: string[];
  values: string[];
  pertinent_contemporary_issues: string[] | null;
  differentiation_notes: string | null;
  special_needs_accommodations: string | null;
  assessment_methods: unknown;
  expected_outcomes: string | null;
  reflection: string | null;
  challenges_faced: string | null;
  learner_achievement: string | null;
  follow_up_actions: string | null;
  status: LessonPlanStatus;
  submitted_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  subject?: { id: string; name: string; code: string } | null;
  class?: { id: string; name: string; level: string } | null;
  term?: { id: string; name: string } | null;
  teacher?: { id: string; first_name: string; last_name: string } | null;
  strand?: { id: string; name: string; strand_number: number } | null;
  sub_strand?: { id: string; name: string; sub_strand_number: number } | null;
  approver?: { id: string; first_name: string; last_name: string } | null;
}

// Fetch lesson plans for a teacher
export function useLessonPlans(options?: {
  teacherId?: string;
  classId?: string;
  subjectId?: string;
  termId?: string;
  status?: LessonPlanStatus;
  dateFrom?: string;
  dateTo?: string;
}) {
  const { institutionId } = useInstitution();

  return useQuery({
    queryKey: ['lesson-plans', institutionId, options],
    queryFn: async () => {
      let query = supabase
        .from('lesson_plans')
        .select(`
          *,
          subject:subjects(id, name, code),
          class:classes(id, name, level),
          term:terms(id, name),
          teacher:staff!lesson_plans_teacher_id_fkey(id, first_name, last_name),
          strand:cbc_strands(id, name, strand_number),
          sub_strand:cbc_sub_strands(id, name, sub_strand_number),
          approver:staff!lesson_plans_approved_by_fkey(id, first_name, last_name)
        `)
        .eq('institution_id', institutionId)
        .order('lesson_date', { ascending: false });

      if (options?.teacherId) query = query.eq('teacher_id', options.teacherId);
      if (options?.classId) query = query.eq('class_id', options.classId);
      if (options?.subjectId) query = query.eq('subject_id', options.subjectId);
      if (options?.termId) query = query.eq('term_id', options.termId);
      if (options?.status) query = query.eq('status', options.status);
      if (options?.dateFrom) query = query.gte('lesson_date', options.dateFrom);
      if (options?.dateTo) query = query.lte('lesson_date', options.dateTo);

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as LessonPlanRow[];
    },
    enabled: !!institutionId,
  });
}

// Fetch single lesson plan
export function useLessonPlan(id?: string) {
  return useQuery({
    queryKey: ['lesson-plan', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('lesson_plans')
        .select(`
          *,
          subject:subjects(id, name, code),
          class:classes(id, name, level),
          term:terms(id, name),
          teacher:staff!lesson_plans_teacher_id_fkey(id, first_name, last_name),
          strand:cbc_strands(*),
          sub_strand:cbc_sub_strands(*, strand:cbc_strands(*)),
          approver:staff!lesson_plans_approved_by_fkey(id, first_name, last_name)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as LessonPlanRow | null;
    },
    enabled: !!id,
  });
}

// Create lesson plan
export function useCreateLessonPlan() {
  const queryClient = useQueryClient();
  const { institutionId } = useInstitution();

  return useMutation({
    mutationFn: async (plan: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from('lesson_plans')
        .insert({ ...plan, institution_id: institutionId } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-plans'] });
      toast.success('Lesson plan created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create lesson plan: ${error.message}`);
    },
  });
}

// Update lesson plan
export function useUpdateLessonPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Record<string, unknown> & { id: string }) => {
      const { data, error } = await supabase
        .from('lesson_plans')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-plans'] });
      queryClient.invalidateQueries({ queryKey: ['lesson-plan', data.id] });
      toast.success('Lesson plan updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update lesson plan: ${error.message}`);
    },
  });
}

// Delete lesson plan
export function useDeleteLessonPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lesson_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-plans'] });
      toast.success('Lesson plan deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete lesson plan: ${error.message}`);
    },
  });
}

// Submit lesson plan for approval
export function useSubmitLessonPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('lesson_plans')
        .update({ 
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-plans'] });
      queryClient.invalidateQueries({ queryKey: ['lesson-plan', data.id] });
      toast.success('Lesson plan submitted for approval');
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit lesson plan: ${error.message}`);
    },
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
          approved_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-plans'] });
      queryClient.invalidateQueries({ queryKey: ['lesson-plan', data.id] });
      toast.success('Lesson plan approved');
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve lesson plan: ${error.message}`);
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
          rejection_reason: reason
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-plans'] });
      queryClient.invalidateQueries({ queryKey: ['lesson-plan', data.id] });
      toast.success('Lesson plan rejected');
    },
    onError: (error: Error) => {
      toast.error(`Failed to reject lesson plan: ${error.message}`);
    },
  });
}

// Get lesson plans pending approval (for HoDs/admins)
export function usePendingLessonPlans() {
  const { institutionId } = useInstitution();

  return useQuery({
    queryKey: ['lesson-plans-pending', institutionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_plans')
        .select(`
          *,
          subject:subjects(id, name, code),
          class:classes(id, name, level),
          teacher:staff!lesson_plans_teacher_id_fkey(id, first_name, last_name)
        `)
        .eq('institution_id', institutionId)
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: true });

      if (error) throw error;
      return data as unknown as LessonPlanRow[];
    },
    enabled: !!institutionId,
  });
}

// Clone a lesson plan
export function useCloneLessonPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sourceId, newDate }: { sourceId: string; newDate: string }) => {
      // Fetch the source plan
      const { data: source, error: fetchError } = await supabase
        .from('lesson_plans')
        .select('*')
        .eq('id', sourceId)
        .single();

      if (fetchError) throw fetchError;

      // Create new plan with reset status
      const { id, created_at, updated_at, status, submitted_at, approved_by, approved_at, rejection_reason, reflection, challenges_faced, learner_achievement, follow_up_actions, ...planData } = source;

      const { data, error } = await supabase
        .from('lesson_plans')
        .insert({
          ...planData,
          lesson_date: newDate,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-plans'] });
      toast.success('Lesson plan cloned');
    },
    onError: (error: Error) => {
      toast.error(`Failed to clone lesson plan: ${error.message}`);
    },
  });
}
