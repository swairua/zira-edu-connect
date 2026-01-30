-- Fee structures per institution
CREATE TABLE public.fee_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  term text NOT NULL, -- term_1, term_2, term_3, annual
  academic_year text NOT NULL,
  amount integer NOT NULL,
  currency text DEFAULT 'KES',
  due_date date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Student fee accounts
CREATE TABLE public.student_fee_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
  student_id text NOT NULL,
  student_name text NOT NULL,
  class text,
  total_fees integer DEFAULT 0,
  total_paid integer DEFAULT 0,
  last_payment_date timestamptz,
  status text DEFAULT 'current', -- current, overdue, defaulter
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Fee payments for students
CREATE TABLE public.fee_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
  student_fee_account_id uuid REFERENCES public.student_fee_accounts(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL,
  payment_method text,
  transaction_ref text,
  recorded_by uuid,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_fee_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;

-- Fee structures policies
CREATE POLICY "Super admins can manage all fee structures"
ON public.fee_structures FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "Institution admins can manage their fee structures"
ON public.fee_structures FOR ALL
USING (has_institution_role(auth.uid(), 'institution_admin'::app_role, institution_id));

CREATE POLICY "Institution users can view fee structures"
ON public.fee_structures FOR SELECT
USING (user_belongs_to_institution(auth.uid(), institution_id));

-- Student fee accounts policies
CREATE POLICY "Super admins can manage all student fee accounts"
ON public.student_fee_accounts FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "Institution admins can manage their student fee accounts"
ON public.student_fee_accounts FOR ALL
USING (has_institution_role(auth.uid(), 'institution_admin'::app_role, institution_id));

CREATE POLICY "Accountants can manage student fee accounts"
ON public.student_fee_accounts FOR ALL
USING (has_institution_role(auth.uid(), 'accountant'::app_role, institution_id));

-- Fee payments policies
CREATE POLICY "Super admins can manage all fee payments"
ON public.fee_payments FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "Institution admins can manage their fee payments"
ON public.fee_payments FOR ALL
USING (has_institution_role(auth.uid(), 'institution_admin'::app_role, institution_id));

CREATE POLICY "Accountants can manage fee payments"
ON public.fee_payments FOR ALL
USING (has_institution_role(auth.uid(), 'accountant'::app_role, institution_id));

-- Indexes for performance
CREATE INDEX idx_fee_structures_institution ON public.fee_structures(institution_id);
CREATE INDEX idx_fee_structures_active ON public.fee_structures(is_active) WHERE is_active = true;
CREATE INDEX idx_student_fee_accounts_institution ON public.student_fee_accounts(institution_id);
CREATE INDEX idx_student_fee_accounts_status ON public.student_fee_accounts(status);
CREATE INDEX idx_fee_payments_account ON public.fee_payments(student_fee_account_id);
CREATE INDEX idx_fee_payments_institution ON public.fee_payments(institution_id);

-- Triggers for updated_at
CREATE TRIGGER update_fee_structures_updated_at
BEFORE UPDATE ON public.fee_structures
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_fee_accounts_updated_at
BEFORE UPDATE ON public.student_fee_accounts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();