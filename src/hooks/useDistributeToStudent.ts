import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface DistributeParams {
  allocationCopyId: string;
  copyId: string;
  studentId: string;
  allocationId: string;
  dueDate: string;
  notes?: string;
}

/**
 * Hook for teachers to distribute allocated book copies to students.
 * Creates a loan record linked to the teacher allocation.
 */
export function useDistributeToStudent() {
  const { institutionId } = useInstitution();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      allocationCopyId,
      copyId,
      studentId,
      allocationId,
      dueDate,
      notes,
    }: DistributeParams) => {
      if (!institutionId || !user?.id) {
        throw new Error('Missing required authentication data');
      }

      // 1. Get copy condition for the loan record
      const { data: copy, error: copyError } = await supabase
        .from('library_book_copies')
        .select('condition')
        .eq('id', copyId)
        .single();

      if (copyError) {
        throw new Error('Failed to fetch book copy details');
      }

      // 2. Create the loan record linked to teacher allocation
      const { data: loan, error: loanError } = await supabase
        .from('library_loans')
        .insert({
          institution_id: institutionId,
          copy_id: copyId,
          student_id: studentId,
          borrowed_by: user.id,
          due_date: dueDate,
          condition_at_checkout: copy?.condition || 'good',
          notes,
          teacher_allocation_id: allocationId,
        })
        .select()
        .single();

      if (loanError) {
        throw new Error(`Failed to create loan: ${loanError.message}`);
      }

      // 3. Update the allocation copy status to show it's been distributed
      // We mark it as 'distributed' to track that it's now with a student
      const { error: allocationCopyError } = await supabase
        .from('library_teacher_allocation_copies')
        .update({
          status: 'distributed' as any, // Extend status to include distributed
          notes: `Distributed to student. Loan ID: ${loan.id}`,
        })
        .eq('id', allocationCopyId);

      if (allocationCopyError) {
        // Log but don't fail - the loan was created successfully
        console.error('Failed to update allocation copy status:', allocationCopyError);
      }

      // 4. Update the parent allocation's distributed count
      const { data: allocation } = await supabase
        .from('library_teacher_allocations')
        .select('quantity_distributed')
        .eq('id', allocationId)
        .single();

      if (allocation) {
        await supabase
          .from('library_teacher_allocations')
          .update({
            quantity_distributed: (allocation.quantity_distributed || 0) + 1,
            status: 'partial',
          })
          .eq('id', allocationId);
      }

      return loan;
    },
    onSuccess: () => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['my-allocations'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-allocations'] });
      queryClient.invalidateQueries({ queryKey: ['library-loans'] });
      queryClient.invalidateQueries({ queryKey: ['library-book-copies'] });
      toast.success('Book distributed to student successfully');
    },
    onError: (error: Error) => {
      toast.error(`Distribution failed: ${error.message}`);
    },
  });
}
