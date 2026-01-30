import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';
import { toast } from 'sonner';

export interface LibraryBook {
  id: string;
  institution_id: string;
  title: string;
  author: string | null;
  book_code: string | null;
  isbn: string | null;
  category: string | null;
  publisher: string | null;
  publication_year: number | null;
  description: string | null;
  location: string | null;
  total_copies: number;
  available_copies: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LibraryBookCopy {
  id: string;
  book_id: string;
  institution_id: string;
  copy_number: string;
  barcode: string | null;
  condition: 'good' | 'fair' | 'damaged' | 'lost';
  acquisition_date: string | null;
  notes: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  book?: LibraryBook;
}

export function useLibraryBooks() {
  const { institutionId } = useInstitution();
  const queryClient = useQueryClient();

  const booksQuery = useQuery({
    queryKey: ['library-books', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data, error } = await supabase
        .from('library_books')
        .select('*')
        .eq('institution_id', institutionId)
        .eq('is_active', true)
        .order('title');
      if (error) throw error;
      return data as LibraryBook[];
    },
    enabled: !!institutionId,
  });

  const createBook = useMutation({
    mutationFn: async (book: Omit<Partial<LibraryBook>, 'id' | 'institution_id' | 'created_at' | 'updated_at'> & { title: string }) => {
      if (!institutionId) throw new Error('No institution selected');
      const { data, error } = await supabase
        .from('library_books')
        .insert({ ...book, institution_id: institutionId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-books', institutionId] });
      toast.success('Book added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add book: ${error.message}`);
    },
  });

  const updateBook = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LibraryBook> & { id: string }) => {
      const { data, error } = await supabase
        .from('library_books')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-books', institutionId] });
      toast.success('Book updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update book: ${error.message}`);
    },
  });

  const deleteBook = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('library_books')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-books', institutionId] });
      toast.success('Book removed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove book: ${error.message}`);
    },
  });

  return {
    books: booksQuery.data ?? [],
    isLoading: booksQuery.isLoading,
    error: booksQuery.error,
    createBook,
    updateBook,
    deleteBook,
  };
}

export function useLibraryBookCopies(bookId?: string) {
  const { institutionId } = useInstitution();
  const queryClient = useQueryClient();

  const copiesQuery = useQuery({
    queryKey: ['library-book-copies', institutionId, bookId],
    queryFn: async () => {
      if (!institutionId) return [];
      let query = supabase
        .from('library_book_copies')
        .select('*, book:library_books(*)')
        .eq('institution_id', institutionId);
      
      if (bookId) {
        query = query.eq('book_id', bookId);
      }
      
      const { data, error } = await query.order('copy_number');
      if (error) throw error;
      return data as LibraryBookCopy[];
    },
    enabled: !!institutionId,
  });

  const createCopy = useMutation({
    mutationFn: async (copy: { book_id: string; copy_number: string; condition?: string; barcode?: string; acquisition_date?: string; notes?: string }) => {
      if (!institutionId) throw new Error('No institution selected');
      const { data, error } = await supabase
        .from('library_book_copies')
        .insert({ ...copy, institution_id: institutionId })
        .select()
        .single();
      if (error) throw error;

      // Update total_copies on the book
      if (copy.book_id) {
        const { data: bookData } = await supabase
          .from('library_books')
          .select('total_copies')
          .eq('id', copy.book_id)
          .single();
        
        await supabase
          .from('library_books')
          .update({ total_copies: (bookData?.total_copies || 0) + 1 })
          .eq('id', copy.book_id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-book-copies', institutionId] });
      queryClient.invalidateQueries({ queryKey: ['library-books', institutionId] });
      toast.success('Copy added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add copy: ${error.message}`);
    },
  });

  const updateCopy = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LibraryBookCopy> & { id: string }) => {
      const { data, error } = await supabase
        .from('library_book_copies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-book-copies', institutionId] });
      toast.success('Copy updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update copy: ${error.message}`);
    },
  });

  const deleteCopy = useMutation({
    mutationFn: async ({ id, bookId }: { id: string; bookId: string }) => {
      const { error } = await supabase
        .from('library_book_copies')
        .delete()
        .eq('id', id);
      if (error) throw error;

      // Update total_copies on the book
      const { data: bookData } = await supabase
        .from('library_books')
        .select('total_copies')
        .eq('id', bookId)
        .single();
      
      await supabase
        .from('library_books')
        .update({ total_copies: Math.max(0, (bookData?.total_copies || 1) - 1) })
        .eq('id', bookId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-book-copies', institutionId] });
      queryClient.invalidateQueries({ queryKey: ['library-books', institutionId] });
      toast.success('Copy deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete copy: ${error.message}`);
    },
  });

  return {
    copies: copiesQuery.data ?? [],
    isLoading: copiesQuery.isLoading,
    error: copiesQuery.error,
    createCopy,
    updateCopy,
    deleteCopy,
  };
}

export function useAvailableCopies() {
  const { institutionId } = useInstitution();

  return useQuery({
    queryKey: ['library-available-copies', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data, error } = await supabase
        .from('library_book_copies')
        .select('*, book:library_books(*)')
        .eq('institution_id', institutionId)
        .eq('is_available', true)
        .neq('condition', 'lost')
        .order('copy_number');
      if (error) throw error;
      return data as LibraryBookCopy[];
    },
    enabled: !!institutionId,
  });
}
