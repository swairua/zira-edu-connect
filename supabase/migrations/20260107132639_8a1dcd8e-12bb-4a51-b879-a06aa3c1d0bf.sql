
-- =============================================
-- FINANCE & ADMINISTRATION PORTAL - SCHEMA
-- =============================================

-- 1. Fee Installments Table
CREATE TABLE public.fee_installments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  fee_item_id UUID NOT NULL REFERENCES public.fee_items(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(fee_item_id, installment_number)
);

-- 2. Fee Discounts Table
CREATE TABLE public.fee_discounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  amount NUMERIC NOT NULL,
  criteria JSONB DEFAULT '{}'::jsonb,
  applicable_fee_items UUID[] DEFAULT '{}',
  applicable_classes UUID[] DEFAULT '{}',
  start_date DATE,
  end_date DATE,
  max_usage INTEGER,
  current_usage INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Late Payment Penalties Table
CREATE TABLE public.late_payment_penalties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  fee_item_id UUID REFERENCES public.fee_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grace_period_days INTEGER DEFAULT 0,
  penalty_type TEXT NOT NULL CHECK (penalty_type IN ('percentage', 'fixed')),
  penalty_amount NUMERIC NOT NULL,
  max_penalty NUMERIC,
  is_compounding BOOLEAN DEFAULT false,
  apply_per TEXT DEFAULT 'invoice' CHECK (apply_per IN ('invoice', 'installment', 'day')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Financial Adjustments Table (for approval workflow)
CREATE TABLE public.financial_adjustments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('reversal', 'modification', 'credit_note', 'write_off', 'reallocation')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('invoice', 'payment', 'balance')),
  entity_id UUID NOT NULL,
  student_id UUID REFERENCES public.students(id),
  old_amount INTEGER,
  new_amount INTEGER,
  adjustment_amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  supporting_document_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  approval_notes TEXT,
  executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Reconciliation Records Table
CREATE TABLE public.reconciliation_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  reconciliation_date DATE NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('bank', 'mpesa', 'cash', 'cheque', 'other')),
  external_reference TEXT,
  external_amount INTEGER NOT NULL,
  external_date DATE,
  external_description TEXT,
  matched_payment_id UUID REFERENCES public.student_payments(id),
  status TEXT NOT NULL DEFAULT 'unmatched' CHECK (status IN ('matched', 'unmatched', 'exception', 'duplicate', 'ignored')),
  exception_type TEXT,
  exception_notes TEXT,
  reconciled_by UUID REFERENCES auth.users(id),
  reconciled_at TIMESTAMP WITH TIME ZONE,
  batch_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Financial Periods Table (for lock management)
CREATE TABLE public.financial_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  period_name TEXT NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('month', 'term', 'quarter', 'year', 'custom')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_locked BOOLEAN DEFAULT false,
  locked_at TIMESTAMP WITH TIME ZONE,
  locked_by UUID REFERENCES auth.users(id),
  lock_reason TEXT,
  can_unlock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(institution_id, period_type, start_date)
);

-- 7. Student Discounts (applied discounts per student)
CREATE TABLE public.student_discounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  discount_id UUID NOT NULL REFERENCES public.fee_discounts(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES public.student_invoices(id),
  amount_applied INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'applied')),
  applied_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(student_id, discount_id, invoice_id)
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_fee_installments_institution ON public.fee_installments(institution_id);
CREATE INDEX idx_fee_installments_fee_item ON public.fee_installments(fee_item_id);
CREATE INDEX idx_fee_discounts_institution ON public.fee_discounts(institution_id);
CREATE INDEX idx_fee_discounts_active ON public.fee_discounts(institution_id, is_active);
CREATE INDEX idx_late_payment_penalties_institution ON public.late_payment_penalties(institution_id);
CREATE INDEX idx_financial_adjustments_institution ON public.financial_adjustments(institution_id);
CREATE INDEX idx_financial_adjustments_status ON public.financial_adjustments(institution_id, status);
CREATE INDEX idx_reconciliation_records_institution ON public.reconciliation_records(institution_id);
CREATE INDEX idx_reconciliation_records_status ON public.reconciliation_records(institution_id, status);
CREATE INDEX idx_reconciliation_records_date ON public.reconciliation_records(institution_id, reconciliation_date);
CREATE INDEX idx_financial_periods_institution ON public.financial_periods(institution_id);
CREATE INDEX idx_financial_periods_dates ON public.financial_periods(institution_id, start_date, end_date);
CREATE INDEX idx_student_discounts_student ON public.student_discounts(student_id);

-- =============================================
-- ENABLE RLS
-- =============================================
ALTER TABLE public.fee_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.late_payment_penalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_discounts ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES - Fee Installments
-- =============================================
CREATE POLICY "Super admins can manage all fee installments"
  ON public.fee_installments FOR ALL
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Users with finance.view can view fee installments"
  ON public.fee_installments FOR SELECT
  USING (has_permission(auth.uid(), 'finance', 'view', institution_id));

CREATE POLICY "Users with finance.create can create fee installments"
  ON public.fee_installments FOR INSERT
  WITH CHECK (has_permission(auth.uid(), 'finance', 'create', institution_id));

CREATE POLICY "Users with finance.edit can update fee installments"
  ON public.fee_installments FOR UPDATE
  USING (has_permission(auth.uid(), 'finance', 'edit', institution_id));

CREATE POLICY "Users with finance.delete can delete fee installments"
  ON public.fee_installments FOR DELETE
  USING (has_permission(auth.uid(), 'finance', 'delete', institution_id));

-- =============================================
-- RLS POLICIES - Fee Discounts
-- =============================================
CREATE POLICY "Super admins can manage all fee discounts"
  ON public.fee_discounts FOR ALL
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Users with finance.view can view fee discounts"
  ON public.fee_discounts FOR SELECT
  USING (has_permission(auth.uid(), 'finance', 'view', institution_id));

CREATE POLICY "Users with finance.create can create fee discounts"
  ON public.fee_discounts FOR INSERT
  WITH CHECK (has_permission(auth.uid(), 'finance', 'create', institution_id));

CREATE POLICY "Users with finance.edit can update fee discounts"
  ON public.fee_discounts FOR UPDATE
  USING (has_permission(auth.uid(), 'finance', 'edit', institution_id));

CREATE POLICY "Users with finance.delete can delete fee discounts"
  ON public.fee_discounts FOR DELETE
  USING (has_permission(auth.uid(), 'finance', 'delete', institution_id));

-- =============================================
-- RLS POLICIES - Late Payment Penalties
-- =============================================
CREATE POLICY "Super admins can manage all late payment penalties"
  ON public.late_payment_penalties FOR ALL
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Users with finance.view can view late payment penalties"
  ON public.late_payment_penalties FOR SELECT
  USING (has_permission(auth.uid(), 'finance', 'view', institution_id));

CREATE POLICY "Users with finance.create can create late payment penalties"
  ON public.late_payment_penalties FOR INSERT
  WITH CHECK (has_permission(auth.uid(), 'finance', 'create', institution_id));

CREATE POLICY "Users with finance.edit can update late payment penalties"
  ON public.late_payment_penalties FOR UPDATE
  USING (has_permission(auth.uid(), 'finance', 'edit', institution_id));

CREATE POLICY "Users with finance.delete can delete late payment penalties"
  ON public.late_payment_penalties FOR DELETE
  USING (has_permission(auth.uid(), 'finance', 'delete', institution_id));

-- =============================================
-- RLS POLICIES - Financial Adjustments
-- =============================================
CREATE POLICY "Super admins can manage all financial adjustments"
  ON public.financial_adjustments FOR ALL
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Users with finance.view can view financial adjustments"
  ON public.financial_adjustments FOR SELECT
  USING (has_permission(auth.uid(), 'finance', 'view', institution_id));

CREATE POLICY "Users with finance.create can create financial adjustments"
  ON public.financial_adjustments FOR INSERT
  WITH CHECK (has_permission(auth.uid(), 'finance', 'create', institution_id));

CREATE POLICY "Institution admins can approve financial adjustments"
  ON public.financial_adjustments FOR UPDATE
  USING (
    has_permission(auth.uid(), 'finance', 'approve', institution_id) OR
    has_institution_role(auth.uid(), 'institution_admin', institution_id)
  );

-- =============================================
-- RLS POLICIES - Reconciliation Records
-- =============================================
CREATE POLICY "Super admins can manage all reconciliation records"
  ON public.reconciliation_records FOR ALL
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Users with finance.view can view reconciliation records"
  ON public.reconciliation_records FOR SELECT
  USING (has_permission(auth.uid(), 'finance', 'view', institution_id));

CREATE POLICY "Users with finance.create can create reconciliation records"
  ON public.reconciliation_records FOR INSERT
  WITH CHECK (has_permission(auth.uid(), 'finance', 'create', institution_id));

CREATE POLICY "Users with finance.edit can update reconciliation records"
  ON public.reconciliation_records FOR UPDATE
  USING (has_permission(auth.uid(), 'finance', 'edit', institution_id));

-- =============================================
-- RLS POLICIES - Financial Periods
-- =============================================
CREATE POLICY "Super admins can manage all financial periods"
  ON public.financial_periods FOR ALL
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Users with finance.view can view financial periods"
  ON public.financial_periods FOR SELECT
  USING (has_permission(auth.uid(), 'finance', 'view', institution_id));

CREATE POLICY "Institution admins can manage financial periods"
  ON public.financial_periods FOR ALL
  USING (has_institution_role(auth.uid(), 'institution_admin', institution_id));

-- =============================================
-- RLS POLICIES - Student Discounts
-- =============================================
CREATE POLICY "Super admins can manage all student discounts"
  ON public.student_discounts FOR ALL
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Users with finance.view can view student discounts"
  ON public.student_discounts FOR SELECT
  USING (has_permission(auth.uid(), 'finance', 'view', institution_id));

CREATE POLICY "Users with finance.create can create student discounts"
  ON public.student_discounts FOR INSERT
  WITH CHECK (has_permission(auth.uid(), 'finance', 'create', institution_id));

CREATE POLICY "Users with finance.edit can update student discounts"
  ON public.student_discounts FOR UPDATE
  USING (has_permission(auth.uid(), 'finance', 'edit', institution_id));

CREATE POLICY "Parents can view their students discounts"
  ON public.student_discounts FOR SELECT
  USING (parent_linked_to_student(auth.uid(), student_id));

-- =============================================
-- ENABLE REALTIME FOR ADJUSTMENTS
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.financial_adjustments;

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================
CREATE TRIGGER update_fee_installments_updated_at
  BEFORE UPDATE ON public.fee_installments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fee_discounts_updated_at
  BEFORE UPDATE ON public.fee_discounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_late_payment_penalties_updated_at
  BEFORE UPDATE ON public.late_payment_penalties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_adjustments_updated_at
  BEFORE UPDATE ON public.financial_adjustments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reconciliation_records_updated_at
  BEFORE UPDATE ON public.reconciliation_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_periods_updated_at
  BEFORE UPDATE ON public.financial_periods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
