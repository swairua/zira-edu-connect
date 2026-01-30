import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface GradeApproval {
  id: string;
  institution_id: string;
  entity_type: 'exam' | 'assignment' | 'batch';
  entity_id: string;
  class_id: string | null;
  subject_id: string | null;
  exam_id: string | null;
  assignment_id: string | null;
  submitted_by: string;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  student_count: number;
  created_at: string;
  // Joined data
  submitter?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
  assignment?: {
    id: string;
    title: string;
    class: {
      id: string;
      name: string;
    };
    subject: {
      id: string;
      name: string;
    };
  };
  exam?: {
    id: string;
    name: string;
  };
}

export interface ApprovalAction {
  approvalId: string;
  action: 'approve' | 'reject' | 'request_revision';
  notes?: string;
}

// Fetch pending approvals for an institution
export function useGradeApprovals(institutionId: string | null, status?: string) {
  return useQuery({
    queryKey: ['grade-approvals', institutionId, status],
    queryFn: async () => {
      if (!institutionId) return [];

      let query = supabase
        .from('grade_approvals')
        .select(`
          *,
          assignment:assignments(
            id, 
            title,
            class:classes(id, name),
            subject:subjects(id, name)
          ),
          exam:exams(id, name)
        `)
        .eq('institution_id', institutionId)
        .order('submitted_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching grade approvals:', error);
        return [];
      }

      return (data || []) as unknown as GradeApproval[];
    },
    enabled: !!institutionId,
  });
}

// Fetch single approval with details
export function useGradeApprovalDetails(approvalId: string | undefined) {
  return useQuery({
    queryKey: ['grade-approval', approvalId],
    queryFn: async () => {
      if (!approvalId) return null;

      const { data, error } = await supabase
        .from('grade_approvals')
        .select(`
          *,
          assignment:assignments(
            id, 
            title,
            total_marks,
            class:classes(id, name, level),
            subject:subjects(id, name, code)
          ),
          exam:exams(id, name, max_marks)
        `)
        .eq('id', approvalId)
        .single();

      if (error) throw error;
      return data as unknown as GradeApproval;
    },
    enabled: !!approvalId,
  });
}

// Process approval action (approve/reject/request revision)
export function useProcessApproval() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ approvalId, action, notes }: ApprovalAction) => {
      if (!user) throw new Error('Not authenticated');

      // Permission check is done at UI level via usePermissions hook
      // The RLS policies on grade_approvals table enforce database-level security

      // Map action to status
      const statusMap = {
        approve: 'approved',
        reject: 'rejected',
        request_revision: 'revision_requested',
      };

      const newStatus = statusMap[action];

      // Update the approval record
      const { data: approval, error: approvalError } = await supabase
        .from('grade_approvals')
        .update({
          status: newStatus,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          review_notes: notes || null,
        })
        .eq('id', approvalId)
        .select()
        .single();

      if (approvalError) throw approvalError;

      // If approved, update all related submissions to 'approved' status
      if (action === 'approve' && approval.assignment_id) {
        const { error: submissionsError } = await supabase
          .from('assignment_submissions')
          .update({ 
            grading_status: 'approved',
            feedback_visible: true, // Make feedback visible upon approval
          })
          .eq('assignment_id', approval.assignment_id)
          .eq('grading_status', 'submitted');

        if (submissionsError) {
          console.error('Failed to update submissions:', submissionsError);
        }
      }

      // If rejected or revision requested, revert submissions to draft
      if ((action === 'reject' || action === 'request_revision') && approval.assignment_id) {
        const { error: submissionsError } = await supabase
          .from('assignment_submissions')
          .update({ grading_status: 'draft' })
          .eq('assignment_id', approval.assignment_id)
          .eq('grading_status', 'submitted');

        if (submissionsError) {
          console.error('Failed to update submissions:', submissionsError);
        }
      }

      // Log to audit
      await supabase.from('audit_logs').insert({
        action: `grades_${action}d`,
        entity_type: 'grade_approval',
        entity_id: approvalId,
        user_id: user.id,
        institution_id: approval.institution_id,
        new_values: { status: newStatus, notes },
      });

      // Create notification for the teacher who submitted
      try {
        const notificationMessages = {
          approve: 'Your grade submission has been approved',
          reject: 'Your grade submission has been rejected',
          request_revision: 'Revision requested for your grade submission',
        };

        await supabase.from('in_app_notifications').insert({
          institution_id: approval.institution_id,
          user_id: approval.submitted_by,
          user_type: 'staff',
          type: action === 'approve' ? 'success' : 'alert',
          title: 'Grade Approval Update',
          message: `${notificationMessages[action]}${notes ? `: ${notes}` : ''}`,
          is_read: false,
        });
      } catch (notifError) {
        console.error('Failed to create notification:', notifError);
        // Don't throw - notification failure shouldn't block the approval
      }

      return approval;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['grade-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['grade-approval', variables.approvalId] });
      queryClient.invalidateQueries({ queryKey: ['submissions-to-grade'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      
      const messages = {
        approve: 'Grades approved successfully',
        reject: 'Grades rejected',
        request_revision: 'Revision requested',
      };
      toast.success(messages[variables.action]);
    },
    onError: (error: any) => {
      toast.error('Failed to process approval', { description: error.message });
    },
  });
}

// Bulk approve multiple approvals
export function useBulkApprove() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (approvalIds: string[]) => {
      if (!user) throw new Error('Not authenticated');

      const results = await Promise.all(
        approvalIds.map(async (approvalId) => {
          const { data, error } = await supabase
            .from('grade_approvals')
            .update({
              status: 'approved',
              reviewed_by: user.id,
              reviewed_at: new Date().toISOString(),
            })
            .eq('id', approvalId)
            .select()
            .single();

          if (error) throw error;

          // Update related submissions
          if (data.assignment_id) {
            await supabase
              .from('assignment_submissions')
              .update({ 
                grading_status: 'approved',
                feedback_visible: true,
              })
              .eq('assignment_id', data.assignment_id)
              .eq('grading_status', 'submitted');
          }

          return data;
        })
      );

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grade-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['submissions-to-grade'] });
      toast.success('Selected grades approved');
    },
    onError: (error: any) => {
      toast.error('Failed to approve grades', { description: error.message });
    },
  });
}

// Get approval stats for dashboard
export function useApprovalStats(institutionId: string | null) {
  return useQuery({
    queryKey: ['approval-stats', institutionId],
    queryFn: async () => {
      if (!institutionId) return null;

      const { data, error } = await supabase
        .from('grade_approvals')
        .select('status')
        .eq('institution_id', institutionId);

      if (error) throw error;

      const stats = {
        pending: 0,
        approved: 0,
        rejected: 0,
        revision_requested: 0,
        total: data?.length || 0,
      };

      data?.forEach(item => {
        if (item.status in stats) {
          stats[item.status as keyof typeof stats]++;
        }
      });

      return stats;
    },
    enabled: !!institutionId,
  });
}
