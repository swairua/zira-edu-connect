import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ParentTransportSubscription {
  id: string;
  student_id: string;
  status: string;
  subscription_type: string;
  start_date: string;
  end_date: string | null;
  fee_amount: number;
  currency: string;
  suspended_reason: string | null;
  route: {
    id: string;
    name: string;
    code: string;
    zone: {
      id: string;
      name: string;
    } | null;
    vehicle: {
      id: string;
      registration_number: string;
      make: string | null;
      model: string | null;
      driver: {
        id: string;
        name: string;
        phone: string;
      } | null;
    } | null;
  } | null;
  stop: {
    id: string;
    name: string;
    location_description: string | null;
    pickup_time: string | null;
    dropoff_time: string | null;
  } | null;
}

export function useParentTransportSubscription(studentId: string | null) {
  const { data: subscription, isLoading, error } = useQuery({
    queryKey: ['parent-transport-subscription', studentId],
    queryFn: async () => {
      if (!studentId) return null;

      // Get current term
      const { data: currentTerm } = await supabase
        .from('terms')
        .select('id')
        .eq('is_current', true)
        .maybeSingle();

      // Get the subscription with related data
      const { data, error } = await supabase
        .from('transport_subscriptions')
        .select(`
          id,
          student_id,
          status,
          subscription_type,
          start_date,
          end_date,
          fee_amount,
          currency,
          suspended_reason,
          route_id,
          stop_id
        `)
        .eq('student_id', studentId)
        .in('status', ['active', 'pending', 'suspended'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Fetch route details
      let route = null;
      if (data.route_id) {
        const { data: routeData } = await supabase
          .from('transport_routes')
          .select(`
            id,
            name,
            code,
            zone_id
          `)
          .eq('id', data.route_id)
          .single();

        if (routeData) {
          // Get zone
          let zone = null;
          if (routeData.zone_id) {
            const { data: zoneData } = await supabase
              .from('transport_zones')
              .select('id, name')
              .eq('id', routeData.zone_id)
              .single();
            zone = zoneData;
          }

          // Get vehicle assigned to this route
          const { data: vehicleData } = await supabase
            .from('transport_vehicles')
            .select(`
              id,
              registration_number,
              make,
              model
            `)
            .eq('current_route_id', data.route_id)
            .eq('status', 'active')
            .maybeSingle();

          let vehicle = null;
          if (vehicleData) {
            // Get driver assigned to this vehicle
            const { data: driverData } = await supabase
              .from('transport_drivers')
              .select('id, name, phone')
              .eq('current_vehicle_id', vehicleData.id)
              .eq('status', 'active')
              .maybeSingle();

            vehicle = {
              ...vehicleData,
              driver: driverData,
            };
          }

          route = {
            id: routeData.id,
            name: routeData.name,
            code: routeData.code,
            zone,
            vehicle,
          };
        }
      }

      // Fetch stop details
      let stop = null;
      if (data.stop_id) {
        const { data: stopData } = await supabase
          .from('transport_stops')
          .select('id, name, location_description, pickup_time, dropoff_time')
          .eq('id', data.stop_id)
          .single();
        stop = stopData;
      }

      return {
        ...data,
        route,
        stop,
      } as ParentTransportSubscription;
    },
    enabled: !!studentId,
  });

  return {
    subscription,
    isLoading,
    error,
  };
}
