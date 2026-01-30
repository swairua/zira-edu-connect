import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TransportRoute, TransportStop } from './useTransportRoutes';

export interface TransportSubscription {
  id: string;
  institution_id: string;
  student_id: string;
  route_id: string | null;
  stop_id: string | null;
  academic_year_id: string | null;
  term_id: string | null;
  subscription_type: 'pickup' | 'dropoff' | 'both';
  start_date: string;
  end_date: string | null;
  status: 'pending' | 'active' | 'suspended' | 'cancelled' | 'ended';
  suspended_reason: string | null;
  suspended_at: string | null;
  fee_amount: number;
  currency: string;
  created_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  parent_requested: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  route?: TransportRoute;
  stop?: TransportStop;
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    admission_number: string;
  };
}

export interface TransportSubscriptionHistory {
  id: string;
  subscription_id: string;
  action: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  changed_by: string | null;
  change_reason: string | null;
  created_at: string;
}

export interface CreateSubscriptionInput {
  institution_id: string;
  student_id: string;
  route_id: string;
  stop_id?: string;
  academic_year_id?: string;
  term_id?: string;
  subscription_type?: 'pickup' | 'dropoff' | 'both';
  start_date: string;
  end_date?: string;
  fee_amount: number;
  currency?: string;
  parent_requested?: boolean;
  notes?: string;
}

export interface SubscriptionFilters {
  status?: string;
  routeId?: string;
  termId?: string;
  search?: string;
}

export function useTransportSubscriptions(institutionId: string | undefined, filters?: SubscriptionFilters) {
  return useQuery({
    queryKey: ['transport-subscriptions', institutionId, filters],
    queryFn: async () => {
      if (!institutionId) return [];
      
      let query = supabase
        .from('transport_subscriptions')
        .select(`
          *,
          route:transport_routes(*),
          stop:transport_stops(*),
          student:students(id, first_name, last_name, admission_number)
        `)
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false });
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.routeId) {
        query = query.eq('route_id', filters.routeId);
      }
      if (filters?.termId) {
        query = query.eq('term_id', filters.termId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as TransportSubscription[];
    },
    enabled: !!institutionId,
  });
}

export function useStudentTransportSubscription(studentId: string | undefined, termId?: string) {
  return useQuery({
    queryKey: ['transport-subscription-student', studentId, termId],
    queryFn: async () => {
      if (!studentId) return null;
      
      let query = supabase
        .from('transport_subscriptions')
        .select(`
          *,
          route:transport_routes(*),
          stop:transport_stops(*)
        `)
        .eq('student_id', studentId)
        .in('status', ['active', 'pending', 'suspended'])
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (termId) {
        query = query.eq('term_id', termId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data?.[0] as TransportSubscription | null;
    },
    enabled: !!studentId,
  });
}

export function usePendingSubscriptions(institutionId: string | undefined) {
  return useQuery({
    queryKey: ['transport-subscriptions-pending', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      
      const { data, error } = await supabase
        .from('transport_subscriptions')
        .select(`
          *,
          route:transport_routes(*),
          stop:transport_stops(*),
          student:students(id, first_name, last_name, admission_number)
        `)
        .eq('institution_id', institutionId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TransportSubscription[];
    },
    enabled: !!institutionId,
  });
}

export function useSubscriptionHistory(subscriptionId: string | undefined) {
  return useQuery({
    queryKey: ['transport-subscription-history', subscriptionId],
    queryFn: async () => {
      if (!subscriptionId) return [];
      
      const { data, error } = await supabase
        .from('transport_subscription_history')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TransportSubscriptionHistory[];
    },
    enabled: !!subscriptionId,
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateSubscriptionInput) => {
      const { data, error } = await supabase
        .from('transport_subscriptions')
        .insert({
          ...input,
          status: input.parent_requested ? 'pending' : 'active',
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transport-subscriptions', variables.institution_id] });
      queryClient.invalidateQueries({ queryKey: ['transport-subscription-student', variables.student_id] });
      toast.success('Subscription created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create subscription: ${error.message}`);
    },
  });
}

export function useApproveSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, institutionId }: { id: string; institutionId: string }) => {
      const { data, error } = await supabase
        .from('transport_subscriptions')
        .update({
          status: 'active',
          approved_by: (await supabase.auth.getUser()).data.user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data, institutionId };
    },
    onSuccess: ({ institutionId }) => {
      queryClient.invalidateQueries({ queryKey: ['transport-subscriptions', institutionId] });
      queryClient.invalidateQueries({ queryKey: ['transport-subscriptions-pending', institutionId] });
      toast.success('Subscription approved');
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve subscription: ${error.message}`);
    },
  });
}

export function useSuspendSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, reason, institutionId }: { id: string; reason: string; institutionId: string }) => {
      const { data, error } = await supabase
        .from('transport_subscriptions')
        .update({
          status: 'suspended',
          suspended_reason: reason,
          suspended_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data, institutionId };
    },
    onSuccess: ({ institutionId }) => {
      queryClient.invalidateQueries({ queryKey: ['transport-subscriptions', institutionId] });
      toast.success('Subscription suspended');
    },
    onError: (error: Error) => {
      toast.error(`Failed to suspend subscription: ${error.message}`);
    },
  });
}

export function useReactivateSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, institutionId }: { id: string; institutionId: string }) => {
      const { data, error } = await supabase
        .from('transport_subscriptions')
        .update({
          status: 'active',
          suspended_reason: null,
          suspended_at: null,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data, institutionId };
    },
    onSuccess: ({ institutionId }) => {
      queryClient.invalidateQueries({ queryKey: ['transport-subscriptions', institutionId] });
      toast.success('Subscription reactivated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to reactivate subscription: ${error.message}`);
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, institutionId }: { id: string; institutionId: string }) => {
      const { data, error } = await supabase
        .from('transport_subscriptions')
        .update({
          status: 'cancelled',
          end_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data, institutionId };
    },
    onSuccess: ({ institutionId }) => {
      queryClient.invalidateQueries({ queryKey: ['transport-subscriptions', institutionId] });
      toast.success('Subscription cancelled');
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel subscription: ${error.message}`);
    },
  });
}

export function useRejectSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, reason, institutionId }: { id: string; reason?: string; institutionId: string }) => {
      const { data, error } = await supabase
        .from('transport_subscriptions')
        .update({
          status: 'cancelled',
          notes: reason ? `Rejected: ${reason}` : 'Rejected',
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data, institutionId };
    },
    onSuccess: ({ institutionId }) => {
      queryClient.invalidateQueries({ queryKey: ['transport-subscriptions', institutionId] });
      queryClient.invalidateQueries({ queryKey: ['transport-subscriptions-pending', institutionId] });
      toast.success('Subscription rejected');
    },
    onError: (error: Error) => {
      toast.error(`Failed to reject subscription: ${error.message}`);
    },
  });
}
