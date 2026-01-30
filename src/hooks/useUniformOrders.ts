import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';
import { toast } from 'sonner';
import type { UniformOrder, UniformOrderStatus, CartItem } from '@/types/uniforms';

export function useUniformOrders() {
  const { institution } = useInstitution();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['uniform-orders', institution?.id],
    queryFn: async () => {
      if (!institution?.id) return [];
      const { data, error } = await (supabase
        .from('uniform_orders' as any)
        .select(`*, student:students(id, first_name, last_name, admission_number), order_lines:uniform_order_lines(*, item:uniform_items(*), size:uniform_item_sizes(*))`)
        .eq('institution_id', institution.id)
        .order('created_at', { ascending: false }) as any);
      if (error) throw error;
      return (data || []) as UniformOrder[];
    },
    enabled: !!institution?.id,
  });

  const createOrder = useMutation({
    mutationFn: async ({ studentId, parentId, cartItems, notes }: { studentId: string; parentId?: string; cartItems: CartItem[]; notes?: string }) => {
      if (!institution?.id) throw new Error('No institution selected');
      const { data: { user } } = await supabase.auth.getUser();
      
      // Generate order number
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const { count } = await (supabase.from('uniform_orders' as any).select('*', { count: 'exact', head: true }).eq('institution_id', institution.id).like('order_number', `UNI-${today}-%`) as any);
      const orderNumber = `UNI-${today}-${String((count || 0) + 1).padStart(3, '0')}`;
      
      const totalAmount = cartItems.reduce((sum, item) => sum + (item.item.base_price + item.size.price_adjustment) * item.quantity, 0);
      
      const { data: order, error: orderError } = await (supabase.from('uniform_orders' as any).insert({
        institution_id: institution.id,
        order_number: orderNumber,
        student_id: studentId,
        parent_id: parentId,
        placed_by: user?.id,
        total_amount: totalAmount,
        currency: 'KES',
        notes,
      }).select().single() as any);
      if (orderError) throw orderError;
      
      const orderLines = cartItems.map(item => ({
        order_id: order.id,
        item_id: item.item.id,
        size_id: item.size.id,
        quantity: item.quantity,
        unit_price: item.item.base_price + item.size.price_adjustment,
        total_price: (item.item.base_price + item.size.price_adjustment) * item.quantity,
      }));
      
      const { error: linesError } = await (supabase.from('uniform_order_lines' as any).insert(orderLines) as any);
      if (linesError) throw linesError;
      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uniform-orders'] });
      toast.success('Order placed successfully');
    },
    onError: (error: Error) => toast.error('Failed to place order: ' + error.message),
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status, collectionDate, collectedBy }: { orderId: string; status: UniformOrderStatus; collectionDate?: string; collectedBy?: string }) => {
      const updates: Record<string, unknown> = { status };
      if (status === 'collected') {
        updates.collected_at = new Date().toISOString();
        updates.collected_by = collectedBy;
      }
      if (collectionDate) updates.collection_date = collectionDate;
      
      const { data, error } = await (supabase.from('uniform_orders' as any).update(updates).eq('id', orderId).select().single() as any);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uniform-orders'] });
      toast.success('Order status updated');
    },
    onError: (error: Error) => toast.error('Failed to update order: ' + error.message),
  });

  const fulfillOrderLine = useMutation({
    mutationFn: async ({ lineId, fulfilledQuantity, sizeId }: { lineId: string; fulfilledQuantity: number; sizeId: string }) => {
      const { error: lineError } = await (supabase.from('uniform_order_lines' as any).update({ fulfilled_quantity: fulfilledQuantity, fulfillment_status: fulfilledQuantity > 0 ? 'fulfilled' : 'pending' }).eq('id', lineId) as any);
      if (lineError) throw lineError;
      
      const { data: { user } } = await supabase.auth.getUser();
      const { error: stockError } = await (supabase.from('uniform_stock_movements' as any).insert({
        institution_id: institution?.id,
        size_id: sizeId,
        movement_type: 'sale',
        quantity: -fulfilledQuantity,
        reference_id: lineId,
        created_by: user?.id,
      }) as any);
      if (stockError) throw stockError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uniform-orders'] });
      queryClient.invalidateQueries({ queryKey: ['uniform-items'] });
      toast.success('Order line fulfilled');
    },
    onError: (error: Error) => toast.error('Failed to fulfill order line: ' + error.message),
  });

  return { orders, isLoading, error, createOrder, updateOrderStatus, fulfillOrderLine };
}
