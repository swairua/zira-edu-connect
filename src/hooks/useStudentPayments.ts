import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StudentPayment {
  id: string;
  institution_id: string;
  student_id: string;
  receipt_number: string;
  amount: number;
  currency?: string | null;
  payment_method: string;
  payment_date: string;
  transaction_reference?: string | null;
  status?: string | null;
  received_by?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
  reversed_at?: string | null;
  reversed_by?: string | null;
  reversal_reason?: string | null;
  created_at?: string | null;
  // Joined data
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    admission_number: string;
    class?: {
      name: string;
    } | null;
  } | null;
  allocations?: PaymentAllocation[];
}

export interface PaymentAllocation {
  id: string;
  payment_id: string;
  invoice_id: string;
  amount: number;
  created_at?: string | null;
  invoice?: {
    invoice_number: string;
    total_amount: number;
  } | null;
}

export interface PaymentFilters {
  search?: string;
  status?: string;
  paymentMethod?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreatePaymentInput {
  institution_id: string;
  student_id: string;
  amount: number;
  currency?: string;
  payment_method: string;
  payment_date: string;
  transaction_reference?: string;
  received_by?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  allocations?: { invoice_id: string; amount: number }[];
}

export function useStudentPayments(institutionId: string | null, filters?: PaymentFilters) {
  return useQuery({
    queryKey: ['student-payments', institutionId, filters],
    queryFn: async () => {
      if (!institutionId) return [];

      let query = supabase
        .from('student_payments')
        .select(`
          *,
          student:students(
            id,
            first_name,
            last_name,
            admission_number,
            class:classes(name)
          ),
          allocations:payment_allocations(
            *,
            invoice:student_invoices(invoice_number, total_amount)
          )
        `)
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.paymentMethod) {
        query = query.eq('payment_method', filters.paymentMethod);
      }

      if (filters?.dateFrom) {
        query = query.gte('payment_date', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('payment_date', filters.dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as StudentPayment[];
    },
    enabled: !!institutionId,
  });
}

export function useStudentPaymentHistory(studentId: string | null) {
  return useQuery({
    queryKey: ['student-payment-history', studentId],
    queryFn: async () => {
      if (!studentId) return [];

      const { data, error } = await supabase
        .from('student_payments')
        .select(`
          *,
          allocations:payment_allocations(
            *,
            invoice:student_invoices(invoice_number, total_amount)
          )
        `)
        .eq('student_id', studentId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data as StudentPayment[];
    },
    enabled: !!studentId,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePaymentInput) => {
      // Generate receipt number
      const { count } = await supabase
        .from('student_payments')
        .select('*', { count: 'exact', head: true })
        .eq('institution_id', input.institution_id);

      const receiptNumber = `RCP-${String((count || 0) + 1).padStart(6, '0')}`;

      const { data: payment, error: paymentError } = await supabase
        .from('student_payments')
        .insert([{
          receipt_number: receiptNumber,
          institution_id: input.institution_id,
          student_id: input.student_id,
          amount: input.amount,
          currency: input.currency || 'KES',
          payment_method: input.payment_method,
          payment_date: input.payment_date,
          transaction_reference: input.transaction_reference,
          received_by: input.received_by,
          notes: input.notes,
          status: 'confirmed',
        }])
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Create payment allocations
      if (input.allocations && input.allocations.length > 0) {
        const { error: allocError } = await supabase
          .from('payment_allocations')
          .insert(
            input.allocations.map(alloc => ({
              payment_id: payment.id,
              invoice_id: alloc.invoice_id,
              amount: alloc.amount,
            }))
          );

        if (allocError) throw allocError;

        // Update invoice statuses based on allocations
        for (const alloc of input.allocations) {
          // Get total paid for this invoice
          const { data: allocations } = await supabase
            .from('payment_allocations')
            .select('amount')
            .eq('invoice_id', alloc.invoice_id);

          const totalPaid = allocations?.reduce((sum, a) => sum + a.amount, 0) || 0;

          // Get invoice total
          const { data: invoice } = await supabase
            .from('student_invoices')
            .select('total_amount')
            .eq('id', alloc.invoice_id)
            .single();

          if (invoice) {
            const newStatus = totalPaid >= invoice.total_amount ? 'paid' : 'partially_paid';
            await supabase
              .from('student_invoices')
              .update({ status: newStatus, updated_at: new Date().toISOString() })
              .eq('id', alloc.invoice_id);
          }
        }
      }

      return payment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['student-payments', data.institution_id] });
      queryClient.invalidateQueries({ queryKey: ['student-payment-history'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['student-invoices'] });
      toast.success('Payment recorded successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to record payment', { description: error.message });
    },
  });
}

export function useReversePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      paymentId,
      userId,
      reason,
    }: {
      paymentId: string;
      userId: string;
      reason: string;
    }) => {
      // Get payment allocations first
      const { data: payment } = await supabase
        .from('student_payments')
        .select('*, allocations:payment_allocations(invoice_id, amount)')
        .eq('id', paymentId)
        .single();

      if (!payment) throw new Error('Payment not found');

      // Update payment status (append-only: add reversal info)
      const { error: updateError } = await supabase
        .from('student_payments')
        .update({
          status: 'reversed',
          reversed_at: new Date().toISOString(),
          reversed_by: userId,
          reversal_reason: reason,
        })
        .eq('id', paymentId);

      if (updateError) throw updateError;

      // Update invoice statuses - recalculate based on remaining allocations
      for (const alloc of payment.allocations || []) {
        const { data: allocations } = await supabase
          .from('payment_allocations')
          .select('amount, payment:student_payments!inner(status)')
          .eq('invoice_id', alloc.invoice_id)
          .neq('payment_id', paymentId);

        const totalPaid = allocations
          ?.filter(a => (a.payment as { status: string })?.status === 'confirmed')
          .reduce((sum, a) => sum + a.amount, 0) || 0;

        const { data: invoice } = await supabase
          .from('student_invoices')
          .select('total_amount')
          .eq('id', alloc.invoice_id)
          .single();

        if (invoice) {
          let newStatus = 'posted';
          if (totalPaid >= invoice.total_amount) {
            newStatus = 'paid';
          } else if (totalPaid > 0) {
            newStatus = 'partially_paid';
          }

          await supabase
            .from('student_invoices')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', alloc.invoice_id);
        }
      }

      return payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-payments'] });
      queryClient.invalidateQueries({ queryKey: ['student-payment-history'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['student-invoices'] });
      toast.success('Payment reversed');
    },
    onError: (error: Error) => {
      toast.error('Failed to reverse payment', { description: error.message });
    },
  });
}

export function usePaymentStats(institutionId: string | null, dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ['payment-stats', institutionId, dateFrom, dateTo],
    queryFn: async () => {
      if (!institutionId) return null;

      let query = supabase
        .from('student_payments')
        .select('amount, payment_method, status, payment_date')
        .eq('institution_id', institutionId)
        .eq('status', 'confirmed');

      if (dateFrom) {
        query = query.gte('payment_date', dateFrom);
      }

      if (dateTo) {
        query = query.lte('payment_date', dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;

      const stats = {
        totalCollected: data.reduce((sum, p) => sum + p.amount, 0),
        transactionCount: data.length,
        byMethod: data.reduce((acc, p) => {
          acc[p.payment_method] = (acc[p.payment_method] || 0) + p.amount;
          return acc;
        }, {} as Record<string, number>),
      };

      return stats;
    },
    enabled: !!institutionId,
  });
}
