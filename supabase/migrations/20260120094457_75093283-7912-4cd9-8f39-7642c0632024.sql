-- Institution invoices for subscription and module billing
CREATE TABLE public.institution_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) NOT NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_type TEXT NOT NULL DEFAULT 'subscription', -- subscription, addon, renewal
  billing_period_start DATE,
  billing_period_end DATE,
  plan_id TEXT, -- Store plan ID as text to avoid enum FK issues
  base_plan_amount NUMERIC NOT NULL DEFAULT 0,
  addons_amount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'KES',
  status TEXT DEFAULT 'pending', -- pending, paid, overdue, cancelled
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  payment_reference TEXT,
  line_items JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Institution payments for tracking all payments
CREATE TABLE public.institution_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) NOT NULL,
  invoice_id UUID REFERENCES public.institution_invoices(id),
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'KES',
  payment_type TEXT NOT NULL, -- plan_upgrade, addon_purchase, renewal
  payment_method TEXT NOT NULL, -- mpesa, bank_transfer, card
  payment_reference TEXT,
  mpesa_receipt TEXT,
  mpesa_phone TEXT,
  checkout_request_id TEXT,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sequence for institution invoice numbers
CREATE SEQUENCE IF NOT EXISTS institution_invoice_number_seq START 1;

-- Function to generate institution invoice numbers
CREATE OR REPLACE FUNCTION public.generate_institution_invoice_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := 'IINV-' || to_char(now(), 'YYYYMM') || '-' || lpad(nextval('institution_invoice_number_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for auto-generating invoice numbers
CREATE TRIGGER generate_institution_invoice_number_trigger
  BEFORE INSERT ON public.institution_invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_institution_invoice_number();

-- Update timestamp triggers
CREATE TRIGGER update_institution_invoices_updated_at
  BEFORE UPDATE ON public.institution_invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_institution_payments_updated_at
  BEFORE UPDATE ON public.institution_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.institution_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for institution_invoices
CREATE POLICY "Super admins can manage all institution invoices"
  ON public.institution_invoices
  FOR ALL
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Institution owners can view their invoices"
  ON public.institution_invoices
  FOR SELECT
  USING (
    institution_id IN (
      SELECT p.institution_id FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'institution_owner')
  );

CREATE POLICY "Institution admins can view their invoices"
  ON public.institution_invoices
  FOR SELECT
  USING (
    institution_id IN (
      SELECT p.institution_id FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'institution_admin')
  );

-- RLS Policies for institution_payments
CREATE POLICY "Super admins can manage all institution payments"
  ON public.institution_payments
  FOR ALL
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Institution owners can view their payments"
  ON public.institution_payments
  FOR SELECT
  USING (
    institution_id IN (
      SELECT p.institution_id FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'institution_owner')
  );

CREATE POLICY "Institution admins can view their payments"
  ON public.institution_payments
  FOR SELECT
  USING (
    institution_id IN (
      SELECT p.institution_id FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'institution_admin')
  );

-- Index for faster queries
CREATE INDEX idx_institution_invoices_institution ON public.institution_invoices(institution_id);
CREATE INDEX idx_institution_invoices_status ON public.institution_invoices(status);
CREATE INDEX idx_institution_payments_institution ON public.institution_payments(institution_id);
CREATE INDEX idx_institution_payments_status ON public.institution_payments(status);
CREATE INDEX idx_institution_payments_checkout ON public.institution_payments(checkout_request_id);