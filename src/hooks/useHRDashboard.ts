import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

export function useHRDashboard() {
  const { userRoles } = useAuth();
  const institutionId = userRoles.find(r => r.institution_id)?.institution_id || null;
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['hr-dashboard-stats', institutionId, today],
    queryFn: async () => {
      if (!institutionId) return null;

      // Get total active staff
      const { count: totalStaff } = await supabase
        .from('staff')
        .select('*', { count: 'exact', head: true })
        .eq('institution_id', institutionId)
        .eq('is_active', true);

      // Get pending leave requests
      const { count: pendingLeave } = await supabase
        .from('leave_requests')
        .select('*', { count: 'exact', head: true })
        .eq('institution_id', institutionId)
        .eq('status', 'pending');

      // Get present today
      const { count: presentToday } = await supabase
        .from('hr_staff_attendance')
        .select('*', { count: 'exact', head: true })
        .eq('institution_id', institutionId)
        .eq('date', today)
        .eq('status', 'present');

      // Get on leave today
      const { count: onLeaveToday } = await supabase
        .from('leave_requests')
        .select('*', { count: 'exact', head: true })
        .eq('institution_id', institutionId)
        .eq('status', 'approved')
        .lte('start_date', today)
        .gte('end_date', today);

      return {
        totalStaff: totalStaff || 0,
        pendingLeave: pendingLeave || 0,
        presentToday: presentToday || 0,
        onLeaveToday: onLeaveToday || 0,
      };
    },
    enabled: !!institutionId,
  });

  const { data: pendingRequests = [] } = useQuery({
    queryKey: ['hr-pending-requests', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data, error } = await supabase
        .from('leave_requests')
        .select(`
          *,
          staff:staff_id(id, first_name, last_name),
          leave_type:leave_type_id(name)
        `)
        .eq('institution_id', institutionId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!institutionId,
  });

  const { data: recentActivity = [] } = useQuery({
    queryKey: ['hr-recent-activity', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data, error } = await supabase
        .from('leave_requests')
        .select(`
          *,
          staff:staff_id(id, first_name, last_name),
          leave_type:leave_type_id(name)
        `)
        .eq('institution_id', institutionId)
        .in('status', ['approved', 'rejected'])
        .order('updated_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!institutionId,
  });

  return {
    stats,
    isLoading,
    pendingRequests,
    recentActivity,
  };
}
