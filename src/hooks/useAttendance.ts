import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface Attendance {
  id: string;
  institution_id: string;
  class_id: string;
  student_id: string;
  date: string;
  status: AttendanceStatus;
  notes?: string | null;
  recorded_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AttendanceRecord {
  student_id: string;
  status: AttendanceStatus;
  notes?: string;
}

export function useAttendance(
  institutionId: string | null,
  classId?: string,
  date?: string
) {
  return useQuery({
    queryKey: ['attendance', institutionId, classId, date],
    queryFn: async () => {
      if (!institutionId || !classId || !date) return [];

      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('institution_id', institutionId)
        .eq('class_id', classId)
        .eq('date', date);

      if (error) throw error;
      return data as Attendance[];
    },
    enabled: !!institutionId && !!classId && !!date,
  });
}

export function useAttendanceSummary(
  institutionId: string | null,
  studentId?: string,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: ['attendance-summary', institutionId, studentId, startDate, endDate],
    queryFn: async () => {
      if (!institutionId || !studentId) return null;

      let query = supabase
        .from('attendance')
        .select('status')
        .eq('institution_id', institutionId)
        .eq('student_id', studentId);

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      const summary = {
        total: data.length,
        present: data.filter((a) => a.status === 'present').length,
        absent: data.filter((a) => a.status === 'absent').length,
        late: data.filter((a) => a.status === 'late').length,
        excused: data.filter((a) => a.status === 'excused').length,
      };

      return summary;
    },
    enabled: !!institutionId && !!studentId,
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      institutionId,
      classId,
      date,
      records,
    }: {
      institutionId: string;
      classId: string;
      date: string;
      records: AttendanceRecord[];
    }) => {
      // Delete existing attendance for this class and date
      await supabase
        .from('attendance')
        .delete()
        .eq('institution_id', institutionId)
        .eq('class_id', classId)
        .eq('date', date);

      // Insert new attendance records
      const attendanceData = records.map((record) => ({
        institution_id: institutionId,
        class_id: classId,
        date,
        student_id: record.student_id,
        status: record.status,
        notes: record.notes || null,
        recorded_by: user?.id || null,
      }));

      const { error } = await supabase.from('attendance').insert(attendanceData);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['attendance', variables.institutionId, variables.classId, variables.date],
      });
      toast.success('Attendance saved successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to save attendance', { description: error.message });
    },
  });
}
