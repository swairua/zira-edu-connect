import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SubjectSubmissionStatus {
  subjectId: string;
  subjectName: string;
  staffId: string | null;
  teacherName: string | null;
  totalStudents: number;
  submittedScores: number;
  hasSubmitted: boolean;
  lastUpdated: string | null;
}

export interface ExamSubmissionProgress {
  examId: string;
  examName: string;
  termName: string | null;
  draftDeadline: string | null;
  correctionDeadline: string | null;
  finalDeadline: string | null;
  subjects: SubjectSubmissionStatus[];
  totalSubjects: number;
  completedSubjects: number;
  overallProgress: number;
}

export function useExamSubmissionProgress(institutionId: string | null, examId?: string | null) {
  return useQuery({
    queryKey: ['exam-submission-progress', institutionId, examId],
    queryFn: async (): Promise<ExamSubmissionProgress[]> => {
      if (!institutionId) return [];

      // Get published exams with deadlines
      let query = supabase
        .from('exams')
        .select(`
          id,
          name,
          institution_id,
          draft_deadline,
          correction_deadline,
          final_deadline,
          term:terms(name)
        `)
        .eq('institution_id', institutionId)
        .eq('status', 'published')
        .not('draft_deadline', 'is', null);

      if (examId) {
        query = query.eq('id', examId);
      }

      const { data: exams, error: examsError } = await query;

      if (examsError) throw examsError;
      if (!exams || exams.length === 0) return [];

      const results: ExamSubmissionProgress[] = [];

      // Get all subjects for the institution
      const { data: allSubjects } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('institution_id', institutionId)
        .eq('is_active', true);

      // Get active student count for the institution
      const { count: studentCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('institution_id', institutionId)
        .eq('status', 'active');

      for (const exam of exams) {
        const subjects: SubjectSubmissionStatus[] = [];

        // For each subject, check if there are scores for this exam
        for (const subject of (allSubjects || [])) {
          // Get score count for this exam/subject
          const { count: scoreCount } = await supabase
            .from('student_scores')
            .select('*', { count: 'exact', head: true })
            .eq('exam_id', exam.id)
            .eq('subject_id', subject.id);

          // Get last update time
          const { data: lastScore } = await supabase
            .from('student_scores')
            .select('updated_at, entered_by')
            .eq('exam_id', exam.id)
            .eq('subject_id', subject.id)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Get teacher name if entered_by exists
          let teacherName: string | null = null;
          let staffId: string | null = null;
          if (lastScore?.entered_by) {
            const { data: staff } = await supabase
              .from('staff')
              .select('id, first_name, last_name')
              .eq('user_id', lastScore.entered_by)
              .maybeSingle();
            
            if (staff) {
              teacherName = `${staff.first_name} ${staff.last_name}`;
              staffId = staff.id;
            }
          }

          subjects.push({
            subjectId: subject.id,
            subjectName: subject.name,
            staffId,
            teacherName,
            totalStudents: studentCount || 0,
            submittedScores: scoreCount || 0,
            hasSubmitted: (scoreCount || 0) > 0,
            lastUpdated: lastScore?.updated_at || null,
          });
        }

        const completedSubjects = subjects.filter(s => s.hasSubmitted).length;
        const termData = exam.term as { name: string } | null;

        results.push({
          examId: exam.id,
          examName: exam.name,
          termName: termData?.name || null,
          draftDeadline: exam.draft_deadline,
          correctionDeadline: exam.correction_deadline,
          finalDeadline: exam.final_deadline,
          subjects,
          totalSubjects: subjects.length,
          completedSubjects,
          overallProgress: subjects.length > 0 ? (completedSubjects / subjects.length) * 100 : 0,
        });
      }

      return results;
    },
    enabled: !!institutionId,
  });
}

export function useExamsWithDeadlines(institutionId: string | null) {
  return useQuery({
    queryKey: ['exams-with-deadlines', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];

      const now = new Date();
      const sevenDaysFromNow = new Date(now);
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      const { data, error } = await supabase
        .from('exams')
        .select(`
          id,
          name,
          draft_deadline,
          correction_deadline,
          final_deadline,
          term:terms(name)
        `)
        .eq('institution_id', institutionId)
        .eq('status', 'published')
        .or(`draft_deadline.lte.${sevenDaysFromNow.toISOString()},correction_deadline.lte.${sevenDaysFromNow.toISOString()},final_deadline.lte.${sevenDaysFromNow.toISOString()}`)
        .or(`draft_deadline.gte.${now.toISOString()},correction_deadline.gte.${now.toISOString()},final_deadline.gte.${now.toISOString()}`);

      if (error) throw error;
      return data || [];
    },
    enabled: !!institutionId,
  });
}
