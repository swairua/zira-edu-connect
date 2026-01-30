import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StudentRankInfo {
  studentId: string;
  classRank: number;
  totalStudents: number;
  totalMarks: number;
  average: number;
}

export function useParentReportCard(
  studentId: string | null,
  examId: string | null,
  institutionId: string | null
) {
  return useQuery({
    queryKey: ['parent-report-card', studentId, examId, institutionId],
    queryFn: async () => {
      if (!studentId || !examId || !institutionId) {
        return null;
      }

      // Fetch student details with class
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select(`
          id,
          first_name,
          last_name,
          admission_number,
          class_id,
          class:classes(id, name, level, stream)
        `)
        .eq('id', studentId)
        .single();

      if (studentError) throw studentError;

      // Fetch exam details
      const { data: exam, error: examError } = await supabase
        .from('exams')
        .select(`
          id,
          name,
          exam_type,
          max_marks,
          term:terms(name),
          academic_year:academic_years(name)
        `)
        .eq('id', examId)
        .single();

      if (examError) throw examError;

      // Fetch this student's scores
      const { data: studentScores, error: scoresError } = await supabase
        .from('student_scores')
        .select(`
          id,
          marks,
          grade,
          subject:subjects(id, name, code)
        `)
        .eq('student_id', studentId)
        .eq('exam_id', examId)
        .not('marks', 'is', null);

      if (scoresError) throw scoresError;

      // Fetch institution details
      const { data: institution, error: instError } = await supabase
        .from('institutions')
        .select('id, name, address, phone, email')
        .eq('id', institutionId)
        .single();

      if (instError) throw instError;

      // Calculate class rankings - get all students in the same class
      const { data: allClassScores, error: rankError } = await supabase
        .from('student_scores')
        .select(`
          student_id,
          marks,
          student:students!inner(id, class_id)
        `)
        .eq('exam_id', examId)
        .eq('student.class_id', student.class_id)
        .not('marks', 'is', null);

      if (rankError) throw rankError;

      // Group scores by student and calculate totals
      const studentTotals: Record<string, number> = {};
      allClassScores?.forEach((score) => {
        if (score.student_id && score.marks !== null) {
          studentTotals[score.student_id] = (studentTotals[score.student_id] || 0) + score.marks;
        }
      });

      // Sort students by total marks to get rankings
      const sortedStudents = Object.entries(studentTotals)
        .sort(([, a], [, b]) => b - a)
        .map(([id], index) => ({ id, rank: index + 1 }));

      const totalStudentsInClass = sortedStudents.length;
      const studentRankEntry = sortedStudents.find((s) => s.id === studentId);
      const classRank = studentRankEntry?.rank || 0;

      // Format scores for PDF
      const scores = studentScores?.map((score) => ({
        subject: score.subject?.name || 'Unknown',
        marks: score.marks || 0,
        grade: score.grade || '-',
        remarks: '',
      })) || [];

      const totalMarks = scores.reduce((sum, s) => sum + s.marks, 0);
      const maxPossible = (exam?.max_marks || 100) * scores.length;
      const average = maxPossible > 0 ? (totalMarks / maxPossible) * 100 : 0;

      return {
        student: {
          ...student,
          className: student.class?.name,
        },
        exam,
        scores,
        classRank,
        totalStudents: totalStudentsInClass,
        average,
        institution,
      };
    },
    enabled: !!studentId && !!examId && !!institutionId,
  });
}
