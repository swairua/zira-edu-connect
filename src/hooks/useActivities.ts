import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';
import { toast } from 'sonner';

export interface Activity {
  id: string;
  institution_id: string;
  name: string;
  activity_type: string;
  category: string;
  description: string | null;
  meeting_schedule: string | null;
  location: string | null;
  max_capacity: number | null;
  is_active: boolean;
  requires_fee: boolean;
  fee_amount: number | null;
  currency: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateActivityInput {
  name: string;
  activity_type: string;
  category: string;
  description?: string;
  meeting_schedule?: string;
  location?: string;
  max_capacity?: number;
  requires_fee?: boolean;
  fee_amount?: number;
}

export function useActivities() {
  const { institution } = useInstitution();
  const queryClient = useQueryClient();

  const { data: activities = [], isLoading, error } = useQuery({
    queryKey: ['activities', institution?.id],
    queryFn: async () => {
      if (!institution?.id) return [];
      
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('institution_id', institution.id)
        .order('name');
      
      if (error) throw error;
      return data as Activity[];
    },
    enabled: !!institution?.id,
  });

  const createActivity = useMutation({
    mutationFn: async (input: CreateActivityInput) => {
      if (!institution?.id) throw new Error('No institution selected');
      
      const { data, error } = await supabase
        .from('activities')
        .insert({
          ...input,
          institution_id: institution.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', institution?.id] });
      toast.success('Activity created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create activity: ${error.message}`);
    },
  });

  const updateActivity = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Activity> & { id: string }) => {
      const { data, error } = await supabase
        .from('activities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', institution?.id] });
      toast.success('Activity updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update activity: ${error.message}`);
    },
  });

  const deleteActivity = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', institution?.id] });
      toast.success('Activity deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete activity: ${error.message}`);
    },
  });

  return {
    activities,
    isLoading,
    error,
    createActivity,
    updateActivity,
    deleteActivity,
  };
}
