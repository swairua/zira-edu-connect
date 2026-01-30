import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';

export function useUniformDashboard() {
  const { institution } = useInstitution();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['uniform-dashboard', institution?.id],
    queryFn: async () => {
      if (!institution?.id) return null;
      
      const { data: orders } = await (supabase.from('uniform_orders' as any).select('status, total_amount').eq('institution_id', institution.id) as any);
      
      const orderList = (orders || []) as Array<{ status: string; total_amount: number }>;
      const pendingOrders = orderList.filter(o => o.status === 'pending').length;
      const processingOrders = orderList.filter(o => ['confirmed', 'processing'].includes(o.status)).length;
      const readyOrders = orderList.filter(o => o.status === 'ready').length;
      const totalRevenue = orderList.filter(o => o.status === 'collected').reduce((sum, o) => sum + Number(o.total_amount), 0);
      
      const { data: lowStockItems } = await (supabase.from('uniform_item_sizes' as any).select(`*, item:uniform_items(name)`).eq('institution_id', institution.id).eq('is_active', true).lte('stock_quantity', 5) as any);
      
      const { count: totalItems } = await (supabase.from('uniform_items' as any).select('*', { count: 'exact', head: true }).eq('institution_id', institution.id).eq('is_active', true) as any);
      
      return { pendingOrders, processingOrders, readyOrders, totalRevenue, lowStockItems: lowStockItems || [], totalItems: totalItems || 0 };
    },
    enabled: !!institution?.id,
  });

  return { stats, isLoading };
}
