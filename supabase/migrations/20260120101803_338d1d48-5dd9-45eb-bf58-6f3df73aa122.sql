-- Add billing cycle to institutions table
ALTER TABLE institutions 
ADD COLUMN IF NOT EXISTS billing_cycle TEXT NOT NULL DEFAULT 'annual' 
CHECK (billing_cycle IN ('monthly', 'termly', 'annual'));

-- Add termly pricing column to subscription_plans
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS price_termly NUMERIC DEFAULT 0;

-- Calculate initial termly prices (yearly / 3 + ~5% premium)
UPDATE subscription_plans 
SET price_termly = ROUND(price_yearly / 3 * 1.05, -2)
WHERE price_termly = 0 OR price_termly IS NULL;

-- Create global billing settings table
CREATE TABLE IF NOT EXISTS billing_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Available billing cycles (super admin can enable/disable)
  monthly_enabled BOOLEAN DEFAULT false,
  termly_enabled BOOLEAN DEFAULT true,
  annual_enabled BOOLEAN DEFAULT true,
  
  -- Default billing cycle for new institutions
  default_billing_cycle TEXT DEFAULT 'annual' CHECK (default_billing_cycle IN ('monthly', 'termly', 'annual')),
  
  -- Grace periods per cycle type
  monthly_grace_days INTEGER DEFAULT 7,
  termly_grace_days INTEGER DEFAULT 14,
  annual_grace_days INTEGER DEFAULT 30,
  
  -- Discounts
  annual_discount_percent NUMERIC DEFAULT 20,
  termly_discount_percent NUMERIC DEFAULT 10,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on billing_settings
ALTER TABLE billing_settings ENABLE ROW LEVEL SECURITY;

-- Super admins can view billing settings
CREATE POLICY "Super admins can view billing settings"
ON billing_settings FOR SELECT
USING (public.is_super_admin(auth.uid()) OR public.is_support_admin(auth.uid()));

-- Super admins can update billing settings
CREATE POLICY "Super admins can update billing settings"
ON billing_settings FOR UPDATE
USING (public.is_super_admin(auth.uid()));

-- Insert default settings (single row) if not exists
INSERT INTO billing_settings (id) 
SELECT gen_random_uuid() 
WHERE NOT EXISTS (SELECT 1 FROM billing_settings);

-- Add trigger for updated_at
CREATE TRIGGER update_billing_settings_updated_at
BEFORE UPDATE ON billing_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();