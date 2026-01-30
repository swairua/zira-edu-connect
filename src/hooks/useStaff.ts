import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Staff {
  id: string;
  institution_id: string;
  user_id?: string | null;
  employee_number: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  department?: string | null;
  designation?: string | null;
  employment_type?: string | null;
  date_joined?: string | null;
  date_left?: string | null;
  is_active?: boolean | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface StaffFilters {
  search?: string;
  department?: string;
  employmentType?: string;
  isActive?: boolean;
}

export interface CreateStaffInput {
  institution_id: string;
  employee_number: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email?: string;
  phone?: string;
  department?: string;
  designation?: string;
  employment_type?: string;
  date_joined?: string;
}

export function useStaff(institutionId: string | null, filters?: StaffFilters) {
  return useQuery({
    queryKey: ['staff', institutionId, filters],
    queryFn: async () => {
      if (!institutionId) return [];

      let query = supabase
        .from('staff')
        .select('*')
        .eq('institution_id', institutionId)
        .is('deleted_at', null)
        .order('first_name', { ascending: true });

      if (filters?.search) {
        query = query.or(
          `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,employee_number.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }

      if (filters?.department) {
        query = query.eq('department', filters.department);
      }

      if (filters?.employmentType) {
        query = query.eq('employment_type', filters.employmentType);
      }

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Staff[];
    },
    enabled: !!institutionId,
  });
}

export function useStaffMember(staffId: string | null) {
  return useQuery({
    queryKey: ['staff-member', staffId],
    queryFn: async () => {
      if (!staffId) return null;

      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('id', staffId)
        .single();

      if (error) throw error;
      return data as Staff;
    },
    enabled: !!staffId,
  });
}

export function useTeachers(institutionId: string | null) {
  return useQuery({
    queryKey: ['teachers', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];

      const { data, error } = await supabase
        .from('staff')
        .select('id, first_name, last_name, employee_number')
        .eq('institution_id', institutionId)
        .eq('is_active', true)
        .is('deleted_at', null)
        .or('department.eq.Teaching,department.eq.Academic,department.ilike.%teacher%')
        .order('first_name', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!institutionId,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateStaffInput) => {
      const { data, error } = await supabase
        .from('staff')
        .insert({
          ...input,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['staff', data.institution_id] });
      queryClient.invalidateQueries({ queryKey: ['teachers', data.institution_id] });
      toast.success('Staff member added successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to add staff member', { description: error.message });
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, first_name, last_name, middle_name, employee_number, email, phone, department, designation, employment_type, date_joined, is_active }: { id: string; first_name?: string; last_name?: string; middle_name?: string | null; employee_number?: string; email?: string | null; phone?: string | null; department?: string | null; designation?: string | null; employment_type?: string | null; date_joined?: string | null; is_active?: boolean | null }) => {
      const { data, error } = await supabase
        .from('staff')
        .update({ 
          first_name, 
          last_name, 
          middle_name, 
          employee_number, 
          email, 
          phone, 
          department, 
          designation, 
          employment_type, 
          date_joined,
          is_active,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      queryClient.invalidateQueries({ queryKey: ['staff-member', data.id] });
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast.success('Staff member updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update staff member', { description: error.message });
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (staffId: string) => {
      // Soft delete
      const { error } = await supabase
        .from('staff')
        .update({ deleted_at: new Date().toISOString(), is_active: false })
        .eq('id', staffId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast.success('Staff member removed');
    },
    onError: (error: Error) => {
      toast.error('Failed to remove staff member', { description: error.message });
    },
  });
}

export function useStaffDepartments() {
  return [
    { value: 'Teaching', label: 'Teaching' },
    { value: 'Administration', label: 'Administration' },
    { value: 'Finance', label: 'Finance' },
    { value: 'IT', label: 'IT / ICT' },
    { value: 'Support', label: 'Support Staff' },
    { value: 'Library', label: 'Library' },
    { value: 'Laboratory', label: 'Laboratory' },
    { value: 'Sports', label: 'Sports' },
    { value: 'Other', label: 'Other' },
  ];
}
