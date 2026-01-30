import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SubjectStats {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  average: number;
  highest: number;
  lowest: number;
  passRate: number;
  totalStudents: number;
}

interface ClassStats {
  classId: string;
  className: string;
  average: number;
  studentCount: number;
  passRate: number;
}

interface GradeDistribution {
  grade: string;
  count: number;
  percentage: number;
}

interface ExamPerformanceStats {
  subjectStats: SubjectStats[];
  classStats: ClassStats[];
  gradeDistribution: GradeDistribution[];
  overallAverage: number;
  totalStudents: number;
  topPerformers: number;
  passRate: number;
}

export function useExamPerformanceStats(
  institutionId: string | null,
  examId?: string,
  classId?: string
) {
  return useQuery({
    queryKey: ['exam-performance-stats', institutionId, examId, classId],
    queryFn: async (): Promise<ExamPerformanceStats> => {
      if (!institutionId) {
        return {
          subjectStats: [],
          classStats: [],
          gradeDistribution: [],
          overallAverage: 0,
          totalStudents: 0,
          topPerformers: 0,
          passRate: 0,
        };
      }

      // Build query
      let query = supabase
        .from('student_scores')
        .select(`
          id,
          marks,
          grade,
          subject_id,
          student_id,
          exam_id,
          subjects!inner(id, name, code),
          students!inner(id, first_name, last_name, class_id, classes!inner(id, name))
        `)
        .eq('institution_id', institutionId)
        .not('marks', 'is', null);

      if (examId) {
        query = query.eq('exam_id', examId);
      }

      if (classId) {
        query = query.eq('students.class_id', classId);
      }

      const { data: scores, error } = await query;

      if (error) {
        console.error('Error fetching exam performance:', error);
        throw error;
      }

      if (!scores || scores.length === 0) {
        return {
          subjectStats: [],
          classStats: [],
          gradeDistribution: [],
          overallAverage: 0,
          totalStudents: 0,
          topPerformers: 0,
          passRate: 0,
        };
      }

      // Calculate subject statistics
      const subjectMap = new Map<string, { marks: number[]; subject: any }>();
      const classMap = new Map<string, { marks: number[]; class: any; studentIds: Set<string> }>();
      const gradeCount = new Map<string, number>();
      const allMarks: number[] = [];
      const uniqueStudents = new Set<string>();

      for (const score of scores) {
        const marks = score.marks || 0;
        const subject = score.subjects as any;
        const student = score.students as any;
        const cls = student?.classes;
        const grade = score.grade || 'E';

        allMarks.push(marks);
        uniqueStudents.add(score.student_id);

        // Subject stats
        if (subject) {
          if (!subjectMap.has(subject.id)) {
            subjectMap.set(subject.id, { marks: [], subject });
          }
          subjectMap.get(subject.id)!.marks.push(marks);
        }

        // Class stats
        if (cls) {
          if (!classMap.has(cls.id)) {
            classMap.set(cls.id, { marks: [], class: cls, studentIds: new Set() });
          }
          classMap.get(cls.id)!.marks.push(marks);
          classMap.get(cls.id)!.studentIds.add(score.student_id);
        }

        // Grade distribution
        gradeCount.set(grade, (gradeCount.get(grade) || 0) + 1);
      }

      // Build subject stats
      const subjectStats: SubjectStats[] = Array.from(subjectMap.entries()).map(([id, data]) => {
        const marks = data.marks;
        const average = marks.reduce((a, b) => a + b, 0) / marks.length;
        const passing = marks.filter(m => m >= 50).length;
        return {
          subjectId: id,
          subjectName: data.subject.name,
          subjectCode: data.subject.code,
          average: Math.round(average * 10) / 10,
          highest: Math.max(...marks),
          lowest: Math.min(...marks),
          passRate: Math.round((passing / marks.length) * 100),
          totalStudents: marks.length,
        };
      }).sort((a, b) => b.average - a.average);

      // Build class stats
      const classStats: ClassStats[] = Array.from(classMap.entries()).map(([id, data]) => {
        const marks = data.marks;
        const average = marks.reduce((a, b) => a + b, 0) / marks.length;
        const passing = marks.filter(m => m >= 50).length;
        return {
          classId: id,
          className: data.class.name,
          average: Math.round(average * 10) / 10,
          studentCount: data.studentIds.size,
          passRate: Math.round((passing / marks.length) * 100),
        };
      }).sort((a, b) => b.average - a.average);

      // Build grade distribution
      const totalGrades = Array.from(gradeCount.values()).reduce((a, b) => a + b, 0);
      const gradeOrder = ['A', 'B', 'C', 'D', 'E'];
      const gradeDistribution: GradeDistribution[] = gradeOrder.map(grade => ({
        grade,
        count: gradeCount.get(grade) || 0,
        percentage: Math.round(((gradeCount.get(grade) || 0) / totalGrades) * 100),
      }));

      // Overall stats
      const overallAverage = allMarks.reduce((a, b) => a + b, 0) / allMarks.length;
      const totalPassing = allMarks.filter(m => m >= 50).length;
      const topPerformers = gradeCount.get('A') || 0;

      return {
        subjectStats,
        classStats,
        gradeDistribution,
        overallAverage: Math.round(overallAverage * 10) / 10,
        totalStudents: uniqueStudents.size,
        topPerformers,
        passRate: Math.round((totalPassing / allMarks.length) * 100),
      };
    },
    enabled: !!institutionId,
  });
}
