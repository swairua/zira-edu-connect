import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { AssignmentSubmission, SubmitAssignmentInput } from '@/types/assignments';
import { toast } from 'sonner';
import { logAuditEvent } from './useAuditLogs';

export function useSubmissions(assignmentId: string | undefined) {
  return useQuery({
    queryKey: ['assignment-submissions', assignmentId],
    queryFn: async () => {
      if (!assignmentId) return [];
      
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select(`
          *,
          student:students(id, first_name, last_name, admission_number),
          parent:parents(id, first_name, last_name)
        `)
        .eq('assignment_id', assignmentId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data as AssignmentSubmission[];
    },
    enabled: !!assignmentId,
  });
}

export function useStudentSubmission(assignmentId: string | undefined, studentId: string | undefined) {
  return useQuery({
    queryKey: ['student-submission', assignmentId, studentId],
    queryFn: async () => {
      if (!assignmentId || !studentId) return null;
      
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('assignment_id', assignmentId)
        .eq('student_id', studentId)
        .maybeSingle();

      if (error) throw error;
      return data as AssignmentSubmission | null;
    },
    enabled: !!assignmentId && !!studentId,
  });
}

export function useStudentAssignmentsWithSubmissions(studentId: string | undefined, classId: string | undefined) {
  return useQuery({
    queryKey: ['student-assignments', studentId, classId],
    queryFn: async () => {
      if (!studentId || !classId) return [];
      
      // Get published assignments for the student's class
      const { data: assignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select(`
          *,
          class:classes(id, name, level),
          subject:subjects(id, name, code)
        `)
        .eq('class_id', classId)
        .eq('status', 'published')
        .order('due_date', { ascending: true });

      if (assignmentsError) throw assignmentsError;

      // Get student's submissions
      const { data: submissions, error: submissionsError } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('student_id', studentId);

      if (submissionsError) throw submissionsError;

      // Merge assignments with their submissions
      const submissionMap = new Map(submissions?.map(s => [s.assignment_id, s]) || []);
      
      return (assignments || []).map(assignment => ({
        ...assignment,
        submission: submissionMap.get(assignment.id) || null,
      })) as Array<{
        id: string;
        title: string;
        description: string | null;
        due_date: string;
        status: string;
        submission_type: string;
        allowed_file_types: string[];
        max_file_size_mb: number;
        allow_late_submission: boolean;
        allow_resubmission: boolean;
        class?: { id: string; name: string; level: string };
        subject?: { id: string; name: string; code: string };
        submission: {
          id: string;
          status: string;
          submitted_by_type: string;
          is_late: boolean;
          file_name: string | null;
          submitted_at: string | null;
        } | null;
      }>;
    },
    enabled: !!studentId && !!classId,
    staleTime: 60 * 1000,
  });
}

export function useSubmitAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SubmitAssignmentInput & { 
      institution_id: string;
      is_parent_submission: boolean;
      parent_id?: string;
    }) => {
      const { assignment_id, student_id, submission_type, text_content, file, institution_id, is_parent_submission, parent_id } = input;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let fileUrl: string | null = null;
      let fileName: string | null = null;
      let fileSize: number | null = null;

      // Upload file if provided
      if (file && submission_type === 'file') {
        const fileExt = file.name.split('.').pop();
        const filePath = `${institution_id}/${assignment_id}/${student_id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('assignment-submissions')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('assignment-submissions')
          .getPublicUrl(filePath);

        fileUrl = urlData.publicUrl;
        fileName = file.name;
        fileSize = file.size;
      }

      // Check if assignment is past due
      const { data: assignment } = await supabase
        .from('assignments')
        .select('due_date, allow_late_submission')
        .eq('id', assignment_id)
        .single();

      const isLate = assignment ? new Date() > new Date(assignment.due_date) : false;
      const status = isLate ? 'late' : 'submitted';

      // Create submission record
      const { data, error } = await supabase
        .from('assignment_submissions')
        .insert([{
          assignment_id,
          student_id,
          institution_id,
          submitted_by_user_id: user.id,
          submitted_by_type: is_parent_submission ? 'parent' : 'student',
          submitted_by_parent_id: parent_id || null,
          submission_type,
          text_content: text_content || null,
          file_url: fileUrl,
          file_name: fileName,
          file_size_bytes: fileSize,
          status,
          submitted_at: new Date().toISOString(),
          is_late: isLate,
          user_agent: navigator.userAgent,
        }])
        .select()
        .single();

      if (error) throw error;

      // Log audit event
      await logAuditEvent({
        action: 'assignment.submit',
        entityType: 'assignment_submission',
        entityId: data.id,
        institutionId: institution_id,
        metadata: {
          assignment_id,
          student_id,
          submitted_by_type: is_parent_submission ? 'parent' : 'student',
          submitted_by_parent_id: parent_id || null,
          is_late: isLate,
          file_name: fileName,
        },
      });

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['student-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['student-submission', data.assignment_id] });
      queryClient.invalidateQueries({ queryKey: ['assignment-submissions', data.assignment_id] });
      toast.success('Assignment submitted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to submit assignment: ' + error.message);
    },
  });
}
