-- Add columns to deduction_types for statutory tracking
ALTER TABLE public.deduction_types 
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'custom',
ADD COLUMN IF NOT EXISTS country_code VARCHAR(5),
ADD COLUMN IF NOT EXISTS calculation_formula JSONB,
ADD COLUMN IF NOT EXISTS employer_contribution_rate NUMERIC(10,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS reduces_taxable_income BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS calculation_order INTEGER DEFAULT 100;

-- Add comments
COMMENT ON COLUMN public.deduction_types.category IS 'statutory, voluntary, or custom';
COMMENT ON COLUMN public.deduction_types.country_code IS 'ISO country code (e.g., KE, UG, TZ)';
COMMENT ON COLUMN public.deduction_types.calculation_formula IS 'JSON with tiered/capped calculation rules';
COMMENT ON COLUMN public.deduction_types.employer_contribution_rate IS 'Employer matching rate (e.g., 0.06 for 6%)';
COMMENT ON COLUMN public.deduction_types.reduces_taxable_income IS 'Whether this deduction reduces taxable income for PAYE';
COMMENT ON COLUMN public.deduction_types.calculation_order IS 'Order of calculation (lower = first, PAYE should be last)';

-- Create payroll country templates table for storing country-specific statutory deduction templates
CREATE TABLE IF NOT EXISTS public.payroll_country_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code VARCHAR(5) NOT NULL,
  deduction_code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'statutory',
  calculation_type VARCHAR(50) NOT NULL DEFAULT 'percentage',
  calculation_formula JSONB NOT NULL,
  default_amount NUMERIC(15,4) DEFAULT 0,
  employer_contribution_rate NUMERIC(10,4) DEFAULT 0,
  reduces_taxable_income BOOLEAN DEFAULT false,
  calculation_order INTEGER DEFAULT 100,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(country_code, deduction_code, effective_from)
);

-- Enable RLS
ALTER TABLE public.payroll_country_templates ENABLE ROW LEVEL SECURITY;

-- Create policy for reading templates (all authenticated users can read)
CREATE POLICY "Anyone can read payroll templates"
ON public.payroll_country_templates
FOR SELECT
USING (true);

-- Create policy for super admins to manage templates
CREATE POLICY "Super admins can manage payroll templates"
ON public.payroll_country_templates
FOR ALL
USING (public.is_super_admin(auth.uid()));

-- Insert Kenya 2025 statutory deduction templates
INSERT INTO public.payroll_country_templates (country_code, deduction_code, name, description, category, calculation_type, calculation_formula, employer_contribution_rate, reduces_taxable_income, calculation_order, effective_from)
VALUES 
-- NSSF (calculated first, reduces taxable income)
('KE', 'NSSF', 'NSSF Contribution', 'National Social Security Fund contribution (6% of pensionable earnings, capped)', 'statutory', 'capped_percentage', 
'{
  "type": "capped_percentage",
  "rate": 0.06,
  "basis": "gross",
  "tiers": [
    {"name": "Tier 1", "min": 0, "max": 8000, "rate": 0.06},
    {"name": "Tier 2", "min": 8000, "max": 72000, "rate": 0.06}
  ],
  "maxContribution": 4320,
  "description": "6% of pensionable earnings (KES 8,000 - 72,000), max KES 4,320"
}'::jsonb, 0.06, true, 10, '2025-01-01'),

-- SHIF (replacing NHIF, calculated second, reduces taxable income)
('KE', 'SHIF', 'SHIF Contribution', 'Social Health Insurance Fund contribution (2.75% of gross salary)', 'statutory', 'percentage',
'{
  "type": "percentage",
  "rate": 0.0275,
  "basis": "gross",
  "description": "2.75% of gross salary"
}'::jsonb, 0, true, 20, '2025-01-01'),

-- Housing Levy (calculated third, reduces taxable income)
('KE', 'HOUSING_LEVY', 'Housing Levy (AHL)', 'Affordable Housing Levy (1.5% of gross salary, employer matches)', 'statutory', 'percentage',
'{
  "type": "percentage",
  "rate": 0.015,
  "basis": "gross",
  "description": "1.5% of gross salary"
}'::jsonb, 0.015, true, 30, '2025-01-01'),

-- PAYE (calculated last on taxable income)
('KE', 'PAYE', 'PAYE (Income Tax)', 'Pay As You Earn tax calculated on taxable income after deductions', 'statutory', 'tiered',
'{
  "type": "tiered",
  "basis": "taxable",
  "personalRelief": 2400,
  "insuranceRelief": 0,
  "bands": [
    {"min": 0, "max": 24000, "rate": 0.10},
    {"min": 24000, "max": 32333, "rate": 0.25},
    {"min": 32333, "max": 500000, "rate": 0.30},
    {"min": 500000, "max": 800000, "rate": 0.325},
    {"min": 800000, "max": null, "rate": 0.35}
  ],
  "description": "Tiered tax rates from 10% to 35% with KES 2,400 personal relief"
}'::jsonb, 0, false, 100, '2025-01-01'),

-- Uganda statutory deductions
('UG', 'NSSF_UG', 'NSSF Contribution', 'National Social Security Fund (5% employee, 10% employer)', 'statutory', 'percentage',
'{
  "type": "percentage",
  "rate": 0.05,
  "basis": "gross",
  "description": "5% of gross salary"
}'::jsonb, 0.10, true, 10, '2025-01-01'),

('UG', 'PAYE_UG', 'PAYE (Income Tax)', 'Pay As You Earn tax for Uganda', 'statutory', 'tiered',
'{
  "type": "tiered",
  "basis": "taxable",
  "personalRelief": 0,
  "threshold": 235000,
  "bands": [
    {"min": 0, "max": 235000, "rate": 0},
    {"min": 235000, "max": 335000, "rate": 0.10},
    {"min": 335000, "max": 410000, "rate": 0.20},
    {"min": 410000, "max": null, "rate": 0.30}
  ],
  "description": "0% up to UGX 235,000, then 10%, 20%, 30%"
}'::jsonb, 0, false, 100, '2025-01-01'),

-- Tanzania statutory deductions
('TZ', 'NSSF_TZ', 'NSSF Contribution', 'National Social Security Fund (10% employee, 10% employer)', 'statutory', 'percentage',
'{
  "type": "percentage",
  "rate": 0.10,
  "basis": "gross",
  "description": "10% of gross salary"
}'::jsonb, 0.10, true, 10, '2025-01-01'),

('TZ', 'SDL', 'Skills Development Levy', 'Skills and Development Levy (4.5% employer only)', 'statutory', 'percentage',
'{
  "type": "percentage",
  "rate": 0,
  "basis": "gross",
  "description": "4.5% employer contribution only"
}'::jsonb, 0.045, false, 20, '2025-01-01'),

('TZ', 'PAYE_TZ', 'PAYE (Income Tax)', 'Pay As You Earn tax for Tanzania', 'statutory', 'tiered',
'{
  "type": "tiered",
  "basis": "taxable",
  "personalRelief": 0,
  "bands": [
    {"min": 0, "max": 270000, "rate": 0},
    {"min": 270000, "max": 520000, "rate": 0.08},
    {"min": 520000, "max": 760000, "rate": 0.20},
    {"min": 760000, "max": 1000000, "rate": 0.25},
    {"min": 1000000, "max": null, "rate": 0.30}
  ],
  "description": "0% up to TZS 270,000, then 8%, 20%, 25%, 30%"
}'::jsonb, 0, false, 100, '2025-01-01'),

-- Nigeria statutory deductions
('NG', 'PENSION_NG', 'Pension Contribution', 'Contributory Pension Scheme (8% employee, 10% employer)', 'statutory', 'percentage',
'{
  "type": "percentage",
  "rate": 0.08,
  "basis": "gross",
  "description": "8% of gross salary"
}'::jsonb, 0.10, true, 10, '2025-01-01'),

('NG', 'NHF', 'National Housing Fund', 'National Housing Fund contribution (2.5% of basic)', 'statutory', 'percentage',
'{
  "type": "percentage",
  "rate": 0.025,
  "basis": "basic",
  "description": "2.5% of basic salary"
}'::jsonb, 0, true, 20, '2025-01-01'),

('NG', 'PAYE_NG', 'PAYE (Income Tax)', 'Pay As You Earn tax for Nigeria', 'statutory', 'tiered',
'{
  "type": "tiered",
  "basis": "taxable",
  "personalRelief": 0,
  "consolidatedRelief": 0.20,
  "bands": [
    {"min": 0, "max": 300000, "rate": 0.07},
    {"min": 300000, "max": 600000, "rate": 0.11},
    {"min": 600000, "max": 1100000, "rate": 0.15},
    {"min": 1100000, "max": 1600000, "rate": 0.19},
    {"min": 1600000, "max": 3200000, "rate": 0.21},
    {"min": 3200000, "max": null, "rate": 0.24}
  ],
  "description": "7% to 24% based on income bands"
}'::jsonb, 0, false, 100, '2025-01-01'),

-- Ghana statutory deductions
('GH', 'SSNIT', 'SSNIT Contribution', 'Social Security and National Insurance Trust (5.5% employee, 13% employer)', 'statutory', 'percentage',
'{
  "type": "percentage",
  "rate": 0.055,
  "basis": "gross",
  "description": "5.5% of gross salary"
}'::jsonb, 0.13, true, 10, '2025-01-01'),

('GH', 'PAYE_GH', 'PAYE (Income Tax)', 'Pay As You Earn tax for Ghana', 'statutory', 'tiered',
'{
  "type": "tiered",
  "basis": "taxable",
  "personalRelief": 0,
  "bands": [
    {"min": 0, "max": 490, "rate": 0},
    {"min": 490, "max": 600, "rate": 0.05},
    {"min": 600, "max": 730, "rate": 0.10},
    {"min": 730, "max": 3896.67, "rate": 0.175},
    {"min": 3896.67, "max": 20000, "rate": 0.25},
    {"min": 20000, "max": 50000, "rate": 0.30},
    {"min": 50000, "max": null, "rate": 0.35}
  ],
  "description": "0% to 35% based on monthly income bands"
}'::jsonb, 0, false, 100, '2025-01-01'),

-- South Africa statutory deductions
('ZA', 'UIF', 'UIF Contribution', 'Unemployment Insurance Fund (1% employee, 1% employer)', 'statutory', 'percentage',
'{
  "type": "percentage",
  "rate": 0.01,
  "basis": "gross",
  "maxContribution": 177.12,
  "description": "1% of gross salary, capped at R177.12"
}'::jsonb, 0.01, false, 10, '2025-01-01'),

('ZA', 'PAYE_ZA', 'PAYE (Income Tax)', 'Pay As You Earn tax for South Africa', 'statutory', 'tiered',
'{
  "type": "tiered",
  "basis": "taxable",
  "annualized": true,
  "rebates": {"primary": 17235, "secondary": 9444, "tertiary": 3145},
  "bands": [
    {"min": 0, "max": 237100, "rate": 0.18},
    {"min": 237100, "max": 370500, "rate": 0.26},
    {"min": 370500, "max": 512800, "rate": 0.31},
    {"min": 512800, "max": 673000, "rate": 0.36},
    {"min": 673000, "max": 857900, "rate": 0.39},
    {"min": 857900, "max": 1817000, "rate": 0.41},
    {"min": 1817000, "max": null, "rate": 0.45}
  ],
  "description": "18% to 45% based on annual income"
}'::jsonb, 0, false, 100, '2025-01-01'),

-- Rwanda statutory deductions
('RW', 'RSSB_PENSION', 'RSSB Pension', 'Rwanda Social Security Board Pension (6% employee, 6% employer)', 'statutory', 'percentage',
'{
  "type": "percentage",
  "rate": 0.06,
  "basis": "gross",
  "description": "6% of gross salary"
}'::jsonb, 0.06, true, 10, '2025-01-01'),

('RW', 'MATERNITY_LEAVE', 'Maternity Leave', 'Maternity Leave contribution (0.6% employer only)', 'statutory', 'percentage',
'{
  "type": "percentage",
  "rate": 0,
  "basis": "gross",
  "description": "0.6% employer contribution"
}'::jsonb, 0.006, false, 20, '2025-01-01'),

('RW', 'PAYE_RW', 'PAYE (Income Tax)', 'Pay As You Earn tax for Rwanda', 'statutory', 'tiered',
'{
  "type": "tiered",
  "basis": "taxable",
  "personalRelief": 0,
  "bands": [
    {"min": 0, "max": 60000, "rate": 0},
    {"min": 60000, "max": 100000, "rate": 0.20},
    {"min": 100000, "max": null, "rate": 0.30}
  ],
  "description": "0% up to RWF 60,000, 20% to 100,000, 30% above"
}'::jsonb, 0, false, 100, '2025-01-01');

-- Add trigger to update updated_at
CREATE TRIGGER update_payroll_country_templates_updated_at
BEFORE UPDATE ON public.payroll_country_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();