import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';
import { TimetableConstraint } from '@/types/diary';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export function useTimetableConstraints() {
  const { institution } = useInstitution();

  return useQuery({
    queryKey: ['timetable-constraints', institution?.id],
    queryFn: async () => {
      if (!institution?.id) return [];

      const { data, error } = await supabase
        .from('timetable_constraints')
        .select('*')
        .eq('institution_id', institution.id)
        .order('constraint_type')
        .order('priority', { ascending: false });

      if (error) throw error;
      return data as unknown as TimetableConstraint[];
    },
    enabled: !!institution?.id,
  });
}

export function useCreateConstraint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (constraint: {
      institution_id: string;
      constraint_type: string;
      name: string;
      config?: Record<string, unknown>;
      priority?: number;
    }) => {
      const { data, error } = await supabase
        .from('timetable_constraints')
        .insert({
          ...constraint,
          config: (constraint.config || {}) as Json,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable-constraints'] });
      toast.success('Constraint created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create constraint: ${error.message}`);
    },
  });
}

export function useUpdateConstraint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, config, ...updates }: { id: string; config?: Record<string, unknown> } & Record<string, unknown>) => {
      const { data, error } = await supabase
        .from('timetable_constraints')
        .update({
          ...updates,
          ...(config ? { config: config as Json } : {}),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable-constraints'] });
      toast.success('Constraint updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update constraint: ${error.message}`);
    },
  });
}

export function useDeleteConstraint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (constraintId: string) => {
      const { error } = await supabase
        .from('timetable_constraints')
        .delete()
        .eq('id', constraintId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable-constraints'] });
      toast.success('Constraint deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete constraint: ${error.message}`);
    },
  });
}
