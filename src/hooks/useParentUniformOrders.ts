import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useParent } from '@/contexts/ParentContext';
import { toast } from 'sonner';
import type { UniformItem, UniformOrder, CartItem } from '@/types/uniforms';

export function useParentUniformOrders() {
  const { parentProfile, selectedStudent } = useParent();
  const queryClient = useQueryClient();

  // Fetch available uniform items for the institution
  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['parent-uniform-items', parentProfile?.institution_id],
    queryFn: async () => {
      if (!parentProfile?.institution_id) return [];
      
      const { data, error } = await (supabase
        .from('uniform_items' as any)
        .select(`*, sizes:uniform_item_sizes(*)`)
        .eq('institution_id', parentProfile.institution_id)
        .eq('is_active', true)
        .order('category')
        .order('name') as any);
      
      if (error) throw error;
      
      // Filter to only items with active sizes that have stock
      return ((data || []) as UniformItem[]).map(item => ({
        ...item,
        sizes: (item.sizes || []).filter(s => s.is_active && s.stock_quantity > 0)
      })).filter(item => item.sizes && item.sizes.length > 0);
    },
    enabled: !!parentProfile?.institution_id,
  });

  // Fetch parent's orders for selected student
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['parent-uniform-orders', parentProfile?.id, selectedStudent?.id],
    queryFn: async () => {
      if (!parentProfile?.id || !selectedStudent?.id) return [];
      
      const { data, error } = await (supabase
        .from('uniform_orders' as any)
        .select(`
          *,
          order_lines:uniform_order_lines(
            *,
            item:uniform_items(*),
            size:uniform_item_sizes(*)
          )
        `)
        .eq('parent_id', parentProfile.id)
        .eq('student_id', selectedStudent.id)
        .order('created_at', { ascending: false }) as any);
      
      if (error) throw error;
      return (data || []) as UniformOrder[];
    },
    enabled: !!parentProfile?.id && !!selectedStudent?.id,
  });

  // Place a new order
  const placeOrder = useMutation({
    mutationFn: async (cartItems: CartItem[]) => {
      if (!parentProfile || !selectedStudent) {
        throw new Error('Parent or student not selected');
      }

      const totalAmount = cartItems.reduce(
        (sum, ci) => sum + (ci.item.base_price + ci.size.price_adjustment) * ci.quantity,
        0
      );

      // Create order
      const { data: order, error: orderError } = await (supabase
        .from('uniform_orders' as any)
        .insert({
          institution_id: parentProfile.institution_id,
          student_id: selectedStudent.id,
          parent_id: parentProfile.id,
          total_amount: totalAmount,
          currency: cartItems[0]?.item.currency || 'KES',
          status: 'pending',
        })
        .select()
        .single() as any);

      if (orderError) throw orderError;

      // Create order lines
      const orderLines = cartItems.map(ci => ({
        order_id: order.id,
        item_id: ci.item.id,
        size_id: ci.size.id,
        quantity: ci.quantity,
        unit_price: ci.item.base_price + ci.size.price_adjustment,
        total_price: (ci.item.base_price + ci.size.price_adjustment) * ci.quantity,
      }));

      const { error: linesError } = await (supabase
        .from('uniform_order_lines' as any)
        .insert(orderLines) as any);

      if (linesError) throw linesError;

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-uniform-orders'] });
      queryClient.invalidateQueries({ queryKey: ['parent-uniform-items'] });
      toast.success('Order placed successfully!');
    },
    onError: (error: Error) => toast.error('Failed to place order: ' + error.message),
  });

  return {
    items,
    orders,
    isLoading: itemsLoading || ordersLoading,
    placeOrder,
  };
}
