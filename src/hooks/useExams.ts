import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Exam {
  id: string;
  institution_id: string;
  academic_year_id?: string | null;
  term_id?: string | null;
  name: string;
  exam_type: string;
  start_date?: string | null;
  end_date?: string | null;
  max_marks?: number | null;
  weight_percentage?: number | null;
  status?: string | null;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  // Deadline fields
  draft_deadline?: string | null;
  correction_deadline?: string | null;
  final_deadline?: string | null;
  allow_late_submission?: boolean;
  late_submission_penalty_percent?: number | null;
  // Joined
  term?: {
    id: string;
    name: string;
  } | null;
  academic_year?: {
    id: string;
    name: string;
  } | null;
}

export interface CreateExamInput {
  institution_id: string;
  academic_year_id?: string;
  term_id?: string;
  name: string;
  exam_type: string;
  start_date?: string;
  end_date?: string;
  max_marks?: number;
  weight_percentage?: number;
  // Deadline fields
  draft_deadline?: string;
  correction_deadline?: string;
  final_deadline?: string;
  allow_late_submission?: boolean;
  late_submission_penalty_percent?: number;
}

export function useExams(institutionId: string | null, academicYearId?: string | null) {
  return useQuery({
    queryKey: ['exams', institutionId, academicYearId],
    queryFn: async () => {
      if (!institutionId) return [];

      let query = supabase
        .from('exams')
        .select(`
          *,
          term:terms(id, name),
          academic_year:academic_years(id, name)
        `)
        .eq('institution_id', institutionId)
        .order('start_date', { ascending: false });

      if (academicYearId) {
        query = query.eq('academic_year_id', academicYearId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Exam[];
    },
    enabled: !!institutionId,
  });
}

export function useExam(examId: string | null) {
  return useQuery({
    queryKey: ['exam', examId],
    queryFn: async () => {
      if (!examId) return null;

      const { data, error } = await supabase
        .from('exams')
        .select(`
          *,
          term:terms(id, name),
          academic_year:academic_years(id, name)
        `)
        .eq('id', examId)
        .single();

      if (error) throw error;
      return data as Exam;
    },
    enabled: !!examId,
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateExamInput) => {
      const { data, error } = await supabase
        .from('exams')
        .insert({
          ...input,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['exams', data.institution_id] });
      toast.success('Exam created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create exam', { description: error.message });
    },
  });
}

export function useUpdateExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Exam> & { id: string }) => {
      const { data, error } = await supabase
        .from('exams')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['exam', data.id] });
      toast.success('Exam updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update exam', { description: error.message });
    },
  });
}

export function usePublishExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (examId: string) => {
      const { data, error } = await supabase
        .from('exams')
        .update({ status: 'published', updated_at: new Date().toISOString() })
        .eq('id', examId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['exam', data.id] });
      toast.success('Exam results published');
    },
    onError: (error: Error) => {
      toast.error('Failed to publish exam', { description: error.message });
    },
  });
}
