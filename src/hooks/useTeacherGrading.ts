import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useStaffProfile } from '@/hooks/useStaffProfile';
import { getGradeFromScore, CountryCode } from '@/lib/country-config';
import { getGradeFromMarks, GradeLevel } from '@/hooks/useGradingScales';
import { toast } from 'sonner';

// Types
export interface TeacherAssignment {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  submission_type: string;
  status: string;
  total_marks: number;
  weight_percentage: number;
  assessment_type: string;
  grading_deadline: string | null;
  class_id: string;
  subject_id: string;
  institution_id: string;
  created_at: string;
  class: {
    id: string;
    name: string;
    level: string;
    stream: string | null;
  };
  subject: {
    id: string;
    name: string;
    code: string | null;
  };
  _count?: {
    submissions: number;
    graded: number;
    pending: number;
  };
}

export interface SubmissionToGrade {
  id: string;
  student_id: string;
  assignment_id: string;
  text_content: string | null;
  file_url: string | null;
  file_name: string | null;
  submitted_at: string | null;
  is_late: boolean | null;
  status: string;
  marks: number | null;
  grade: string | null;
  feedback: string | null;
  grading_status: string;
  graded_at: string | null;
  student: {
    id: string;
    first_name: string;
    last_name: string;
    admission_number: string;
  };
}

export interface GradeInput {
  submissionId: string;
  marks: number;
  feedback?: string;
  isDraft?: boolean;
}

export interface BulkGradeInput {
  assignmentId: string;
  grades: {
    submissionId: string;
    studentId: string;
    marks: number;
    feedback?: string;
  }[];
  submitForApproval?: boolean;
  gradeLevels?: GradeLevel[]; // Optional configurable grading scale
}

// Hook to fetch assignments for grading (teacher's assignments)
export function useTeacherAssignments() {
  const { data: profile } = useStaffProfile();

  return useQuery({
    queryKey: ['teacher-assignments', profile?.id],
    queryFn: async () => {
      if (!profile) return [];

      // Get assignments for classes the teacher is assigned to
      const { data: teacherClasses } = await supabase
        .from('class_teachers')
        .select('class_id, subject_id')
        .eq('staff_id', profile.id);

      if (!teacherClasses || teacherClasses.length === 0) return [];

      const classIds = [...new Set(teacherClasses.map(tc => tc.class_id))];

      const { data: assignments, error } = await supabase
        .from('assignments')
        .select(`
          *,
          class:classes(id, name, level, stream),
          subject:subjects(id, name, code)
        `)
        .eq('institution_id', profile.institution_id)
        .eq('status', 'published')
        .in('class_id', classIds)
        .order('due_date', { ascending: false });

      if (error) {
        console.error('Error fetching teacher assignments:', error);
        return [];
      }

      // Get submission counts for each assignment
      const assignmentsWithCounts = await Promise.all(
        (assignments || []).map(async (assignment) => {
          const { data: submissions } = await supabase
            .from('assignment_submissions')
            .select('id, grading_status')
            .eq('assignment_id', assignment.id);

          const submissionCount = submissions?.length || 0;
          const gradedCount = submissions?.filter(s => 
            ['submitted', 'approved', 'locked'].includes(s.grading_status)
          ).length || 0;
          const pendingCount = submissions?.filter(s => 
            ['pending', 'draft'].includes(s.grading_status)
          ).length || 0;

          return {
            ...assignment,
            _count: {
              submissions: submissionCount,
              graded: gradedCount,
              pending: pendingCount,
            },
          } as TeacherAssignment;
        })
      );

      return assignmentsWithCounts;
    },
    enabled: !!profile,
  });
}

// Hook to fetch submissions for a specific assignment
export function useSubmissionsToGrade(assignmentId: string | undefined) {
  return useQuery({
    queryKey: ['submissions-to-grade', assignmentId],
    queryFn: async () => {
      if (!assignmentId) return [];

      // Get the assignment to know the class
      const { data: assignment } = await supabase
        .from('assignments')
        .select('class_id, institution_id')
        .eq('id', assignmentId)
        .single();

      if (!assignment) return [];

      // Get all students in the class
      const { data: students } = await supabase
        .from('students')
        .select('id, first_name, last_name, admission_number')
        .eq('class_id', assignment.class_id)
        .eq('status', 'active')
        .order('first_name');

      if (!students || students.length === 0) return [];

      // Get existing submissions
      const { data: submissions } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('assignment_id', assignmentId);

      // Map students to submissions (create placeholder for those without submissions)
      const result: SubmissionToGrade[] = students.map(student => {
        const submission = submissions?.find(s => s.student_id === student.id);
        
        return {
          id: submission?.id || `placeholder-${student.id}`,
          student_id: student.id,
          assignment_id: assignmentId,
          text_content: submission?.text_content || null,
          file_url: submission?.file_url || null,
          file_name: submission?.file_name || null,
          submitted_at: submission?.submitted_at || null,
          is_late: submission?.is_late || null,
          status: submission?.status || 'not_submitted',
          marks: submission?.marks || null,
          grade: submission?.grade || null,
          feedback: submission?.feedback || null,
          grading_status: submission?.grading_status || 'pending',
          graded_at: submission?.graded_at || null,
          student: {
            id: student.id,
            first_name: student.first_name,
            last_name: student.last_name,
            admission_number: student.admission_number,
          },
        };
      });

      return result;
    },
    enabled: !!assignmentId,
  });
}

// Hook to grade a single submission
export function useGradeSubmission(countryCode: CountryCode = 'KE', gradeLevels?: GradeLevel[]) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Helper to calculate grade using configurable scale or fallback
  const calculateGrade = (marks: number): string => {
    if (gradeLevels && gradeLevels.length > 0) {
      const result = getGradeFromMarks(marks, gradeLevels);
      return result?.grade || 'N/A';
    }
    return getGradeFromScore(marks, countryCode);
  };

  return useMutation({
    mutationFn: async ({ submissionId, marks, feedback, isDraft = false }: GradeInput) => {
      if (!user) throw new Error('Not authenticated');

      const grade = calculateGrade(marks);
      const gradingStatus = isDraft ? 'draft' : 'submitted';

      const { data, error } = await supabase
        .from('assignment_submissions')
        .update({
          marks,
          grade,
          feedback: feedback || null,
          grading_status: gradingStatus,
          graded_by: user.id,
          graded_at: new Date().toISOString(),
        })
        .eq('id', submissionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['submissions-to-grade'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      toast.success(variables.isDraft ? 'Draft saved' : 'Grade submitted');
    },
    onError: (error: any) => {
      toast.error('Failed to save grade', { description: error.message });
    },
  });
}

// Hook to bulk grade submissions
export function useBulkGradeSubmissions(
  institutionId: string | null, 
  countryCode: CountryCode = 'KE'
) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ assignmentId, grades, submitForApproval = false, gradeLevels }: BulkGradeInput) => {
      if (!user || !institutionId) throw new Error('Not authenticated');

      // Helper to calculate grade using configurable scale or fallback
      const calculateGrade = (marks: number): string => {
        if (gradeLevels && gradeLevels.length > 0) {
          const result = getGradeFromMarks(marks, gradeLevels);
          return result?.grade || 'N/A';
        }
        return getGradeFromScore(marks, countryCode);
      };

      const updates = grades.map(g => ({
        id: g.submissionId,
        marks: g.marks,
        grade: calculateGrade(g.marks),
        feedback: g.feedback || null,
        grading_status: submitForApproval ? 'submitted' : 'draft',
        graded_by: user.id,
        graded_at: new Date().toISOString(),
      }));

      // Update each submission
      const results = await Promise.all(
        updates.map(async (update) => {
          // Check if this is a placeholder (no actual submission)
          if (update.id.startsWith('placeholder-')) {
            // Create a new submission entry for grading
            const studentId = update.id.replace('placeholder-', '');
            const { data, error } = await supabase
              .from('assignment_submissions')
              .insert({
                assignment_id: assignmentId,
                student_id: studentId,
                institution_id: institutionId,
                submission_type: 'graded_directly',
                status: 'graded',
                marks: update.marks,
                grade: update.grade,
                feedback: update.feedback,
                grading_status: update.grading_status,
                graded_by: update.graded_by,
                graded_at: update.graded_at,
                submitted_by_type: 'teacher',
              })
              .select()
              .single();

            if (error) throw error;
            return data;
          } else {
            const { data, error } = await supabase
              .from('assignment_submissions')
              .update({
                marks: update.marks,
                grade: update.grade,
                feedback: update.feedback,
                grading_status: update.grading_status,
                graded_by: update.graded_by,
                graded_at: update.graded_at,
              })
              .eq('id', update.id)
              .select()
              .single();

            if (error) throw error;
            return data;
          }
        })
      );

      // If submitting for approval, create approval record
      if (submitForApproval) {
        const { error: approvalError } = await supabase
          .from('grade_approvals')
          .insert({
            institution_id: institutionId,
            entity_type: 'assignment',
            entity_id: assignmentId,
            assignment_id: assignmentId,
            submitted_by: user.id,
            student_count: grades.length,
            status: 'pending',
          });

        if (approvalError) {
          console.error('Failed to create approval record:', approvalError);
        }
      }

      // Log to audit
      await supabase.from('audit_logs').insert({
        action: submitForApproval ? 'grades_submitted_for_approval' : 'grades_saved_draft',
        entity_type: 'assignment',
        entity_id: assignmentId,
        user_id: user.id,
        institution_id: institutionId,
        new_values: { student_count: grades.length },
      });

      return results;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['submissions-to-grade', variables.assignmentId] });
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['grade-approvals'] });
      toast.success(
        variables.submitForApproval 
          ? 'Grades submitted for approval' 
          : 'Draft grades saved'
      );
    },
    onError: (error: any) => {
      toast.error('Failed to save grades', { description: error.message });
    },
  });
}

// Hook to get assignment details with grading info
export function useAssignmentForGrading(assignmentId: string | undefined) {
  return useQuery({
    queryKey: ['assignment-for-grading', assignmentId],
    queryFn: async () => {
      if (!assignmentId) return null;

      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          class:classes(id, name, level, stream),
          subject:subjects(id, name, code),
          academic_year:academic_years(id, name),
          term:terms(id, name)
        `)
        .eq('id', assignmentId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!assignmentId,
  });
}
