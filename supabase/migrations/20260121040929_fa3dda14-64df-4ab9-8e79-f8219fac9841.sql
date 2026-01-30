-- Add formula-based pricing columns to billing_settings
ALTER TABLE billing_settings 
ADD COLUMN IF NOT EXISTS tier_base_setup_fee NUMERIC(12,2) DEFAULT 15000,
ADD COLUMN IF NOT EXISTS tier_per_learner_setup NUMERIC(12,2) DEFAULT 100,
ADD COLUMN IF NOT EXISTS tier_base_annual_fee NUMERIC(12,2) DEFAULT 12000,
ADD COLUMN IF NOT EXISTS tier_per_learner_annual NUMERIC(12,2) DEFAULT 50,
ADD COLUMN IF NOT EXISTS tier_private_multiplier NUMERIC(4,2) DEFAULT 1.25;

-- Add comment for documentation
COMMENT ON COLUMN billing_settings.tier_base_setup_fee IS 'Base setup fee in KES (one-time)';
COMMENT ON COLUMN billing_settings.tier_per_learner_setup IS 'Per-learner setup fee in KES';
COMMENT ON COLUMN billing_settings.tier_base_annual_fee IS 'Base annual subscription fee in KES';
COMMENT ON COLUMN billing_settings.tier_per_learner_annual IS 'Per-learner annual fee in KES';
COMMENT ON COLUMN billing_settings.tier_private_multiplier IS 'Multiplier for private schools (e.g., 1.25 = 25% premium)';