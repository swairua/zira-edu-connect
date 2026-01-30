import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BusinessMetrics {
  mrr: number;
  mrrGrowthRate: number;
  subscriptionGrowthRate: number;
  activeCount: number;
  churnedCount: number;
  churnRate: number;
  avgRevenuePerInstitution: number;
}

export interface RevenueByCountry {
  country: string;
  countryName: string;
  revenue: number;
  institutionCount: number;
}

export interface TopInstitution {
  id: string;
  name: string;
  country: string;
  plan: string;
  studentCount: number;
  revenue: number;
}

export interface SubscriptionTierDistribution {
  tier: string;
  count: number;
  percentage: number;
}

const PLAN_PRICING: Record<string, number> = {
  free: 0,
  starter: 2500,
  professional: 7500,
  enterprise: 25000,
};

const COUNTRY_NAMES: Record<string, string> = {
  KE: 'Kenya',
  UG: 'Uganda',
  TZ: 'Tanzania',
  RW: 'Rwanda',
  NG: 'Nigeria',
  GH: 'Ghana',
  ZA: 'South Africa',
};

export function useSuperAdminMetrics() {
  const businessMetricsQuery = useQuery({
    queryKey: ['super-admin-business-metrics'],
    queryFn: async (): Promise<BusinessMetrics> => {
      const { data: institutions, error } = await supabase
        .from('institutions')
        .select('id, status, subscription_plan, student_count, created_at, churn_reason');

      if (error) throw error;

      const active = institutions?.filter(i => i.status === 'active') || [];
      const churned = institutions?.filter(i => i.status === 'churned') || [];

      // Calculate MRR
      const mrr = active.reduce((sum, inst) => {
        return sum + (PLAN_PRICING[inst.subscription_plan] || 0);
      }, 0);

      // Calculate growth rates (comparing this month to last month)
      const now = new Date();
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const newThisMonth = institutions?.filter(i => 
        new Date(i.created_at) >= startOfThisMonth
      ).length || 0;

      const newLastMonth = institutions?.filter(i => 
        new Date(i.created_at) >= startOfLastMonth && new Date(i.created_at) < startOfThisMonth
      ).length || 0;

      const subscriptionGrowthRate = newLastMonth > 0 
        ? ((newThisMonth - newLastMonth) / newLastMonth) * 100 
        : (newThisMonth > 0 ? 100 : 0);

      // Estimate MRR growth (simplified)
      const lastMonthMrr = mrr * 0.95; // Estimate
      const mrrGrowthRate = lastMonthMrr > 0 ? ((mrr - lastMonthMrr) / lastMonthMrr) * 100 : 0;

      const churnRate = (active.length + churned.length) > 0 
        ? (churned.length / (active.length + churned.length)) * 100 
        : 0;

      const avgRevenuePerInstitution = active.length > 0 ? mrr / active.length : 0;

      return {
        mrr,
        mrrGrowthRate,
        subscriptionGrowthRate,
        activeCount: active.length,
        churnedCount: churned.length,
        churnRate,
        avgRevenuePerInstitution,
      };
    },
  });

  const revenueByCountryQuery = useQuery({
    queryKey: ['super-admin-revenue-by-country'],
    queryFn: async (): Promise<RevenueByCountry[]> => {
      const { data: institutions, error } = await supabase
        .from('institutions')
        .select('country, subscription_plan')
        .eq('status', 'active');

      if (error) throw error;

      const countryRevenue: Record<string, { revenue: number; count: number }> = {};

      institutions?.forEach(inst => {
        if (!countryRevenue[inst.country]) {
          countryRevenue[inst.country] = { revenue: 0, count: 0 };
        }
        countryRevenue[inst.country].revenue += PLAN_PRICING[inst.subscription_plan] || 0;
        countryRevenue[inst.country].count++;
      });

      return Object.entries(countryRevenue)
        .map(([country, data]) => ({
          country,
          countryName: COUNTRY_NAMES[country] || country,
          revenue: data.revenue,
          institutionCount: data.count,
        }))
        .sort((a, b) => b.revenue - a.revenue);
    },
  });

  const topInstitutionsQuery = useQuery({
    queryKey: ['super-admin-top-institutions'],
    queryFn: async (): Promise<TopInstitution[]> => {
      const { data: institutions, error } = await supabase
        .from('institutions')
        .select('id, name, country, subscription_plan, student_count')
        .eq('status', 'active')
        .order('student_count', { ascending: false })
        .limit(10);

      if (error) throw error;

      return (institutions || []).map(inst => ({
        id: inst.id,
        name: inst.name,
        country: inst.country,
        plan: inst.subscription_plan,
        studentCount: inst.student_count,
        revenue: PLAN_PRICING[inst.subscription_plan] || 0,
      }));
    },
  });

  const tierDistributionQuery = useQuery({
    queryKey: ['super-admin-tier-distribution'],
    queryFn: async (): Promise<SubscriptionTierDistribution[]> => {
      const { data: institutions, error } = await supabase
        .from('institutions')
        .select('subscription_plan')
        .eq('status', 'active');

      if (error) throw error;

      const tierCounts: Record<string, number> = {
        free: 0,
        starter: 0,
        professional: 0,
        enterprise: 0,
      };

      institutions?.forEach(inst => {
        if (tierCounts[inst.subscription_plan] !== undefined) {
          tierCounts[inst.subscription_plan]++;
        }
      });

      const total = institutions?.length || 0;

      return Object.entries(tierCounts).map(([tier, count]) => ({
        tier: tier.charAt(0).toUpperCase() + tier.slice(1),
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }));
    },
  });

  return {
    businessMetrics: businessMetricsQuery.data,
    isLoadingBusinessMetrics: businessMetricsQuery.isLoading,
    revenueByCountry: revenueByCountryQuery.data || [],
    isLoadingRevenueByCountry: revenueByCountryQuery.isLoading,
    topInstitutions: topInstitutionsQuery.data || [],
    isLoadingTopInstitutions: topInstitutionsQuery.isLoading,
    tierDistribution: tierDistributionQuery.data || [],
    isLoadingTierDistribution: tierDistributionQuery.isLoading,
  };
}
