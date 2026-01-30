import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getGradeFromScore, type CountryCode } from '@/lib/country-config';
import { getGradeFromMarks, getCBCRubricFallback, type GradeLevel } from './useGradingScales';

export interface StudentScore {
  id: string;
  institution_id: string;
  exam_id: string;
  student_id: string;
  subject_id: string;
  marks: number | null;
  grade: string | null;
  remarks: string | null;
  status: string | null;
  entered_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  // Joined
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    admission_number: string;
  };
  subject?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface ScoreInput {
  student_id: string;
  subject_id: string;
  marks: number | null;
  grade?: string | null;
  remarks?: string | null;
}

export function useScores(examId: string | null, classId?: string | null, subjectId?: string | null) {
  return useQuery({
    queryKey: ['scores', examId, classId, subjectId],
    queryFn: async () => {
      if (!examId) return [];

      let query = supabase
        .from('student_scores')
        .select(`
          *,
          student:students(id, first_name, last_name, admission_number, class_id),
          subject:subjects(id, name, code)
        `)
        .eq('exam_id', examId);

      if (subjectId) {
        query = query.eq('subject_id', subjectId);
      }

      const { data, error } = await query.order('created_at', { ascending: true });
      if (error) throw error;

      // Filter by class if specified
      if (classId) {
        return (data as any[]).filter(score => score.student?.class_id === classId);
      }

      return data as StudentScore[];
    },
    enabled: !!examId,
  });
}

// Calculate grade using institution's configurable scale, curriculum fallback, or country config
function calculateGrade(
  marks: number,
  gradeLevels: Pick<GradeLevel, 'grade' | 'min_marks' | 'max_marks' | 'points' | 'description'>[] | undefined,
  countryCode: CountryCode,
  curriculum?: string | null
): string {
  // Priority 1: Use custom grading scale if available
  if (gradeLevels && gradeLevels.length > 0) {
    const result = getGradeFromMarks(marks, gradeLevels);
    return result?.grade || 'N/A';
  }
  // Priority 2: CBC rubric fallback for ke_cbc curriculum
  if (curriculum === 'ke_cbc') {
    const result = getGradeFromMarks(marks, getCBCRubricFallback());
    return result?.grade || 'BE2';
  }
  // Priority 3: Fallback to country-based grading
  return getGradeFromScore(marks, countryCode);
}

export function useUpsertScores(
  institutionId: string | null,
  countryCode: CountryCode = 'KE',
  gradeLevels?: Pick<GradeLevel, 'grade' | 'min_marks' | 'max_marks' | 'points' | 'description'>[],
  curriculum?: string | null
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ examId, scores, staffId }: { examId: string; scores: ScoreInput[]; staffId?: string }) => {
      if (!institutionId) throw new Error('Institution ID required');

      // Calculate grades for each score using configurable scale
      const scoresWithGrades = scores.map(score => ({
        institution_id: institutionId,
        exam_id: examId,
        student_id: score.student_id,
        subject_id: score.subject_id,
        marks: score.marks,
        grade: score.marks !== null ? calculateGrade(score.marks, gradeLevels, countryCode, curriculum) : null,
        remarks: score.remarks || null,
        status: 'entered',
        entered_by: staffId || null,
        updated_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from('student_scores')
        .upsert(scoresWithGrades, {
          onConflict: 'exam_id,student_id,subject_id',
          ignoreDuplicates: false,
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scores', variables.examId] });
      toast.success('Scores saved successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to save scores', { description: error.message });
    },
  });
}

export function useExamScoreStats(examId: string | null) {
  return useQuery({
    queryKey: ['exam-score-stats', examId],
    queryFn: async () => {
      if (!examId) return null;

      const { data, error } = await supabase
        .from('student_scores')
        .select('id, marks, status')
        .eq('exam_id', examId);

      if (error) throw error;

      const total = data.length;
      const entered = data.filter(s => s.marks !== null).length;
      const avgMarks = data.filter(s => s.marks !== null).length > 0
        ? data.filter(s => s.marks !== null).reduce((sum, s) => sum + (s.marks || 0), 0) / entered
        : 0;

      return {
        total,
        entered,
        pending: total - entered,
        avgMarks: Math.round(avgMarks * 10) / 10,
      };
    },
    enabled: !!examId,
  });
}
