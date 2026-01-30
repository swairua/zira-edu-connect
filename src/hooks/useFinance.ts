import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FinanceStats {
  totalFees: number;
  totalCollected: number;
  totalOutstanding: number;
  collectionRate: number;
  studentCount: number;
  defaulterCount: number;
}

export interface AgingBucket {
  label: string;
  range: string;
  count: number;
  amount: number;
}

export interface DefaulterStudent {
  id: string;
  student_id: string;
  student_name: string;
  class: string | null;
  total_fees: number;
  total_paid: number;
  balance: number;
  last_payment_date: string | null;
  status: string;
  institution_name?: string;
}

export function useFinance(institutionId?: string) {
  const statsQuery = useQuery({
    queryKey: ['finance-stats', institutionId],
    queryFn: async (): Promise<FinanceStats> => {
      let query = supabase.from('student_fee_accounts').select('total_fees, total_paid, status');
      
      if (institutionId) {
        query = query.eq('institution_id', institutionId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const totalFees = data?.reduce((sum, a) => sum + (a.total_fees || 0), 0) || 0;
      const totalCollected = data?.reduce((sum, a) => sum + (a.total_paid || 0), 0) || 0;
      const defaulterCount = data?.filter(a => a.status === 'defaulter').length || 0;

      return {
        totalFees,
        totalCollected,
        totalOutstanding: totalFees - totalCollected,
        collectionRate: totalFees > 0 ? (totalCollected / totalFees) * 100 : 0,
        studentCount: data?.length || 0,
        defaulterCount,
      };
    },
  });

  const agingQuery = useQuery({
    queryKey: ['finance-aging', institutionId],
    queryFn: async (): Promise<AgingBucket[]> => {
      let query = supabase
        .from('student_fee_accounts')
        .select('total_fees, total_paid, last_payment_date, created_at');

      if (institutionId) {
        query = query.eq('institution_id', institutionId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const now = new Date();
      const buckets: AgingBucket[] = [
        { label: 'Current', range: '0-30 days', count: 0, amount: 0 },
        { label: '31-60 Days', range: '31-60 days', count: 0, amount: 0 },
        { label: '61-90 Days', range: '61-90 days', count: 0, amount: 0 },
        { label: '90+ Days', range: '90+ days', count: 0, amount: 0 },
      ];

      data?.forEach(account => {
        const balance = (account.total_fees || 0) - (account.total_paid || 0);
        if (balance <= 0) return;

        const createdDate = new Date(account.created_at);
        const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

        let bucketIndex = 0;
        if (daysDiff > 90) bucketIndex = 3;
        else if (daysDiff > 60) bucketIndex = 2;
        else if (daysDiff > 30) bucketIndex = 1;

        buckets[bucketIndex].count++;
        buckets[bucketIndex].amount += balance;
      });

      return buckets;
    },
  });

  const defaultersQuery = useQuery({
    queryKey: ['finance-defaulters', institutionId],
    queryFn: async (): Promise<DefaulterStudent[]> => {
      let query = supabase
        .from('student_fee_accounts')
        .select(`
          id,
          student_id,
          student_name,
          class,
          total_fees,
          total_paid,
          last_payment_date,
          status,
          institution_id,
          institutions(name)
        `)
        .eq('status', 'defaulter')
        .order('total_fees', { ascending: false })
        .limit(50);

      if (institutionId) {
        query = query.eq('institution_id', institutionId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(d => ({
        id: d.id,
        student_id: d.student_id,
        student_name: d.student_name,
        class: d.class,
        total_fees: d.total_fees || 0,
        total_paid: d.total_paid || 0,
        balance: (d.total_fees || 0) - (d.total_paid || 0),
        last_payment_date: d.last_payment_date,
        status: d.status || 'current',
        institution_name: (d.institutions as any)?.name,
      }));
    },
  });

  const recentPaymentsQuery = useQuery({
    queryKey: ['finance-recent-payments', institutionId],
    queryFn: async () => {
      let query = supabase
        .from('fee_payments')
        .select(`
          id,
          amount,
          payment_method,
          transaction_ref,
          created_at,
          student_fee_accounts(student_name, class)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (institutionId) {
        query = query.eq('institution_id', institutionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  return {
    stats: statsQuery.data,
    isLoadingStats: statsQuery.isLoading,
    aging: agingQuery.data || [],
    isLoadingAging: agingQuery.isLoading,
    defaulters: defaultersQuery.data || [],
    isLoadingDefaulters: defaultersQuery.isLoading,
    recentPayments: recentPaymentsQuery.data || [],
    isLoadingPayments: recentPaymentsQuery.isLoading,
  };
}
