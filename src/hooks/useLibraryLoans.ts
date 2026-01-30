import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface LibraryLoan {
  id: string;
  institution_id: string;
  copy_id: string;
  student_id: string;
  borrowed_by: string;
  borrowed_at: string;
  due_date: string;
  returned_at: string | null;
  returned_to: string | null;
  status: 'active' | 'returned' | 'overdue' | 'lost';
  condition_at_checkout: string | null;
  condition_at_return: string | null;
  renewal_count: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  teacher_allocation_id?: string | null;
  copy?: {
    id: string;
    copy_number: string;
    barcode?: string | null;
    book: {
      id: string;
      title: string;
      author: string | null;
    };
  };
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    admission_number: string;
  };
}

export function useLibraryLoans(status?: string) {
  const { institutionId } = useInstitution();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const loansQuery = useQuery({
    queryKey: ['library-loans', institutionId, status],
    queryFn: async () => {
      if (!institutionId) return [];
      let query = supabase
        .from('library_loans')
        .select(`
          *,
          copy:library_book_copies(
            id, copy_number, barcode,
            book:library_books(id, title, author)
          ),
          student:students(id, first_name, last_name, admission_number)
        `)
        .eq('institution_id', institutionId)
        .order('borrowed_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LibraryLoan[];
    },
    enabled: !!institutionId,
  });

  const checkoutBook = useMutation({
    mutationFn: async ({ 
      copyId, 
      studentId, 
      dueDate,
      notes 
    }: { 
      copyId: string; 
      studentId: string; 
      dueDate: string;
      notes?: string;
    }) => {
      if (!institutionId || !user?.id) throw new Error('Missing required data');

      // Get copy condition
      const { data: copy } = await supabase
        .from('library_book_copies')
        .select('condition')
        .eq('id', copyId)
        .single();

      const { data, error } = await supabase
        .from('library_loans')
        .insert({
          institution_id: institutionId,
          copy_id: copyId,
          student_id: studentId,
          borrowed_by: user.id,
          due_date: dueDate,
          condition_at_checkout: copy?.condition || 'good',
          notes,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-loans', institutionId] });
      queryClient.invalidateQueries({ queryKey: ['library-available-copies', institutionId] });
      queryClient.invalidateQueries({ queryKey: ['library-book-copies', institutionId] });
      queryClient.invalidateQueries({ queryKey: ['library-books', institutionId] });
      toast.success('Book checked out successfully');
    },
    onError: (error: Error) => {
      toast.error(`Checkout failed: ${error.message}`);
    },
  });

  const returnBook = useMutation({
    mutationFn: async ({ 
      loanId, 
      conditionAtReturn,
      notes 
    }: { 
      loanId: string; 
      conditionAtReturn?: string;
      notes?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('library_loans')
        .update({
          status: 'returned',
          returned_at: new Date().toISOString(),
          returned_to: user.id,
          condition_at_return: conditionAtReturn,
          notes,
        })
        .eq('id', loanId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-loans', institutionId] });
      queryClient.invalidateQueries({ queryKey: ['library-available-copies', institutionId] });
      queryClient.invalidateQueries({ queryKey: ['library-book-copies', institutionId] });
      queryClient.invalidateQueries({ queryKey: ['library-books', institutionId] });
      toast.success('Book returned successfully');
    },
    onError: (error: Error) => {
      toast.error(`Return failed: ${error.message}`);
    },
  });

  const markAsLost = useMutation({
    mutationFn: async (loanId: string) => {
      const { data, error } = await supabase
        .from('library_loans')
        .update({ status: 'lost' })
        .eq('id', loanId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-loans', institutionId] });
      queryClient.invalidateQueries({ queryKey: ['library-book-copies', institutionId] });
      queryClient.invalidateQueries({ queryKey: ['library-books', institutionId] });
      toast.success('Book marked as lost');
    },
    onError: (error: Error) => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  const renewLoan = useMutation({
    mutationFn: async ({ loanId, newDueDate }: { loanId: string; newDueDate: string }) => {
      const { data: loan } = await supabase
        .from('library_loans')
        .select('renewal_count')
        .eq('id', loanId)
        .single();

      const { data, error } = await supabase
        .from('library_loans')
        .update({
          due_date: newDueDate,
          renewal_count: (loan?.renewal_count || 0) + 1,
        })
        .eq('id', loanId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-loans', institutionId] });
      toast.success('Loan renewed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Renewal failed: ${error.message}`);
    },
  });

  return {
    loans: loansQuery.data ?? [],
    isLoading: loansQuery.isLoading,
    error: loansQuery.error,
    checkoutBook,
    returnBook,
    markAsLost,
    renewLoan,
  };
}

export function useStudentActiveLoans(studentId?: string) {
  const { institutionId } = useInstitution();

  return useQuery({
    queryKey: ['student-active-loans', institutionId, studentId],
    queryFn: async () => {
      if (!institutionId || !studentId) return [];
      const { data, error } = await supabase
        .from('library_loans')
        .select(`
          *,
          copy:library_book_copies(
            id, copy_number,
            book:library_books(id, title, author)
          )
        `)
        .eq('institution_id', institutionId)
        .eq('student_id', studentId)
        .in('status', ['active', 'overdue'])
        .order('due_date');
      if (error) throw error;
      return data as LibraryLoan[];
    },
    enabled: !!institutionId && !!studentId,
  });
}

export function useOverdueLoans() {
  const { institutionId } = useInstitution();

  return useQuery({
    queryKey: ['library-overdue-loans', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('library_loans')
        .select(`
          *,
          copy:library_book_copies(
            id, copy_number,
            book:library_books(id, title, author)
          ),
          student:students(id, first_name, last_name, admission_number)
        `)
        .eq('institution_id', institutionId)
        .in('status', ['active', 'overdue'])
        .lt('due_date', today)
        .order('due_date');
      if (error) throw error;
      return data as LibraryLoan[];
    },
    enabled: !!institutionId,
  });
}
