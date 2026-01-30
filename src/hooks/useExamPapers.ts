import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';
import { ExamPaper, ExamPaperQuestion, ExamPaperStatus } from '@/types/question-bank';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

interface PaperFilters {
  examId?: string;
  subjectId?: string;
  status?: ExamPaperStatus;
}

export function useExamPapers(filters: PaperFilters = {}) {
  const { institution } = useInstitution();

  return useQuery({
    queryKey: ['exam-papers', institution?.id, filters],
    queryFn: async () => {
      if (!institution?.id) return [];

      let query = supabase
        .from('exam_papers')
        .select(`
          *,
          subject:subjects(name, code),
          exam:exams(name, exam_type),
          creator:staff!created_by(first_name, last_name)
        `)
        .eq('institution_id', institution.id)
        .order('created_at', { ascending: false });

      if (filters.examId) query = query.eq('exam_id', filters.examId);
      if (filters.subjectId) query = query.eq('subject_id', filters.subjectId);
      if (filters.status) query = query.eq('status', filters.status);

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as ExamPaper[];
    },
    enabled: !!institution?.id,
  });
}

export function useExamPaper(paperId: string) {
  return useQuery({
    queryKey: ['exam-paper', paperId],
    queryFn: async () => {
      const { data: paper, error: paperError } = await supabase
        .from('exam_papers')
        .select(`
          *,
          subject:subjects(name, code),
          exam:exams(name, exam_type)
        `)
        .eq('id', paperId)
        .single();

      if (paperError) throw paperError;

      const { data: questions, error: questionsError } = await supabase
        .from('exam_paper_questions')
        .select(`
          *,
          question:question_bank(*)
        `)
        .eq('exam_paper_id', paperId)
        .order('section_index')
        .order('question_order');

      if (questionsError) throw questionsError;

      return { ...paper, questions } as unknown as ExamPaper & { questions: ExamPaperQuestion[] };
    },
    enabled: !!paperId,
  });
}

export function useCreateExamPaper() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paper: {
      institution_id: string;
      exam_id: string;
      subject_id: string;
      title: string;
      instructions?: string;
      duration_minutes?: number;
      total_marks?: number;
      sections?: unknown[];
      status?: string;
      created_by?: string;
    }) => {
      const insertData = {
        institution_id: paper.institution_id,
        exam_id: paper.exam_id,
        subject_id: paper.subject_id,
        title: paper.title,
        instructions: paper.instructions,
        duration_minutes: paper.duration_minutes,
        total_marks: paper.total_marks,
        sections: paper.sections as Json,
        status: paper.status as 'draft' | 'finalized' | 'archived',
        created_by: paper.created_by,
      };
      
      const { data, error } = await supabase
        .from('exam_papers')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-papers'] });
      toast.success('Exam paper created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create paper: ${error.message}`);
    },
  });
}

export function useUpdateExamPaper() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, sections, ...updates }: { id: string; sections?: unknown[] } & Record<string, unknown>) => {
      const { data, error } = await supabase
        .from('exam_papers')
        .update({
          ...updates,
          ...(sections ? { sections: sections as Json } : {}),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exam-papers'] });
      queryClient.invalidateQueries({ queryKey: ['exam-paper', variables.id] });
      toast.success('Exam paper updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update paper: ${error.message}`);
    },
  });
}

export function useAddQuestionToPaper() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      exam_paper_id: string;
      question_id: string;
      section_index: number;
      question_order: number;
      marks_override?: number;
    }) => {
      const { error } = await supabase
        .from('exam_paper_questions')
        .insert(data);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exam-paper', variables.exam_paper_id] });
      toast.success('Question added to paper');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add question: ${error.message}`);
    },
  });
}

export function useRemoveQuestionFromPaper() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ paperId, questionId }: { paperId: string; questionId: string }) => {
      const { error } = await supabase
        .from('exam_paper_questions')
        .delete()
        .eq('exam_paper_id', paperId)
        .eq('question_id', questionId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exam-paper', variables.paperId] });
      toast.success('Question removed from paper');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove question: ${error.message}`);
    },
  });
}
