import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';

export interface ActivityDashboardStats {
  totalActivities: number;
  activeActivities: number;
  totalEnrollments: number;
  upcomingEvents: number;
  categoryCounts: Record<string, number>;
  typeCounts: Record<string, number>;
}

export function useActivityDashboard() {
  const { institution } = useInstitution();

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['activity-dashboard', institution?.id],
    queryFn: async (): Promise<ActivityDashboardStats> => {
      if (!institution?.id) {
        return {
          totalActivities: 0,
          activeActivities: 0,
          totalEnrollments: 0,
          upcomingEvents: 0,
          categoryCounts: {},
          typeCounts: {},
        };
      }
      
      // Fetch activities
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('id, is_active, category, activity_type')
        .eq('institution_id', institution.id);
      
      if (activitiesError) throw activitiesError;
      
      // Fetch active enrollments
      const { count: enrollmentCount, error: enrollmentError } = await supabase
        .from('activity_enrollments')
        .select('id', { count: 'exact', head: true })
        .eq('institution_id', institution.id)
        .eq('status', 'active');
      
      if (enrollmentError) throw enrollmentError;
      
      // Fetch upcoming events
      const today = new Date().toISOString().split('T')[0];
      const { count: eventsCount, error: eventsError } = await supabase
        .from('activity_events')
        .select('id', { count: 'exact', head: true })
        .eq('institution_id', institution.id)
        .eq('status', 'scheduled')
        .gte('event_date', today);
      
      if (eventsError) throw eventsError;
      
      // Calculate category and type counts
      const categoryCounts: Record<string, number> = {};
      const typeCounts: Record<string, number> = {};
      
      activities?.forEach(activity => {
        categoryCounts[activity.category] = (categoryCounts[activity.category] || 0) + 1;
        typeCounts[activity.activity_type] = (typeCounts[activity.activity_type] || 0) + 1;
      });
      
      return {
        totalActivities: activities?.length || 0,
        activeActivities: activities?.filter(a => a.is_active).length || 0,
        totalEnrollments: enrollmentCount || 0,
        upcomingEvents: eventsCount || 0,
        categoryCounts,
        typeCounts,
      };
    },
    enabled: !!institution?.id,
  });

  const { data: recentEnrollments = [] } = useQuery({
    queryKey: ['activity-recent-enrollments', institution?.id],
    queryFn: async () => {
      if (!institution?.id) return [];
      
      const { data, error } = await supabase
        .from('activity_enrollments')
        .select(`
          *,
          student:students(first_name, last_name),
          activity:activities(name)
        `)
        .eq('institution_id', institution.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
    enabled: !!institution?.id,
  });

  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ['activity-upcoming-events', institution?.id],
    queryFn: async () => {
      if (!institution?.id) return [];
      
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('activity_events')
        .select(`
          *,
          activity:activities(name)
        `)
        .eq('institution_id', institution.id)
        .eq('status', 'scheduled')
        .gte('event_date', today)
        .order('event_date', { ascending: true })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
    enabled: !!institution?.id,
  });

  return {
    stats: stats || {
      totalActivities: 0,
      activeActivities: 0,
      totalEnrollments: 0,
      upcomingEvents: 0,
      categoryCounts: {},
      typeCounts: {},
    },
    recentEnrollments,
    upcomingEvents,
    isLoading,
    error,
  };
}
