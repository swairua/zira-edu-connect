import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface LeaveRequest {
  id: string;
  institution_id: string;
  staff_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  staff?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  leave_type?: {
    id: string;
    name: string;
  };
}

export function useLeaveRequests(statusFilter?: string) {
  const { userRoles } = useAuth();
  const queryClient = useQueryClient();
  const institutionId = userRoles.find(r => r.institution_id)?.institution_id || null;

  const { data: leaveRequests = [], isLoading } = useQuery({
    queryKey: ['leave-requests', institutionId, statusFilter],
    queryFn: async () => {
      if (!institutionId) return [];
      let query = supabase
        .from('leave_requests')
        .select(`
          *,
          staff:staff!leave_requests_staff_id_fkey(id, first_name, last_name),
          leave_type:leave_types!leave_requests_leave_type_id_fkey(id, name)
        `)
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as LeaveRequest[];
    },
    enabled: !!institutionId,
  });

  const createLeaveRequest = useMutation({
    mutationFn: async (request: Partial<LeaveRequest>) => {
      if (!institutionId) throw new Error('No institution selected');
      const { data, error } = await supabase
        .from('leave_requests')
        .insert({
          staff_id: request.staff_id!,
          leave_type_id: request.leave_type_id!,
          start_date: request.start_date!,
          end_date: request.end_date!,
          days: request.days!,
          reason: request.reason,
          institution_id: institutionId,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast.success('Leave request submitted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit leave request: ${error.message}`);
    },
  });

  const approveLeaveRequest = useMutation({
    mutationFn: async ({ id, approvedBy }: { id: string; approvedBy: string }) => {
      const { data, error } = await supabase
        .from('leave_requests')
        .update({
          status: 'approved',
          approved_by: approvedBy,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast.success('Leave request approved');
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve leave request: ${error.message}`);
    },
  });

  const rejectLeaveRequest = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data, error } = await supabase
        .from('leave_requests')
        .update({
          status: 'rejected',
          rejection_reason: reason,
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast.success('Leave request rejected');
    },
    onError: (error: Error) => {
      toast.error(`Failed to reject leave request: ${error.message}`);
    },
  });

  const cancelLeaveRequest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('leave_requests')
        .update({ status: 'cancelled' })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast.success('Leave request cancelled');
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel leave request: ${error.message}`);
    },
  });

  return {
    leaveRequests,
    isLoading,
    createLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
    cancelLeaveRequest,
  };
}
