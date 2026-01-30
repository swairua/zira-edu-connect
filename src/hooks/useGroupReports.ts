import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface GroupReportData {
  campusId: string;
  campusName: string;
  studentCount: number;
  staffCount: number;
  totalRevenue: number;
  collectedAmount: number;
  outstandingAmount: number;
  collectionRate: number;
}

interface ConsolidatedStats {
  totalStudents: number;
  totalStaff: number;
  totalRevenue: number;
  totalCollected: number;
  totalOutstanding: number;
  avgCollectionRate: number;
}

export function useGroupReports(groupId?: string) {
  const { user } = useAuth();

  // Optimized: Single query to fetch all campus data with aggregated financials
  const { data: campusReports, isLoading: isLoadingReports } = useQuery({
    queryKey: ['group-reports', groupId],
    queryFn: async () => {
      if (!groupId) return [];

      // Get all campuses in the group with their counts
      const { data: campuses, error: campusError } = await supabase
        .from('institutions')
        .select('id, name, code, student_count, staff_count')
        .eq('group_id', groupId);

      if (campusError) throw campusError;
      if (!campuses || campuses.length === 0) return [];

      const campusIds = campuses.map(c => c.id);

      // Fetch all invoices for these campuses in ONE query
      const { data: invoiceData } = await supabase
        .from('student_invoices')
        .select('institution_id, total_amount')
        .in('institution_id', campusIds);

      // Fetch all payments for these campuses in ONE query
      const { data: paymentData } = await supabase
        .from('student_payments')
        .select('institution_id, amount')
        .in('institution_id', campusIds);

      // Aggregate data by institution
      const invoicesByInstitution = (invoiceData ?? []).reduce((acc, inv) => {
        acc[inv.institution_id] = (acc[inv.institution_id] || 0) + (inv.total_amount || 0);
        return acc;
      }, {} as Record<string, number>);

      const paymentsByInstitution = (paymentData ?? []).reduce((acc, pay) => {
        acc[pay.institution_id] = (acc[pay.institution_id] || 0) + (pay.amount || 0);
        return acc;
      }, {} as Record<string, number>);

      // Build reports
      return campuses.map((campus) => {
        const totalRevenue = invoicesByInstitution[campus.id] ?? 0;
        const collectedAmount = paymentsByInstitution[campus.id] ?? 0;
        const outstandingAmount = totalRevenue - collectedAmount;
        const collectionRate = totalRevenue > 0 ? (collectedAmount / totalRevenue) * 100 : 0;

        return {
          campusId: campus.id,
          campusName: campus.name,
          studentCount: campus.student_count ?? 0,
          staffCount: campus.staff_count ?? 0,
          totalRevenue,
          collectedAmount,
          outstandingAmount,
          collectionRate,
        } as GroupReportData;
      });
    },
    enabled: !!groupId && !!user,
  });

  // Calculate consolidated stats
  const consolidatedStats: ConsolidatedStats = campusReports?.reduce(
    (acc, campus) => ({
      totalStudents: acc.totalStudents + campus.studentCount,
      totalStaff: acc.totalStaff + campus.staffCount,
      totalRevenue: acc.totalRevenue + campus.totalRevenue,
      totalCollected: acc.totalCollected + campus.collectedAmount,
      totalOutstanding: acc.totalOutstanding + campus.outstandingAmount,
      avgCollectionRate: 0, // Will calculate after
    }),
    { totalStudents: 0, totalStaff: 0, totalRevenue: 0, totalCollected: 0, totalOutstanding: 0, avgCollectionRate: 0 }
  ) ?? { totalStudents: 0, totalStaff: 0, totalRevenue: 0, totalCollected: 0, totalOutstanding: 0, avgCollectionRate: 0 };

  // Calculate average collection rate
  if (consolidatedStats.totalRevenue > 0) {
    consolidatedStats.avgCollectionRate = (consolidatedStats.totalCollected / consolidatedStats.totalRevenue) * 100;
  }

  // Sort campuses by different metrics
  const topByRevenue = [...(campusReports ?? [])].sort((a, b) => b.totalRevenue - a.totalRevenue);
  const topByStudents = [...(campusReports ?? [])].sort((a, b) => b.studentCount - a.studentCount);
  const topByCollection = [...(campusReports ?? [])].sort((a, b) => b.collectionRate - a.collectionRate);

  return {
    campusReports: campusReports ?? [],
    consolidatedStats,
    topByRevenue,
    topByStudents,
    topByCollection,
    isLoading: isLoadingReports,
  };
}
