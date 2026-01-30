import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TransportPolicySettings {
  id: string;
  institution_id: string;
  enable_auto_suspension: boolean;
  suspension_days_overdue: number;
  suspension_grace_period_days: number;
  require_approval_for_subscription: boolean;
  allow_parent_self_service: boolean;
  send_suspension_notice: boolean;
  notice_days_before_suspension: number;
  created_at: string;
  updated_at: string;
}

export interface UpdatePolicyInput {
  enable_auto_suspension?: boolean;
  suspension_days_overdue?: number;
  suspension_grace_period_days?: number;
  require_approval_for_subscription?: boolean;
  allow_parent_self_service?: boolean;
  send_suspension_notice?: boolean;
  notice_days_before_suspension?: number;
}

export function useTransportPolicies(institutionId: string | undefined) {
  return useQuery({
    queryKey: ['transport-policies', institutionId],
    queryFn: async () => {
      if (!institutionId) return null;
      
      const { data, error } = await supabase
        .from('transport_policy_settings')
        .select('*')
        .eq('institution_id', institutionId)
        .maybeSingle();
      
      if (error) throw error;
      return data as TransportPolicySettings | null;
    },
    enabled: !!institutionId,
  });
}

export function useUpdateTransportPolicies() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ institutionId, updates }: { institutionId: string; updates: UpdatePolicyInput }) => {
      // First check if settings exist
      const { data: existing } = await supabase
        .from('transport_policy_settings')
        .select('id')
        .eq('institution_id', institutionId)
        .maybeSingle();
      
      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('transport_policy_settings')
          .update(updates)
          .eq('institution_id', institutionId)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('transport_policy_settings')
          .insert({ institution_id: institutionId, ...updates })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transport-policies', data.institution_id] });
      toast.success('Policy settings updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update policies: ${error.message}`);
    },
  });
}
