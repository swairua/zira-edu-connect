-- Create invoices table for subscription billing
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES institutions(id) ON DELETE CASCADE NOT NULL,
  invoice_number text NOT NULL,
  amount integer NOT NULL,
  currency text DEFAULT 'KES',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  due_date timestamptz NOT NULL,
  paid_at timestamptz,
  billing_period_start timestamptz NOT NULL,
  billing_period_end timestamptz NOT NULL,
  subscription_plan subscription_plan NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create payments table for tracking transactions
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE SET NULL,
  institution_id uuid REFERENCES institutions(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL,
  currency text DEFAULT 'KES',
  payment_method text CHECK (payment_method IN ('mpesa', 'bank_transfer', 'card', 'cash', 'other')),
  transaction_ref text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  recorded_by uuid,
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Invoices RLS policies
CREATE POLICY "Super admins can manage all invoices"
  ON public.invoices FOR ALL
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Institution admins can view their invoices"
  ON public.invoices FOR SELECT
  USING (institution_id = get_user_institution_id(auth.uid()) AND has_role(auth.uid(), 'institution_admin'::app_role));

-- Payments RLS policies
CREATE POLICY "Super admins can manage all payments"
  ON public.payments FOR ALL
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Institution admins can view their payments"
  ON public.payments FOR SELECT
  USING (institution_id = get_user_institution_id(auth.uid()) AND has_role(auth.uid(), 'institution_admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_invoices_institution_id ON public.invoices(institution_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX idx_payments_institution_id ON public.payments(institution_id);
CREATE INDEX idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX idx_payments_status ON public.payments(status);

-- Create trigger for updated_at on invoices
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create sequence for invoice numbers
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1000;

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.invoice_number := 'INV-' || to_char(now(), 'YYYYMM') || '-' || lpad(nextval('invoice_number_seq')::text, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate invoice number
CREATE TRIGGER set_invoice_number
  BEFORE INSERT ON public.invoices
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
  EXECUTE FUNCTION generate_invoice_number();