-- Add original_tier column to module_pricing for bulk tier restoration
ALTER TABLE public.module_pricing 
ADD COLUMN IF NOT EXISTS original_tier text;

-- Add original pricing columns for restoration
ALTER TABLE public.module_pricing 
ADD COLUMN IF NOT EXISTS original_monthly_price numeric,
ADD COLUMN IF NOT EXISTS original_termly_price numeric,
ADD COLUMN IF NOT EXISTS original_annual_price numeric;

-- Add is_institution_disabled to institution_module_config
ALTER TABLE public.institution_module_config 
ADD COLUMN IF NOT EXISTS is_institution_disabled boolean DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN public.module_pricing.original_tier IS 'Stores original tier when bulk-set to core for competitive mode';
COMMENT ON COLUMN public.institution_module_config.is_institution_disabled IS 'Allows institution admins to hide modules from their school without affecting billing';