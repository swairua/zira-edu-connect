import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface BedAllocation {
  id: string;
  institution_id: string;
  student_id: string;
  bed_id: string;
  academic_year_id: string | null;
  term_id: string | null;
  allocation_date: string;
  start_date: string;
  end_date: string | null;
  status: 'active' | 'ended' | 'transferred' | 'suspended';
  allocated_by: string;
  ended_by: string | null;
  end_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    admission_number: string;
    class?: {
      name: string;
    };
  };
  bed?: {
    id: string;
    bed_number: string;
    room?: {
      id: string;
      room_number: string;
      floor: string | null;
      hostel?: {
        id: string;
        name: string;
        code: string;
      };
    };
  };
  academic_year?: {
    name: string;
  };
  term?: {
    name: string;
  };
}

export interface AllocationHistory {
  id: string;
  allocation_id: string;
  action: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  changed_by: string;
  change_reason: string | null;
  requires_approval: boolean;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

interface AllocationFilters {
  status?: string;
  hostelId?: string;
  academicYearId?: string;
  termId?: string;
  searchQuery?: string;
}

export function useBedAllocations(filters: AllocationFilters = {}) {
  const { institution } = useInstitution();

  return useQuery({
    queryKey: ['bed-allocations', institution?.id, filters],
    queryFn: async () => {
      if (!institution?.id) return [];

      let query = supabase
        .from('bed_allocations')
        .select(`
          *,
          student:students(id, first_name, last_name, admission_number, class:classes(name)),
          bed:hostel_beds(
            id, 
            bed_number,
            room:hostel_rooms(
              id, 
              room_number, 
              floor,
              hostel:hostels(id, name, code)
            )
          ),
          academic_year:academic_years(name),
          term:terms(name)
        `)
        .eq('institution_id', institution.id)
        .order('created_at', { ascending: false });

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.academicYearId) {
        query = query.eq('academic_year_id', filters.academicYearId);
      }

      if (filters.termId) {
        query = query.eq('term_id', filters.termId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter by hostel if needed (can't do this in supabase query easily)
      let result = data as BedAllocation[];
      
      if (filters.hostelId) {
        result = result.filter(a => a.bed?.room?.hostel?.id === filters.hostelId);
      }

      if (filters.searchQuery) {
        const search = filters.searchQuery.toLowerCase();
        result = result.filter(a => 
          a.student?.first_name?.toLowerCase().includes(search) ||
          a.student?.last_name?.toLowerCase().includes(search) ||
          a.student?.admission_number?.toLowerCase().includes(search)
        );
      }

      return result;
    },
    enabled: !!institution?.id,
  });
}

export function useStudentAllocation(studentId: string | undefined, termId?: string) {
  const { institution } = useInstitution();

  return useQuery({
    queryKey: ['student-allocation', studentId, termId],
    queryFn: async () => {
      if (!studentId || !institution?.id) return null;

      let query = supabase
        .from('bed_allocations')
        .select(`
          *,
          bed:hostel_beds(
            id, 
            bed_number,
            room:hostel_rooms(
              id, 
              room_number, 
              floor,
              hostel:hostels(id, name, code, gender)
            )
          ),
          academic_year:academic_years(name),
          term:terms(name)
        `)
        .eq('student_id', studentId)
        .eq('status', 'active');

      if (termId) {
        query = query.eq('term_id', termId);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      return data as BedAllocation | null;
    },
    enabled: !!studentId && !!institution?.id,
  });
}

export function useAllocateBed() {
  const queryClient = useQueryClient();
  const { institution } = useInstitution();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      student_id: string;
      bed_id: string;
      academic_year_id: string;
      term_id?: string;
      start_date: string;
      end_date?: string;
      notes?: string;
    }) => {
      if (!institution?.id) throw new Error('No institution selected');
      if (!user?.id) throw new Error('User not authenticated');

      // Check if student already has an active allocation
      const { data: existingAllocation } = await supabase
        .from('bed_allocations')
        .select('id')
        .eq('student_id', data.student_id)
        .eq('status', 'active')
        .maybeSingle();

      if (existingAllocation) {
        throw new Error('Student already has an active bed allocation');
      }

      // Check if bed is available
      const { data: bed } = await supabase
        .from('hostel_beds')
        .select('status')
        .eq('id', data.bed_id)
        .single();

      if (bed?.status !== 'available') {
        throw new Error('Selected bed is not available');
      }

      // Create allocation
      const { data: allocation, error } = await supabase
        .from('bed_allocations')
        .insert({
          institution_id: institution.id,
          allocated_by: user.id,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      return allocation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bed-allocations'] });
      queryClient.invalidateQueries({ queryKey: ['available-beds'] });
      queryClient.invalidateQueries({ queryKey: ['boarding-stats'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student assigned to bed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to allocate bed');
    },
  });
}

export function useTransferBed() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      allocationId,
      newBedId,
      reason,
    }: {
      allocationId: string;
      newBedId: string;
      reason: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Get current allocation
      const { data: currentAllocation, error: fetchError } = await supabase
        .from('bed_allocations')
        .select('*')
        .eq('id', allocationId)
        .single();

      if (fetchError) throw fetchError;

      // Check if new bed is available
      const { data: newBed } = await supabase
        .from('hostel_beds')
        .select('status')
        .eq('id', newBedId)
        .single();

      if (newBed?.status !== 'available') {
        throw new Error('Target bed is not available');
      }

      // End current allocation
      const { error: endError } = await supabase
        .from('bed_allocations')
        .update({
          status: 'transferred',
          ended_by: user.id,
          end_reason: reason,
          end_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
        })
        .eq('id', allocationId);

      if (endError) throw endError;

      // Create new allocation
      const { data: newAllocation, error: createError } = await supabase
        .from('bed_allocations')
        .insert({
          institution_id: currentAllocation.institution_id,
          student_id: currentAllocation.student_id,
          bed_id: newBedId,
          academic_year_id: currentAllocation.academic_year_id,
          term_id: currentAllocation.term_id,
          start_date: new Date().toISOString().split('T')[0],
          end_date: currentAllocation.end_date,
          allocated_by: user.id,
          notes: `Transferred: ${reason}`,
        })
        .select()
        .single();

      if (createError) throw createError;
      return newAllocation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bed-allocations'] });
      queryClient.invalidateQueries({ queryKey: ['available-beds'] });
      queryClient.invalidateQueries({ queryKey: ['student-allocation'] });
      toast.success('Student transferred successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to transfer student');
    },
  });
}

export function useEndAllocation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      allocationId,
      reason,
      endDate,
    }: {
      allocationId: string;
      reason: string;
      endDate?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('bed_allocations')
        .update({
          status: 'ended',
          ended_by: user.id,
          end_reason: reason,
          end_date: endDate || new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
        })
        .eq('id', allocationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bed-allocations'] });
      queryClient.invalidateQueries({ queryKey: ['available-beds'] });
      queryClient.invalidateQueries({ queryKey: ['boarding-stats'] });
      queryClient.invalidateQueries({ queryKey: ['student-allocation'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Allocation ended successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to end allocation');
    },
  });
}

export function useAllocationHistory(allocationId: string | undefined) {
  return useQuery({
    queryKey: ['allocation-history', allocationId],
    queryFn: async () => {
      if (!allocationId) return [];

      const { data, error } = await supabase
        .from('bed_allocation_history')
        .select('*')
        .eq('allocation_id', allocationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AllocationHistory[];
    },
    enabled: !!allocationId,
  });
}

export function useRecentAllocations(limit = 5) {
  const { institution } = useInstitution();

  return useQuery({
    queryKey: ['recent-allocations', institution?.id, limit],
    queryFn: async () => {
      if (!institution?.id) return [];

      const { data, error } = await supabase
        .from('bed_allocations')
        .select(`
          *,
          student:students(id, first_name, last_name, admission_number),
          bed:hostel_beds(
            bed_number,
            room:hostel_rooms(
              room_number,
              hostel:hostels(name, code)
            )
          )
        `)
        .eq('institution_id', institution.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as BedAllocation[];
    },
    enabled: !!institution?.id,
  });
}
