import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfYear, endOfYear, startOfMonth, endOfMonth } from 'date-fns';

export interface FeeStatementTransaction {
  date: string;
  description: string;
  type: 'invoice' | 'payment' | 'adjustment';
  debit?: number;
  credit?: number;
  balance: number;
  reference?: string;
}

export interface FeeStatement {
  student: {
    id: string;
    first_name: string;
    last_name: string;
    admission_number: string;
    class?: { name: string };
  };
  period: { start: Date; end: Date };
  openingBalance: number;
  transactions: FeeStatementTransaction[];
  closingBalance: number;
  totalDebits: number;
  totalCredits: number;
}

export type PeriodPreset = 'this_term' | 'this_year' | 'last_year' | 'custom';

export function useFeeStatement(
  studentId: string | null,
  institutionId: string | null,
  periodStart?: Date,
  periodEnd?: Date
) {
  return useQuery({
    queryKey: ['fee-statement', studentId, institutionId, periodStart?.toISOString(), periodEnd?.toISOString()],
    queryFn: async (): Promise<FeeStatement | null> => {
      if (!studentId || !institutionId) return null;

      const start = periodStart || startOfYear(new Date());
      const end = periodEnd || endOfYear(new Date());

      // Fetch student info
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id, first_name, last_name, admission_number, class_id')
        .eq('id', studentId)
        .single();

      if (studentError) throw studentError;

      // Fetch class info if exists
      let classInfo = null;
      if (student.class_id) {
        const { data: classData } = await supabase
          .from('classes')
          .select('name')
          .eq('id', student.class_id)
          .single();
        classInfo = classData;
      }

      // Fetch invoices within period
      const { data: invoices, error: invoicesError } = await supabase
        .from('student_invoices')
        .select('id, invoice_number, total_amount, created_at, status')
        .eq('student_id', studentId)
        .eq('institution_id', institutionId)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at', { ascending: true });

      if (invoicesError) throw invoicesError;

      // Fetch payments within period
      const { data: payments, error: paymentsError } = await supabase
        .from('student_payments')
        .select('id, receipt_number, amount, payment_date, status')
        .eq('student_id', studentId)
        .eq('institution_id', institutionId)
        .eq('status', 'completed')
        .gte('payment_date', start.toISOString())
        .lte('payment_date', end.toISOString())
        .order('payment_date', { ascending: true });

      if (paymentsError) throw paymentsError;

      // Fetch adjustments within period
      const { data: adjustments, error: adjustmentsError } = await supabase
        .from('financial_adjustments')
        .select('id, adjustment_type, adjustment_amount, reason, executed_at, status')
        .eq('student_id', studentId)
        .eq('institution_id', institutionId)
        .eq('status', 'approved')
        .not('executed_at', 'is', null)
        .gte('executed_at', start.toISOString())
        .lte('executed_at', end.toISOString())
        .order('executed_at', { ascending: true });

      if (adjustmentsError) throw adjustmentsError;

      // Calculate opening balance (invoices before period - payments before period)
      const { data: priorInvoices } = await supabase
        .from('student_invoices')
        .select('total_amount')
        .eq('student_id', studentId)
        .eq('institution_id', institutionId)
        .lt('created_at', start.toISOString());

      const { data: priorPayments } = await supabase
        .from('student_payments')
        .select('amount')
        .eq('student_id', studentId)
        .eq('institution_id', institutionId)
        .eq('status', 'completed')
        .lt('payment_date', start.toISOString());

      const priorInvoiceTotal = (priorInvoices || []).reduce((sum, i) => sum + (i.total_amount || 0), 0);
      const priorPaymentTotal = (priorPayments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
      const openingBalance = priorInvoiceTotal - priorPaymentTotal;

      // Combine and sort transactions
      const allTransactions: Array<{
        date: Date;
        description: string;
        type: 'invoice' | 'payment' | 'adjustment';
        debit?: number;
        credit?: number;
        reference?: string;
      }> = [];

      (invoices || []).forEach(inv => {
        if (inv.status !== 'cancelled') {
          allTransactions.push({
            date: new Date(inv.created_at),
            description: `Invoice ${inv.invoice_number}`,
            type: 'invoice',
            debit: inv.total_amount,
            reference: inv.invoice_number,
          });
        }
      });

      (payments || []).forEach(pmt => {
        allTransactions.push({
          date: new Date(pmt.payment_date),
          description: `Payment ${pmt.receipt_number}`,
          type: 'payment',
          credit: pmt.amount,
          reference: pmt.receipt_number,
        });
      });

      (adjustments || []).forEach(adj => {
        const isCredit = adj.adjustment_type === 'credit' || adj.adjustment_type === 'discount';
        allTransactions.push({
          date: new Date(adj.executed_at!),
          description: adj.reason || `${adj.adjustment_type} adjustment`,
          type: 'adjustment',
          debit: isCredit ? undefined : adj.adjustment_amount,
          credit: isCredit ? adj.adjustment_amount : undefined,
        });
      });

      // Sort by date
      allTransactions.sort((a, b) => a.date.getTime() - b.date.getTime());

      // Calculate running balance
      let runningBalance = openingBalance;
      const transactions: FeeStatementTransaction[] = allTransactions.map(t => {
        if (t.debit) runningBalance += t.debit;
        if (t.credit) runningBalance -= t.credit;

        return {
          date: t.date.toISOString(),
          description: t.description,
          type: t.type,
          debit: t.debit,
          credit: t.credit,
          balance: runningBalance,
          reference: t.reference,
        };
      });

      const totalDebits = transactions.reduce((sum, t) => sum + (t.debit || 0), 0);
      const totalCredits = transactions.reduce((sum, t) => sum + (t.credit || 0), 0);

      return {
        student: {
          ...student,
          class: classInfo,
        },
        period: { start, end },
        openingBalance,
        transactions,
        closingBalance: runningBalance,
        totalDebits,
        totalCredits,
      };
    },
    enabled: !!studentId && !!institutionId,
  });
}

export function getPeriodDates(preset: PeriodPreset, customStart?: Date, customEnd?: Date): { start: Date; end: Date } {
  const now = new Date();
  
  switch (preset) {
    case 'this_term':
      // Approximate term dates (adjust based on actual term data)
      return {
        start: startOfMonth(new Date(now.getFullYear(), Math.floor(now.getMonth() / 4) * 4, 1)),
        end: endOfMonth(new Date(now.getFullYear(), Math.floor(now.getMonth() / 4) * 4 + 3, 1)),
      };
    case 'this_year':
      return { start: startOfYear(now), end: endOfYear(now) };
    case 'last_year':
      const lastYear = new Date(now.getFullYear() - 1, 0, 1);
      return { start: startOfYear(lastYear), end: endOfYear(lastYear) };
    case 'custom':
      return {
        start: customStart || startOfYear(now),
        end: customEnd || endOfYear(now),
      };
    default:
      return { start: startOfYear(now), end: endOfYear(now) };
  }
}
