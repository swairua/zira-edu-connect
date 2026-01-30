
-- =====================================================
-- SCHOOL ACCOUNTING MODULE - CORE SCHEMA
-- Using correct app_role enum values
-- =====================================================

-- 1. FUNDS (for fund accounting - FPE, JSS, Boarding, etc.)
CREATE TABLE public.funds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  fund_code TEXT NOT NULL,
  fund_name TEXT NOT NULL,
  fund_type TEXT NOT NULL DEFAULT 'fees' CHECK (fund_type IN ('capitation', 'fees', 'donation', 'project', 'operations', 'reserve')),
  source TEXT NOT NULL DEFAULT 'parents' CHECK (source IN ('government', 'parents', 'donors', 'internal', 'other')),
  description TEXT,
  budget_amount NUMERIC(15,2) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_fund_code UNIQUE (institution_id, fund_code)
);

-- 2. VOTEHEADS (expenditure categories - RMI, PE, etc.)
CREATE TABLE public.voteheads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'recurrent' CHECK (category IN ('recurrent', 'capital', 'personal_emolument', 'development')),
  requires_approval_above NUMERIC(15,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_votehead_code UNIQUE (institution_id, code)
);

-- 3. FUND-VOTEHEAD MAPPING
CREATE TABLE public.fund_votehead_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  fund_id UUID NOT NULL REFERENCES public.funds(id) ON DELETE CASCADE,
  votehead_id UUID NOT NULL REFERENCES public.voteheads(id) ON DELETE CASCADE,
  budget_amount NUMERIC(15,2) DEFAULT 0,
  spent_amount NUMERIC(15,2) DEFAULT 0,
  academic_year_id UUID REFERENCES public.academic_years(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_fund_votehead UNIQUE (institution_id, fund_id, votehead_id, academic_year_id)
);

-- 4. CHART OF ACCOUNTS (hierarchical ledger structure)
CREATE TABLE public.chart_of_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  account_code TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'income', 'expense')),
  parent_account_id UUID REFERENCES public.chart_of_accounts(id),
  fund_id UUID REFERENCES public.funds(id),
  normal_balance TEXT NOT NULL DEFAULT 'debit' CHECK (normal_balance IN ('debit', 'credit')),
  is_bank_account BOOLEAN NOT NULL DEFAULT false,
  is_control_account BOOLEAN NOT NULL DEFAULT false,
  is_system_account BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_account_code UNIQUE (institution_id, account_code)
);

-- 5. BANK ACCOUNTS
CREATE TABLE public.bank_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  branch TEXT,
  account_type TEXT NOT NULL DEFAULT 'current' CHECK (account_type IN ('current', 'savings', 'fixed_deposit', 'mpesa', 'other')),
  currency TEXT NOT NULL DEFAULT 'KES',
  fund_id UUID REFERENCES public.funds(id),
  ledger_account_id UUID REFERENCES public.chart_of_accounts(id),
  opening_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  current_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_bank_account UNIQUE (institution_id, account_number, bank_name)
);

-- 6. JOURNAL ENTRIES (double-entry core)
CREATE TABLE public.journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  entry_number TEXT NOT NULL,
  entry_date DATE NOT NULL,
  posting_date DATE,
  description TEXT NOT NULL,
  reference TEXT,
  source_type TEXT CHECK (source_type IN ('receipt', 'payment', 'voucher', 'transfer', 'adjustment', 'opening_balance', 'closing', 'manual')),
  source_id UUID,
  period_id UUID REFERENCES public.financial_periods(id),
  total_debit NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_credit NUMERIC(15,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'reversed')),
  posted_by UUID REFERENCES auth.users(id),
  posted_at TIMESTAMPTZ,
  reversed_by UUID REFERENCES auth.users(id),
  reversed_at TIMESTAMPTZ,
  reversal_reason TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT balanced_entry CHECK (total_debit = total_credit),
  CONSTRAINT unique_entry_number UNIQUE (institution_id, entry_number)
);

-- 7. JOURNAL ENTRY LINES
CREATE TABLE public.journal_entry_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.chart_of_accounts(id),
  fund_id UUID REFERENCES public.funds(id),
  votehead_id UUID REFERENCES public.voteheads(id),
  description TEXT,
  debit_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  credit_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  line_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_amounts CHECK (
    (debit_amount >= 0 AND credit_amount >= 0) AND
    (debit_amount > 0 OR credit_amount > 0) AND
    NOT (debit_amount > 0 AND credit_amount > 0)
  )
);

-- 8. CASHBOOK ENTRIES
CREATE TABLE public.cashbook_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  bank_account_id UUID NOT NULL REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  value_date DATE,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('receipt', 'payment', 'transfer_in', 'transfer_out', 'charge', 'interest', 'reversal')),
  reference_number TEXT,
  description TEXT NOT NULL,
  debit_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  credit_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  running_balance NUMERIC(15,2),
  source_type TEXT CHECK (source_type IN ('receipt', 'voucher', 'transfer', 'bank_charge', 'interest', 'manual')),
  source_id UUID,
  journal_entry_id UUID REFERENCES public.journal_entries(id),
  reconciled BOOLEAN NOT NULL DEFAULT false,
  reconciled_date DATE,
  reconciled_by UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. FINANCE RECEIPTS
CREATE TABLE public.finance_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  receipt_number TEXT NOT NULL,
  receipt_date DATE NOT NULL,
  payer_type TEXT NOT NULL CHECK (payer_type IN ('student', 'parent', 'government', 'donor', 'other')),
  payer_id UUID,
  payer_name TEXT NOT NULL,
  fund_id UUID REFERENCES public.funds(id),
  bank_account_id UUID REFERENCES public.bank_accounts(id),
  total_amount NUMERIC(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'cheque', 'mpesa', 'bank_transfer', 'rtgs', 'eft', 'other')),
  cheque_number TEXT,
  cheque_date DATE,
  cheque_bank TEXT,
  mpesa_code TEXT,
  bank_reference TEXT,
  narration TEXT,
  received_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'cancelled', 'reversed')),
  cancelled_by UUID REFERENCES auth.users(id),
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  journal_entry_id UUID REFERENCES public.journal_entries(id),
  cashbook_entry_id UUID REFERENCES public.cashbook_entries(id),
  student_payment_id UUID REFERENCES public.student_payments(id),
  printed_at TIMESTAMPTZ,
  printed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_receipt_number UNIQUE (institution_id, receipt_number)
);

-- 10. PAYMENT VOUCHERS
CREATE TABLE public.payment_vouchers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  voucher_number TEXT NOT NULL,
  voucher_date DATE NOT NULL,
  payee_type TEXT NOT NULL CHECK (payee_type IN ('supplier', 'staff', 'government', 'other')),
  payee_id UUID,
  payee_name TEXT NOT NULL,
  fund_id UUID REFERENCES public.funds(id),
  bank_account_id UUID REFERENCES public.bank_accounts(id),
  total_amount NUMERIC(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  payment_method TEXT CHECK (payment_method IN ('cash', 'cheque', 'mpesa', 'bank_transfer', 'rtgs', 'eft')),
  cheque_number TEXT,
  cheque_date DATE,
  description TEXT NOT NULL,
  purpose TEXT,
  prepared_by UUID NOT NULL REFERENCES auth.users(id),
  prepared_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  checked_by UUID REFERENCES auth.users(id),
  checked_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  paid_by UUID REFERENCES auth.users(id),
  paid_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_check', 'pending_approval', 'approved', 'paid', 'cancelled', 'rejected')),
  rejection_reason TEXT,
  cancelled_by UUID REFERENCES auth.users(id),
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  journal_entry_id UUID REFERENCES public.journal_entries(id),
  cashbook_entry_id UUID REFERENCES public.cashbook_entries(id),
  supporting_documents JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_voucher_number UNIQUE (institution_id, voucher_number)
);

-- 11. VOUCHER LINES
CREATE TABLE public.voucher_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voucher_id UUID NOT NULL REFERENCES public.payment_vouchers(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  account_id UUID REFERENCES public.chart_of_accounts(id),
  votehead_id UUID REFERENCES public.voteheads(id),
  quantity NUMERIC(10,2) DEFAULT 1,
  unit_price NUMERIC(15,2) NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  line_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. SUPPLIERS REGISTRY
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  supplier_code TEXT,
  supplier_name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  kra_pin TEXT,
  vat_number TEXT,
  bank_name TEXT,
  bank_branch TEXT,
  bank_account_number TEXT,
  bank_account_name TEXT,
  category TEXT,
  payment_terms TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_supplier_code UNIQUE (institution_id, supplier_code)
);

-- 13. CAPITATION TRACKING
CREATE TABLE public.capitation_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  academic_year_id UUID REFERENCES public.academic_years(id),
  term_id UUID REFERENCES public.terms(id),
  fund_id UUID NOT NULL REFERENCES public.funds(id),
  capitation_type TEXT NOT NULL CHECK (capitation_type IN ('fpe', 'jss_tuition', 'jss_operations', 'jss_infrastructure', 'other')),
  enrolled_learners INTEGER NOT NULL,
  rate_per_learner NUMERIC(15,2) NOT NULL,
  expected_amount NUMERIC(15,2) NOT NULL,
  received_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  receipt_id UUID REFERENCES public.finance_receipts(id),
  disbursement_date DATE,
  reference_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_funds_institution ON public.funds(institution_id);
CREATE INDEX idx_voteheads_institution ON public.voteheads(institution_id);
CREATE INDEX idx_chart_of_accounts_institution ON public.chart_of_accounts(institution_id);
CREATE INDEX idx_chart_of_accounts_type ON public.chart_of_accounts(account_type);
CREATE INDEX idx_bank_accounts_institution ON public.bank_accounts(institution_id);
CREATE INDEX idx_journal_entries_institution ON public.journal_entries(institution_id);
CREATE INDEX idx_journal_entries_date ON public.journal_entries(entry_date);
CREATE INDEX idx_journal_entries_status ON public.journal_entries(status);
CREATE INDEX idx_journal_entry_lines_journal ON public.journal_entry_lines(journal_entry_id);
CREATE INDEX idx_journal_entry_lines_account ON public.journal_entry_lines(account_id);
CREATE INDEX idx_cashbook_entries_bank ON public.cashbook_entries(bank_account_id);
CREATE INDEX idx_cashbook_entries_date ON public.cashbook_entries(entry_date);
CREATE INDEX idx_finance_receipts_institution ON public.finance_receipts(institution_id);
CREATE INDEX idx_finance_receipts_date ON public.finance_receipts(receipt_date);
CREATE INDEX idx_payment_vouchers_institution ON public.payment_vouchers(institution_id);
CREATE INDEX idx_payment_vouchers_status ON public.payment_vouchers(status);
CREATE INDEX idx_suppliers_institution ON public.suppliers(institution_id);
CREATE INDEX idx_capitation_records_institution ON public.capitation_records(institution_id);

-- ROW LEVEL SECURITY
ALTER TABLE public.funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voteheads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fund_votehead_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashbook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voucher_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capitation_records ENABLE ROW LEVEL SECURITY;

-- Finance roles: super_admin, institution_admin, accountant, bursar, finance_officer

-- Funds policies
CREATE POLICY "funds_select" ON public.funds FOR SELECT
  USING (institution_id IN (SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()));

CREATE POLICY "funds_insert" ON public.funds FOR INSERT
  WITH CHECK (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin', 'accountant', 'bursar', 'finance_officer')
  ));

CREATE POLICY "funds_update" ON public.funds FOR UPDATE
  USING (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin', 'accountant', 'bursar', 'finance_officer')
  ));

CREATE POLICY "funds_delete" ON public.funds FOR DELETE
  USING (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin', 'accountant', 'bursar')
  ));

-- Voteheads policies
CREATE POLICY "voteheads_select" ON public.voteheads FOR SELECT
  USING (institution_id IN (SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()));

CREATE POLICY "voteheads_insert" ON public.voteheads FOR INSERT
  WITH CHECK (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin', 'accountant', 'bursar', 'finance_officer')
  ));

CREATE POLICY "voteheads_update" ON public.voteheads FOR UPDATE
  USING (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin', 'accountant', 'bursar', 'finance_officer')
  ));

CREATE POLICY "voteheads_delete" ON public.voteheads FOR DELETE
  USING (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin', 'accountant', 'bursar')
  ));

-- Fund votehead allocations policies
CREATE POLICY "fva_select" ON public.fund_votehead_allocations FOR SELECT
  USING (institution_id IN (SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()));

CREATE POLICY "fva_insert" ON public.fund_votehead_allocations FOR INSERT
  WITH CHECK (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin', 'accountant', 'bursar', 'finance_officer')
  ));

CREATE POLICY "fva_update" ON public.fund_votehead_allocations FOR UPDATE
  USING (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin', 'accountant', 'bursar', 'finance_officer')
  ));

CREATE POLICY "fva_delete" ON public.fund_votehead_allocations FOR DELETE
  USING (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin', 'accountant', 'bursar')
  ));

-- Chart of accounts policies
CREATE POLICY "coa_select" ON public.chart_of_accounts FOR SELECT
  USING (institution_id IN (SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()));

CREATE POLICY "coa_insert" ON public.chart_of_accounts FOR INSERT
  WITH CHECK (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin', 'accountant', 'bursar')
  ));

CREATE POLICY "coa_update" ON public.chart_of_accounts FOR UPDATE
  USING (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin', 'accountant', 'bursar')
  ));

CREATE POLICY "coa_delete" ON public.chart_of_accounts FOR DELETE
  USING (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin')
  ));

-- Bank accounts policies
CREATE POLICY "ba_select" ON public.bank_accounts FOR SELECT
  USING (institution_id IN (SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()));

CREATE POLICY "ba_insert" ON public.bank_accounts FOR INSERT
  WITH CHECK (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin', 'accountant', 'bursar')
  ));

CREATE POLICY "ba_update" ON public.bank_accounts FOR UPDATE
  USING (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin', 'accountant', 'bursar')
  ));

CREATE POLICY "ba_delete" ON public.bank_accounts FOR DELETE
  USING (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin')
  ));

-- Journal entries policies
CREATE POLICY "je_select" ON public.journal_entries FOR SELECT
  USING (institution_id IN (SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()));

CREATE POLICY "je_insert" ON public.journal_entries FOR INSERT
  WITH CHECK (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin', 'accountant', 'bursar', 'finance_officer')
  ));

CREATE POLICY "je_update" ON public.journal_entries FOR UPDATE
  USING (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin', 'accountant', 'bursar', 'finance_officer')
  ));

CREATE POLICY "je_delete" ON public.journal_entries FOR DELETE
  USING (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin')
  ));

-- Journal entry lines policies
CREATE POLICY "jel_select" ON public.journal_entry_lines FOR SELECT
  USING (institution_id IN (SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()));

CREATE POLICY "jel_insert" ON public.journal_entry_lines FOR INSERT
  WITH CHECK (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin', 'accountant', 'bursar', 'finance_officer')
  ));

CREATE POLICY "jel_update" ON public.journal_entry_lines FOR UPDATE
  USING (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin', 'accountant', 'bursar', 'finance_officer')
  ));

CREATE POLICY "jel_delete" ON public.journal_entry_lines FOR DELETE
  USING (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin')
  ));

-- Cashbook entries policies
CREATE POLICY "cb_select" ON public.cashbook_entries FOR SELECT
  USING (institution_id IN (SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()));

CREATE POLICY "cb_insert" ON public.cashbook_entries FOR INSERT
  WITH CHECK (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin', 'accountant', 'bursar', 'finance_officer')
  ));

CREATE POLICY "cb_update" ON public.cashbook_entries FOR UPDATE
  USING (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin', 'accountant', 'bursar', 'finance_officer')
  ));

CREATE POLICY "cb_delete" ON public.cashbook_entries FOR DELETE
  USING (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin')
  ));

-- Finance receipts policies
CREATE POLICY "fr_select" ON public.finance_receipts FOR SELECT
  USING (institution_id IN (SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()));

CREATE POLICY "fr_insert" ON public.finance_receipts FOR INSERT
  WITH CHECK (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin', 'accountant', 'bursar', 'finance_officer')
  ));

CREATE POLICY "fr_update" ON public.finance_receipts FOR UPDATE
  USING (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin', 'accountant', 'bursar', 'finance_officer')
  ));

CREATE POLICY "fr_delete" ON public.finance_receipts FOR DELETE
  USING (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin')
  ));

-- Payment vouchers policies
CREATE POLICY "pv_select" ON public.payment_vouchers FOR SELECT
  USING (institution_id IN (SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()));

CREATE POLICY "pv_insert" ON public.payment_vouchers FOR INSERT
  WITH CHECK (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin', 'accountant', 'bursar', 'finance_officer')
  ));

CREATE POLICY "pv_update" ON public.payment_vouchers FOR UPDATE
  USING (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin', 'accountant', 'bursar', 'finance_officer')
  ));

CREATE POLICY "pv_delete" ON public.payment_vouchers FOR DELETE
  USING (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin')
  ));

-- Voucher lines policies
CREATE POLICY "vl_select" ON public.voucher_lines FOR SELECT
  USING (institution_id IN (SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()));

CREATE POLICY "vl_insert" ON public.voucher_lines FOR INSERT
  WITH CHECK (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin', 'accountant', 'bursar', 'finance_officer')
  ));

CREATE POLICY "vl_update" ON public.voucher_lines FOR UPDATE
  USING (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin', 'accountant', 'bursar', 'finance_officer')
  ));

CREATE POLICY "vl_delete" ON public.voucher_lines FOR DELETE
  USING (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin')
  ));

-- Suppliers policies
CREATE POLICY "sup_select" ON public.suppliers FOR SELECT
  USING (institution_id IN (SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()));

CREATE POLICY "sup_insert" ON public.suppliers FOR INSERT
  WITH CHECK (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin', 'accountant', 'bursar', 'finance_officer')
  ));

CREATE POLICY "sup_update" ON public.suppliers FOR UPDATE
  USING (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin', 'accountant', 'bursar', 'finance_officer')
  ));

CREATE POLICY "sup_delete" ON public.suppliers FOR DELETE
  USING (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin')
  ));

-- Capitation records policies
CREATE POLICY "cap_select" ON public.capitation_records FOR SELECT
  USING (institution_id IN (SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()));

CREATE POLICY "cap_insert" ON public.capitation_records FOR INSERT
  WITH CHECK (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin', 'accountant', 'bursar', 'finance_officer')
  ));

CREATE POLICY "cap_update" ON public.capitation_records FOR UPDATE
  USING (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin', 'accountant', 'bursar', 'finance_officer')
  ));

CREATE POLICY "cap_delete" ON public.capitation_records FOR DELETE
  USING (institution_id IN (
    SELECT ur.institution_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'institution_admin')
  ));

-- TRIGGERS
CREATE TRIGGER update_funds_updated_at BEFORE UPDATE ON public.funds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_voteheads_updated_at BEFORE UPDATE ON public.voteheads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fund_votehead_allocations_updated_at BEFORE UPDATE ON public.fund_votehead_allocations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chart_of_accounts_updated_at BEFORE UPDATE ON public.chart_of_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON public.bank_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cashbook_entries_updated_at BEFORE UPDATE ON public.cashbook_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_finance_receipts_updated_at BEFORE UPDATE ON public.finance_receipts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_vouchers_updated_at BEFORE UPDATE ON public.payment_vouchers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_capitation_records_updated_at BEFORE UPDATE ON public.capitation_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.generate_accounting_number(
  p_institution_id UUID,
  p_prefix TEXT,
  p_table_name TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_year TEXT;
  v_count INTEGER;
  v_number TEXT;
BEGIN
  v_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  EXECUTE format(
    'SELECT COUNT(*) + 1 FROM %I WHERE institution_id = $1 AND created_at >= date_trunc(''year'', CURRENT_DATE)',
    p_table_name
  ) INTO v_count USING p_institution_id;
  
  v_number := p_prefix || '-' || v_year || '-' || LPAD(v_count::TEXT, 5, '0');
  
  RETURN v_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_account_balance(
  p_account_id UUID,
  p_as_of_date DATE DEFAULT CURRENT_DATE
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance NUMERIC;
  v_normal_balance TEXT;
BEGIN
  SELECT normal_balance INTO v_normal_balance
  FROM chart_of_accounts WHERE id = p_account_id;
  
  SELECT 
    CASE WHEN v_normal_balance = 'debit' 
      THEN COALESCE(SUM(debit_amount), 0) - COALESCE(SUM(credit_amount), 0)
      ELSE COALESCE(SUM(credit_amount), 0) - COALESCE(SUM(debit_amount), 0)
    END
  INTO v_balance
  FROM journal_entry_lines jel
  JOIN journal_entries je ON je.id = jel.journal_entry_id
  WHERE jel.account_id = p_account_id
    AND je.status = 'posted'
    AND je.entry_date <= p_as_of_date;
  
  RETURN COALESCE(v_balance, 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_fund_balance(
  p_fund_id UUID,
  p_as_of_date DATE DEFAULT CURRENT_DATE
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance NUMERIC;
BEGIN
  SELECT COALESCE(SUM(credit_amount), 0) - COALESCE(SUM(debit_amount), 0)
  INTO v_balance
  FROM journal_entry_lines jel
  JOIN journal_entries je ON je.id = jel.journal_entry_id
  WHERE jel.fund_id = p_fund_id
    AND je.status = 'posted'
    AND je.entry_date <= p_as_of_date;
  
  RETURN COALESCE(v_balance, 0);
END;
$$;
