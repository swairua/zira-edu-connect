import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SystemStats {
  activeUsers24h: number;
  totalInstitutions: number;
  activeInstitutions: number;
  totalStudents: number;
  totalStaff: number;
  recentErrors: number;
  uptime: number;
}

export interface RecentActivity {
  id: string;
  action: string;
  entity_type: string;
  user_email: string | null;
  created_at: string;
}

export function useSystemHealth() {
  const statsQuery = useQuery({
    queryKey: ['system-health-stats'],
    queryFn: async (): Promise<SystemStats> => {
      // Get institution stats
      const { data: institutions, error: instError } = await supabase
        .from('institutions')
        .select('status, student_count, staff_count');

      if (instError) throw instError;

      const activeInstitutions = institutions?.filter(i => i.status === 'active').length || 0;
      const totalStudents = institutions?.reduce((sum, i) => sum + (i.student_count || 0), 0) || 0;
      const totalStaff = institutions?.reduce((sum, i) => sum + (i.staff_count || 0), 0) || 0;

      // Get recent audit logs for activity count
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: activityCount } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', twentyFourHoursAgo);

      // Get error count (actions containing 'error' or 'fail')
      const { count: errorCount } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', twentyFourHoursAgo)
        .or('action.ilike.%error%,action.ilike.%fail%');

      return {
        activeUsers24h: activityCount || 0,
        totalInstitutions: institutions?.length || 0,
        activeInstitutions,
        totalStudents,
        totalStaff,
        recentErrors: errorCount || 0,
        uptime: 99.9, // Placeholder - would come from external monitoring
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const recentActivityQuery = useQuery({
    queryKey: ['system-recent-activity'],
    queryFn: async (): Promise<RecentActivity[]> => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('id, action, entity_type, user_email, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const institutionsByStatusQuery = useQuery({
    queryKey: ['institutions-by-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('institutions')
        .select('status');

      if (error) throw error;

      const counts: Record<string, number> = {};
      data?.forEach(inst => {
        counts[inst.status] = (counts[inst.status] || 0) + 1;
      });

      return Object.entries(counts).map(([status, count]) => ({
        status,
        count,
      }));
    },
  });

  const institutionsByCountryQuery = useQuery({
    queryKey: ['institutions-by-country'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('institutions')
        .select('country');

      if (error) throw error;

      const counts: Record<string, number> = {};
      data?.forEach(inst => {
        counts[inst.country] = (counts[inst.country] || 0) + 1;
      });

      return Object.entries(counts).map(([country, count]) => ({
        country,
        count,
      }));
    },
  });

  return {
    stats: statsQuery.data,
    isLoadingStats: statsQuery.isLoading,
    recentActivity: recentActivityQuery.data || [],
    isLoadingActivity: recentActivityQuery.isLoading,
    institutionsByStatus: institutionsByStatusQuery.data || [],
    institutionsByCountry: institutionsByCountryQuery.data || [],
  };
}
