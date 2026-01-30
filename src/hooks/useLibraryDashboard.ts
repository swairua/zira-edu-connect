import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';

export interface LibraryStats {
  totalBooks: number;
  totalCopies: number;
  availableCopies: number;
  activeLoans: number;
  overdueLoans: number;
  lostBooks: number;
  pendingPenalties: number;
  totalPenaltyAmount: number;
}

export function useLibraryDashboard() {
  const { institutionId } = useInstitution();

  return useQuery({
    queryKey: ['library-dashboard', institutionId],
    queryFn: async (): Promise<LibraryStats> => {
      if (!institutionId) {
        return {
          totalBooks: 0,
          totalCopies: 0,
          availableCopies: 0,
          activeLoans: 0,
          overdueLoans: 0,
          lostBooks: 0,
          pendingPenalties: 0,
          totalPenaltyAmount: 0,
        };
      }

      const today = new Date().toISOString().split('T')[0];

      // Fetch all stats in parallel
      const [
        booksResult,
        copiesResult,
        availableCopiesResult,
        activeLoansResult,
        overdueLoansResult,
        lostLoansResult,
        penaltiesResult,
      ] = await Promise.all([
        supabase
          .from('library_books')
          .select('id', { count: 'exact', head: true })
          .eq('institution_id', institutionId)
          .eq('is_active', true),
        supabase
          .from('library_book_copies')
          .select('id', { count: 'exact', head: true })
          .eq('institution_id', institutionId)
          .neq('condition', 'lost'),
        supabase
          .from('library_book_copies')
          .select('id', { count: 'exact', head: true })
          .eq('institution_id', institutionId)
          .eq('is_available', true)
          .neq('condition', 'lost'),
        supabase
          .from('library_loans')
          .select('id', { count: 'exact', head: true })
          .eq('institution_id', institutionId)
          .eq('status', 'active'),
        supabase
          .from('library_loans')
          .select('id', { count: 'exact', head: true })
          .eq('institution_id', institutionId)
          .in('status', ['active', 'overdue'])
          .lt('due_date', today),
        supabase
          .from('library_loans')
          .select('id', { count: 'exact', head: true })
          .eq('institution_id', institutionId)
          .eq('status', 'lost'),
        supabase
          .from('library_penalties')
          .select('amount')
          .eq('institution_id', institutionId)
          .eq('status', 'pending'),
      ]);

      const pendingPenalties = penaltiesResult.data?.length || 0;
      const totalPenaltyAmount = penaltiesResult.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      return {
        totalBooks: booksResult.count || 0,
        totalCopies: copiesResult.count || 0,
        availableCopies: availableCopiesResult.count || 0,
        activeLoans: activeLoansResult.count || 0,
        overdueLoans: overdueLoansResult.count || 0,
        lostBooks: lostLoansResult.count || 0,
        pendingPenalties,
        totalPenaltyAmount,
      };
    },
    enabled: !!institutionId,
  });
}
