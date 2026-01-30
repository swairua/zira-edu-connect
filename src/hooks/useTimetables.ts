import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';
import { toast } from 'sonner';
import type { Timetable, TimetableEntry } from '@/types/timetable';

export function useTimetables() {
  const { institution } = useInstitution();

  return useQuery({
    queryKey: ['timetables', institution?.id],
    queryFn: async () => {
      if (!institution?.id) return [];
      const { data, error } = await supabase
        .from('timetables')
        .select('*, academic_years(name), terms(name)')
        .eq('institution_id', institution.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as (Timetable & { academic_years: { name: string }; terms: { name: string } | null })[];
    },
    enabled: !!institution?.id,
  });
}

export function useTimetable(id: string | undefined) {
  return useQuery({
    queryKey: ['timetable', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('timetables')
        .select('*, academic_years(name), terms(name)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Timetable & { academic_years: { name: string }; terms: { name: string } | null };
    },
    enabled: !!id,
  });
}

export function useCreateTimetable() {
  const queryClient = useQueryClient();
  const { institution } = useInstitution();

  return useMutation({
    mutationFn: async (timetable: Omit<Timetable, 'id' | 'created_at' | 'updated_at' | 'institution_id'>) => {
      if (!institution?.id) throw new Error('No institution selected');
      const { data, error } = await supabase
        .from('timetables')
        .insert({ ...timetable, institution_id: institution.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetables'] });
      toast.success('Timetable created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateTimetable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Timetable> & { id: string }) => {
      const { data, error } = await supabase
        .from('timetables')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetables'] });
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      toast.success('Timetable updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function usePublishTimetable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('timetables')
        .update({ status: 'published', published_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetables'] });
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      toast.success('Timetable published successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteTimetable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('timetables').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetables'] });
      toast.success('Timetable deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Timetable Entries
export function useTimetableEntries(timetableId: string | undefined, classId?: string) {
  return useQuery({
    queryKey: ['timetable-entries', timetableId, classId],
    queryFn: async () => {
      if (!timetableId) return [];
      let query = supabase
        .from('timetable_entries')
        .select(`
          *,
          classes(name, level, stream),
          subjects(name, code),
          staff(first_name, last_name, employee_number),
          rooms(name),
          time_slots(*)
        `)
        .eq('timetable_id', timetableId);
      
      if (classId) {
        query = query.eq('class_id', classId);
      }
      
      const { data, error } = await query.order('day_of_week');
      if (error) throw error;
      return data.map((entry: any) => ({
        ...entry,
        class: entry.classes,
        subject: entry.subjects,
        teacher: entry.staff,
        room: entry.rooms,
        time_slot: entry.time_slots,
      })) as TimetableEntry[];
    },
    enabled: !!timetableId,
  });
}

export function useCreateTimetableEntry() {
  const queryClient = useQueryClient();
  const { institution } = useInstitution();

  return useMutation({
    mutationFn: async (entry: Omit<TimetableEntry, 'id' | 'created_at' | 'updated_at' | 'institution_id' | 'class' | 'subject' | 'teacher' | 'room' | 'time_slot'>) => {
      if (!institution?.id) throw new Error('No institution selected');
      const { data, error } = await supabase
        .from('timetable_entries')
        .insert({ ...entry, institution_id: institution.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable-entries'] });
      toast.success('Entry added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateTimetableEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; subject_id?: string; teacher_id?: string; room_id?: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('timetable_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable-entries'] });
      toast.success('Entry updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteTimetableEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('timetable_entries').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable-entries'] });
      toast.success('Entry deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
