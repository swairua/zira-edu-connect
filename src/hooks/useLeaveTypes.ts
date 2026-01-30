import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface LeaveType {
  id: string;
  institution_id: string;
  name: string;
  days_allowed: number;
  carry_forward: boolean;
  requires_approval: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useLeaveTypes() {
  const { userRoles } = useAuth();
  const queryClient = useQueryClient();
  const institutionId = userRoles.find(r => r.institution_id)?.institution_id || null;

  const { data: leaveTypes = [], isLoading } = useQuery({
    queryKey: ['leave-types', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data, error } = await supabase
        .from('leave_types')
        .select('*')
        .eq('institution_id', institutionId)
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data as LeaveType[];
    },
    enabled: !!institutionId,
  });

  const createLeaveType = useMutation({
    mutationFn: async (leaveType: Partial<LeaveType>) => {
      if (!institutionId) throw new Error('No institution selected');
      const { data, error } = await supabase
        .from('leave_types')
        .insert({
          name: leaveType.name!,
          days_allowed: leaveType.days_allowed || 0,
          carry_forward: leaveType.carry_forward || false,
          requires_approval: leaveType.requires_approval ?? true,
          institution_id: institutionId,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-types'] });
      toast.success('Leave type created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create leave type: ${error.message}`);
    },
  });

  const updateLeaveType = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LeaveType> & { id: string }) => {
      const { data, error } = await supabase
        .from('leave_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-types'] });
      toast.success('Leave type updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update leave type: ${error.message}`);
    },
  });

  const deleteLeaveType = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('leave_types')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-types'] });
      toast.success('Leave type deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete leave type: ${error.message}`);
    },
  });

  return {
    leaveTypes,
    isLoading,
    createLeaveType,
    updateLeaveType,
    deleteLeaveType,
  };
}
