import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';
import { toast } from 'sonner';
import type { UniformItem } from '@/types/uniforms';

export function useUniformItems() {
  const { institution } = useInstitution();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['uniform-items', institution?.id],
    queryFn: async () => {
      if (!institution?.id) return [];
      
      const { data, error } = await (supabase
        .from('uniform_items' as any)
        .select(`*, sizes:uniform_item_sizes(*)`)
        .eq('institution_id', institution.id)
        .order('name') as any);
      
      if (error) throw error;
      return (data || []) as UniformItem[];
    },
    enabled: !!institution?.id,
  });

  const createItem = useMutation({
    mutationFn: async (item: Omit<UniformItem, 'id' | 'created_at' | 'updated_at' | 'sizes'>) => {
      const { data, error } = await (supabase
        .from('uniform_items' as any)
        .insert(item)
        .select()
        .single() as any);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uniform-items'] });
      toast.success('Uniform item created');
    },
    onError: (error: Error) => toast.error('Failed to create item: ' + error.message),
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<UniformItem> & { id: string }) => {
      const { data, error } = await (supabase
        .from('uniform_items' as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single() as any);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uniform-items'] });
      toast.success('Uniform item updated');
    },
    onError: (error: Error) => toast.error('Failed to update item: ' + error.message),
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from('uniform_items' as any).delete().eq('id', id) as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uniform-items'] });
      toast.success('Uniform item deleted');
    },
    onError: (error: Error) => toast.error('Failed to delete item: ' + error.message),
  });

  return { items, isLoading, error, createItem, updateItem, deleteItem };
}
