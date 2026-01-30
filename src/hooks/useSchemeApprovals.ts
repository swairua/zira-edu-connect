import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';
import { toast } from 'sonner';

type SchemeStatusLocal = 'draft' | 'submitted' | 'active' | 'rejected' | 'archived';

// Database row type for approval views
interface SchemeApprovalRow {
  id: string;
  institution_id: string;
  teacher_id: string | null;
  subject_id: string;
  class_id: string;
  academic_year_id: string;
  term_id: string;
  title: string;
  description: string | null;
  total_weeks: number;
  status: SchemeStatusLocal;
  submitted_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  subject?: { id: string; name: string; code: string } | null;
  class?: { id: string; name: string; level: string } | null;
  term?: { id: string; name: string } | null;
  academic_year?: { id: string; name: string } | null;
  teacher?: { id: string; first_name: string; last_name: string } | null;
  approver?: { id: string; first_name: string; last_name: string } | null;
}

interface SchemeEntryRow {
  id: string;
  scheme_id: string;
  week_number: number;
  strand_id: string | null;
  sub_strand_id: string | null;
  topic: string;
  sub_topic: string | null;
  objectives: unknown;
  learning_activities: unknown;
  teaching_resources: unknown;
  assessment_methods: unknown;
  remarks: string | null;
  lessons_allocated: number;
  strand?: { id: string; name: string; strand_number: number } | null;
  sub_strand?: { id: string; name: string; sub_strand_number: number } | null;
}

// Fetch approval statistics
export function useSchemeApprovalStats() {
  const { institutionId } = useInstitution();

  return useQuery({
    queryKey: ['scheme-approval-stats', institutionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schemes_of_work')
        .select('status')
        .eq('institution_id', institutionId);

      if (error) throw error;

      return {
        pending: data.filter(s => s.status === 'submitted').length,
        approved: data.filter(s => s.status === 'active').length,
        rejected: data.filter(s => s.status === 'rejected').length,
        draft: data.filter(s => s.status === 'draft').length,
        total: data.length,
      };
    },
    enabled: !!institutionId,
  });
}

// Fetch schemes for approval review
export function useSchemesForApproval(status?: string) {
  const { institutionId } = useInstitution();

  return useQuery({
    queryKey: ['schemes-for-approval', institutionId, status],
    queryFn: async () => {
      let query = supabase
        .from('schemes_of_work')
        .select(`
          id,
          institution_id,
          teacher_id,
          subject_id,
          class_id,
          academic_year_id,
          term_id,
          title,
          description,
          total_weeks,
          status,
          submitted_at,
          approved_by,
          approved_at,
          rejection_reason,
          created_at,
          updated_at,
          subject:subjects(id, name, code),
          class:classes(id, name, level),
          term:terms(id, name),
          academic_year:academic_years(id, name),
          teacher:staff!schemes_of_work_teacher_id_fkey(id, first_name, last_name),
          approver:staff!schemes_of_work_approved_by_fkey(id, first_name, last_name)
        `)
        .eq('institution_id', institutionId)
        .order('submitted_at', { ascending: false, nullsFirst: false });

      if (status && status !== 'all') {
        // Map 'approved' filter to 'active' status
        const dbStatus = status === 'approved' ? 'active' : status;
        query = query.eq('status', dbStatus as any);
      } else {
        // Exclude drafts when showing all
        query = query.neq('status', 'draft');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as SchemeApprovalRow[];
    },
    enabled: !!institutionId,
  });
}

// Fetch single scheme with entries for detailed review
export function useSchemeForReview(id?: string) {
  return useQuery({
    queryKey: ['scheme-review', id],
    queryFn: async () => {
      if (!id) return null;

      // Fetch scheme
      const { data: scheme, error: schemeError } = await supabase
        .from('schemes_of_work')
        .select(`
          *,
          subject:subjects(id, name, code),
          class:classes(id, name, level),
          term:terms(id, name),
          academic_year:academic_years(id, name),
          teacher:staff!schemes_of_work_teacher_id_fkey(id, first_name, last_name),
          approver:staff!schemes_of_work_approved_by_fkey(id, first_name, last_name)
        `)
        .eq('id', id)
        .maybeSingle();

      if (schemeError) throw schemeError;
      if (!scheme) return null;

      // Fetch entries with CBC alignment
      const { data: entries, error: entriesError } = await supabase
        .from('scheme_entries')
        .select(`
          *,
          strand:cbc_strands(id, name, strand_number),
          sub_strand:cbc_sub_strands(id, name, sub_strand_number)
        `)
        .eq('scheme_id', id)
        .order('week_number');

      if (entriesError) throw entriesError;

      return { ...scheme, entries: entries as SchemeEntryRow[] } as SchemeApprovalRow & { entries: SchemeEntryRow[] };
    },
    enabled: !!id,
  });
}

// Submit scheme for approval
export function useSubmitScheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('schemes_of_work')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemes-of-work'] });
      queryClient.invalidateQueries({ queryKey: ['schemes-for-approval'] });
      queryClient.invalidateQueries({ queryKey: ['scheme-approval-stats'] });
      toast.success('Scheme submitted for approval');
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit: ${error.message}`);
    },
  });
}

// Approve scheme
export function useApproveScheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, approverId }: { id: string; approverId: string }) => {
      const { data, error } = await supabase
        .from('schemes_of_work')
        .update({
          status: 'active',
          approved_by: approverId,
          approved_at: new Date().toISOString(),
          rejection_reason: null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemes-of-work'] });
      queryClient.invalidateQueries({ queryKey: ['schemes-for-approval'] });
      queryClient.invalidateQueries({ queryKey: ['scheme-approval-stats'] });
      queryClient.invalidateQueries({ queryKey: ['scheme-review'] });
      toast.success('Scheme of work approved');
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve: ${error.message}`);
    },
  });
}

// Reject scheme
export function useRejectScheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, approverId, reason }: { id: string; approverId: string; reason: string }) => {
      const { data, error } = await supabase
        .from('schemes_of_work')
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
      queryClient.invalidateQueries({ queryKey: ['schemes-of-work'] });
      queryClient.invalidateQueries({ queryKey: ['schemes-for-approval'] });
      queryClient.invalidateQueries({ queryKey: ['scheme-approval-stats'] });
      queryClient.invalidateQueries({ queryKey: ['scheme-review'] });
      toast.success('Scheme of work rejected');
    },
    onError: (error: Error) => {
      toast.error(`Failed to reject: ${error.message}`);
    },
  });
}
