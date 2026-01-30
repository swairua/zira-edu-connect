-- Payroll Settings Table
CREATE TABLE public.payroll_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  pay_day INTEGER NOT NULL DEFAULT 25 CHECK (pay_day >= 1 AND pay_day <= 28),
  currency VARCHAR(10) NOT NULL DEFAULT 'KES',
  auto_generate BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(institution_id)
);

-- Salary Structures Table
CREATE TABLE public.salary_structures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  base_salary NUMERIC(15,2) NOT NULL,
  min_salary NUMERIC(15,2),
  max_salary NUMERIC(15,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Staff Salaries Table
CREATE TABLE public.staff_salaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  salary_structure_id UUID REFERENCES public.salary_structures(id) ON DELETE SET NULL,
  basic_salary NUMERIC(15,2) NOT NULL,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  is_current BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Allowance Types Table
CREATE TABLE public.allowance_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL,
  description TEXT,
  calculation_type VARCHAR(20) NOT NULL DEFAULT 'fixed' CHECK (calculation_type IN ('fixed', 'percentage')),
  default_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  is_taxable BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(institution_id, code)
);

-- Deduction Types Table
CREATE TABLE public.deduction_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL,
  description TEXT,
  calculation_type VARCHAR(20) NOT NULL DEFAULT 'fixed' CHECK (calculation_type IN ('fixed', 'percentage')),
  default_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  is_statutory BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(institution_id, code)
);

-- Staff Allowances Table
CREATE TABLE public.staff_allowances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  allowance_type_id UUID NOT NULL REFERENCES public.allowance_types(id) ON DELETE CASCADE,
  amount NUMERIC(15,2) NOT NULL,
  calculation_type VARCHAR(20) NOT NULL DEFAULT 'fixed' CHECK (calculation_type IN ('fixed', 'percentage')),
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Staff Deductions Table
CREATE TABLE public.staff_deductions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  deduction_type_id UUID NOT NULL REFERENCES public.deduction_types(id) ON DELETE CASCADE,
  amount NUMERIC(15,2) NOT NULL,
  calculation_type VARCHAR(20) NOT NULL DEFAULT 'fixed' CHECK (calculation_type IN ('fixed', 'percentage')),
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Payroll Runs Table
CREATE TABLE public.payroll_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2100),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'cancelled')),
  total_staff INTEGER NOT NULL DEFAULT 0,
  total_gross NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_deductions NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_net NUMERIC(15,2) NOT NULL DEFAULT 0,
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(institution_id, month, year)
);

-- Payslips Table
CREATE TABLE public.payslips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payroll_run_id UUID NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  basic_salary NUMERIC(15,2) NOT NULL,
  total_allowances NUMERIC(15,2) NOT NULL DEFAULT 0,
  gross_salary NUMERIC(15,2) NOT NULL,
  total_deductions NUMERIC(15,2) NOT NULL DEFAULT 0,
  net_salary NUMERIC(15,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'sent', 'paid')),
  payment_date DATE,
  payment_method VARCHAR(50),
  payment_ref VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(payroll_run_id, staff_id)
);

-- Payslip Items Table
CREATE TABLE public.payslip_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payslip_id UUID NOT NULL REFERENCES public.payslips(id) ON DELETE CASCADE,
  item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('allowance', 'deduction')),
  type_id UUID,
  name VARCHAR(100) NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.payroll_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allowance_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deduction_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_allowances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslip_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payroll_settings
CREATE POLICY "Users can view payroll settings for their institution" ON public.payroll_settings
  FOR SELECT USING (
    public.is_super_admin(auth.uid()) OR 
    public.user_belongs_to_institution(auth.uid(), institution_id)
  );

CREATE POLICY "Users with HR permission can manage payroll settings" ON public.payroll_settings
  FOR ALL USING (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'manage', institution_id)
  );

-- RLS Policies for salary_structures
CREATE POLICY "Users can view salary structures for their institution" ON public.salary_structures
  FOR SELECT USING (
    public.is_super_admin(auth.uid()) OR 
    public.user_belongs_to_institution(auth.uid(), institution_id)
  );

CREATE POLICY "Users with HR permission can manage salary structures" ON public.salary_structures
  FOR ALL USING (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'manage', institution_id)
  );

-- RLS Policies for staff_salaries
CREATE POLICY "Users can view staff salaries for their institution" ON public.staff_salaries
  FOR SELECT USING (
    public.is_super_admin(auth.uid()) OR 
    public.user_belongs_to_institution(auth.uid(), institution_id)
  );

CREATE POLICY "Users with HR permission can manage staff salaries" ON public.staff_salaries
  FOR ALL USING (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'manage', institution_id)
  );

-- RLS Policies for allowance_types
CREATE POLICY "Users can view allowance types for their institution" ON public.allowance_types
  FOR SELECT USING (
    public.is_super_admin(auth.uid()) OR 
    public.user_belongs_to_institution(auth.uid(), institution_id)
  );

CREATE POLICY "Users with HR permission can manage allowance types" ON public.allowance_types
  FOR ALL USING (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'manage', institution_id)
  );

-- RLS Policies for deduction_types
CREATE POLICY "Users can view deduction types for their institution" ON public.deduction_types
  FOR SELECT USING (
    public.is_super_admin(auth.uid()) OR 
    public.user_belongs_to_institution(auth.uid(), institution_id)
  );

CREATE POLICY "Users with HR permission can manage deduction types" ON public.deduction_types
  FOR ALL USING (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'manage', institution_id)
  );

-- RLS Policies for staff_allowances
CREATE POLICY "Users can view staff allowances for their institution" ON public.staff_allowances
  FOR SELECT USING (
    public.is_super_admin(auth.uid()) OR 
    public.user_belongs_to_institution(auth.uid(), institution_id)
  );

CREATE POLICY "Users with HR permission can manage staff allowances" ON public.staff_allowances
  FOR ALL USING (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'manage', institution_id)
  );

-- RLS Policies for staff_deductions
CREATE POLICY "Users can view staff deductions for their institution" ON public.staff_deductions
  FOR SELECT USING (
    public.is_super_admin(auth.uid()) OR 
    public.user_belongs_to_institution(auth.uid(), institution_id)
  );

CREATE POLICY "Users with HR permission can manage staff deductions" ON public.staff_deductions
  FOR ALL USING (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'manage', institution_id)
  );

-- RLS Policies for payroll_runs
CREATE POLICY "Users can view payroll runs for their institution" ON public.payroll_runs
  FOR SELECT USING (
    public.is_super_admin(auth.uid()) OR 
    public.user_belongs_to_institution(auth.uid(), institution_id)
  );

CREATE POLICY "Users with HR permission can manage payroll runs" ON public.payroll_runs
  FOR ALL USING (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'manage', institution_id)
  );

-- RLS Policies for payslips
CREATE POLICY "Users can view payslips for their institution" ON public.payslips
  FOR SELECT USING (
    public.is_super_admin(auth.uid()) OR 
    public.user_belongs_to_institution(auth.uid(), institution_id)
  );

CREATE POLICY "Users with HR permission can manage payslips" ON public.payslips
  FOR ALL USING (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'manage', institution_id)
  );

-- RLS Policies for payslip_items
CREATE POLICY "Users can view payslip items" ON public.payslip_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.payslips p
      WHERE p.id = payslip_id
      AND (public.is_super_admin(auth.uid()) OR public.user_belongs_to_institution(auth.uid(), p.institution_id))
    )
  );

CREATE POLICY "Users with HR permission can manage payslip items" ON public.payslip_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.payslips p
      WHERE p.id = payslip_id
      AND (public.is_super_admin(auth.uid()) OR public.has_permission(auth.uid(), 'staff_hr', 'manage', p.institution_id))
    )
  );

-- Create updated_at triggers
CREATE TRIGGER update_payroll_settings_updated_at BEFORE UPDATE ON public.payroll_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_salary_structures_updated_at BEFORE UPDATE ON public.salary_structures
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_staff_salaries_updated_at BEFORE UPDATE ON public.staff_salaries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_allowance_types_updated_at BEFORE UPDATE ON public.allowance_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deduction_types_updated_at BEFORE UPDATE ON public.deduction_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_staff_allowances_updated_at BEFORE UPDATE ON public.staff_allowances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_staff_deductions_updated_at BEFORE UPDATE ON public.staff_deductions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payroll_runs_updated_at BEFORE UPDATE ON public.payroll_runs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payslips_updated_at BEFORE UPDATE ON public.payslips
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_staff_salaries_staff_id ON public.staff_salaries(staff_id);
CREATE INDEX idx_staff_salaries_is_current ON public.staff_salaries(is_current) WHERE is_current = true;
CREATE INDEX idx_staff_allowances_staff_id ON public.staff_allowances(staff_id);
CREATE INDEX idx_staff_deductions_staff_id ON public.staff_deductions(staff_id);
CREATE INDEX idx_payroll_runs_month_year ON public.payroll_runs(year, month);
CREATE INDEX idx_payslips_payroll_run_id ON public.payslips(payroll_run_id);
CREATE INDEX idx_payslips_staff_id ON public.payslips(staff_id);
CREATE INDEX idx_payslip_items_payslip_id ON public.payslip_items(payslip_id);