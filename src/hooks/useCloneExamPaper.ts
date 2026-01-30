import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

interface CloneExamPaperParams {
  paperId: string;
  newTitle: string;
  newExamId?: string;
  institutionId: string;
  createdBy: string;
}

export function useCloneExamPaper() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ paperId, newTitle, newExamId, institutionId, createdBy }: CloneExamPaperParams) => {
      // 1. Fetch the original paper
      const { data: original, error: fetchError } = await supabase
        .from('exam_papers')
        .select('*')
        .eq('id', paperId)
        .single();

      if (fetchError) throw fetchError;

      // 2. Create a new paper with the same data
      const { data: newPaper, error: createError } = await supabase
        .from('exam_papers')
        .insert({
          institution_id: institutionId,
          exam_id: newExamId || original.exam_id,
          subject_id: original.subject_id,
          title: newTitle,
          instructions: original.instructions,
          duration_minutes: original.duration_minutes,
          total_marks: original.total_marks,
          sections: original.sections as Json,
          status: 'draft' as const,
          created_by: createdBy,
        })
        .select()
        .single();

      if (createError) throw createError;

      // 3. Fetch and clone the questions
      const { data: questions, error: questionsError } = await supabase
        .from('exam_paper_questions')
        .select('*')
        .eq('exam_paper_id', paperId);

      if (questionsError) throw questionsError;

      if (questions && questions.length > 0) {
        const newQuestions = questions.map((q) => ({
          exam_paper_id: newPaper.id,
          question_id: q.question_id,
          section_index: q.section_index,
          question_order: q.question_order,
          marks_override: q.marks_override,
        }));

        const { error: insertError } = await supabase
          .from('exam_paper_questions')
          .insert(newQuestions);

        if (insertError) throw insertError;
      }

      return newPaper;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-papers'] });
      toast.success('Exam paper cloned successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to clone paper: ${error.message}`);
    },
  });
}
