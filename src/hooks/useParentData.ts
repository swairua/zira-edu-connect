import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FeeBalance, AttendanceSummary, Invoice, Payment, StudentScore, Announcement } from '@/types/parent';

// Hook to fetch fee balance for a student
export function useStudentFeeBalance(studentId: string | null, institutionId: string | null) {
  return useQuery({
    queryKey: ['student-fee-balance', studentId],
    queryFn: async (): Promise<FeeBalance | null> => {
      if (!studentId || !institutionId) return null;

      // Get total invoiced amount (posted invoices only)
      const { data: invoices, error: invoiceError } = await supabase
        .from('student_invoices')
        .select('total_amount')
        .eq('student_id', studentId)
        .eq('status', 'posted');

      if (invoiceError) {
        console.error('Error fetching invoices:', invoiceError);
        throw invoiceError;
      }

      const totalInvoiced = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;

      // Get total paid amount
      const { data: payments, error: paymentError } = await supabase
        .from('student_payments')
        .select('amount')
        .eq('student_id', studentId)
        .eq('status', 'completed');

      if (paymentError) {
        console.error('Error fetching payments:', paymentError);
        throw paymentError;
      }

      const totalPaid = payments?.reduce((sum, pay) => sum + (pay.amount || 0), 0) || 0;

      return {
        totalInvoiced,
        totalPaid,
        balance: totalInvoiced - totalPaid,
        isPaid: totalPaid >= totalInvoiced,
      };
    },
    enabled: !!studentId && !!institutionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook to fetch invoices for a student (parent view - posted only)
export function useStudentInvoicesForParent(studentId: string | null) {
  return useQuery({
    queryKey: ['parent-student-invoices', studentId],
    queryFn: async (): Promise<Invoice[]> => {
      if (!studentId) return [];

      const { data, error } = await supabase
        .from('student_invoices')
        .select(`
          id,
          invoice_number,
          total_amount,
          due_date,
          status,
          created_at,
          currency,
          academic_years:academic_year_id (name),
          terms:term_id (name),
          invoice_lines (
            id,
            description,
            unit_amount,
            quantity,
            total_amount
          )
        `)
        .eq('student_id', studentId)
        .eq('status', 'posted')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invoices:', error);
        throw error;
      }

      return (data || []) as unknown as Invoice[];
    },
    enabled: !!studentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook to fetch payments for a student
export function useStudentPaymentsForParent(studentId: string | null) {
  return useQuery({
    queryKey: ['parent-student-payments', studentId],
    queryFn: async (): Promise<Payment[]> => {
      if (!studentId) return [];

      const { data, error } = await supabase
        .from('student_payments')
        .select(`
          id,
          receipt_number,
          amount,
          payment_date,
          payment_method,
          transaction_reference,
          status,
          currency
        `)
        .eq('student_id', studentId)
        .order('payment_date', { ascending: false });

      if (error) {
        console.error('Error fetching payments:', error);
        throw error;
      }

      return (data || []) as Payment[];
    },
    enabled: !!studentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook to fetch released exam results for a student
export function useStudentResultsForParent(studentId: string | null, institutionId: string | null) {
  return useQuery({
    queryKey: ['parent-student-results', studentId],
    queryFn: async (): Promise<StudentScore[]> => {
      if (!studentId || !institutionId) return [];

      const { data, error } = await supabase
        .from('student_scores')
        .select(`
          id,
          marks,
          grade,
          remarks,
          exams:exam_id (
            id,
            name,
            exam_type,
            max_marks,
            status,
            academic_years:academic_year_id (name),
            terms:term_id (name)
          ),
          subjects:subject_id (
            id,
            name,
            code
          )
        `)
        .eq('student_id', studentId);

      if (error) {
        console.error('Error fetching results:', error);
        throw error;
      }

      // Filter to only released exams (RLS should handle this, but double-check)
      return ((data || []) as unknown as StudentScore[]).filter(
        (score) => score.exams?.status === 'released'
      );
    },
    enabled: !!studentId && !!institutionId,
    staleTime: 5 * 60 * 1000, // 5 minutes - results don't change often
  });
}

// Hook to fetch attendance summary for a student
export function useStudentAttendanceSummary(
  studentId: string | null, 
  startDate?: string, 
  endDate?: string
) {
  return useQuery({
    queryKey: ['parent-student-attendance', studentId, startDate, endDate],
    queryFn: async (): Promise<AttendanceSummary | null> => {
      if (!studentId) return null;

      let query = supabase
        .from('attendance')
        .select('status')
        .eq('student_id', studentId);

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching attendance:', error);
        throw error;
      }

      const records = data || [];
      const total = records.length;
      const present = records.filter(r => r.status === 'present').length;
      const absent = records.filter(r => r.status === 'absent').length;
      const late = records.filter(r => r.status === 'late').length;
      const excused = records.filter(r => r.status === 'excused').length;

      return {
        total,
        present,
        absent,
        late,
        excused,
        attendanceRate: total > 0 ? Math.round((present / total) * 100) : 100,
      };
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to fetch announcements for parents
export function useParentAnnouncements(institutionId: string | null) {
  return useQuery({
    queryKey: ['parent-announcements', institutionId],
    queryFn: async (): Promise<Announcement[]> => {
      if (!institutionId) return [];

      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          recipient_type,
          sent_at,
          created_at,
          status
        `)
        .eq('institution_id', institutionId)
        .in('recipient_type', ['parents', 'all'])
        .eq('status', 'sent')
        .order('sent_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching announcements:', error);
        throw error;
      }

      return (data || []) as Announcement[];
    },
    enabled: !!institutionId,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}
