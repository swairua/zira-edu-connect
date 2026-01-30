import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';
import { toast } from 'sonner';
import type { Room } from '@/types/timetable';

export function useRooms() {
  const { institution } = useInstitution();

  return useQuery({
    queryKey: ['rooms', institution?.id],
    queryFn: async () => {
      if (!institution?.id) return [];
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('institution_id', institution.id)
        .order('name');
      if (error) throw error;
      return data as Room[];
    },
    enabled: !!institution?.id,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  const { institution } = useInstitution();

  return useMutation({
    mutationFn: async (room: Omit<Room, 'id' | 'created_at' | 'updated_at' | 'institution_id'>) => {
      if (!institution?.id) throw new Error('No institution selected');
      const { data, error } = await supabase
        .from('rooms')
        .insert({ ...room, institution_id: institution.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Room> & { id: string }) => {
      const { data, error } = await supabase
        .from('rooms')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('rooms').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
