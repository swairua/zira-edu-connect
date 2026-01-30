import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface LeaveBalance {
  id: string;
  staff_id: string;
  leave_type_id: string;
  year: number;
  entitled: number;
  used: number;
  balance: number;
  staff?: {
    id: string;
    first_name: string;
    last_name: string;
    employee_number: string;
  };
  leave_type?: {
    id: string;
    name: string;
  };
}

export function useLeaveBalances(year?: number) {
  const { userRoles } = useAuth();
  const queryClient = useQueryClient();
  const institutionId = userRoles.find(r => r.institution_id)?.institution_id || null;
  const currentYear = year || new Date().getFullYear();

  const { data: balances = [], isLoading } = useQuery({
    queryKey: ['leave-balances', institutionId, currentYear],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data, error } = await supabase
        .from('leave_balances')
        .select(`
          *,
          staff:staff_id(id, first_name, last_name, employee_number),
          leave_type:leave_type_id(id, name)
        `)
        .eq('institution_id', institutionId)
        .eq('year', currentYear)
        .order('staff_id');
      if (error) throw error;
      return data as LeaveBalance[];
    },
    enabled: !!institutionId,
  });

  const updateBalance = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LeaveBalance> & { id: string }) => {
      const { data, error } = await supabase
        .from('leave_balances')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-balances'] });
      toast.success('Leave balance updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update balance: ${error.message}`);
    },
  });

  const initializeBalances = useMutation({
    mutationFn: async (staffIds: string[]) => {
      if (!institutionId) throw new Error('No institution');
      
      // Get all leave types
      const { data: leaveTypes } = await supabase
        .from('leave_types')
        .select('id, days_allowed')
        .eq('institution_id', institutionId)
        .eq('is_active', true);

      if (!leaveTypes?.length) throw new Error('No leave types configured');

      const balancesToInsert = staffIds.flatMap(staffId =>
        leaveTypes.map(lt => ({
          institution_id: institutionId,
          staff_id: staffId,
          leave_type_id: lt.id,
          year: currentYear,
          entitled_days: lt.days_allowed,
          used_days: 0,
          carried_days: 0,
        }))
      );

      const { error } = await supabase
        .from('leave_balances')
        .upsert(balancesToInsert, { onConflict: 'staff_id,leave_type_id,year' });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-balances'] });
      toast.success('Leave balances initialized');
    },
    onError: (error: Error) => {
      toast.error(`Failed to initialize: ${error.message}`);
    },
  });

  return {
    balances,
    isLoading,
    updateBalance,
    initializeBalances,
  };
}
