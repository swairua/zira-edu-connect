import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Assignment, CreateAssignmentInput } from '@/types/assignments';
import { toast } from 'sonner';

export function useAssignments(institutionId: string | undefined, classId?: string, status?: string) {
  return useQuery({
    queryKey: ['assignments', institutionId, classId, status],
    queryFn: async () => {
      if (!institutionId) return [];
      
      let query = supabase
        .from('assignments')
        .select(`
          *,
          class:classes(id, name, level),
          subject:subjects(id, name, code),
          academic_year:academic_years(id, name),
          term:terms(id, name)
        `)
        .eq('institution_id', institutionId)
        .order('due_date', { ascending: true });

      if (classId) {
        query = query.eq('class_id', classId);
      }
      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Assignment[];
    },
    enabled: !!institutionId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAssignment(assignmentId: string | undefined) {
  return useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: async () => {
      if (!assignmentId) return null;
      
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          class:classes(id, name, level),
          subject:subjects(id, name, code),
          academic_year:academic_years(id, name),
          term:terms(id, name)
        `)
        .eq('id', assignmentId)
        .single();

      if (error) throw error;
      return data as Assignment;
    },
    enabled: !!assignmentId,
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAssignmentInput) => {
      const { data, error } = await supabase
        .from('assignments')
        .insert([{
          ...input,
          status: 'draft',
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      toast.success('Assignment created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create assignment: ' + error.message);
    },
  });
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Assignment> & { id: string }) => {
      const { data, error } = await supabase
        .from('assignments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assignment', data.id] });
      toast.success('Assignment updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update assignment: ' + error.message);
    },
  });
}

export function usePublishAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const { data, error } = await supabase
        .from('assignments')
        .update({ status: 'published' })
        .eq('id', assignmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assignment', data.id] });
      toast.success('Assignment published successfully');
    },
    onError: (error) => {
      toast.error('Failed to publish assignment: ' + error.message);
    },
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      toast.success('Assignment deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete assignment: ' + error.message);
    },
  });
}
