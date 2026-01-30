-- Create module_pricing table for billing readiness
CREATE TABLE public.module_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  base_monthly_price INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'KES',
  tier TEXT DEFAULT 'addon' CHECK (tier IN ('core', 'addon', 'premium')),
  requires_modules TEXT[] DEFAULT '{}',
  max_usage_limit INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create institution_module_config table
CREATE TABLE public.institution_module_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  activation_type TEXT DEFAULT 'manual' CHECK (activation_type IN ('plan_included', 'manual', 'addon', 'trial')),
  custom_settings JSONB DEFAULT '{}',
  activated_at TIMESTAMPTZ,
  activated_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(institution_id, module_id)
);

-- Create module_activation_history table for audit
CREATE TABLE public.module_activation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('activated', 'deactivated', 'upgraded', 'downgraded', 'trial_started', 'trial_expired')),
  previous_status BOOLEAN,
  new_status BOOLEAN,
  reason TEXT,
  activated_by UUID REFERENCES auth.users(id),
  billing_tier TEXT,
  monthly_price INTEGER DEFAULT 0,
  effective_from TIMESTAMPTZ DEFAULT now(),
  effective_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.module_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_module_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_activation_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for module_pricing (read-only for authenticated users)
CREATE POLICY "Anyone can view module pricing"
ON public.module_pricing FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Super admins can manage module pricing"
ON public.module_pricing FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('super_admin', 'support_admin')
  )
);

-- RLS Policies for institution_module_config
CREATE POLICY "Users can view their institution module config"
ON public.institution_module_config FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND (
      role IN ('super_admin', 'support_admin')
      OR institution_id = institution_module_config.institution_id
    )
  )
);

CREATE POLICY "Super admins can manage module config"
ON public.institution_module_config FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('super_admin', 'support_admin')
  )
);

-- RLS Policies for module_activation_history
CREATE POLICY "Users can view their institution activation history"
ON public.module_activation_history FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND (
      role IN ('super_admin', 'support_admin')
      OR institution_id = module_activation_history.institution_id
    )
  )
);

CREATE POLICY "Super admins can insert activation history"
ON public.module_activation_history FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('super_admin', 'support_admin')
  )
);

-- Seed module pricing data
INSERT INTO public.module_pricing (module_id, display_name, description, tier, base_monthly_price, requires_modules) VALUES
('academics', 'Academics', 'Core academic management including classes, subjects, exams, and grading', 'core', 0, '{}'),
('finance', 'Finance', 'Fee management, invoicing, payments, and financial reporting', 'core', 0, '{}'),
('communication', 'Communication', 'SMS notifications, announcements, and messaging', 'addon', 2000, '{}'),
('hr', 'HR Management', 'Staff management, payroll, and leave tracking', 'addon', 3000, '{}'),
('library', 'Library', 'Book catalog, loans, returns, and library management', 'addon', 1500, ARRAY['academics']),
('transport', 'Transport', 'Route management, vehicle tracking, and transport billing', 'addon', 2500, ARRAY['finance']),
('hostel', 'Boarding & Hostel', 'Hostel management, bed allocation, and boarding fees', 'addon', 2000, ARRAY['finance']),
('activities', 'Activities & Sports', 'Extracurricular activities, clubs, and sports management', 'addon', 1500, ARRAY['academics']),
('uniforms', 'Uniform Store', 'Uniform inventory, orders, and sales management', 'addon', 1000, ARRAY['finance']),
('timetable', 'Timetable', 'Class scheduling, room allocation, and timetable generation', 'addon', 1000, ARRAY['academics']),
('reports', 'Advanced Reports', 'Custom reports, analytics, and data exports', 'premium', 5000, '{}');

-- Create function to sync enabled_modules array from config table
CREATE OR REPLACE FUNCTION public.sync_enabled_modules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.institutions
  SET enabled_modules = (
    SELECT COALESCE(array_agg(module_id), '{}')
    FROM public.institution_module_config
    WHERE institution_id = COALESCE(NEW.institution_id, OLD.institution_id)
    AND is_enabled = true
  )
  WHERE id = COALESCE(NEW.institution_id, OLD.institution_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger to sync enabled_modules on config changes
CREATE TRIGGER sync_enabled_modules_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.institution_module_config
FOR EACH ROW
EXECUTE FUNCTION public.sync_enabled_modules();

-- Migrate existing enabled_modules to new config table
INSERT INTO public.institution_module_config (institution_id, module_id, is_enabled, activation_type, activated_at)
SELECT 
  i.id,
  unnest(i.enabled_modules),
  true,
  'manual',
  now()
FROM public.institutions i
WHERE array_length(i.enabled_modules, 1) > 0
ON CONFLICT (institution_id, module_id) DO NOTHING;

-- Create updated_at trigger for module tables
CREATE TRIGGER update_module_pricing_updated_at
BEFORE UPDATE ON public.module_pricing
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_institution_module_config_updated_at
BEFORE UPDATE ON public.institution_module_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();