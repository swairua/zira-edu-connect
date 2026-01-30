import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';

export interface StudentLoan {
  id: string;
  copy_id: string;
  borrowed_at: string;
  due_date: string;
  returned_at: string | null;
  status: 'active' | 'returned' | 'overdue' | 'lost';
  renewal_count: number;
  copy?: {
    id: string;
    copy_number: string;
    book?: {
      id: string;
      title: string;
      author: string | null;
      book_code: string | null;
    };
  };
}

export function useStudentLoans(studentId?: string) {
  const { institutionId } = useInstitution();

  return useQuery({
    queryKey: ['student-loans', institutionId, studentId],
    queryFn: async () => {
      if (!institutionId || !studentId) return [];

      const { data, error } = await supabase
        .from('library_loans')
        .select(`
          id,
          copy_id,
          borrowed_at,
          due_date,
          returned_at,
          status,
          renewal_count,
          copy:library_book_copies(
            id,
            copy_number,
            book:library_books(id, title, author, book_code)
          )
        `)
        .eq('institution_id', institutionId)
        .eq('student_id', studentId)
        .order('borrowed_at', { ascending: false });

      if (error) throw error;
      return data as StudentLoan[];
    },
    enabled: !!institutionId && !!studentId,
  });
}

export function useStudentActiveLoansCount(studentId?: string) {
  const { institutionId } = useInstitution();

  return useQuery({
    queryKey: ['student-active-loans-count', institutionId, studentId],
    queryFn: async () => {
      if (!institutionId || !studentId) return { active: 0, overdue: 0 };

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('library_loans')
        .select('id, due_date, status')
        .eq('institution_id', institutionId)
        .eq('student_id', studentId)
        .in('status', ['active', 'overdue']);

      if (error) throw error;

      const active = data?.filter(loan => loan.due_date >= today).length || 0;
      const overdue = data?.filter(loan => loan.due_date < today).length || 0;

      return { active, overdue };
    },
    enabled: !!institutionId && !!studentId,
  });
}

export function useAvailableLibraryBooks() {
  const { institutionId } = useInstitution();

  return useQuery({
    queryKey: ['available-library-books', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];

      const { data, error } = await supabase
        .from('library_books')
        .select('id, title, author, book_code, category, available_copies')
        .eq('institution_id', institutionId)
        .eq('is_active', true)
        .gt('available_copies', 0)
        .order('title');

      if (error) throw error;
      return data;
    },
    enabled: !!institutionId,
  });
}
