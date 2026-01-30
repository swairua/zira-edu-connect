-- Revised Add-on Module Pricing: Lower prices to encourage adoption
-- Target: Add-ons should be 10-25% of core renewal cost

-- HR Management: KES 28,800 → KES 9,600/year
UPDATE module_pricing SET 
  base_annual_price = 9600, 
  base_termly_price = 3600, 
  base_monthly_price = 1000,
  updated_at = now()
WHERE module_id = 'hr';

-- Transport: KES 24,000 → KES 7,200/year
UPDATE module_pricing SET 
  base_annual_price = 7200, 
  base_termly_price = 2700, 
  base_monthly_price = 750,
  updated_at = now()
WHERE module_id = 'transport';

-- Communication: KES 19,200 → KES 6,000/year
UPDATE module_pricing SET 
  base_annual_price = 6000, 
  base_termly_price = 2250, 
  base_monthly_price = 625,
  updated_at = now()
WHERE module_id = 'communication';

-- Boarding & Hostel: KES 19,200 → KES 7,200/year
UPDATE module_pricing SET 
  base_annual_price = 7200, 
  base_termly_price = 2700, 
  base_monthly_price = 750,
  updated_at = now()
WHERE module_id = 'boarding';

-- Library: KES 14,400 → KES 4,800/year
UPDATE module_pricing SET 
  base_annual_price = 4800, 
  base_termly_price = 1800, 
  base_monthly_price = 500,
  updated_at = now()
WHERE module_id = 'library';

-- Activities & Sports: KES 9,600 → KES 3,600/year
UPDATE module_pricing SET 
  base_annual_price = 3600, 
  base_termly_price = 1350, 
  base_monthly_price = 375,
  updated_at = now()
WHERE module_id = 'activities';

-- Uniform Store: KES 9,600 → KES 3,600/year
UPDATE module_pricing SET 
  base_annual_price = 3600, 
  base_termly_price = 1350, 
  base_monthly_price = 375,
  updated_at = now()
WHERE module_id = 'inventory';

-- Timetable: KES 9,600 → KES 4,800/year
UPDATE module_pricing SET 
  base_annual_price = 4800, 
  base_termly_price = 1800, 
  base_monthly_price = 500,
  updated_at = now()
WHERE module_id = 'timetable';

-- Premium Module: Advanced Reports: KES 48,000 → KES 12,000/year
UPDATE module_pricing SET 
  base_annual_price = 12000, 
  base_termly_price = 4500, 
  base_monthly_price = 1250,
  updated_at = now()
WHERE module_id = 'advanced_reports';