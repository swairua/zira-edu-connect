-- Add termly and annual pricing columns to module_pricing
ALTER TABLE module_pricing 
ADD COLUMN base_termly_price NUMERIC DEFAULT 0,
ADD COLUMN base_annual_price NUMERIC DEFAULT 0;

-- Calculate initial prices based on monthly price
-- Termly = monthly × 4 × 0.9 (10% discount for 4-month term)
-- Annual = monthly × 12 × 0.8 (20% discount for annual)
UPDATE module_pricing 
SET 
  base_termly_price = ROUND(base_monthly_price * 4 * 0.9),
  base_annual_price = ROUND(base_monthly_price * 12 * 0.8);