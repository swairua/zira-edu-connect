import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ReminderSchedule {
  id: string;
  institution_id: string;
  name: string;
  reminder_type: 'upcoming_due' | 'due_date' | 'overdue' | 'penalty_applied' | 'birthday' | 'attendance_absent' | 'attendance_late' | 'attendance_summary' | 'assignment_due' | 'activity_reminder' | 'library_due' | 'library_overdue';
  days_offset: number;
  channels: string[];
  message_template: string;
  is_active: boolean;
  send_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReminderLog {
  id: string;
  schedule_id: string | null;
  institution_id: string;
  student_id: string;
  invoice_id: string | null;
  parent_id: string | null;
  channel: 'sms' | 'email' | 'whatsapp' | 'in_app';
  message: string;
  status: 'sent' | 'delivered' | 'failed' | 'opted_out';
  sent_at: string | null;
  delivered_at: string | null;
  error_message: string | null;
  created_at: string;
  students?: {
    first_name: string;
    last_name: string;
  };
  parents?: {
    first_name: string;
    last_name: string;
    phone: string;
  };
}

interface CreateScheduleParams {
  institution_id: string;
  name: string;
  reminder_type: string;
  days_offset: number;
  channels: string[];
  message_template: string;
  is_active?: boolean;
  send_time?: string;
}

interface UpdateScheduleParams {
  id: string;
  name?: string;
  reminder_type?: string;
  days_offset?: number;
  channels?: string[];
  message_template?: string;
  is_active?: boolean;
  send_time?: string;
}

// Fetch reminder schedules
export function useReminderSchedules(institutionId: string | null) {
  return useQuery({
    queryKey: ['reminder-schedules', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];

      const { data, error } = await supabase
        .from('reminder_schedules')
        .select('*')
        .eq('institution_id', institutionId)
        .order('reminder_type', { ascending: true })
        .order('days_offset', { ascending: true });

      if (error) throw error;
      return data as ReminderSchedule[];
    },
    enabled: !!institutionId,
  });
}

// Fetch reminder logs
export function useReminderLogs(institutionId: string | null, options?: { limit?: number; studentId?: string }) {
  return useQuery({
    queryKey: ['reminder-logs', institutionId, options],
    queryFn: async () => {
      if (!institutionId) return [];

      let query = supabase
        .from('reminder_logs')
        .select(`
          *,
          students (first_name, last_name),
          parents (first_name, last_name, phone)
        `)
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false });

      if (options?.studentId) {
        query = query.eq('student_id', options.studentId);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ReminderLog[];
    },
    enabled: !!institutionId,
  });
}

// Create reminder schedule
export function useCreateReminderSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateScheduleParams) => {
      const { data, error } = await supabase
        .from('reminder_schedules')
        .insert(params)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reminder-schedules', variables.institution_id] });
      toast.success('Reminder schedule created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create schedule');
    },
  });
}

// Update reminder schedule
export function useUpdateReminderSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...params }: UpdateScheduleParams) => {
      const { data, error } = await supabase
        .from('reminder_schedules')
        .update(params)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminder-schedules'] });
      toast.success('Reminder schedule updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update schedule');
    },
  });
}

// Delete reminder schedule
export function useDeleteReminderSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reminder_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminder-schedules'] });
      toast.success('Reminder schedule deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete schedule');
    },
  });
}

// Toggle schedule active status
export function useToggleScheduleActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('reminder_schedules')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reminder-schedules'] });
      toast.success(`Schedule ${data.is_active ? 'activated' : 'deactivated'}`);
    },
  });
}
