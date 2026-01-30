import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface DistributedLoan {
  id: string;
  copy_id: string;
  student_id: string;
  borrowed_at: string;
  due_date: string;
  returned_at: string | null;
  status: 'active' | 'returned' | 'overdue' | 'lost';
  condition_at_checkout: string | null;
  condition_at_return: string | null;
  notes: string | null;
  teacher_allocation_id: string;
  copy?: {
    id: string;
    copy_number: string;
    barcode: string | null;
    book?: {
      id: string;
      title: string;
      author: string | null;
      book_code: string | null;
    };
  };
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    admission_number: string;
  };
}

export function useTeacherDistributedLoans() {
  const { institutionId } = useInstitution();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const loansQuery = useQuery({
    queryKey: ['teacher-distributed-loans', institutionId, user?.id],
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

      // Get all allocation IDs for this teacher
      const { data: allocations } = await supabase
        .from('library_teacher_allocations')
        .select('id')
        .eq('teacher_id', staffData.id)
        .eq('institution_id', institutionId);

      if (!allocations || allocations.length === 0) return [];

      const allocationIds = allocations.map(a => a.id);

      // Get all loans linked to these allocations
      const { data: loans, error } = await supabase
        .from('library_loans')
        .select(`
          id,
          copy_id,
          student_id,
          borrowed_at,
          due_date,
          returned_at,
          status,
          condition_at_checkout,
          condition_at_return,
          notes,
          teacher_allocation_id,
          copy:library_book_copies(
            id,
            copy_number,
            barcode,
            book:library_books(id, title, author, book_code)
          ),
          student:students(id, first_name, last_name, admission_number)
        `)
        .eq('institution_id', institutionId)
        .in('teacher_allocation_id', allocationIds)
        .order('borrowed_at', { ascending: false });

      if (error) throw error;
      return loans as DistributedLoan[];
    },
    enabled: !!institutionId && !!user?.id,
  });

  // Process return from student back to teacher
  const returnFromStudent = useMutation({
    mutationFn: async ({
      loanId,
      conditionAtReturn,
      notes,
    }: {
      loanId: string;
      conditionAtReturn?: string;
      notes?: string;
    }) => {
      // 1. Get the loan details
      const { data: loan, error: fetchError } = await supabase
        .from('library_loans')
        .select('copy_id, teacher_allocation_id')
        .eq('id', loanId)
        .single();

      if (fetchError || !loan) throw new Error('Failed to find loan');

      // 2. Mark the loan as returned
      const { error: loanError } = await supabase
        .from('library_loans')
        .update({
          status: 'returned',
          returned_at: new Date().toISOString(),
          condition_at_return: conditionAtReturn || null,
          notes: notes || null,
        })
        .eq('id', loanId);

      if (loanError) throw loanError;

      // 3. Update the allocation copy status back to 'allocated' (with teacher)
      if (loan.teacher_allocation_id) {
        const { error: copyError } = await supabase
          .from('library_teacher_allocation_copies')
          .update({
            status: 'allocated',
          })
          .eq('allocation_id', loan.teacher_allocation_id)
          .eq('copy_id', loan.copy_id);

        if (copyError) throw copyError;
      }

      // 4. Decrement distributed count on allocation
      if (loan.teacher_allocation_id) {
        const { data: allocation } = await supabase
          .from('library_teacher_allocations')
          .select('quantity_distributed')
          .eq('id', loan.teacher_allocation_id)
          .single();

        if (allocation) {
          await supabase
            .from('library_teacher_allocations')
            .update({
              quantity_distributed: Math.max(0, (allocation.quantity_distributed || 0) - 1),
            })
            .eq('id', loan.teacher_allocation_id);
        }
      }

      return { loanId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-distributed-loans', institutionId] });
      queryClient.invalidateQueries({ queryKey: ['my-allocations', institutionId] });
      queryClient.invalidateQueries({ queryKey: ['teacher-allocations', institutionId] });
      toast.success('Book returned from student successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to return book: ${error.message}`);
    },
  });

  // Calculate stats
  const loans = loansQuery.data ?? [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeLoans = loans.filter(l => l.status === 'active' || l.status === 'overdue');
  const overdueLoans = activeLoans.filter(l => new Date(l.due_date) < today);
  const returnedLoans = loans.filter(l => l.status === 'returned');

  return {
    loans,
    activeLoans,
    overdueLoans,
    returnedLoans,
    isLoading: loansQuery.isLoading,
    error: loansQuery.error,
    returnFromStudent,
  };
}
