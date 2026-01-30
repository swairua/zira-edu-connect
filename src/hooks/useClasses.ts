import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Class {
  id: string;
  institution_id: string;
  name: string;
  level: string;
  stream?: string | null;
  academic_year_id?: string | null;
  class_teacher_id?: string | null;
  capacity?: number | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  // Joined data
  academic_year?: {
    id: string;
    name: string;
  } | null;
  class_teacher?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
  student_count?: number;
}

export interface CreateClassInput {
  institution_id: string;
  name: string;
  level: string;
  stream?: string;
  academic_year_id?: string;
  class_teacher_id?: string;
  capacity?: number;
}

export function useClasses(institutionId: string | null) {
  return useQuery({
    queryKey: ['classes', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];

      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          academic_year:academic_years(id, name),
          class_teacher:staff(id, first_name, last_name)
        `)
        .eq('institution_id', institutionId)
        .eq('is_active', true)
        .order('level', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Class[];
    },
    enabled: !!institutionId,
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateClassInput) => {
      const { data, error } = await supabase
        .from('classes')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['classes', data.institution_id] });
      toast.success('Class created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create class', { description: error.message });
    },
  });
}

export function useUpdateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Class> & { id: string }) => {
      const { data, error } = await supabase
        .from('classes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update class', { description: error.message });
    },
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (classId: string) => {
      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('classes')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', classId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class removed successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to remove class', { description: error.message });
    },
  });
}
