import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useStaffProfile } from '@/hooks/useStaffProfile';
import { toast } from 'sonner';

export interface MyLeaveRequest {
  id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  days: number;
  half_day: boolean;
  half_day_period: string | null;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  rejection_reason: string | null;
  attachment_url: string | null;
  created_at: string;
  approved_at: string | null;
  leave_type?: {
    id: string;
    name: string;
  };
}

export interface MyLeaveBalance {
  id: string;
  leave_type_id: string;
  year: number;
  entitled_days: number;
  used_days: number;
  carried_days: number;
  leave_type?: {
    id: string;
    name: string;
  };
}

export interface SubmitLeaveRequest {
  leave_type_id: string;
  start_date: string;
  end_date: string;
  days: number;
  half_day?: boolean;
  half_day_period?: 'morning' | 'afternoon';
  reason?: string;
  attachment_url?: string;
}

export function useMyLeave() {
  const { data: profile, isLoading: profileLoading } = useStaffProfile();
  const queryClient = useQueryClient();

  const { data: myRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['my-leave-requests', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from('leave_requests')
        .select(`
          id, leave_type_id, start_date, end_date, days, half_day, half_day_period,
          reason, status, rejection_reason, attachment_url, created_at, approved_at,
          leave_type:leave_types!leave_requests_leave_type_id_fkey(id, name)
        `)
        .eq('staff_id', profile.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as MyLeaveRequest[];
    },
    enabled: !!profile?.id,
  });

  const { data: myBalances = [], isLoading: balancesLoading } = useQuery({
    queryKey: ['my-leave-balances', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const currentYear = new Date().getFullYear();
      const { data, error } = await supabase
        .from('leave_balances')
        .select(`
          id, leave_type_id, year, entitled_days, used_days, carried_days,
          leave_type:leave_types!leave_balances_leave_type_id_fkey(id, name)
        `)
        .eq('staff_id', profile.id)
        .eq('year', currentYear);
      if (error) throw error;
      return data as unknown as MyLeaveBalance[];
    },
    enabled: !!profile?.id,
  });

  const { data: leaveTypes = [] } = useQuery({
    queryKey: ['leave-types-for-request', profile?.institution?.id],
    queryFn: async () => {
      if (!profile?.institution?.id) return [];
      const { data, error } = await supabase
        .from('leave_types')
        .select('id, name, days_allowed, requires_approval')
        .eq('institution_id', profile.institution.id)
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.institution?.id,
  });

  const submitRequest = useMutation({
    mutationFn: async (request: SubmitLeaveRequest) => {
      if (!profile?.id || !profile?.institution?.id) {
        throw new Error('Profile not loaded');
      }
      const { data, error } = await supabase
        .from('leave_requests')
        .insert({
          staff_id: profile.id,
          institution_id: profile.institution.id,
          leave_type_id: request.leave_type_id,
          start_date: request.start_date,
          end_date: request.end_date,
          days: request.days,
          half_day: request.half_day || false,
          half_day_period: request.half_day_period || null,
          reason: request.reason || null,
          attachment_url: request.attachment_url || null,
          status: 'pending',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-leave-requests'] });
      toast.success('Leave request submitted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit request: ${error.message}`);
    },
  });

  const cancelRequest = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('leave_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId)
        .eq('status', 'pending');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-leave-requests'] });
      toast.success('Leave request cancelled');
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel request: ${error.message}`);
    },
  });

  const pendingRequests = myRequests.filter(r => r.status === 'pending');
  const approvedRequests = myRequests.filter(r => r.status === 'approved');

  return {
    profile,
    myRequests,
    myBalances,
    leaveTypes,
    pendingRequests,
    approvedRequests,
    submitRequest,
    cancelRequest,
    isLoading: profileLoading || requestsLoading || balancesLoading,
  };
}
