-- Fix module pricing with correct module_ids

-- Boarding & Hostel: KES 19,200 → KES 7,200/year (module_id is 'hostel' not 'boarding')
UPDATE module_pricing SET 
  base_annual_price = 7200, 
  base_termly_price = 2700, 
  base_monthly_price = 750,
  updated_at = now()
WHERE module_id = 'hostel';

-- Uniform Store: KES 9,600 → KES 3,600/year (module_id is 'uniforms' not 'inventory')
UPDATE module_pricing SET 
  base_annual_price = 3600, 
  base_termly_price = 1350, 
  base_monthly_price = 375,
  updated_at = now()
WHERE module_id = 'uniforms';

-- Advanced Reports: KES 48,000 → KES 12,000/year (module_id is 'reports' not 'advanced_reports')
UPDATE module_pricing SET 
  base_annual_price = 12000, 
  base_termly_price = 4500, 
  base_monthly_price = 1250,
  updated_at = now()
WHERE module_id = 'reports';