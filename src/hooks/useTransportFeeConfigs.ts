import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TransportZone } from './useTransportZones';
import { TransportRoute } from './useTransportRoutes';

export interface TransportFeeConfig {
  id: string;
  institution_id: string;
  zone_id: string | null;
  route_id: string | null;
  academic_year_id: string | null;
  term_id: string | null;
  fee_type: 'term' | 'monthly' | 'annual';
  pickup_only_fee: number | null;
  dropoff_only_fee: number | null;
  both_ways_fee: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  zone?: TransportZone;
  route?: TransportRoute;
}

export interface CreateFeeConfigInput {
  institution_id: string;
  zone_id?: string;
  route_id?: string;
  academic_year_id?: string;
  term_id?: string;
  fee_type?: 'term' | 'monthly' | 'annual';
  pickup_only_fee?: number;
  dropoff_only_fee?: number;
  both_ways_fee: number;
  currency?: string;
  is_active?: boolean;
}

export function useTransportFeeConfigs(institutionId: string | undefined) {
  return useQuery({
    queryKey: ['transport-fee-configs', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      
      const { data, error } = await supabase
        .from('transport_fee_configs')
        .select(`
          *,
          zone:transport_zones(*),
          route:transport_routes(*)
        `)
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TransportFeeConfig[];
    },
    enabled: !!institutionId,
  });
}

export function useGetFeeForRoute(routeId: string | undefined, subscriptionType?: 'pickup' | 'dropoff' | 'both') {
  return useQuery({
    queryKey: ['transport-fee-for-route', routeId, subscriptionType],
    queryFn: async () => {
      if (!routeId) return null;
      
      // First try to find a route-specific fee config
      let { data, error } = await supabase
        .from('transport_fee_configs')
        .select('*')
        .eq('route_id', routeId)
        .eq('is_active', true)
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      // If no route-specific config, try zone-based
      if (!data) {
        const { data: route } = await supabase
          .from('transport_routes')
          .select('zone_id')
          .eq('id', routeId)
          .single();
        
        if (route?.zone_id) {
          const { data: zoneConfig, error: zoneError } = await supabase
            .from('transport_fee_configs')
            .select('*')
            .eq('zone_id', route.zone_id)
            .eq('is_active', true)
            .limit(1)
            .single();
          
          if (zoneError && zoneError.code !== 'PGRST116') throw zoneError;
          data = zoneConfig;
        }
      }
      
      if (!data) return null;
      
      // Return appropriate fee based on subscription type
      const feeConfig = data as TransportFeeConfig;
      let fee = feeConfig.both_ways_fee;
      
      if (subscriptionType === 'pickup' && feeConfig.pickup_only_fee) {
        fee = feeConfig.pickup_only_fee;
      } else if (subscriptionType === 'dropoff' && feeConfig.dropoff_only_fee) {
        fee = feeConfig.dropoff_only_fee;
      }
      
      return { fee, currency: feeConfig.currency, config: feeConfig };
    },
    enabled: !!routeId,
  });
}

export function useCreateFeeConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateFeeConfigInput) => {
      const { data, error } = await supabase
        .from('transport_fee_configs')
        .insert(input)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transport-fee-configs', variables.institution_id] });
      toast.success('Fee configuration created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create fee configuration: ${error.message}`);
    },
  });
}

export function useUpdateFeeConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TransportFeeConfig> & { id: string }) => {
      const { data, error } = await supabase
        .from('transport_fee_configs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transport-fee-configs', data.institution_id] });
      toast.success('Fee configuration updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update fee configuration: ${error.message}`);
    },
  });
}

export function useDeleteFeeConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, institutionId }: { id: string; institutionId: string }) => {
      const { error } = await supabase
        .from('transport_fee_configs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { id, institutionId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transport-fee-configs', data.institutionId] });
      toast.success('Fee configuration deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete fee configuration: ${error.message}`);
    },
  });
}
