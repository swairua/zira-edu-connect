import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface ActivityEvent {
  id: string;
  institution_id: string;
  activity_id: string;
  event_name: string;
  event_type: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  description: string | null;
  budget: number | null;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  activity?: {
    id: string;
    name: string;
  };
}

export interface CreateEventInput {
  activity_id: string;
  event_name: string;
  event_type: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  description?: string;
  budget?: number;
}

export function useActivityEvents(activityId?: string) {
  const { institution } = useInstitution();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['activity-events', institution?.id, activityId],
    queryFn: async () => {
      if (!institution?.id) return [];
      
      let query = supabase
        .from('activity_events')
        .select(`
          *,
          activity:activities(id, name)
        `)
        .eq('institution_id', institution.id);
      
      if (activityId) {
        query = query.eq('activity_id', activityId);
      }
      
      const { data, error } = await query.order('event_date', { ascending: true });
      
      if (error) throw error;
      return data as ActivityEvent[];
    },
    enabled: !!institution?.id,
  });

  const createEvent = useMutation({
    mutationFn: async (input: CreateEventInput) => {
      if (!institution?.id) throw new Error('No institution selected');
      
      const { data, error } = await supabase
        .from('activity_events')
        .insert({
          ...input,
          institution_id: institution.id,
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-events'] });
      toast.success('Event created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create event: ${error.message}`);
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ActivityEvent> & { id: string }) => {
      const { data, error } = await supabase
        .from('activity_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-events'] });
      toast.success('Event updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update event: ${error.message}`);
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('activity_events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-events'] });
      toast.success('Event deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete event: ${error.message}`);
    },
  });

  return {
    events,
    isLoading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
