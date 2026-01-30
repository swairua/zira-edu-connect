import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';
import { toast } from 'sonner';
import type { UniformItemSize } from '@/types/uniforms';

export function useUniformSizes() {
  const { institution } = useInstitution();
  const queryClient = useQueryClient();

  const createSize = useMutation({
    mutationFn: async (size: Omit<UniformItemSize, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await (supabase.from('uniform_item_sizes' as any).insert(size).select().single() as any);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uniform-items'] });
      toast.success('Size added');
    },
    onError: (error: Error) => toast.error('Failed to add size: ' + error.message),
  });

  const updateSize = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<UniformItemSize> & { id: string }) => {
      const { data, error } = await (supabase.from('uniform_item_sizes' as any).update(updates).eq('id', id).select().single() as any);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uniform-items'] });
      toast.success('Size updated');
    },
    onError: (error: Error) => toast.error('Failed to update size: ' + error.message),
  });

  const deleteSize = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from('uniform_item_sizes' as any).delete().eq('id', id) as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uniform-items'] });
      toast.success('Size deleted');
    },
    onError: (error: Error) => toast.error('Failed to delete size: ' + error.message),
  });

  const adjustStock = useMutation({
    mutationFn: async ({ sizeId, quantity, movementType, notes }: { sizeId: string; quantity: number; movementType: string; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await (supabase.from('uniform_stock_movements' as any).insert({
        institution_id: institution?.id,
        size_id: sizeId,
        movement_type: movementType,
        quantity,
        notes,
        created_by: user?.id,
      }) as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uniform-items'] });
      toast.success('Stock adjusted');
    },
    onError: (error: Error) => toast.error('Failed to adjust stock: ' + error.message),
  });

  return { createSize, updateSize, deleteSize, adjustStock };
}
