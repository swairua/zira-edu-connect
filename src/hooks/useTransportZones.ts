import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TransportZone {
  id: string;
  institution_id: string;
  name: string;
  code: string;
  description: string | null;
  base_fee: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateZoneInput {
  institution_id: string;
  name: string;
  code: string;
  description?: string;
  base_fee: number;
  currency?: string;
  is_active?: boolean;
}

export function useTransportZones(institutionId: string | undefined) {
  return useQuery({
    queryKey: ['transport-zones', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      
      const { data, error } = await supabase
        .from('transport_zones')
        .select('*')
        .eq('institution_id', institutionId)
        .order('name');
      
      if (error) throw error;
      return data as TransportZone[];
    },
    enabled: !!institutionId,
  });
}

export function useCreateZone() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateZoneInput) => {
      const { data, error } = await supabase
        .from('transport_zones')
        .insert(input)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transport-zones', variables.institution_id] });
      toast.success('Zone created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create zone: ${error.message}`);
    },
  });
}

export function useUpdateZone() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TransportZone> & { id: string }) => {
      const { data, error } = await supabase
        .from('transport_zones')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transport-zones', data.institution_id] });
      toast.success('Zone updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update zone: ${error.message}`);
    },
  });
}

export function useDeleteZone() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, institutionId }: { id: string; institutionId: string }) => {
      const { error } = await supabase
        .from('transport_zones')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { id, institutionId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transport-zones', data.institutionId] });
      toast.success('Zone deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete zone: ${error.message}`);
    },
  });
}
