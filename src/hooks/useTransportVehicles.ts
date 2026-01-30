import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TransportRoute } from './useTransportRoutes';

export interface TransportVehicle {
  id: string;
  institution_id: string;
  registration_number: string;
  vehicle_type: 'bus' | 'van' | 'minibus' | 'car';
  make: string | null;
  model: string | null;
  year: number | null;
  capacity: number;
  current_route_id: string | null;
  status: 'active' | 'maintenance' | 'inactive';
  insurance_expiry: string | null;
  inspection_expiry: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  current_route?: TransportRoute;
}

export interface CreateVehicleInput {
  institution_id: string;
  registration_number: string;
  vehicle_type?: 'bus' | 'van' | 'minibus' | 'car';
  make?: string;
  model?: string;
  year?: number;
  capacity: number;
  current_route_id?: string;
  status?: 'active' | 'maintenance' | 'inactive';
  insurance_expiry?: string;
  inspection_expiry?: string;
  notes?: string;
}

export function useTransportVehicles(institutionId: string | undefined) {
  return useQuery({
    queryKey: ['transport-vehicles', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      
      const { data, error } = await supabase
        .from('transport_vehicles')
        .select(`
          *,
          current_route:transport_routes(*)
        `)
        .eq('institution_id', institutionId)
        .order('registration_number');
      
      if (error) throw error;
      return data as TransportVehicle[];
    },
    enabled: !!institutionId,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateVehicleInput) => {
      const { data, error } = await supabase
        .from('transport_vehicles')
        .insert(input)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transport-vehicles', variables.institution_id] });
      toast.success('Vehicle added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add vehicle: ${error.message}`);
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TransportVehicle> & { id: string }) => {
      const { data, error } = await supabase
        .from('transport_vehicles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transport-vehicles', data.institution_id] });
      toast.success('Vehicle updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update vehicle: ${error.message}`);
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, institutionId }: { id: string; institutionId: string }) => {
      const { error } = await supabase
        .from('transport_vehicles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { id, institutionId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transport-vehicles', data.institutionId] });
      toast.success('Vehicle deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete vehicle: ${error.message}`);
    },
  });
}

export function useAssignVehicleToRoute() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ vehicleId, routeId, institutionId }: { vehicleId: string; routeId: string | null; institutionId: string }) => {
      const { data, error } = await supabase
        .from('transport_vehicles')
        .update({ current_route_id: routeId })
        .eq('id', vehicleId)
        .select()
        .single();
      
      if (error) throw error;
      return { data, institutionId };
    },
    onSuccess: ({ institutionId }) => {
      queryClient.invalidateQueries({ queryKey: ['transport-vehicles', institutionId] });
      toast.success('Vehicle assigned to route');
    },
    onError: (error: Error) => {
      toast.error(`Failed to assign vehicle: ${error.message}`);
    },
  });
}
