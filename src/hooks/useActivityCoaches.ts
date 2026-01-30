import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';
import { toast } from 'sonner';

export interface ActivityCoach {
  id: string;
  institution_id: string;
  activity_id: string;
  staff_id: string;
  role: string;
  is_primary: boolean;
  assigned_date: string;
  is_active: boolean;
  created_at: string;
  staff?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  activity?: {
    id: string;
    name: string;
  };
}

export interface AssignCoachInput {
  activity_id: string;
  staff_id: string;
  role?: string;
  is_primary?: boolean;
}

export function useActivityCoaches(activityId?: string) {
  const { institution } = useInstitution();
  const queryClient = useQueryClient();

  const { data: coaches = [], isLoading, error } = useQuery({
    queryKey: ['activity-coaches', institution?.id, activityId],
    queryFn: async () => {
      if (!institution?.id) return [];
      
      let query = supabase
        .from('activity_coaches')
        .select(`
          *,
          staff:staff(id, first_name, last_name, email),
          activity:activities(id, name)
        `)
        .eq('institution_id', institution.id)
        .eq('is_active', true);
      
      if (activityId) {
        query = query.eq('activity_id', activityId);
      }
      
      const { data, error } = await query.order('is_primary', { ascending: false });
      
      if (error) throw error;
      return data as ActivityCoach[];
    },
    enabled: !!institution?.id,
  });

  const assignCoach = useMutation({
    mutationFn: async (input: AssignCoachInput) => {
      if (!institution?.id) throw new Error('No institution selected');
      
      const { data, error } = await supabase
        .from('activity_coaches')
        .insert({
          ...input,
          institution_id: institution.id,
          role: input.role || 'coach',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-coaches'] });
      toast.success('Coach assigned successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to assign coach: ${error.message}`);
    },
  });

  const removeCoach = useMutation({
    mutationFn: async (coachId: string) => {
      const { error } = await supabase
        .from('activity_coaches')
        .update({ is_active: false })
        .eq('id', coachId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-coaches'] });
      toast.success('Coach removed');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove coach: ${error.message}`);
    },
  });

  return {
    coaches,
    isLoading,
    error,
    assignCoach,
    removeCoach,
  };
}
