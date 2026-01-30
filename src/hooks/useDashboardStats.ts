import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalInstitutions: number;
  activeInstitutions: number;
  totalStudents: number;
  totalStaff: number;
  newInstitutionsThisMonth: number;
  pendingTickets: number;
  countryDistribution: { name: string; value: number; code: string }[];
}

const countryNames: Record<string, string> = {
  KE: 'Kenya',
  UG: 'Uganda',
  TZ: 'Tanzania',
  RW: 'Rwanda',
  NG: 'Nigeria',
  GH: 'Ghana',
  ZA: 'South Africa',
};

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const { data: institutions, error } = await supabase
        .from('institutions')
        .select('status, student_count, staff_count, country, created_at');

      if (error) throw error;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const totalInstitutions = institutions?.length || 0;
      const activeInstitutions = institutions?.filter(i => i.status === 'active').length || 0;
      const totalStudents = institutions?.reduce((sum, i) => sum + (i.student_count || 0), 0) || 0;
      const totalStaff = institutions?.reduce((sum, i) => sum + (i.staff_count || 0), 0) || 0;
      const newInstitutionsThisMonth = institutions?.filter(i => 
        new Date(i.created_at) >= startOfMonth
      ).length || 0;

      // Country distribution
      const countryCounts: Record<string, number> = {};
      institutions?.forEach(i => {
        countryCounts[i.country] = (countryCounts[i.country] || 0) + 1;
      });

      const countryDistribution = Object.entries(countryCounts)
        .map(([code, value]) => ({
          name: countryNames[code] || code,
          value,
          code,
        }))
        .sort((a, b) => b.value - a.value);

      return {
        totalInstitutions,
        activeInstitutions,
        totalStudents,
        totalStaff,
        newInstitutionsThisMonth,
        pendingTickets: 0, // Placeholder - would need a tickets table
        countryDistribution,
      };
    },
  });
}

export function useRecentInstitutions(limit = 5) {
  return useQuery({
    queryKey: ['recent-institutions', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('institutions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
}
