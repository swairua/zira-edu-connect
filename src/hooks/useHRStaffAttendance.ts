import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';

export interface StaffAttendance {
  id: string;
  institution_id: string;
  staff_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';
  notes: string | null;
  created_at: string;
  updated_at: string;
  staff?: {
    id: string;
    first_name: string;
    last_name: string;
    department: string | null;
  };
}

export function useHRStaffAttendance(date?: Date) {
  const { userRoles } = useAuth();
  const queryClient = useQueryClient();
  const institutionId = userRoles.find(r => r.institution_id)?.institution_id || null;
  const dateString = date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');

  const { data: attendanceRecords = [], isLoading } = useQuery({
    queryKey: ['hr-staff-attendance', institutionId, dateString],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data, error } = await supabase
        .from('hr_staff_attendance')
        .select(`
          *,
          staff:staff!hr_staff_attendance_staff_id_fkey(id, first_name, last_name, department)
        `)
        .eq('institution_id', institutionId)
        .eq('date', dateString)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as StaffAttendance[];
    },
    enabled: !!institutionId,
  });

  const { data: attendanceStats } = useQuery({
    queryKey: ['hr-staff-attendance-stats', institutionId, dateString],
    queryFn: async () => {
      if (!institutionId) return { present: 0, absent: 0, late: 0, onLeave: 0 };
      const { data, error } = await supabase
        .from('hr_staff_attendance')
        .select('status')
        .eq('institution_id', institutionId)
        .eq('date', dateString);
      if (error) throw error;
      
      const stats = { present: 0, absent: 0, late: 0, onLeave: 0 };
      data?.forEach((record) => {
        if (record.status === 'present') stats.present++;
        else if (record.status === 'absent') stats.absent++;
        else if (record.status === 'late') stats.late++;
        else if (record.status === 'on_leave') stats.onLeave++;
      });
      return stats;
    },
    enabled: !!institutionId,
  });

  const markAttendance = useMutation({
    mutationFn: async (attendance: { staff_id: string; status: string; check_in?: string | null; check_out?: string | null; notes?: string | null }) => {
      if (!institutionId) throw new Error('No institution selected');
      const { data, error } = await supabase
        .from('hr_staff_attendance')
        .upsert(
          { 
            staff_id: attendance.staff_id,
            status: attendance.status,
            check_in: attendance.check_in,
            check_out: attendance.check_out,
            notes: attendance.notes,
            institution_id: institutionId,
            date: dateString,
          },
          { onConflict: 'staff_id,date' }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-staff-attendance'] });
      toast.success('Attendance marked successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to mark attendance: ${error.message}`);
    },
  });

  const bulkMarkAttendance = useMutation({
    mutationFn: async (records: Array<{ staff_id: string; status: string; check_in?: string | null; check_out?: string | null; notes?: string | null }>) => {
      if (!institutionId) throw new Error('No institution selected');
      const recordsWithDefaults = records.map(r => ({
        staff_id: r.staff_id,
        status: r.status,
        check_in: r.check_in,
        check_out: r.check_out,
        notes: r.notes,
        institution_id: institutionId,
        date: dateString,
      }));
      const { error } = await supabase
        .from('hr_staff_attendance')
        .upsert(recordsWithDefaults, { onConflict: 'staff_id,date' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-staff-attendance'] });
      toast.success('Attendance marked for all staff');
    },
    onError: (error: Error) => {
      toast.error(`Failed to mark attendance: ${error.message}`);
    },
  });

  return {
    attendanceRecords,
    attendanceStats,
    isLoading,
    markAttendance,
    bulkMarkAttendance,
  };
}
