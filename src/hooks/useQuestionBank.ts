import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Question, DifficultyLevel, QuestionType, CognitiveLevel } from '@/types/question-bank';
import { useInstitution } from '@/contexts/InstitutionContext';
import { toast } from 'sonner';

interface QuestionFilters {
  subjectId?: string;
  subStrandId?: string;
  topic?: string;
  difficulty?: DifficultyLevel;
  questionType?: QuestionType;
  cognitiveLevel?: CognitiveLevel;
  tags?: string[];
  isActive?: boolean;
}

export function useQuestions(filters: QuestionFilters = {}) {
  const { institution } = useInstitution();

  return useQuery({
    queryKey: ['questions', institution?.id, filters],
    queryFn: async () => {
      if (!institution?.id) return [];

      let query = supabase
        .from('question_bank')
        .select(`
          *,
          subject:subjects(name, code),
          sub_strand:cbc_sub_strands(name, strand:cbc_strands(name, subject_code)),
          creator:staff!created_by(first_name, last_name)
        `)
        .eq('institution_id', institution.id)
        .order('created_at', { ascending: false });

      if (filters.subjectId) query = query.eq('subject_id', filters.subjectId);
      if (filters.subStrandId) query = query.eq('sub_strand_id', filters.subStrandId);
      if (filters.difficulty) query = query.eq('difficulty', filters.difficulty);
      if (filters.questionType) query = query.eq('question_type', filters.questionType);
      if (filters.cognitiveLevel) query = query.eq('cognitive_level', filters.cognitiveLevel);
      if (filters.isActive !== undefined) query = query.eq('is_active', filters.isActive);
      if (filters.topic) query = query.ilike('topic', `%${filters.topic}%`);

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Question[];
    },
    enabled: !!institution?.id,
  });
}

export function useQuestion(questionId: string) {
  return useQuery({
    queryKey: ['question', questionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('question_bank')
        .select(`*, subject:subjects(name, code)`)
        .eq('id', questionId)
        .single();

      if (error) throw error;
      return data as unknown as Question;
    },
    enabled: !!questionId,
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (question: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from('question_bank')
        .insert(question as never)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast.success('Question created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create question: ${error.message}`);
    },
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Record<string, unknown>) => {
      const { data, error } = await supabase
        .from('question_bank')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast.success('Question updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update question: ${error.message}`);
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionId: string) => {
      const { error } = await supabase
        .from('question_bank')
        .delete()
        .eq('id', questionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast.success('Question deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete question: ${error.message}`);
    },
  });
}
