import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TransportVehicle } from './useTransportVehicles';

export interface TransportDriver {
  id: string;
  institution_id: string;
  staff_id: string | null;
  name: string;
  phone: string;
  license_number: string | null;
  license_expiry: string | null;
  current_vehicle_id: string | null;
  status: 'active' | 'on_leave' | 'inactive';
  photo_url: string | null;
  emergency_contact: string | null;
  created_at: string;
  updated_at: string;
  current_vehicle?: TransportVehicle;
}

export interface CreateDriverInput {
  institution_id: string;
  staff_id?: string;
  name: string;
  phone: string;
  license_number?: string;
  license_expiry?: string;
  current_vehicle_id?: string;
  status?: 'active' | 'on_leave' | 'inactive';
  photo_url?: string;
  emergency_contact?: string;
}

export function useTransportDrivers(institutionId: string | undefined) {
  return useQuery({
    queryKey: ['transport-drivers', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      
      const { data, error } = await supabase
        .from('transport_drivers')
        .select(`
          *,
          current_vehicle:transport_vehicles(*)
        `)
        .eq('institution_id', institutionId)
        .order('name');
      
      if (error) throw error;
      return data as TransportDriver[];
    },
    enabled: !!institutionId,
  });
}

export function useCreateDriver() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateDriverInput) => {
      const { data, error } = await supabase
        .from('transport_drivers')
        .insert(input)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transport-drivers', variables.institution_id] });
      toast.success('Driver added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add driver: ${error.message}`);
    },
  });
}

export function useUpdateDriver() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TransportDriver> & { id: string }) => {
      const { data, error } = await supabase
        .from('transport_drivers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transport-drivers', data.institution_id] });
      toast.success('Driver updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update driver: ${error.message}`);
    },
  });
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, institutionId }: { id: string; institutionId: string }) => {
      const { error } = await supabase
        .from('transport_drivers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { id, institutionId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transport-drivers', data.institutionId] });
      toast.success('Driver deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete driver: ${error.message}`);
    },
  });
}

export function useAssignDriverToVehicle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ driverId, vehicleId, institutionId }: { driverId: string; vehicleId: string | null; institutionId: string }) => {
      const { data, error } = await supabase
        .from('transport_drivers')
        .update({ current_vehicle_id: vehicleId })
        .eq('id', driverId)
        .select()
        .single();
      
      if (error) throw error;
      return { data, institutionId };
    },
    onSuccess: ({ institutionId }) => {
      queryClient.invalidateQueries({ queryKey: ['transport-drivers', institutionId] });
      toast.success('Driver assigned to vehicle');
    },
    onError: (error: Error) => {
      toast.error(`Failed to assign driver: ${error.message}`);
    },
  });
}
