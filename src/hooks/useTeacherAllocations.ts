import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface AllocationCopy {
  id: string;
  copy_id: string;
  status: 'allocated' | 'returned' | 'lost' | 'distributed';
  returned_at: string | null;
  condition_at_return: string | null;
  notes: string | null;
  copy?: {
    id: string;
    copy_number: string;
    barcode: string | null;
    condition: string | null;
  };
}

export interface TeacherAllocation {
  id: string;
  institution_id: string;
  book_id: string;
  teacher_id: string;
  class_id: string | null;
  allocated_by: string;
  allocated_at: string;
  returned_at: string | null;
  quantity_allocated: number;
  quantity_distributed: number;
  status: 'active' | 'returned' | 'partial';
  notes: string | null;
  created_at: string;
  updated_at: string;
  book?: {
    id: string;
    title: string;
    author: string | null;
    book_code: string | null;
  };
  teacher?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  class?: {
    id: string;
    name: string;
    level: string;
  };
  allocation_copies?: AllocationCopy[];
}

export function useTeacherAllocations(teacherId?: string) {
  const { institutionId } = useInstitution();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const allocationsQuery = useQuery({
    queryKey: ['teacher-allocations', institutionId, teacherId],
    queryFn: async () => {
      if (!institutionId) return [];
      
      let query = supabase
        .from('library_teacher_allocations')
        .select(`
          *,
          book:library_books(id, title, author, book_code),
          teacher:staff(id, first_name, last_name),
          class:classes(id, name, level),
          allocation_copies:library_teacher_allocation_copies(
            id,
            copy_id,
            status,
            returned_at,
            condition_at_return,
            notes,
            copy:library_book_copies(id, copy_number, barcode, condition)
          )
        `)
        .eq('institution_id', institutionId)
        .order('allocated_at', { ascending: false });

      if (teacherId) {
        query = query.eq('teacher_id', teacherId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TeacherAllocation[];
    },
    enabled: !!institutionId,
  });

  const allocateToTeacher = useMutation({
    mutationFn: async ({
      bookId,
      teacherId,
      classId,
      copyIds,
      notes,
    }: {
      bookId: string;
      teacherId: string;
      classId?: string;
      copyIds: string[];
      notes?: string;
    }) => {
      if (!institutionId || !user?.id) throw new Error('Missing required data');
      if (copyIds.length === 0) throw new Error('Please select at least one book copy');

      // 1. Insert allocation record
      const { data: allocation, error } = await supabase
        .from('library_teacher_allocations')
        .insert({
          institution_id: institutionId,
          book_id: bookId,
          teacher_id: teacherId,
          class_id: classId || null,
          allocated_by: user.id,
          quantity_allocated: copyIds.length,
          notes,
        })
        .select()
        .single();

      if (error) throw error;

      // 2. Insert copy associations with status
      const copyRecords = copyIds.map(copyId => ({
        allocation_id: allocation.id,
        copy_id: copyId,
        status: 'allocated' as const,
      }));
      
      const { error: copyError } = await supabase
        .from('library_teacher_allocation_copies')
        .insert(copyRecords);

      if (copyError) throw copyError;

      // 3. Mark copies as unavailable
      const { error: updateError } = await supabase
        .from('library_book_copies')
        .update({ is_available: false })
        .in('id', copyIds);

      if (updateError) throw updateError;

      return allocation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-allocations', institutionId] });
      queryClient.invalidateQueries({ queryKey: ['library-book-copies'] });
      toast.success('Books allocated to teacher successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to allocate books: ${error.message}`);
    },
  });

  // Return individual copy
  const returnIndividualCopy = useMutation({
    mutationFn: async ({
      allocationCopyId,
      conditionAtReturn,
      notes,
    }: {
      allocationCopyId: string;
      conditionAtReturn?: string;
      notes?: string;
    }) => {
      // 1. Get the allocation copy to find the copy_id and allocation_id
      const { data: allocationCopy, error: fetchError } = await supabase
        .from('library_teacher_allocation_copies')
        .select('copy_id, allocation_id')
        .eq('id', allocationCopyId)
        .single();

      if (fetchError || !allocationCopy) throw new Error('Failed to find allocation copy');

      // 2. Update the allocation copy status
      const { error: updateCopyError } = await supabase
        .from('library_teacher_allocation_copies')
        .update({
          status: 'returned',
          returned_at: new Date().toISOString(),
          condition_at_return: conditionAtReturn || null,
          notes: notes || null,
        })
        .eq('id', allocationCopyId);

      if (updateCopyError) throw updateCopyError;

      // 3. Mark the book copy as available again
      const { error: bookCopyError } = await supabase
        .from('library_book_copies')
        .update({ 
          is_available: true,
          condition: conditionAtReturn || undefined,
        })
        .eq('id', allocationCopy.copy_id);

      if (bookCopyError) throw bookCopyError;

      // 4. Update parent allocation status
      await updateAllocationStatus(allocationCopy.allocation_id);

      return { allocationCopyId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-allocations', institutionId] });
      queryClient.invalidateQueries({ queryKey: ['library-book-copies'] });
      toast.success('Book copy returned successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to return book: ${error.message}`);
    },
  });

  // Mark individual copy as lost
  const markCopyAsLost = useMutation({
    mutationFn: async ({
      allocationCopyId,
      notes,
    }: {
      allocationCopyId: string;
      notes?: string;
    }) => {
      // 1. Get the allocation copy
      const { data: allocationCopy, error: fetchError } = await supabase
        .from('library_teacher_allocation_copies')
        .select('copy_id, allocation_id')
        .eq('id', allocationCopyId)
        .single();

      if (fetchError || !allocationCopy) throw new Error('Failed to find allocation copy');

      // 2. Update the allocation copy status to lost
      const { error: updateCopyError } = await supabase
        .from('library_teacher_allocation_copies')
        .update({
          status: 'lost',
          returned_at: new Date().toISOString(),
          notes: notes || null,
        })
        .eq('id', allocationCopyId);

      if (updateCopyError) throw updateCopyError;

      // 3. Mark the book copy as lost
      const { error: bookCopyError } = await supabase
        .from('library_book_copies')
        .update({ 
          is_available: false,
          condition: 'lost',
        })
        .eq('id', allocationCopy.copy_id);

      if (bookCopyError) throw bookCopyError;

      // 4. Update parent allocation status
      await updateAllocationStatus(allocationCopy.allocation_id);

      return { allocationCopyId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-allocations', institutionId] });
      queryClient.invalidateQueries({ queryKey: ['library-book-copies'] });
      toast.success('Book copy marked as lost');
    },
    onError: (error: Error) => {
      toast.error(`Failed to mark book as lost: ${error.message}`);
    },
  });

  // Helper function to update allocation status based on copy statuses
  const updateAllocationStatus = async (allocationId: string) => {
    // Get all copies for this allocation
    const { data: copies, error } = await supabase
      .from('library_teacher_allocation_copies')
      .select('status')
      .eq('allocation_id', allocationId);

    if (error || !copies) return;

    const allocatedCount = copies.filter(c => c.status === 'allocated').length;
    const totalCount = copies.length;

    let newStatus: 'active' | 'partial' | 'returned';
    if (allocatedCount === 0) {
      newStatus = 'returned';
    } else if (allocatedCount < totalCount) {
      newStatus = 'partial';
    } else {
      newStatus = 'active';
    }

    await supabase
      .from('library_teacher_allocations')
      .update({
        status: newStatus,
        returned_at: newStatus === 'returned' ? new Date().toISOString() : null,
      })
      .eq('id', allocationId);
  };

  // Bulk return all remaining copies
  const returnFromTeacher = useMutation({
    mutationFn: async (allocationId: string) => {
      // 1. Get all allocated copies (not yet returned or lost)
      const { data: copies } = await supabase
        .from('library_teacher_allocation_copies')
        .select('id, copy_id')
        .eq('allocation_id', allocationId)
        .eq('status', 'allocated');

      if (copies && copies.length > 0) {
        const copyIds = copies.map(c => c.copy_id);
        const allocationCopyIds = copies.map(c => c.id);

        // 2. Mark copies as returned in allocation_copies
        await supabase
          .from('library_teacher_allocation_copies')
          .update({
            status: 'returned',
            returned_at: new Date().toISOString(),
          })
          .in('id', allocationCopyIds);

        // 3. Mark book copies as available again
        await supabase
          .from('library_book_copies')
          .update({ is_available: true })
          .in('id', copyIds);
      }

      // 4. Update allocation status
      const { data, error } = await supabase
        .from('library_teacher_allocations')
        .update({
          status: 'returned',
          returned_at: new Date().toISOString(),
        })
        .eq('id', allocationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-allocations', institutionId] });
      queryClient.invalidateQueries({ queryKey: ['library-book-copies'] });
      toast.success('All remaining books returned successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to return books: ${error.message}`);
    },
  });

  const updateDistributedCount = useMutation({
    mutationFn: async ({
      allocationId,
      quantityDistributed,
    }: {
      allocationId: string;
      quantityDistributed: number;
    }) => {
      const { data, error } = await supabase
        .from('library_teacher_allocations')
        .update({
          quantity_distributed: quantityDistributed,
          status: quantityDistributed > 0 ? 'partial' : 'active',
        })
        .eq('id', allocationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-allocations', institutionId] });
    },
  });

  return {
    allocations: allocationsQuery.data ?? [],
    isLoading: allocationsQuery.isLoading,
    error: allocationsQuery.error,
    allocateToTeacher,
    returnFromTeacher,
    returnIndividualCopy,
    markCopyAsLost,
    updateDistributedCount,
  };
}

export function useMyAllocations() {
  const { institutionId } = useInstitution();
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-allocations', institutionId, user?.id],
    queryFn: async () => {
      if (!institutionId || !user?.id) return [];

      // Get staff record for current user
      const { data: staffData } = await supabase
        .from('staff')
        .select('id')
        .eq('user_id', user.id)
        .eq('institution_id', institutionId)
        .single();

      if (!staffData) return [];

      const { data, error } = await supabase
        .from('library_teacher_allocations')
        .select(`
          *,
          book:library_books(id, title, author, book_code),
          class:classes(id, name, level),
          allocation_copies:library_teacher_allocation_copies(
            id,
            copy_id,
            status,
            returned_at,
            condition_at_return,
            notes,
            copy:library_book_copies(id, copy_number, barcode, condition)
          )
        `)
        .eq('institution_id', institutionId)
        .eq('teacher_id', staffData.id)
        .in('status', ['active', 'partial'])
        .order('allocated_at', { ascending: false });

      if (error) throw error;
      return data as TeacherAllocation[];
    },
    enabled: !!institutionId && !!user?.id,
  });
}