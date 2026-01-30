import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TransportZone } from './useTransportZones';

export interface TransportRoute {
  id: string;
  institution_id: string;
  zone_id: string | null;
  name: string;
  code: string;
  description: string | null;
  route_type: 'pickup' | 'dropoff' | 'both';
  estimated_duration_minutes: number | null;
  distance_km: number | null;
  departure_time: string | null;
  arrival_time: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  zone?: TransportZone;
}

export interface TransportStop {
  id: string;
  institution_id: string;
  route_id: string;
  name: string;
  location_description: string | null;
  latitude: number | null;
  longitude: number | null;
  stop_order: number;
  pickup_time: string | null;
  dropoff_time: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateRouteInput {
  institution_id: string;
  zone_id?: string;
  name: string;
  code: string;
  description?: string;
  route_type?: 'pickup' | 'dropoff' | 'both';
  estimated_duration_minutes?: number;
  distance_km?: number;
  departure_time?: string;
  arrival_time?: string;
  is_active?: boolean;
}

export interface CreateStopInput {
  institution_id: string;
  route_id: string;
  name: string;
  location_description?: string;
  latitude?: number;
  longitude?: number;
  stop_order: number;
  pickup_time?: string;
  dropoff_time?: string;
  is_active?: boolean;
}

export function useTransportRoutes(institutionId: string | undefined, zoneId?: string) {
  return useQuery({
    queryKey: ['transport-routes', institutionId, zoneId],
    queryFn: async () => {
      if (!institutionId) return [];
      
      let query = supabase
        .from('transport_routes')
        .select(`
          *,
          zone:transport_zones(*)
        `)
        .eq('institution_id', institutionId)
        .order('name');
      
      if (zoneId) {
        query = query.eq('zone_id', zoneId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as TransportRoute[];
    },
    enabled: !!institutionId,
  });
}

export function useRouteWithStops(routeId: string | undefined) {
  return useQuery({
    queryKey: ['transport-route', routeId],
    queryFn: async () => {
      if (!routeId) return null;
      
      const { data, error } = await supabase
        .from('transport_routes')
        .select(`
          *,
          zone:transport_zones(*),
          stops:transport_stops(*)
        `)
        .eq('id', routeId)
        .single();
      
      if (error) throw error;
      return data as TransportRoute & { stops: TransportStop[] };
    },
    enabled: !!routeId,
  });
}

export function useRouteStops(routeId: string | undefined) {
  return useQuery({
    queryKey: ['transport-stops', routeId],
    queryFn: async () => {
      if (!routeId) return [];
      
      const { data, error } = await supabase
        .from('transport_stops')
        .select('*')
        .eq('route_id', routeId)
        .order('stop_order');
      
      if (error) throw error;
      return data as TransportStop[];
    },
    enabled: !!routeId,
  });
}

export function useCreateRoute() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateRouteInput) => {
      const { data, error } = await supabase
        .from('transport_routes')
        .insert(input)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transport-routes', variables.institution_id] });
      toast.success('Route created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create route: ${error.message}`);
    },
  });
}

export function useUpdateRoute() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TransportRoute> & { id: string }) => {
      const { data, error } = await supabase
        .from('transport_routes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transport-routes', data.institution_id] });
      queryClient.invalidateQueries({ queryKey: ['transport-route', data.id] });
      toast.success('Route updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update route: ${error.message}`);
    },
  });
}

export function useDeleteRoute() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, institutionId }: { id: string; institutionId: string }) => {
      const { error } = await supabase
        .from('transport_routes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { id, institutionId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transport-routes', data.institutionId] });
      toast.success('Route deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete route: ${error.message}`);
    },
  });
}

export function useCreateStop() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateStopInput) => {
      const { data, error } = await supabase
        .from('transport_stops')
        .insert(input)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transport-stops', variables.route_id] });
      queryClient.invalidateQueries({ queryKey: ['transport-route', variables.route_id] });
      toast.success('Stop added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add stop: ${error.message}`);
    },
  });
}

export function useUpdateStop() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TransportStop> & { id: string }) => {
      const { data, error } = await supabase
        .from('transport_stops')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transport-stops', data.route_id] });
      queryClient.invalidateQueries({ queryKey: ['transport-route', data.route_id] });
      toast.success('Stop updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update stop: ${error.message}`);
    },
  });
}

export function useDeleteStop() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, routeId }: { id: string; routeId: string }) => {
      const { error } = await supabase
        .from('transport_stops')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { id, routeId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transport-stops', data.routeId] });
      queryClient.invalidateQueries({ queryKey: ['transport-route', data.routeId] });
      toast.success('Stop deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete stop: ${error.message}`);
    },
  });
}
