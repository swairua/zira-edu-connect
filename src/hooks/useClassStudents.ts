import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ClassStudent {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  class_id: string | null;
  status: string | null;
}

export function useClassStudents(classId: string | null) {
  return useQuery({
    queryKey: ['class-students', classId],
    queryFn: async () => {
      if (!classId) return [];

      const { data, error } = await supabase
        .from('students')
        .select('id, first_name, last_name, admission_number, class_id, status')
        .eq('class_id', classId)
        .eq('status', 'active')
        .is('deleted_at', null)
        .order('admission_number', { ascending: true });

      if (error) throw error;
      return data as ClassStudent[];
    },
    enabled: !!classId,
  });
}

export function useClassSubjectTeachers(classId: string | null, institutionId: string | null) {
  return useQuery({
    queryKey: ['class-subject-teachers', classId, institutionId],
    queryFn: async () => {
      if (!classId || !institutionId) return [];

      const { data, error } = await supabase
        .from('class_subjects')
        .select(`
          id,
          subject:subjects(id, name, code),
          teacher:staff(id, first_name, last_name)
        `)
        .eq('class_id', classId)
        .eq('institution_id', institutionId);

      if (error) throw error;
      return data;
    },
    enabled: !!classId && !!institutionId,
  });
}
