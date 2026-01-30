import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';
import { toast } from 'sonner';

export interface ActivityEnrollment {
  id: string;
  institution_id: string;
  activity_id: string;
  student_id: string;
  academic_year_id: string | null;
  term_id: string | null;
  status: string;
  enrolled_date: string;
  withdrawn_date: string | null;
  notes: string | null;
  enrolled_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    admission_number: string;
  };
  activity?: {
    id: string;
    name: string;
    activity_type: string;
    category: string;
  };
}

export interface EnrollStudentInput {
  activity_id: string;
  student_id: string;
  academic_year_id?: string;
  term_id?: string;
  notes?: string;
}

export function useActivityEnrollments(activityId?: string) {
  const { institution } = useInstitution();
  const queryClient = useQueryClient();

  const { data: enrollments = [], isLoading, error } = useQuery({
    queryKey: ['activity-enrollments', institution?.id, activityId],
    queryFn: async () => {
      if (!institution?.id) return [];
      
      let query = supabase
        .from('activity_enrollments')
        .select(`
          *,
          student:students(id, first_name, last_name, admission_number),
          activity:activities(id, name, activity_type, category)
        `)
        .eq('institution_id', institution.id);
      
      if (activityId) {
        query = query.eq('activity_id', activityId);
      }
      
      const { data, error } = await query.order('enrolled_date', { ascending: false });
      
      if (error) throw error;
      return data as ActivityEnrollment[];
    },
    enabled: !!institution?.id,
  });

  const enrollStudent = useMutation({
    mutationFn: async (input: EnrollStudentInput) => {
      if (!institution?.id) throw new Error('No institution selected');
      
      const { data, error } = await supabase
        .from('activity_enrollments')
        .insert({
          ...input,
          institution_id: institution.id,
          status: 'active',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-enrollments'] });
      toast.success('Student enrolled successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to enroll student: ${error.message}`);
    },
  });

  const updateEnrollment = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ActivityEnrollment> & { id: string }) => {
      const { data, error } = await supabase
        .from('activity_enrollments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-enrollments'] });
      toast.success('Enrollment updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update enrollment: ${error.message}`);
    },
  });

  const withdrawStudent = useMutation({
    mutationFn: async (enrollmentId: string) => {
      const { data, error } = await supabase
        .from('activity_enrollments')
        .update({
          status: 'withdrawn',
          withdrawn_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', enrollmentId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-enrollments'] });
      toast.success('Student withdrawn from activity');
    },
    onError: (error: Error) => {
      toast.error(`Failed to withdraw student: ${error.message}`);
    },
  });

  return {
    enrollments,
    isLoading,
    error,
    enrollStudent,
    updateEnrollment,
    withdrawStudent,
  };
}
