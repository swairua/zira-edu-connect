import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FinanceDashboardStats {
  todayCollections: number;
  yesterdayCollections: number;
  pendingAdjustments: number;
  overdueAmount: number;
  overdueCount: number;
  collectionRate: number;
  unmatchedReconciliations: number;
}

export interface TodayPayment {
  id: string;
  amount: number;
  method: string;
  studentName: string;
  createdAt: string;
}

export interface PendingAdjustment {
  id: string;
  type: string;
  amount: number;
  reason: string;
  requestedAt: string;
}

export interface CriticalDefaulter {
  id: string;
  name: string;
  className: string | null;
  balance: number;
  daysOverdue: number;
}

export function useFinanceDashboard(institutionId?: string) {
  const statsQuery = useQuery({
    queryKey: ['finance-dashboard-stats', institutionId],
    queryFn: async (): Promise<FinanceDashboardStats> => {
      if (!institutionId) throw new Error('No institution ID');

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [todayPaymentsRes, yesterdayPaymentsRes, pendingAdjRes, feeSummaryRes, overdueRes] = await Promise.all([
        // Today's payments
        supabase
          .from('student_payments')
          .select('amount')
          .eq('institution_id', institutionId)
          .eq('status', 'completed')
          .gte('payment_date', today.toISOString())
          .lt('payment_date', tomorrow.toISOString()),
        // Yesterday's payments
        supabase
          .from('student_payments')
          .select('amount')
          .eq('institution_id', institutionId)
          .eq('status', 'completed')
          .gte('payment_date', yesterday.toISOString())
          .lt('payment_date', today.toISOString()),
        // Pending adjustments
        supabase
          .from('financial_adjustments')
          .select('id', { count: 'exact', head: true })
          .eq('institution_id', institutionId)
          .eq('status', 'pending'),
        // Fee summary for collection rate
        supabase
          .from('student_fee_accounts')
          .select('total_fees, total_paid')
          .eq('institution_id', institutionId),
        // Overdue accounts (90+ days)
        supabase
          .from('student_fee_accounts')
          .select('total_fees, total_paid, created_at')
          .eq('institution_id', institutionId)
          .eq('status', 'defaulter'),
      ]);

      const todayCollections = todayPaymentsRes.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      const yesterdayCollections = yesterdayPaymentsRes.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      const pendingAdjustments = pendingAdjRes.count || 0;

      const totalExpected = feeSummaryRes.data?.reduce((sum, a) => sum + (a.total_fees || 0), 0) || 0;
      const totalCollected = feeSummaryRes.data?.reduce((sum, a) => sum + (a.total_paid || 0), 0) || 0;
      const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

      // Calculate overdue
      const now = new Date();
      let overdueAmount = 0;
      let overdueCount = 0;
      overdueRes.data?.forEach(account => {
        const createdDate = new Date(account.created_at);
        const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff >= 90) {
          const balance = (account.total_fees || 0) - (account.total_paid || 0);
          if (balance > 0) {
            overdueAmount += balance;
            overdueCount++;
          }
        }
      });

      return {
        todayCollections,
        yesterdayCollections,
        pendingAdjustments,
        overdueAmount,
        overdueCount,
        collectionRate,
        unmatchedReconciliations: 0,
      };
    },
    enabled: !!institutionId,
  });

  const todayPaymentsQuery = useQuery({
    queryKey: ['finance-today-payments', institutionId],
    queryFn: async (): Promise<TodayPayment[]> => {
      if (!institutionId) return [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('student_payments')
        .select(`
          id,
          amount,
          payment_method,
          created_at,
          students(first_name, last_name)
        `)
        .eq('institution_id', institutionId)
        .eq('status', 'completed')
        .gte('payment_date', today.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data || []).map((p: any) => ({
        id: p.id,
        amount: p.amount,
        method: p.payment_method || 'Cash',
        studentName: p.students ? `${p.students.first_name} ${p.students.last_name}` : 'Unknown',
        createdAt: p.created_at,
      }));
    },
    enabled: !!institutionId,
  });

  const pendingAdjustmentsQuery = useQuery({
    queryKey: ['finance-pending-adjustments', institutionId],
    queryFn: async (): Promise<PendingAdjustment[]> => {
      if (!institutionId) return [];

      const { data, error } = await supabase
        .from('financial_adjustments')
        .select('id, adjustment_type, adjustment_amount, reason, requested_at')
        .eq('institution_id', institutionId)
        .eq('status', 'pending')
        .order('requested_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data || []).map(adj => ({
        id: adj.id,
        type: adj.adjustment_type,
        amount: adj.adjustment_amount,
        reason: adj.reason,
        requestedAt: adj.requested_at || '',
      }));
    },
    enabled: !!institutionId,
  });

  const criticalDefaultersQuery = useQuery({
    queryKey: ['finance-critical-defaulters', institutionId],
    queryFn: async (): Promise<CriticalDefaulter[]> => {
      if (!institutionId) return [];

      const { data, error } = await supabase
        .from('student_fee_accounts')
        .select('id, student_id, student_name, class, total_fees, total_paid, created_at')
        .eq('institution_id', institutionId)
        .eq('status', 'defaulter')
        .order('total_fees', { ascending: false });

      if (error) throw error;

      const now = new Date();
      return (data || [])
        .map(account => {
          const createdDate = new Date(account.created_at);
          const daysOverdue = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
          const balance = (account.total_fees || 0) - (account.total_paid || 0);
          return {
            id: account.id,
            name: account.student_name,
            className: account.class,
            balance,
            daysOverdue,
          };
        })
        .filter(d => d.daysOverdue >= 90 && d.balance > 0)
        .sort((a, b) => b.balance - a.balance);
    },
    enabled: !!institutionId,
  });

  return {
    stats: statsQuery.data,
    isLoadingStats: statsQuery.isLoading,
    todayPayments: todayPaymentsQuery.data || [],
    isLoadingTodayPayments: todayPaymentsQuery.isLoading,
    pendingAdjustments: pendingAdjustmentsQuery.data || [],
    isLoadingAdjustments: pendingAdjustmentsQuery.isLoading,
    criticalDefaulters: criticalDefaultersQuery.data || [],
    isLoadingDefaulters: criticalDefaultersQuery.isLoading,
  };
}
