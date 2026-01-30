import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StudentRanking {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  classId: string;
  className: string;
  stream?: string;
  totalMarks: number;
  subjectCount: number;
  average: number;
  classRank: number;
  gradeRank?: number;
  overallRank: number;
}

interface ClassPerformanceSummary {
  classId: string;
  className: string;
  stream?: string;
  studentCount: number;
  average: number;
  highestAverage: number;
  lowestAverage: number;
  passRate: number;
  topStudent?: {
    name: string;
    average: number;
  };
}

interface StreamPerformance {
  stream: string;
  average: number;
  studentCount: number;
  passRate: number;
}

export function useClassPerformance(
  institutionId: string | null,
  examId?: string,
  classId?: string
) {
  return useQuery({
    queryKey: ['class-performance', institutionId, examId, classId],
    queryFn: async () => {
      if (!institutionId || !examId) {
        return {
          rankings: [] as StudentRanking[],
          classSummaries: [] as ClassPerformanceSummary[],
          streamPerformance: [] as StreamPerformance[],
        };
      }

      // Fetch scores with student and class info
      let query = supabase
        .from('student_scores')
        .select(`
          marks,
          student_id,
          students!inner(
            id,
            first_name,
            last_name,
            admission_number,
            class_id,
            classes!inner(id, name, level, stream)
          )
        `)
        .eq('institution_id', institutionId)
        .eq('exam_id', examId)
        .not('marks', 'is', null);

      if (classId) {
        query = query.eq('students.class_id', classId);
      }

      const { data: scores, error } = await query;

      if (error) {
        console.error('Error fetching class performance:', error);
        throw error;
      }

      if (!scores || scores.length === 0) {
        return {
          rankings: [],
          classSummaries: [],
          streamPerformance: [],
        };
      }

      // Aggregate scores by student
      const studentScores = new Map<string, {
        student: any;
        totalMarks: number;
        subjectCount: number;
      }>();

      for (const score of scores) {
        const student = score.students as any;
        if (!student) continue;

        if (!studentScores.has(student.id)) {
          studentScores.set(student.id, {
            student,
            totalMarks: 0,
            subjectCount: 0,
          });
        }
        const entry = studentScores.get(student.id)!;
        entry.totalMarks += score.marks || 0;
        entry.subjectCount += 1;
      }

      // Calculate averages and create rankings
      const studentsWithAverages = Array.from(studentScores.entries()).map(([id, data]) => ({
        studentId: id,
        studentName: `${data.student.first_name} ${data.student.last_name}`,
        admissionNumber: data.student.admission_number,
        classId: data.student.class_id,
        className: data.student.classes?.name || '',
        stream: data.student.classes?.stream,
        level: data.student.classes?.level,
        totalMarks: data.totalMarks,
        subjectCount: data.subjectCount,
        average: Math.round((data.totalMarks / data.subjectCount) * 10) / 10,
      }));

      // Sort by average for overall ranking
      studentsWithAverages.sort((a, b) => b.average - a.average);
      
      // Assign overall ranks
      const rankings: StudentRanking[] = studentsWithAverages.map((student, index) => ({
        ...student,
        overallRank: index + 1,
        classRank: 0,
        gradeRank: 0,
      }));

      // Calculate class ranks
      const classGroups = new Map<string, StudentRanking[]>();
      for (const student of rankings) {
        if (!classGroups.has(student.classId)) {
          classGroups.set(student.classId, []);
        }
        classGroups.get(student.classId)!.push(student);
      }

      for (const [, students] of classGroups) {
        students.sort((a, b) => b.average - a.average);
        students.forEach((student, index) => {
          student.classRank = index + 1;
        });
      }

      // Calculate grade/level ranks
      const levelGroups = new Map<string, StudentRanking[]>();
      for (const student of rankings) {
        const level = studentsWithAverages.find(s => s.studentId === student.studentId)?.level;
        if (level) {
          if (!levelGroups.has(level)) {
            levelGroups.set(level, []);
          }
          levelGroups.get(level)!.push(student);
        }
      }

      for (const [, students] of levelGroups) {
        students.sort((a, b) => b.average - a.average);
        students.forEach((student, index) => {
          student.gradeRank = index + 1;
        });
      }

      // Class summaries
      const classSummaries: ClassPerformanceSummary[] = Array.from(classGroups.entries()).map(([classId, students]) => {
        const averages = students.map(s => s.average);
        const classAverage = averages.reduce((a, b) => a + b, 0) / averages.length;
        const passing = students.filter(s => s.average >= 50).length;
        const topStudent = students[0];

        return {
          classId,
          className: students[0]?.className || '',
          stream: students[0]?.stream,
          studentCount: students.length,
          average: Math.round(classAverage * 10) / 10,
          highestAverage: Math.max(...averages),
          lowestAverage: Math.min(...averages),
          passRate: Math.round((passing / students.length) * 100),
          topStudent: topStudent ? {
            name: topStudent.studentName,
            average: topStudent.average,
          } : undefined,
        };
      }).sort((a, b) => b.average - a.average);

      // Stream performance
      const streamGroups = new Map<string, StudentRanking[]>();
      for (const student of rankings) {
        const stream = student.stream || 'No Stream';
        if (!streamGroups.has(stream)) {
          streamGroups.set(stream, []);
        }
        streamGroups.get(stream)!.push(student);
      }

      const streamPerformance: StreamPerformance[] = Array.from(streamGroups.entries()).map(([stream, students]) => {
        const averages = students.map(s => s.average);
        const average = averages.reduce((a, b) => a + b, 0) / averages.length;
        const passing = students.filter(s => s.average >= 50).length;

        return {
          stream,
          average: Math.round(average * 10) / 10,
          studentCount: students.length,
          passRate: Math.round((passing / students.length) * 100),
        };
      }).sort((a, b) => b.average - a.average);

      return {
        rankings,
        classSummaries,
        streamPerformance,
      };
    },
    enabled: !!institutionId && !!examId,
  });
}
