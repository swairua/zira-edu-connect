import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';
import { DiaryEntry, BehaviorRecord } from '@/types/diary';
import { toast } from 'sonner';

interface DiaryFilters {
  studentId?: string;
  classId?: string;
  entryType?: string;
  startDate?: string;
  endDate?: string;
  isFlagged?: boolean;
  hasParentResponse?: boolean;
  pendingAcknowledgment?: boolean;
}

export function useDiaryEntries(filters: DiaryFilters = {}) {
  const { institution } = useInstitution();

  return useQuery({
    queryKey: ['diary-entries', institution?.id, filters],
    queryFn: async () => {
      if (!institution?.id) return [];

      let query = supabase
        .from('student_diary_entries')
        .select(`
          *,
          student:students(first_name, last_name, admission_number, class_id, class:classes(name)),
          creator:staff!created_by(first_name, last_name)
        `)
        .eq('institution_id', institution.id)
        .order('entry_date', { ascending: false });

      if (filters.studentId) query = query.eq('student_id', filters.studentId);
      if (filters.entryType) query = query.eq('entry_type', filters.entryType);
      if (filters.startDate) query = query.gte('entry_date', filters.startDate);
      if (filters.endDate) query = query.lte('entry_date', filters.endDate);
      if (filters.isFlagged !== undefined) query = query.eq('is_flagged', filters.isFlagged);
      if (filters.hasParentResponse) query = query.not('parent_comment', 'is', null);
      if (filters.pendingAcknowledgment) query = query.is('parent_acknowledged_at', null);

      const { data, error } = await query;
      if (error) throw error;
      
      // Filter by classId client-side (Supabase doesn't support nested filtering well)
      let filteredData = data as unknown as DiaryEntry[];
      if (filters.classId) {
        filteredData = filteredData.filter(entry => 
          (entry.student as any)?.class_id === filters.classId
        );
      }
      
      return filteredData;
    },
    enabled: !!institution?.id,
  });
}

export function useStudentDiaryEntries(studentId: string) {
  return useQuery({
    queryKey: ['student-diary', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_diary_entries')
        .select(`*, creator:staff!created_by(first_name, last_name)`)
        .eq('student_id', studentId)
        .order('entry_date', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data as unknown as DiaryEntry[];
    },
    enabled: !!studentId,
  });
}

export function useExistingEntriesForDate(classId: string | null, date: string) {
  const { institution } = useInstitution();
  
  return useQuery({
    queryKey: ['existing-diary-entries', classId, date, institution?.id],
    queryFn: async () => {
      if (!institution?.id || !classId) return [];

      // Get all students in the class
      const { data: students } = await supabase
        .from('students')
        .select('id')
        .eq('class_id', classId)
        .eq('status', 'active')
        .is('deleted_at', null);

      const studentIds = students?.map(s => s.id) || [];
      if (studentIds.length === 0) return [];

      // Get existing entries for these students on this date
      const { data: entries, error } = await supabase
        .from('student_diary_entries')
        .select('student_id')
        .eq('institution_id', institution.id)
        .eq('entry_date', date)
        .in('student_id', studentIds);

      if (error) throw error;
      return entries?.map(e => e.student_id) || [];
    },
    enabled: !!institution?.id && !!classId,
  });
}

export function useCreateDiaryEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: Partial<DiaryEntry>) => {
      const { data, error } = await supabase
        .from('student_diary_entries')
        .insert(entry as never)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary-entries'] });
      queryClient.invalidateQueries({ queryKey: ['student-diary'] });
      queryClient.invalidateQueries({ queryKey: ['existing-diary-entries'] });
      toast.success('Diary entry created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create entry: ${error.message}`);
    },
  });
}

export function useBulkCreateDiaryEntries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entries: Partial<DiaryEntry>[]) => {
      if (entries.length === 0) return [];
      
      const { data, error } = await supabase
        .from('student_diary_entries')
        .insert(entries as never[])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['diary-entries'] });
      queryClient.invalidateQueries({ queryKey: ['student-diary'] });
      queryClient.invalidateQueries({ queryKey: ['existing-diary-entries'] });
      toast.success(`${data?.length || 0} diary entries created`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create entries: ${error.message}`);
    },
  });
}

export function useUpdateDiaryEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DiaryEntry> & { id: string }) => {
      const { data, error } = await supabase
        .from('student_diary_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary-entries'] });
      queryClient.invalidateQueries({ queryKey: ['student-diary'] });
      toast.success('Diary entry updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update entry: ${error.message}`);
    },
  });
}

// Behavior Records hooks
export function useBehaviorRecords(studentId?: string) {
  const { institution } = useInstitution();

  return useQuery({
    queryKey: ['behavior-records', institution?.id, studentId],
    queryFn: async () => {
      if (!institution?.id) return [];

      let query = supabase
        .from('behavior_records')
        .select(`
          *,
          student:students(first_name, last_name, admission_number),
          creator:staff!created_by(first_name, last_name)
        `)
        .eq('institution_id', institution.id)
        .order('recorded_at', { ascending: false });

      if (studentId) query = query.eq('student_id', studentId);

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as BehaviorRecord[];
    },
    enabled: !!institution?.id,
  });
}

export function useCreateBehaviorRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: Partial<BehaviorRecord>) => {
      const { data, error } = await supabase
        .from('behavior_records')
        .insert(record as never)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['behavior-records'] });
      toast.success('Behavior record created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create record: ${error.message}`);
    },
  });
}
