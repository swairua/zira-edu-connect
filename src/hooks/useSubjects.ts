import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Subject {
  id: string;
  institution_id: string;
  name: string;
  code: string;
  category?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateSubjectInput {
  institution_id: string;
  name: string;
  code: string;
  category?: string;
}

export function useSubjects(institutionId: string | null) {
  return useQuery({
    queryKey: ['subjects', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];

      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('institution_id', institutionId)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Subject[];
    },
    enabled: !!institutionId,
  });
}

export function useActiveSubjects(institutionId: string | null) {
  return useQuery({
    queryKey: ['subjects', institutionId, 'active'],
    queryFn: async () => {
      if (!institutionId) return [];

      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('institution_id', institutionId)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Subject[];
    },
    enabled: !!institutionId,
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSubjectInput) => {
      const { data, error } = await supabase
        .from('subjects')
        .insert({
          ...input,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subjects', data.institution_id] });
      toast.success('Subject created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create subject', { description: error.message });
    },
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Subject> & { id: string }) => {
      const { data, error } = await supabase
        .from('subjects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update subject', { description: error.message });
    },
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subjectId: string) => {
      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('subjects')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', subjectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject removed successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to remove subject', { description: error.message });
    },
  });
}
