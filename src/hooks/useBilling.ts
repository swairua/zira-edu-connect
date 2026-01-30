import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Invoice = Tables<'invoices'>;
export type Payment = Tables<'payments'>;

export interface BillingStats {
  totalRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
  paidThisMonth: number;
  invoiceCount: number;
  overdueCount: number;
}

export function useBillingStats() {
  return useQuery({
    queryKey: ['billing-stats'],
    queryFn: async (): Promise<BillingStats> => {
      const [invoicesResult, paymentsResult] = await Promise.all([
        supabase.from('invoices').select('*'),
        supabase.from('payments').select('*').eq('status', 'completed'),
      ]);

      if (invoicesResult.error) throw invoicesResult.error;
      if (paymentsResult.error) throw paymentsResult.error;

      const invoices = invoicesResult.data || [];
      const payments = paymentsResult.data || [];

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
      const pendingAmount = invoices
        .filter((i) => i.status === 'pending')
        .reduce((sum, i) => sum + i.amount, 0);
      const overdueInvoices = invoices.filter((i) => i.status === 'overdue');
      const overdueAmount = overdueInvoices.reduce((sum, i) => sum + i.amount, 0);
      const paidThisMonth = payments
        .filter((p) => new Date(p.created_at) >= startOfMonth)
        .reduce((sum, p) => sum + p.amount, 0);

      return {
        totalRevenue,
        pendingAmount,
        overdueAmount,
        paidThisMonth,
        invoiceCount: invoices.length,
        overdueCount: overdueInvoices.length,
      };
    },
  });
}

export function useInvoices(filters?: { status?: string; institutionId?: string }) {
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select(`
          *,
          institutions (
            id,
            name,
            code
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.institutionId) {
        query = query.eq('institution_id', filters.institutionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function usePayments(filters?: { status?: string; institutionId?: string }) {
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: async () => {
      let query = supabase
        .from('payments')
        .select(`
          *,
          institutions (
            id,
            name,
            code
          ),
          invoices (
            id,
            invoice_number
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.institutionId) {
        query = query.eq('institution_id', filters.institutionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useRecentTransactions(limit: number = 10) {
  return useQuery({
    queryKey: ['recent-transactions', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          institutions (
            id,
            name
          )
        `)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
}
