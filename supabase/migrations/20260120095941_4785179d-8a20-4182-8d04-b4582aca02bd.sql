-- Institution custom pricing for negotiated deals
CREATE TABLE public.institution_custom_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
  
  -- Custom plan pricing (overrides subscription_plan pricing)
  custom_yearly_price NUMERIC,
  custom_monthly_price NUMERIC,
  
  -- Custom limits (overrides plan limits)
  custom_max_students INTEGER,
  custom_max_staff INTEGER,
  
  -- Custom modules included
  included_modules TEXT[],
  
  -- Negotiation details
  discount_percentage NUMERIC DEFAULT 0,
  negotiation_notes TEXT,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Module pricing overrides per institution
CREATE TABLE public.module_pricing_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
  module_id TEXT NOT NULL,
  custom_price NUMERIC NOT NULL,
  reason TEXT,
  approved_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(institution_id, module_id)
);

-- Enable RLS
ALTER TABLE public.institution_custom_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_pricing_overrides ENABLE ROW LEVEL SECURITY;

-- RLS Policies for institution_custom_pricing
CREATE POLICY "Super admins can manage all custom pricing"
ON public.institution_custom_pricing FOR ALL
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Support admins can view all custom pricing"
ON public.institution_custom_pricing FOR SELECT
USING (public.is_support_admin(auth.uid()));

CREATE POLICY "Institution admins can view own custom pricing"
ON public.institution_custom_pricing FOR SELECT
USING (public.user_belongs_to_institution(auth.uid(), institution_id));

-- RLS Policies for module_pricing_overrides
CREATE POLICY "Super admins can manage all module overrides"
ON public.module_pricing_overrides FOR ALL
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Support admins can view all module overrides"
ON public.module_pricing_overrides FOR SELECT
USING (public.is_support_admin(auth.uid()));

CREATE POLICY "Institution admins can view own module overrides"
ON public.module_pricing_overrides FOR SELECT
USING (public.user_belongs_to_institution(auth.uid(), institution_id));

-- Triggers for updated_at
CREATE TRIGGER update_institution_custom_pricing_updated_at
  BEFORE UPDATE ON public.institution_custom_pricing
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_module_pricing_overrides_updated_at
  BEFORE UPDATE ON public.module_pricing_overrides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster lookups
CREATE INDEX idx_institution_custom_pricing_institution 
ON public.institution_custom_pricing(institution_id) WHERE is_active = true;

CREATE INDEX idx_module_pricing_overrides_institution 
ON public.module_pricing_overrides(institution_id);