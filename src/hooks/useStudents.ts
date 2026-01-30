import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Student {
  id: string;
  institution_id: string;
  admission_number: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  date_of_birth?: string | null;
  gender?: string | null;
  nationality?: string | null;
  class_id?: string | null;
  admission_date?: string | null;
  status?: string | null;
  photo_url?: string | null;
  medical_info?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  user_id?: string | null;
  // Portal access fields
  portal_enabled?: boolean | null;
  login_pin?: string | null;
  pin_expires_at?: string | null;
  pin_attempts?: number | null;
  // Boarding status
  boarding_status?: 'day' | 'boarding' | 'day_boarding' | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  // Joined data
  class?: {
    id: string;
    name: string;
    level: string;
    stream?: string | null;
  } | null;
}

export interface StudentFilters {
  search?: string;
  classId?: string;
  status?: string;
  admissionYear?: string;
}

export interface CreateStudentInput {
  institution_id: string;
  admission_number: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  date_of_birth?: string | null;
  gender?: string | null;
  nationality?: string | null;
  class_id?: string | null;
  admission_date?: string | null;
  status?: string | null;
  boarding_status?: string | null;
}

export function useStudents(institutionId: string | null, filters?: StudentFilters) {
  return useQuery({
    queryKey: ['students', institutionId, filters],
    queryFn: async () => {
      if (!institutionId) return [];

      let query = supabase
        .from('students')
        .select(`
          *,
          class:classes(id, name, level, stream)
        `)
        .eq('institution_id', institutionId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.search) {
        query = query.or(
          `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,admission_number.ilike.%${filters.search}%`
        );
      }

      if (filters?.classId) {
        query = query.eq('class_id', filters.classId);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.admissionYear) {
        query = query.gte('admission_date', `${filters.admissionYear}-01-01`)
          .lte('admission_date', `${filters.admissionYear}-12-31`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Student[];
    },
    enabled: !!institutionId,
  });
}

export function useStudent(studentId: string | null) {
  return useQuery({
    queryKey: ['student', studentId],
    queryFn: async () => {
      if (!studentId) return null;

      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          class:classes(id, name, level, stream)
        `)
        .eq('id', studentId)
        .single();

      if (error) throw error;
      return data as Student;
    },
    enabled: !!studentId,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateStudentInput) => {
      const { data, error } = await supabase
        .from('students')
        .insert([input])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['students', data.institution_id] });
      queryClient.invalidateQueries({ queryKey: ['student-stats', data.institution_id] });
      toast.success('Student registered successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to register student', { description: error.message });
    },
  });
}

export function useBulkCreateStudents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (students: CreateStudentInput[]) => {
      const { data, error } = await supabase
        .from('students')
        .insert(students)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['students', data[0].institution_id] });
        queryClient.invalidateQueries({ queryKey: ['student-stats', data[0].institution_id] });
      }
      toast.success(`${data.length} students imported successfully`);
    },
    onError: (error: Error) => {
      toast.error('Failed to import students', { description: error.message });
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, institution_id, first_name, last_name, middle_name, admission_number, class_id, status, date_of_birth, gender, nationality, admission_date }: { id: string; institution_id?: string; first_name?: string; last_name?: string; middle_name?: string | null; admission_number?: string; class_id?: string | null; status?: string | null; date_of_birth?: string | null; gender?: string | null; nationality?: string | null; admission_date?: string | null }) => {
      const { data, error } = await supabase
        .from('students')
        .update({ 
          first_name, 
          last_name, 
          middle_name, 
          admission_number, 
          class_id, 
          status, 
          date_of_birth, 
          gender, 
          nationality, 
          admission_date,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', data.id] });
      toast.success('Student updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update student', { description: error.message });
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentId: string) => {
      // Soft delete
      const { error } = await supabase
        .from('students')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', studentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student removed successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to remove student', { description: error.message });
    },
  });
}

export interface BulkUpdateInput {
  id: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  nationality?: string | null;
  class_id?: string | null;
  boarding_status?: string | null;
  status?: string | null;
}

export function useBulkUpdateStudents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: BulkUpdateInput[]) => {
      const results = await Promise.allSettled(
        updates.map(async ({ id, ...data }) => {
          const { data: result, error } = await supabase
            .from('students')
            .update({
              ...data,
              updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;
          return result;
        })
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      return { successful, failed };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student-stats'] });
      toast.success(`Updated ${data.successful} students`, {
        description: data.failed > 0 ? `${data.failed} failed` : undefined,
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to update students', { description: error.message });
    },
  });
}

export function useStudentStats(institutionId: string | null) {
  return useQuery({
    queryKey: ['student-stats', institutionId],
    queryFn: async () => {
      if (!institutionId) return null;

      const { data, error } = await supabase
        .from('students')
        .select('status, gender')
        .eq('institution_id', institutionId)
        .is('deleted_at', null);

      if (error) throw error;

      const stats = {
        total: data.length,
        active: data.filter(s => s.status === 'active').length,
        inactive: data.filter(s => s.status !== 'active').length,
        male: data.filter(s => s.gender === 'male').length,
        female: data.filter(s => s.gender === 'female').length,
      };

      return stats;
    },
    enabled: !!institutionId,
  });
}
