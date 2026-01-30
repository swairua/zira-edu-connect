-- Expand to 8 pricing tiers for better granularity
DELETE FROM pricing_tiers;

INSERT INTO pricing_tiers (tier_number, name, min_students, max_students, representative_count, description, is_popular, is_contact_sales, display_order) VALUES
(1, 'Micro',       1,    100,   75,   'Perfect for small private schools and early learning centers', false, false, 1),
(2, 'Small',       101,  250,   175,  'Ideal for growing primary schools', false, false, 2),
(3, 'Medium',      251,  450,   350,  'Most popular choice for established schools', true, false, 3),
(4, 'Standard',    451,  650,   550,  'For well-established mid-size schools', false, false, 4),
(5, 'Large',       651,  900,   775,  'For large primary and secondary schools', false, false, 5),
(6, 'Extra Large', 901,  1200,  1050, 'For major institutions with multiple streams', false, false, 6),
(7, 'Jumbo',       1201, 1800,  1500, 'For large multi-stream institutions', false, false, 7),
(8, 'Mega',        1801, -1,    2000, 'Enterprise solutions for the largest institutions', false, true, 8);