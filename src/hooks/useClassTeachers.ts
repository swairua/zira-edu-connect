import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ClassTeacher {
  id: string;
  class_id: string;
  staff_id: string;
  subject_id: string | null;
  is_class_teacher: boolean;
  institution_id: string;
  assigned_at: string;
  staff?: {
    id: string;
    first_name: string;
    last_name: string;
    employee_number: string;
  };
  subject?: {
    id: string;
    name: string;
    code: string | null;
  };
}

export function useClassTeachers(classId: string | null) {
  return useQuery({
    queryKey: ['class-teachers', classId],
    queryFn: async () => {
      if (!classId) return [];

      const { data, error } = await supabase
        .from('class_teachers')
        .select(`
          *,
          staff:staff(id, first_name, last_name, employee_number),
          subject:subjects(id, name, code)
        `)
        .eq('class_id', classId);

      if (error) throw error;
      return data as ClassTeacher[];
    },
    enabled: !!classId,
  });
}

export function useAssignTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      class_id: string;
      staff_id: string;
      subject_id?: string | null;
      is_class_teacher?: boolean;
      institution_id: string;
    }) => {
      const { data, error } = await supabase
        .from('class_teachers')
        .insert({
          class_id: input.class_id,
          staff_id: input.staff_id,
          subject_id: input.subject_id || null,
          is_class_teacher: input.is_class_teacher || false,
          institution_id: input.institution_id,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('This teacher is already assigned to this class/subject');
        }
        throw error;
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['class-teachers', data.class_id] });
      queryClient.invalidateQueries({ queryKey: ['teacher-classes'] });
      toast.success('Teacher assigned successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to assign teacher', { description: error.message });
    },
  });
}

export function useRemoveTeacherAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from('class_teachers')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-teachers'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-classes'] });
      toast.success('Teacher removed from class');
    },
    onError: (error: Error) => {
      toast.error('Failed to remove teacher', { description: error.message });
    },
  });
}

export function useUpdateClassTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; is_class_teacher: boolean }) => {
      const { data, error } = await supabase
        .from('class_teachers')
        .update({ is_class_teacher: input.is_class_teacher })
        .eq('id', input.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['class-teachers', data.class_id] });
      toast.success('Teacher role updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update', { description: error.message });
    },
  });
}
