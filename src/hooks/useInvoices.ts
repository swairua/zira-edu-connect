import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Invoice {
  id: string;
  invoice_number: string;
  institution_id: string;
  student_id: string;
  academic_year_id?: string | null;
  term_id?: string | null;
  total_amount: number;
  currency?: string | null;
  due_date: string;
  status?: string | null;
  posted_at?: string | null;
  posted_by?: string | null;
  notes?: string | null;
  cancelled_at?: string | null;
  cancelled_by?: string | null;
  cancellation_reason?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  // Joined data
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    admission_number: string;
    class?: {
      name: string;
      level: string;
    } | null;
  } | null;
  invoice_lines?: InvoiceLine[];
}

export interface InvoiceLine {
  id: string;
  invoice_id: string;
  fee_item_id?: string | null;
  description: string;
  quantity?: number | null;
  unit_amount: number;
  total_amount: number;
  created_at?: string | null;
}

export interface InvoiceFilters {
  search?: string;
  status?: string;
  termId?: string;
  classId?: string;
}

export interface CreateInvoiceInput {
  institution_id: string;
  student_id: string;
  academic_year_id?: string;
  term_id?: string;
  total_amount: number;
  currency?: string;
  due_date: string;
  status?: string;
  notes?: string;
  lines: Omit<InvoiceLine, 'id' | 'invoice_id' | 'created_at'>[];
}

export function useInvoices(institutionId: string | null, filters?: InvoiceFilters) {
  return useQuery({
    queryKey: ['invoices', institutionId, filters],
    queryFn: async () => {
      if (!institutionId) return [];

      let query = supabase
        .from('student_invoices')
        .select(`
          *,
          student:students(
            id, 
            first_name, 
            last_name, 
            admission_number,
            class:classes(name, level)
          ),
          invoice_lines(*)
        `)
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.termId) {
        query = query.eq('term_id', filters.termId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Invoice[];
    },
    enabled: !!institutionId,
  });
}

export function useStudentInvoices(studentId: string | null) {
  return useQuery({
    queryKey: ['student-invoices', studentId],
    queryFn: async () => {
      if (!studentId) return [];

      const { data, error } = await supabase
        .from('student_invoices')
        .select(`
          *,
          invoice_lines(*)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Invoice[];
    },
    enabled: !!studentId,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateInvoiceInput) => {
      // Generate invoice number using database function for atomic sequence
      const { data: invoiceNumber, error: numError } = await supabase
        .rpc('generate_institution_invoice_number', { p_institution_id: input.institution_id });

      if (numError) {
        console.error('Failed to generate invoice number:', numError);
        throw new Error('Failed to generate invoice number');
      }

      const { data: invoice, error: invoiceError } = await supabase
        .from('student_invoices')
        .insert({
          invoice_number: invoiceNumber,
          institution_id: input.institution_id,
          student_id: input.student_id,
          academic_year_id: input.academic_year_id,
          term_id: input.term_id,
          total_amount: input.total_amount,
          currency: input.currency || 'KES',
          due_date: input.due_date,
          status: input.status || 'draft',
          notes: input.notes,
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice lines
      if (input.lines.length > 0) {
        const { error: linesError } = await supabase
          .from('invoice_lines')
          .insert(
            input.lines.map(line => ({
              ...line,
              invoice_id: invoice.id,
            }))
          );

        if (linesError) throw linesError;
      }

      return invoice;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', data.institution_id] });
      queryClient.invalidateQueries({ queryKey: ['student-invoices'] });
      toast.success('Invoice created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create invoice', { description: error.message });
    },
  });
}

export function usePostInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invoiceId, userId }: { invoiceId: string; userId: string }) => {
      const { data, error } = await supabase
        .from('student_invoices')
        .update({
          status: 'posted',
          posted_at: new Date().toISOString(),
          posted_by: userId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoiceId)
        .eq('status', 'draft') // Only post drafts
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['student-invoices'] });
      toast.success('Invoice posted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to post invoice', { description: error.message });
    },
  });
}

export function useCancelInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      invoiceId,
      userId,
      reason,
    }: {
      invoiceId: string;
      userId: string;
      reason: string;
    }) => {
      const { data, error } = await supabase
        .from('student_invoices')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancelled_by: userId,
          cancellation_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoiceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['student-invoices'] });
      toast.success('Invoice cancelled');
    },
    onError: (error: Error) => {
      toast.error('Failed to cancel invoice', { description: error.message });
    },
  });
}

export function useInvoiceStats(institutionId: string | null, termId?: string) {
  return useQuery({
    queryKey: ['invoice-stats', institutionId, termId],
    queryFn: async () => {
      if (!institutionId) return null;

      let query = supabase
        .from('student_invoices')
        .select('status, total_amount')
        .eq('institution_id', institutionId);

      if (termId) {
        query = query.eq('term_id', termId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const stats = {
        totalInvoiced: data.reduce((sum, inv) => sum + (inv.total_amount || 0), 0),
        totalPosted: data
          .filter(inv => inv.status === 'posted' || inv.status === 'partially_paid' || inv.status === 'paid')
          .reduce((sum, inv) => sum + (inv.total_amount || 0), 0),
        draftCount: data.filter(inv => inv.status === 'draft').length,
        postedCount: data.filter(inv => inv.status === 'posted').length,
        paidCount: data.filter(inv => inv.status === 'paid').length,
        cancelledCount: data.filter(inv => inv.status === 'cancelled').length,
      };

      return stats;
    },
    enabled: !!institutionId,
  });
}

export interface BulkGenerateInput {
  institutionId: string;
  studentIds: string[];
  feeItems: { id: string; name: string; amount: number; category?: string | null }[];
  termId?: string;
  academicYearId?: string;
  dueDate: string;
}

export function useBulkGenerateInvoices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: BulkGenerateInput) => {
      const createdInvoices: string[] = [];

      for (let i = 0; i < input.studentIds.length; i++) {
        const studentId = input.studentIds[i];
        const totalAmount = input.feeItems.reduce((sum, item) => sum + item.amount, 0);

        // Generate invoice number using database function for atomic sequence
        const { data: invoiceNumber, error: numError } = await supabase
          .rpc('generate_institution_invoice_number', { p_institution_id: input.institutionId });

        if (numError) {
          console.error('Failed to generate invoice number:', numError);
          throw new Error('Failed to generate invoice number');
        }

        // Create invoice
        const { data: invoice, error: invoiceError } = await supabase
          .from('student_invoices')
          .insert([{
            invoice_number: invoiceNumber,
            institution_id: input.institutionId,
            student_id: studentId,
            academic_year_id: input.academicYearId,
            term_id: input.termId,
            total_amount: totalAmount,
            currency: 'KES',
            due_date: input.dueDate,
            status: 'draft',
          }])
          .select()
          .single();

        if (invoiceError) throw invoiceError;

        // Create invoice lines
        const lines = input.feeItems.map((item) => ({
          invoice_id: invoice.id,
          fee_item_id: item.id,
          description: item.name,
          quantity: 1,
          unit_amount: item.amount,
          total_amount: item.amount,
        }));

        const { error: linesError } = await supabase.from('invoice_lines').insert(lines);

        if (linesError) throw linesError;

        createdInvoices.push(invoice.id);
      }

      return createdInvoices;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.institutionId] });
      queryClient.invalidateQueries({ queryKey: ['student-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-stats'] });
      toast.success(`${data.length} invoice${data.length !== 1 ? 's' : ''} generated successfully`);
    },
    onError: (error: Error) => {
      toast.error('Failed to generate invoices', { description: error.message });
    },
  });
}
