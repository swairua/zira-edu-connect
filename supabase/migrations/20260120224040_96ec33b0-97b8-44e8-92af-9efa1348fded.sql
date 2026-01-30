-- Add setup fee configuration columns to billing_settings
ALTER TABLE billing_settings 
ADD COLUMN IF NOT EXISTS base_setup_fee numeric DEFAULT 25000,
ADD COLUMN IF NOT EXISTS data_migration_fee_per_record numeric DEFAULT 10,
ADD COLUMN IF NOT EXISTS data_migration_flat_fee numeric DEFAULT 15000,
ADD COLUMN IF NOT EXISTS integration_fee_per_system numeric DEFAULT 20000,
ADD COLUMN IF NOT EXISTS training_fee_per_day numeric DEFAULT 10000,
ADD COLUMN IF NOT EXISTS customization_hourly_rate numeric DEFAULT 5000;

-- Create setup fee catalog table for configurable setup services
CREATE TABLE public.setup_fee_catalog (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_type text NOT NULL CHECK (service_type IN ('setup', 'migration', 'integration', 'training', 'customization')),
  name text NOT NULL,
  description text,
  base_price numeric NOT NULL DEFAULT 0,
  price_type text NOT NULL DEFAULT 'flat' CHECK (price_type IN ('flat', 'per_unit', 'per_hour', 'per_day', 'per_record')),
  unit_label text, -- e.g., "per system", "per day", "per record"
  is_required boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create institution setup fees tracking table
CREATE TABLE public.institution_setup_fees (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  fee_catalog_id uuid REFERENCES public.setup_fee_catalog(id) ON DELETE SET NULL,
  custom_name text, -- For custom line items not in catalog
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  total_amount numeric GENERATED ALWAYS AS (quantity * unit_price) STORED,
  discount_percentage numeric DEFAULT 0,
  final_amount numeric GENERATED ALWAYS AS ((quantity * unit_price) * (1 - COALESCE(discount_percentage, 0) / 100)) STORED,
  status text NOT NULL DEFAULT 'quoted' CHECK (status IN ('quoted', 'approved', 'invoiced', 'paid', 'waived')),
  notes text,
  created_by uuid,
  approved_by uuid,
  approved_at timestamp with time zone,
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.setup_fee_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_setup_fees ENABLE ROW LEVEL SECURITY;

-- RLS policies for setup_fee_catalog (super admins can manage, others can read)
CREATE POLICY "Anyone can view active setup fees" 
ON public.setup_fee_catalog 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Super admins can manage setup fee catalog" 
ON public.setup_fee_catalog 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'support_admin')
  )
);

-- RLS policies for institution_setup_fees
CREATE POLICY "Users can view their institution setup fees" 
ON public.institution_setup_fees 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND institution_id = institution_setup_fees.institution_id
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'support_admin')
  )
);

CREATE POLICY "Super admins can manage institution setup fees" 
ON public.institution_setup_fees 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'support_admin')
  )
);

-- Insert default setup fee catalog items
INSERT INTO public.setup_fee_catalog (service_type, name, description, base_price, price_type, unit_label, is_required, display_order)
VALUES 
  ('setup', 'Platform Setup & Configuration', 'Initial platform setup, configuration, and customization to match your institution branding and workflows.', 25000, 'flat', NULL, true, 1),
  ('migration', 'Data Migration (Flat Fee)', 'Standard data migration for institutions with up to 500 student records.', 15000, 'flat', NULL, false, 2),
  ('migration', 'Data Migration (Per Record)', 'For larger institutions - charged per student/staff record migrated.', 10, 'per_record', 'per record', false, 3),
  ('integration', 'Third-Party Integration', 'Integration with external systems like accounting software, payment gateways, or SMS providers.', 20000, 'per_unit', 'per system', false, 4),
  ('training', 'On-Site Training', 'Comprehensive training sessions for administrators and staff at your institution.', 10000, 'per_day', 'per day', false, 5),
  ('training', 'Virtual Training Session', 'Remote training sessions via video conferencing.', 5000, 'per_hour', 'per hour', false, 6),
  ('customization', 'Custom Development', 'Custom feature development or modifications to existing functionality.', 5000, 'per_hour', 'per hour', false, 7);

-- Create trigger for updated_at on setup_fee_catalog
CREATE TRIGGER update_setup_fee_catalog_updated_at
BEFORE UPDATE ON public.setup_fee_catalog
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on institution_setup_fees
CREATE TRIGGER update_institution_setup_fees_updated_at
BEFORE UPDATE ON public.institution_setup_fees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();