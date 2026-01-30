import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// ==================== TYPES ====================

export interface Fund {
  id: string;
  institution_id: string;
  fund_code: string;
  fund_name: string;
  fund_type: 'capitation' | 'fees' | 'donation' | 'project' | 'operations' | 'reserve';
  source: 'government' | 'parents' | 'donors' | 'internal' | 'other';
  description: string | null;
  budget_amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Votehead {
  id: string;
  institution_id: string;
  code: string;
  name: string;
  description: string | null;
  category: 'recurrent' | 'capital' | 'personal_emolument' | 'development';
  requires_approval_above: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChartOfAccount {
  id: string;
  institution_id: string;
  account_code: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  parent_account_id: string | null;
  fund_id: string | null;
  normal_balance: 'debit' | 'credit';
  is_bank_account: boolean;
  is_control_account: boolean;
  is_system_account: boolean;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  fund?: Fund;
  parent_account?: ChartOfAccount;
}

export interface BankAccount {
  id: string;
  institution_id: string;
  account_number: string;
  account_name: string;
  bank_name: string;
  branch: string | null;
  account_type: 'current' | 'savings' | 'fixed_deposit' | 'mpesa' | 'other';
  currency: string;
  fund_id: string | null;
  ledger_account_id: string | null;
  opening_balance: number;
  current_balance: number;
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  fund?: Fund;
}

export interface CashbookEntry {
  id: string;
  institution_id: string;
  bank_account_id: string;
  entry_date: string;
  value_date: string | null;
  entry_type: 'receipt' | 'payment' | 'transfer_in' | 'transfer_out' | 'charge' | 'interest' | 'reversal';
  reference_number: string | null;
  description: string;
  debit_amount: number;
  credit_amount: number;
  running_balance: number | null;
  source_type: string | null;
  source_id: string | null;
  journal_entry_id: string | null;
  reconciled: boolean;
  reconciled_date: string | null;
  reconciled_by: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  bank_account?: BankAccount;
}

export interface PaymentVoucher {
  id: string;
  institution_id: string;
  voucher_number: string;
  voucher_date: string;
  payee_type: 'supplier' | 'staff' | 'government' | 'other';
  payee_id: string | null;
  payee_name: string;
  fund_id: string | null;
  bank_account_id: string | null;
  total_amount: number;
  currency: string;
  payment_method: string | null;
  cheque_number: string | null;
  cheque_date: string | null;
  description: string;
  purpose: string | null;
  prepared_by: string;
  prepared_at: string;
  checked_by: string | null;
  checked_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  secondary_approved_by: string | null;
  secondary_approved_at: string | null;
  paid_by: string | null;
  paid_at: string | null;
  status: 'draft' | 'pending_check' | 'pending_approval' | 'pending_secondary_approval' | 'approved' | 'paid' | 'cancelled' | 'rejected';
  rejection_reason: string | null;
  cancelled_by: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  journal_entry_id: string | null;
  cashbook_entry_id: string | null;
  supporting_documents: any[];
  created_at: string;
  updated_at: string;
  fund?: Fund;
  bank_account?: BankAccount;
  lines?: VoucherLine[];
}

export interface VoucherLine {
  id: string;
  voucher_id: string;
  institution_id: string;
  description: string;
  account_id: string | null;
  votehead_id: string | null;
  quantity: number;
  unit_price: number;
  amount: number;
  line_order: number;
  created_at: string;
  account?: ChartOfAccount;
  votehead?: Votehead;
}

export interface Supplier {
  id: string;
  institution_id: string;
  supplier_code: string | null;
  supplier_name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  kra_pin: string | null;
  vat_number: string | null;
  bank_name: string | null;
  bank_branch: string | null;
  bank_account_number: string | null;
  bank_account_name: string | null;
  category: string | null;
  payment_terms: string | null;
  is_approved: boolean;
  approved_by: string | null;
  approved_at: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CapitationRecord {
  id: string;
  institution_id: string;
  academic_year_id: string | null;
  term_id: string | null;
  fund_id: string;
  capitation_type: 'fpe' | 'jss_tuition' | 'jss_operations' | 'jss_infrastructure' | 'other';
  enrolled_learners: number;
  rate_per_learner: number;
  expected_amount: number;
  received_amount: number;
  receipt_id: string | null;
  disbursement_date: string | null;
  reference_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  fund?: Fund;
}

// ==================== FUNDS ====================

export function useFunds(institutionId: string | null) {
  return useQuery({
    queryKey: ['funds', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data, error } = await supabase
        .from('funds')
        .select('*')
        .eq('institution_id', institutionId)
        .order('fund_code');
      if (error) throw error;
      return data as Fund[];
    },
    enabled: !!institutionId,
  });
}

export function useCreateFund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fund: Omit<Fund, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('funds').insert(fund).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['funds', variables.institution_id] });
      toast.success('Fund created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create fund: ${error.message}`);
    },
  });
}

export function useUpdateFund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Fund> & { id: string }) => {
      const { data, error } = await supabase.from('funds').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['funds', data.institution_id] });
      toast.success('Fund updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update fund: ${error.message}`);
    },
  });
}

// ==================== VOTEHEADS ====================

export function useVoteheads(institutionId: string | null) {
  return useQuery({
    queryKey: ['voteheads', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data, error } = await supabase
        .from('voteheads')
        .select('*')
        .eq('institution_id', institutionId)
        .order('code');
      if (error) throw error;
      return data as Votehead[];
    },
    enabled: !!institutionId,
  });
}

export function useCreateVotehead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (votehead: Omit<Votehead, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('voteheads').insert(votehead).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['voteheads', variables.institution_id] });
      toast.success('Votehead created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create votehead: ${error.message}`);
    },
  });
}

export function useUpdateVotehead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Votehead> & { id: string }) => {
      const { data, error } = await supabase.from('voteheads').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['voteheads', data.institution_id] });
      toast.success('Votehead updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update votehead: ${error.message}`);
    },
  });
}

// ==================== CHART OF ACCOUNTS ====================

export function useChartOfAccounts(institutionId: string | null) {
  return useQuery({
    queryKey: ['chart-of-accounts', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('*, fund:funds(*)')
        .eq('institution_id', institutionId)
        .order('account_code');
      if (error) throw error;
      return data as ChartOfAccount[];
    },
    enabled: !!institutionId,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (account: Omit<ChartOfAccount, 'id' | 'created_at' | 'updated_at' | 'fund' | 'parent_account'>) => {
      const { data, error } = await supabase.from('chart_of_accounts').insert(account).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chart-of-accounts', variables.institution_id] });
      toast.success('Account created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create account: ${error.message}`);
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ChartOfAccount> & { id: string }) => {
      const { data, error } = await supabase.from('chart_of_accounts').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chart-of-accounts', data.institution_id] });
      toast.success('Account updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update account: ${error.message}`);
    },
  });
}

// ==================== BANK ACCOUNTS ====================

export function useBankAccounts(institutionId: string | null) {
  return useQuery({
    queryKey: ['bank-accounts', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*, fund:funds(*)')
        .eq('institution_id', institutionId)
        .order('account_name');
      if (error) throw error;
      return data as BankAccount[];
    },
    enabled: !!institutionId,
  });
}

export function useCreateBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (account: Omit<BankAccount, 'id' | 'created_at' | 'updated_at' | 'fund'>) => {
      const { data, error } = await supabase.from('bank_accounts').insert(account).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts', variables.institution_id] });
      toast.success('Bank account created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create bank account: ${error.message}`);
    },
  });
}

export function useUpdateBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BankAccount> & { id: string }) => {
      const { data, error } = await supabase.from('bank_accounts').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts', data.institution_id] });
      toast.success('Bank account updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update bank account: ${error.message}`);
    },
  });
}

// ==================== CASHBOOK ====================

export function useCashbook(institutionId: string | null, bankAccountId?: string, dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ['cashbook', institutionId, bankAccountId, dateFrom, dateTo],
    queryFn: async () => {
      if (!institutionId) return [];
      let query = supabase
        .from('cashbook_entries')
        .select('*, bank_account:bank_accounts(*)')
        .eq('institution_id', institutionId)
        .order('entry_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (bankAccountId) {
        query = query.eq('bank_account_id', bankAccountId);
      }
      if (dateFrom) {
        query = query.gte('entry_date', dateFrom);
      }
      if (dateTo) {
        query = query.lte('entry_date', dateTo);
      }

      const { data, error } = await query.limit(500);
      if (error) throw error;
      return data as CashbookEntry[];
    },
    enabled: !!institutionId,
  });
}

// ==================== PAYMENT VOUCHERS ====================

export function usePaymentVouchers(institutionId: string | null, status?: string) {
  return useQuery({
    queryKey: ['payment-vouchers', institutionId, status],
    queryFn: async () => {
      if (!institutionId) return [];
      let query = supabase
        .from('payment_vouchers')
        .select('*, fund:funds(*), bank_account:bank_accounts(*)')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.limit(200);
      if (error) throw error;
      return data as PaymentVoucher[];
    },
    enabled: !!institutionId,
  });
}

export function usePaymentVoucherDetail(voucherId: string | null) {
  return useQuery({
    queryKey: ['payment-voucher', voucherId],
    queryFn: async () => {
      if (!voucherId) return null;
      const { data, error } = await supabase
        .from('payment_vouchers')
        .select('*, fund:funds(*), bank_account:bank_accounts(*)')
        .eq('id', voucherId)
        .single();
      if (error) throw error;

      // Get voucher lines
      const { data: lines, error: linesError } = await supabase
        .from('voucher_lines')
        .select('*, account:chart_of_accounts(*), votehead:voteheads(*)')
        .eq('voucher_id', voucherId)
        .order('line_order');
      if (linesError) throw linesError;

      return { ...data, lines } as PaymentVoucher;
    },
    enabled: !!voucherId,
  });
}

export function useCreatePaymentVoucher() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      voucher,
      lines,
    }: {
      voucher: Omit<PaymentVoucher, 'id' | 'created_at' | 'updated_at' | 'voucher_number' | 'prepared_by' | 'prepared_at' | 'fund' | 'bank_account' | 'lines'>;
      lines: Omit<VoucherLine, 'id' | 'voucher_id' | 'created_at' | 'account' | 'votehead'>[];
    }) => {
      // Generate voucher number
      const year = new Date().getFullYear();
      const { count } = await supabase
        .from('payment_vouchers')
        .select('*', { count: 'exact', head: true })
        .eq('institution_id', voucher.institution_id)
        .gte('created_at', `${year}-01-01`);

      const voucherNumber = `PV-${year}-${String((count || 0) + 1).padStart(5, '0')}`;

      const { data, error } = await supabase
        .from('payment_vouchers')
        .insert({
          ...voucher,
          voucher_number: voucherNumber,
          prepared_by: user?.id,
          prepared_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;

      // Insert lines
      if (lines.length > 0) {
        const { error: linesError } = await supabase.from('voucher_lines').insert(
          lines.map((line, index) => ({
            ...line,
            voucher_id: data.id,
            line_order: index + 1,
          }))
        );
        if (linesError) throw linesError;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payment-vouchers', variables.voucher.institution_id] });
      toast.success('Payment voucher created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create payment voucher: ${error.message}`);
    },
  });
}

// Role matrix for voucher workflow actions
// This defines which roles can perform each action
export const VOUCHER_ROLE_MATRIX = {
  check: ['finance_officer', 'accountant', 'bursar', 'institution_admin', 'institution_owner'],
  approve: ['bursar', 'institution_admin', 'institution_owner'],
  secondary_approve: ['institution_admin', 'institution_owner'], // Level 2 approval for 3-level workflow
  reject: ['bursar', 'institution_admin', 'institution_owner'],
  pay: ['bursar', 'institution_admin', 'institution_owner'],
} as const;

export function useApproveVoucher() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      id, 
      action,
      approvalLevels = 2 
    }: { 
      id: string; 
      action: 'check' | 'approve' | 'secondary_approve' | 'reject'; 
      reason?: string;
      approvalLevels?: 1 | 2 | 3;
    }) => {
      // Permission check is enforced at UI level using VOUCHER_ROLE_MATRIX
      // The RLS policies on payment_vouchers table enforce database-level security
      
      const updates: any = {};
      if (action === 'check') {
        updates.status = 'pending_approval';
        updates.checked_by = user?.id;
        updates.checked_at = new Date().toISOString();
      } else if (action === 'approve') {
        // For 3-level workflow, first approval moves to pending_secondary_approval
        if (approvalLevels === 3) {
          updates.status = 'pending_secondary_approval';
        } else {
          updates.status = 'approved';
        }
        updates.approved_by = user?.id;
        updates.approved_at = new Date().toISOString();
      } else if (action === 'secondary_approve') {
        // Final approval in 3-level workflow
        updates.status = 'approved';
        updates.secondary_approved_by = user?.id;
        updates.secondary_approved_at = new Date().toISOString();
      } else if (action === 'reject') {
        updates.status = 'rejected';
      }

      const { data, error } = await supabase.from('payment_vouchers').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payment-vouchers', data.institution_id] });
      queryClient.invalidateQueries({ queryKey: ['payment-voucher', data.id] });
      toast.success('Voucher updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update voucher: ${error.message}`);
    },
  });
}

// Mark voucher as paid and create journal entry + cashbook entry
export function useMarkVoucherPaid() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      voucherId, 
      bankAccountId,
      paymentMethod,
      chequeNumber 
    }: { 
      voucherId: string; 
      bankAccountId: string;
      paymentMethod?: string;
      chequeNumber?: string;
    }) => {
      // 1. Get voucher with lines
      const { data: voucher, error: voucherError } = await supabase
        .from('payment_vouchers')
        .select(`
          *,
          lines:voucher_lines(*, account:chart_of_accounts(*)),
          bank_account:bank_accounts(*, ledger_account_id)
        `)
        .eq('id', voucherId)
        .single();
      
      if (voucherError || !voucher) throw new Error('Voucher not found');
      if (voucher.status !== 'approved') throw new Error('Voucher must be approved before marking as paid');

      // 2. Get bank account's ledger account for the credit entry
      const { data: bankAccount, error: bankError } = await supabase
        .from('bank_accounts')
        .select('*, ledger_account_id')
        .eq('id', bankAccountId)
        .single();
      
      if (bankError || !bankAccount) throw new Error('Bank account not found');
      if (!bankAccount.ledger_account_id) throw new Error('Bank account has no linked ledger account');

      // 3. Generate journal entry number
      const year = new Date().getFullYear();
      const { count } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true })
        .eq('institution_id', voucher.institution_id)
        .gte('created_at', `${year}-01-01`);
      const entryNumber = `JE-${year}-${String((count || 0) + 1).padStart(5, '0')}`;

      // 4. Create journal entry
      const { data: journalEntry, error: journalError } = await supabase
        .from('journal_entries')
        .insert({
          institution_id: voucher.institution_id,
          entry_number: entryNumber,
          entry_date: new Date().toISOString().split('T')[0],
          description: `Payment: ${voucher.description}`,
          reference: voucher.voucher_number,
          source_type: 'payment_voucher',
          source_id: voucher.id,
          status: 'posted',
          posted_at: new Date().toISOString(),
          posted_by: user?.id,
        })
        .select()
        .single();

      if (journalError) throw journalError;

      // 5. Create journal entry lines - Debit expense accounts from voucher lines
      const journalLines: any[] = [];
      
      // Debit lines from voucher (expense accounts)
      for (const line of (voucher.lines || [])) {
        if (line.account_id) {
          journalLines.push({
            journal_entry_id: journalEntry.id,
            institution_id: voucher.institution_id,
            account_id: line.account_id,
            fund_id: voucher.fund_id,
            debit_amount: line.amount,
            credit_amount: 0,
            description: line.description,
          });
        }
      }

      // Credit line - Bank account
      journalLines.push({
        journal_entry_id: journalEntry.id,
        institution_id: voucher.institution_id,
        account_id: bankAccount.ledger_account_id,
        fund_id: voucher.fund_id,
        debit_amount: 0,
        credit_amount: voucher.total_amount,
        description: `Payment to ${voucher.payee_name}`,
      });

      const { error: linesError } = await supabase
        .from('journal_entry_lines')
        .insert(journalLines);

      if (linesError) throw linesError;

      // 6. Create cashbook entry
      const { data: cashbookEntry, error: cashbookError } = await supabase
        .from('cashbook_entries')
        .insert({
          institution_id: voucher.institution_id,
          bank_account_id: bankAccountId,
          entry_date: new Date().toISOString().split('T')[0],
          entry_type: 'payment',
          reference_number: voucher.voucher_number,
          description: `${voucher.payee_name}: ${voucher.description}`,
          debit_amount: 0,
          credit_amount: voucher.total_amount,
          source_type: 'payment_voucher',
          source_id: voucher.id,
          journal_entry_id: journalEntry.id,
          created_by: user?.id,
        })
        .select()
        .single();

      if (cashbookError) throw cashbookError;

      // 7. Update bank account balance
      const { error: balanceError } = await supabase
        .from('bank_accounts')
        .update({
          current_balance: bankAccount.current_balance - voucher.total_amount,
        })
        .eq('id', bankAccountId);

      if (balanceError) throw balanceError;

      // 8. Update voucher status to paid
      const { data: updatedVoucher, error: updateError } = await supabase
        .from('payment_vouchers')
        .update({
          status: 'paid',
          paid_by: user?.id,
          paid_at: new Date().toISOString(),
          bank_account_id: bankAccountId,
          payment_method: paymentMethod || voucher.payment_method,
          cheque_number: chequeNumber || voucher.cheque_number,
          journal_entry_id: journalEntry.id,
          cashbook_entry_id: cashbookEntry.id,
        })
        .eq('id', voucherId)
        .select()
        .single();

      if (updateError) throw updateError;

      return { voucher: updatedVoucher, journalEntry, cashbookEntry };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payment-vouchers', data.voucher.institution_id] });
      queryClient.invalidateQueries({ queryKey: ['payment-voucher', data.voucher.id] });
      queryClient.invalidateQueries({ queryKey: ['journal-entries', data.voucher.institution_id] });
      queryClient.invalidateQueries({ queryKey: ['cashbook-entries', data.voucher.institution_id] });
      queryClient.invalidateQueries({ queryKey: ['bank-accounts', data.voucher.institution_id] });
      toast.success('Voucher marked as paid', {
        description: `Journal entry ${data.journalEntry.entry_number} created`,
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to process payment: ${error.message}`);
    },
  });
}

// ==================== SUPPLIERS ====================

export function useSuppliers(institutionId: string | null) {
  return useQuery({
    queryKey: ['suppliers', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('institution_id', institutionId)
        .order('supplier_name');
      if (error) throw error;
      return data as Supplier[];
    },
    enabled: !!institutionId,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('suppliers').insert(supplier).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', variables.institution_id] });
      toast.success('Supplier created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create supplier: ${error.message}`);
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Supplier> & { id: string }) => {
      const { data, error } = await supabase.from('suppliers').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', data.institution_id] });
      toast.success('Supplier updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update supplier: ${error.message}`);
    },
  });
}

// ==================== CAPITATION ====================

export function useCapitationRecords(institutionId: string | null, academicYearId?: string) {
  return useQuery({
    queryKey: ['capitation-records', institutionId, academicYearId],
    queryFn: async () => {
      if (!institutionId) return [];
      let query = supabase
        .from('capitation_records')
        .select('*, fund:funds(*)')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false });

      if (academicYearId) {
        query = query.eq('academic_year_id', academicYearId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CapitationRecord[];
    },
    enabled: !!institutionId,
  });
}

export function useCreateCapitationRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (record: Omit<CapitationRecord, 'id' | 'created_at' | 'updated_at' | 'fund'>) => {
      const { data, error } = await supabase.from('capitation_records').insert(record).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['capitation-records', variables.institution_id] });
      toast.success('Capitation record created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create capitation record: ${error.message}`);
    },
  });
}

export function useUpdateCapitationRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CapitationRecord> & { id: string }) => {
      const { data, error } = await supabase.from('capitation_records').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['capitation-records', data.institution_id] });
      toast.success('Capitation record updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update capitation record: ${error.message}`);
    },
  });
}

// ==================== JOURNAL ENTRIES ====================

export interface JournalEntry {
  id: string;
  institution_id: string;
  entry_number: string;
  entry_date: string;
  description: string;
  reference: string | null;
  source_type: string;
  status: 'draft' | 'posted' | 'reversed';
  lines?: JournalEntryLine[];
}

export interface JournalEntryLine {
  id: string;
  account_id: string;
  fund_id: string | null;
  debit_amount: number;
  credit_amount: number;
  description: string;
}

export function useJournalEntries(institutionId: string | null) {
  return useQuery({
    queryKey: ['journal-entries', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*, lines:journal_entry_lines(*)')
        .eq('institution_id', institutionId)
        .order('entry_date', { ascending: false });
      if (error) throw error;
      return data as JournalEntry[];
    },
    enabled: !!institutionId,
  });
}

// ==================== FINANCE RECEIPTS ====================

export interface FinanceReceipt {
  id: string;
  institution_id: string;
  receipt_number: string;
  receipt_date: string;
  payer_type: string;
  payer_name: string;
  fund_id: string | null;
  bank_account_id: string | null;
  total_amount: number;
  payment_method: string;
  status: string;
  narration?: string;
  cheque_number?: string;
  mpesa_code?: string;
  bank_reference?: string;
  currency?: string;
  fund?: { fund_code: string; fund_name: string } | null;
}

export function useFinanceReceipts(institutionId: string | null) {
  return useQuery({
    queryKey: ['finance-receipts', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data, error } = await supabase
        .from('finance_receipts')
        .select('*, fund:funds(fund_code, fund_name)')
        .eq('institution_id', institutionId)
        .order('receipt_date', { ascending: false });
      if (error) throw error;
      return data as unknown as FinanceReceipt[];
    },
    enabled: !!institutionId,
  });
}

export interface CreateFinanceReceiptInput {
  institution_id: string;
  receipt_date: string;
  payer_type: string;
  payer_name: string;
  fund_id: string;
  bank_account_id: string;
  total_amount: number;
  payment_method: string;
  status: string;
  narration?: string;
  cheque_number?: string;
  mpesa_code?: string;
  bank_reference?: string;
  currency?: string;
}

export function useCreateFinanceReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (receipt: CreateFinanceReceiptInput) => {
      // Generate receipt number
      const receiptNumber = `RCP-${new Date().toISOString().slice(0,7).replace('-', '')}-${Date.now().toString().slice(-5)}`;
      const { data, error } = await supabase
        .from('finance_receipts')
        .insert([{ ...receipt, receipt_number: receiptNumber }])
        .select()
        .single();
      if (error) throw error;
      return data;
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['finance-receipts', variables.institution_id] });
      toast.success('Receipt created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create receipt: ${error.message}`);
    },
  });
}
