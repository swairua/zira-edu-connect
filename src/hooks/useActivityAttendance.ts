import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface ActivityAttendance {
  id: string;
  institution_id: string;
  activity_id: string;
  student_id: string;
  event_id: string | null;
  attendance_date: string;
  status: string;
  marked_by: string | null;
  notes: string | null;
  created_at: string;
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    admission_number: string;
  };
}

export interface MarkAttendanceInput {
  activity_id: string;
  student_id: string;
  attendance_date: string;
  status: string;
  event_id?: string;
  notes?: string;
}

export function useActivityAttendance(activityId?: string, date?: string) {
  const { institution } = useInstitution();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: attendance = [], isLoading, error } = useQuery({
    queryKey: ['activity-attendance', institution?.id, activityId, date],
    queryFn: async () => {
      if (!institution?.id) return [];
      
      let query = supabase
        .from('activity_attendance')
        .select(`
          *,
          student:students(id, first_name, last_name, admission_number)
        `)
        .eq('institution_id', institution.id);
      
      if (activityId) {
        query = query.eq('activity_id', activityId);
      }
      
      if (date) {
        query = query.eq('attendance_date', date);
      }
      
      const { data, error } = await query.order('attendance_date', { ascending: false });
      
      if (error) throw error;
      return data as ActivityAttendance[];
    },
    enabled: !!institution?.id,
  });

  const markAttendance = useMutation({
    mutationFn: async (input: MarkAttendanceInput) => {
      if (!institution?.id) throw new Error('No institution selected');
      
      const { data, error } = await supabase
        .from('activity_attendance')
        .insert({
          ...input,
          institution_id: institution.id,
          marked_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-attendance'] });
      toast.success('Attendance marked');
    },
    onError: (error: Error) => {
      toast.error(`Failed to mark attendance: ${error.message}`);
    },
  });

  const bulkMarkAttendance = useMutation({
    mutationFn: async (records: MarkAttendanceInput[]) => {
      if (!institution?.id) throw new Error('No institution selected');
      
      const { data, error } = await supabase
        .from('activity_attendance')
        .upsert(
          records.map(r => ({
            ...r,
            institution_id: institution.id,
            marked_by: user?.id,
          })),
          { onConflict: 'activity_id,student_id,attendance_date' }
        )
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-attendance'] });
      toast.success('Attendance saved');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save attendance: ${error.message}`);
    },
  });

  return {
    attendance,
    isLoading,
    error,
    markAttendance,
    bulkMarkAttendance,
  };
}
