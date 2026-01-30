import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AcademicYear {
  id: string;
  institution_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current?: boolean | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  // Joined data
  terms?: Term[];
}

export interface Term {
  id: string;
  academic_year_id: string;
  institution_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current?: boolean | null;
  sequence_order: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateAcademicYearInput {
  institution_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current?: boolean;
}

export interface CreateTermInput {
  academic_year_id: string;
  institution_id: string;
  name: string;
  start_date: string;
  end_date: string;
  sequence_order: number;
  is_current?: boolean;
}

export function useAcademicYears(institutionId: string | null) {
  return useQuery({
    queryKey: ['academic-years', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];

      const { data, error } = await supabase
        .from('academic_years')
        .select(`
          *,
          terms(*)
        `)
        .eq('institution_id', institutionId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data as AcademicYear[];
    },
    enabled: !!institutionId,
  });
}

export function useCurrentAcademicYear(institutionId: string | null) {
  return useQuery({
    queryKey: ['current-academic-year', institutionId],
    queryFn: async () => {
      if (!institutionId) return null;

      const { data, error } = await supabase
        .from('academic_years')
        .select(`
          *,
          terms(*)
        `)
        .eq('institution_id', institutionId)
        .eq('is_current', true)
        .maybeSingle();

      if (error) throw error;
      return data as AcademicYear | null;
    },
    enabled: !!institutionId,
  });
}

export function useCreateAcademicYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAcademicYearInput) => {
      // If setting as current, unset other current years first
      if (input.is_current) {
        await supabase
          .from('academic_years')
          .update({ is_current: false })
          .eq('institution_id', input.institution_id);
      }

      const { data, error } = await supabase
        .from('academic_years')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['academic-years', data.institution_id] });
      queryClient.invalidateQueries({ queryKey: ['current-academic-year', data.institution_id] });
      toast.success('Academic year created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create academic year', { description: error.message });
    },
  });
}

export function useCreateTerm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTermInput) => {
      // If setting as current, unset other current terms first
      if (input.is_current) {
        await supabase
          .from('terms')
          .update({ is_current: false })
          .eq('institution_id', input.institution_id);
      }

      const { data, error } = await supabase
        .from('terms')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      queryClient.invalidateQueries({ queryKey: ['current-academic-year'] });
      toast.success('Term created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create term', { description: error.message });
    },
  });
}

export function useDeleteAcademicYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (yearId: string) => {
      const { error } = await supabase
        .from('academic_years')
        .delete()
        .eq('id', yearId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      queryClient.invalidateQueries({ queryKey: ['current-academic-year'] });
      toast.success('Academic year deleted');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete academic year', { description: error.message });
    },
  });
}

export function useDeleteTerm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (termId: string) => {
      const { error } = await supabase
        .from('terms')
        .delete()
        .eq('id', termId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      toast.success('Term deleted');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete term', { description: error.message });
    },
  });
}

export function useSetCurrentAcademicYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ yearId, institutionId }: { yearId: string; institutionId: string }) => {
      // Unset all current years
      await supabase
        .from('academic_years')
        .update({ is_current: false })
        .eq('institution_id', institutionId);

      // Set the new current year
      const { error } = await supabase
        .from('academic_years')
        .update({ is_current: true })
        .eq('id', yearId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      queryClient.invalidateQueries({ queryKey: ['current-academic-year'] });
      toast.success('Current academic year updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update current year', { description: error.message });
    },
  });
}

export function useSetCurrentTerm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ termId, institutionId }: { termId: string; institutionId: string }) => {
      // Unset all current terms
      await supabase
        .from('terms')
        .update({ is_current: false })
        .eq('institution_id', institutionId);

      // Set the new current term
      const { error } = await supabase
        .from('terms')
        .update({ is_current: true })
        .eq('id', termId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      queryClient.invalidateQueries({ queryKey: ['current-academic-year'] });
      toast.success('Current term updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update current term', { description: error.message });
    },
  });
}
