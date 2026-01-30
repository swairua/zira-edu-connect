import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useStaffProfile } from '@/hooks/useStaffProfile';
import { toast } from 'sonner';

export interface ClassStudent {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  photo_url?: string | null;
}

export interface AttendanceRecord {
  student_id: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

export function useTeacherAttendance(classId?: string, date?: string) {
  const { data: staffProfile } = useStaffProfile();
  const queryClient = useQueryClient();

  // Fetch students in selected class
  const studentsQuery = useQuery({
    queryKey: ['class-students-attendance', classId],
    queryFn: async () => {
      if (!classId) return [];

      const { data, error } = await supabase
        .from('students')
        .select('id, first_name, last_name, admission_number, photo_url')
        .eq('class_id', classId)
        .eq('status', 'active')
        .is('deleted_at', null)
        .order('first_name');

      if (error) {
        console.error('Error fetching students:', error);
        return [];
      }

      return data as ClassStudent[];
    },
    enabled: !!classId,
  });

  // Fetch existing attendance for date
  const attendanceQuery = useQuery({
    queryKey: ['attendance-records', classId, date],
    queryFn: async () => {
      if (!classId || !date) return [];

      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('class_id', classId)
        .eq('date', date);

      if (error) {
        console.error('Error fetching attendance:', error);
        return [];
      }

      return data;
    },
    enabled: !!classId && !!date,
  });

  // Save attendance mutation
  const saveAttendanceMutation = useMutation({
    mutationFn: async (records: AttendanceRecord[]) => {
      if (!classId || !date || !staffProfile) {
        throw new Error('Missing required data');
      }

      // Delete existing records for this class and date
      await supabase
        .from('attendance')
        .delete()
        .eq('class_id', classId)
        .eq('date', date);

      // Insert new records
      const recordsToInsert = records.map(record => ({
        class_id: classId,
        student_id: record.student_id,
        date: date,
        status: record.status,
        notes: record.notes || null,
        institution_id: staffProfile.institution_id,
        recorded_by: staffProfile.id,
      }));

      const { error } = await supabase
        .from('attendance')
        .insert(recordsToInsert);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Attendance saved successfully');
      queryClient.invalidateQueries({ queryKey: ['attendance-records', classId, date] });
    },
    onError: (error) => {
      console.error('Error saving attendance:', error);
      toast.error('Failed to save attendance');
    },
  });

  // Get attendance summary for a class
  const summaryQuery = useQuery({
    queryKey: ['attendance-summary', classId, date],
    queryFn: async () => {
      if (!classId || !date) return null;

      const { data: attendance, error } = await supabase
        .from('attendance')
        .select('status')
        .eq('class_id', classId)
        .eq('date', date);

      if (error || !attendance) return null;

      const summary = {
        present: attendance.filter(a => a.status === 'present').length,
        absent: attendance.filter(a => a.status === 'absent').length,
        late: attendance.filter(a => a.status === 'late').length,
        excused: attendance.filter(a => a.status === 'excused').length,
        total: attendance.length,
      };

      return summary;
    },
    enabled: !!classId && !!date,
  });

  return {
    students: studentsQuery.data || [],
    isLoadingStudents: studentsQuery.isLoading,
    existingAttendance: attendanceQuery.data || [],
    isLoadingAttendance: attendanceQuery.isLoading,
    summary: summaryQuery.data,
    saveAttendance: saveAttendanceMutation.mutateAsync,
    isSaving: saveAttendanceMutation.isPending,
  };
}
