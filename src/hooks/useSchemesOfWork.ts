import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useInstitution } from '@/contexts/InstitutionContext';

// Database row type
interface SchemeOfWorkRow {
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
  status: string;
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
  entries?: SchemeEntryRow[];
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
  created_at: string;
  updated_at: string;
}

// Fetch schemes of work
export function useSchemesOfWork(options?: {
  teacherId?: string;
  classId?: string;
  subjectId?: string;
  termId?: string;
}) {
  const { institutionId } = useInstitution();

  return useQuery({
    queryKey: ['schemes-of-work', institutionId, options],
    queryFn: async () => {
      let query = supabase
        .from('schemes_of_work')
        .select(`
          *,
          subject:subjects(id, name, code),
          class:classes(id, name, level),
          term:terms(id, name),
          teacher:staff!schemes_of_work_teacher_id_fkey(id, first_name, last_name)
        `)
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false });

      if (options?.teacherId) query = query.eq('teacher_id', options.teacherId);
      if (options?.classId) query = query.eq('class_id', options.classId);
      if (options?.subjectId) query = query.eq('subject_id', options.subjectId);
      if (options?.termId) query = query.eq('term_id', options.termId);

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as SchemeOfWorkRow[];
    },
    enabled: !!institutionId,
  });
}

// Fetch single scheme with entries
export function useSchemeOfWork(id?: string) {
  return useQuery({
    queryKey: ['scheme-of-work', id],
    queryFn: async () => {
      if (!id) return null;

      const { data: scheme, error: schemeError } = await supabase
        .from('schemes_of_work')
        .select(`
          *,
          subject:subjects(id, name, code),
          class:classes(id, name, level),
          term:terms(id, name),
          teacher:staff(id, first_name, last_name)
        `)
        .eq('id', id)
        .maybeSingle();

      if (schemeError) throw schemeError;
      if (!scheme) return null;

      // Fetch entries
      const { data: entries, error: entriesError } = await supabase
        .from('scheme_entries')
        .select(`
          *,
          strand:cbc_strands(*),
          sub_strand:cbc_sub_strands(*)
        `)
        .eq('scheme_id', id)
        .order('week_number');

      if (entriesError) throw entriesError;

      return { ...scheme, entries } as unknown as SchemeOfWorkRow;
    },
    enabled: !!id,
  });
}

// Create scheme of work
export function useCreateScheme() {
  const queryClient = useQueryClient();
  const { institutionId } = useInstitution();

  return useMutation({
    mutationFn: async (scheme: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from('schemes_of_work')
        .insert({ ...scheme, institution_id: institutionId } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemes-of-work'] });
      toast.success('Scheme of work created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create scheme: ${error.message}`);
    },
  });
}

// Update scheme of work
export function useUpdateScheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Record<string, unknown> & { id: string }) => {
      const { data, error } = await supabase
        .from('schemes_of_work')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['schemes-of-work'] });
      queryClient.invalidateQueries({ queryKey: ['scheme-of-work', data.id] });
      toast.success('Scheme updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update scheme: ${error.message}`);
    },
  });
}

// Delete scheme
export function useDeleteScheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('schemes_of_work')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemes-of-work'] });
      toast.success('Scheme deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete scheme: ${error.message}`);
    },
  });
}

// === Scheme Entries ===

// Add scheme entry
export function useCreateSchemeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from('scheme_entries')
        .insert(entry as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['scheme-of-work', data.scheme_id] });
      toast.success('Week entry added');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add entry: ${error.message}`);
    },
  });
}

// Update scheme entry
export function useUpdateSchemeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, schemeId, ...updates }: Record<string, unknown> & { id: string; schemeId: string }) => {
      const { data, error } = await supabase
        .from('scheme_entries')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, schemeId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['scheme-of-work', data.schemeId] });
      toast.success('Entry updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update entry: ${error.message}`);
    },
  });
}

// Delete scheme entry
export function useDeleteSchemeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, schemeId }: { id: string; schemeId: string }) => {
      const { error } = await supabase
        .from('scheme_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { schemeId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['scheme-of-work', data.schemeId] });
      toast.success('Entry deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete entry: ${error.message}`);
    },
  });
}

// Bulk upsert scheme entries (for quick editing)
export function useBulkUpsertSchemeEntries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ schemeId, entries }: { schemeId: string; entries: Record<string, unknown>[] }) => {
      const { data, error } = await supabase
        .from('scheme_entries')
        .upsert(
          entries.map(e => ({ ...e, scheme_id: schemeId })) as any,
          { onConflict: 'scheme_id,week_number,topic' }
        )
        .select();

      if (error) throw error;
      return { schemeId, count: data.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['scheme-of-work', data.schemeId] });
      toast.success(`${data.count} entries saved`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to save entries: ${error.message}`);
    },
  });
}

// Generate empty scheme entries for all weeks
export function useGenerateSchemeEntries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ schemeId, weeks }: { schemeId: string; weeks: number }) => {
      const entries = Array.from({ length: weeks }, (_, i) => ({
        scheme_id: schemeId,
        week_number: i + 1,
        topic: `Week ${i + 1}`,
        objectives: [],
        learning_activities: [],
        teaching_resources: [],
        assessment_methods: [],
      }));

      const { data, error } = await supabase
        .from('scheme_entries')
        .insert(entries)
        .select();

      if (error) throw error;
      return { schemeId, count: data.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['scheme-of-work', data.schemeId] });
      toast.success(`${data.count} week entries created`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to generate entries: ${error.message}`);
    },
  });
}
