import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TransportStats {
  totalZones: number;
  totalRoutes: number;
  totalVehicles: number;
  totalDrivers: number;
  activeSubscriptions: number;
  pendingApprovals: number;
  suspendedSubscriptions: number;
  totalCapacity: number;
}

export interface RouteOccupancy {
  routeId: string;
  routeName: string;
  subscriberCount: number;
  vehicleCapacity: number;
  occupancyRate: number;
}

export function useTransportStats(institutionId: string | undefined) {
  return useQuery({
    queryKey: ['transport-stats', institutionId],
    queryFn: async (): Promise<TransportStats> => {
      if (!institutionId) {
        return {
          totalZones: 0,
          totalRoutes: 0,
          totalVehicles: 0,
          totalDrivers: 0,
          activeSubscriptions: 0,
          pendingApprovals: 0,
          suspendedSubscriptions: 0,
          totalCapacity: 0,
        };
      }
      
      const [
        zonesResult,
        routesResult,
        vehiclesResult,
        driversResult,
        activeSubsResult,
        pendingSubsResult,
        suspendedSubsResult,
      ] = await Promise.all([
        supabase
          .from('transport_zones')
          .select('id', { count: 'exact', head: true })
          .eq('institution_id', institutionId)
          .eq('is_active', true),
        supabase
          .from('transport_routes')
          .select('id', { count: 'exact', head: true })
          .eq('institution_id', institutionId)
          .eq('is_active', true),
        supabase
          .from('transport_vehicles')
          .select('id, capacity', { count: 'exact' })
          .eq('institution_id', institutionId)
          .eq('status', 'active'),
        supabase
          .from('transport_drivers')
          .select('id', { count: 'exact', head: true })
          .eq('institution_id', institutionId)
          .eq('status', 'active'),
        supabase
          .from('transport_subscriptions')
          .select('id', { count: 'exact', head: true })
          .eq('institution_id', institutionId)
          .eq('status', 'active'),
        supabase
          .from('transport_subscriptions')
          .select('id', { count: 'exact', head: true })
          .eq('institution_id', institutionId)
          .eq('status', 'pending'),
        supabase
          .from('transport_subscriptions')
          .select('id', { count: 'exact', head: true })
          .eq('institution_id', institutionId)
          .eq('status', 'suspended'),
      ]);
      
      const totalCapacity = vehiclesResult.data?.reduce((sum, v) => sum + (v.capacity || 0), 0) || 0;
      
      return {
        totalZones: zonesResult.count || 0,
        totalRoutes: routesResult.count || 0,
        totalVehicles: vehiclesResult.count || 0,
        totalDrivers: driversResult.count || 0,
        activeSubscriptions: activeSubsResult.count || 0,
        pendingApprovals: pendingSubsResult.count || 0,
        suspendedSubscriptions: suspendedSubsResult.count || 0,
        totalCapacity,
      };
    },
    enabled: !!institutionId,
  });
}

export function useRouteOccupancy(institutionId: string | undefined) {
  return useQuery({
    queryKey: ['transport-route-occupancy', institutionId],
    queryFn: async (): Promise<RouteOccupancy[]> => {
      if (!institutionId) return [];
      
      // Get routes with their vehicles
      const { data: routes, error: routesError } = await supabase
        .from('transport_routes')
        .select(`
          id,
          name,
          vehicles:transport_vehicles(capacity)
        `)
        .eq('institution_id', institutionId)
        .eq('is_active', true);
      
      if (routesError) throw routesError;
      
      // Get subscription counts per route
      const { data: subscriptions, error: subsError } = await supabase
        .from('transport_subscriptions')
        .select('route_id')
        .eq('institution_id', institutionId)
        .eq('status', 'active');
      
      if (subsError) throw subsError;
      
      // Calculate occupancy
      const subCountByRoute = subscriptions?.reduce((acc, sub) => {
        if (sub.route_id) {
          acc[sub.route_id] = (acc[sub.route_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};
      
      return (routes || []).map(route => {
        const vehicleCapacity = (route.vehicles as { capacity: number }[])?.reduce((sum, v) => sum + (v.capacity || 0), 0) || 0;
        const subscriberCount = subCountByRoute[route.id] || 0;
        
        return {
          routeId: route.id,
          routeName: route.name,
          subscriberCount,
          vehicleCapacity,
          occupancyRate: vehicleCapacity > 0 ? (subscriberCount / vehicleCapacity) * 100 : 0,
        };
      });
    },
    enabled: !!institutionId,
  });
}
