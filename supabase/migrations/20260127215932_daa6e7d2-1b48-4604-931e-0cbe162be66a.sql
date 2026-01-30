-- Migration 1: Add AGRI (Agriculture) strands for Grade 7-9
-- 9 new strands total (3 per grade)

INSERT INTO cbc_strands (subject_code, level, strand_number, name, description, suggested_time_allocation)
VALUES 
  -- Grade 7
  ('AGRI', 'grade_7', 1, 'Crop Production', 'Advanced crop production techniques including land preparation, planting, crop management, and harvesting methods for various crops', '2 hours per week'),
  ('AGRI', 'grade_7', 2, 'Animal Production', 'Livestock management covering animal nutrition, housing, health care, and breeding practices for common farm animals', '2 hours per week'),
  ('AGRI', 'grade_7', 3, 'Agricultural Economics', 'Introduction to farm economics including record keeping, budgeting, marketing, and value addition in agriculture', '2 hours per week'),
  
  -- Grade 8
  ('AGRI', 'grade_8', 1, 'Soil Science', 'Study of soil types, soil fertility, soil conservation, and sustainable soil management practices', '2 hours per week'),
  ('AGRI', 'grade_8', 2, 'Farm Mechanization', 'Introduction to farm tools, equipment, machinery, and technology used in modern agriculture', '2 hours per week'),
  ('AGRI', 'grade_8', 3, 'Agribusiness', 'Agricultural entrepreneurship including business planning, marketing strategies, and agricultural value chains', '2 hours per week'),
  
  -- Grade 9
  ('AGRI', 'grade_9', 1, 'Agricultural Technology', 'Modern agricultural technologies including irrigation systems, greenhouse farming, and precision agriculture', '2 hours per week'),
  ('AGRI', 'grade_9', 2, 'Sustainable Agriculture', 'Environmental conservation in agriculture, organic farming, and climate-smart agricultural practices', '2 hours per week'),
  ('AGRI', 'grade_9', 3, 'Agricultural Entrepreneurship', 'Developing agricultural enterprises, accessing markets, and creating employment through agriculture', '2 hours per week');

-- Migration 2: Add HE (Home Science) strands for Grade 7-9
-- 9 new strands total (3 per grade)

INSERT INTO cbc_strands (subject_code, level, strand_number, name, description, suggested_time_allocation)
VALUES 
  -- Grade 7
  ('HE', 'grade_7', 1, 'Nutrition and Food Science', 'Advanced nutrition concepts including food groups, nutrients, meal planning, and dietary requirements', '2 hours per week'),
  ('HE', 'grade_7', 2, 'Textile Technology', 'Introduction to textiles, fabric construction, fabric care, and basic garment construction techniques', '2 hours per week'),
  ('HE', 'grade_7', 3, 'Consumer Studies', 'Consumer rights, responsibilities, and skills for making informed purchasing decisions', '2 hours per week'),
  
  -- Grade 8
  ('HE', 'grade_8', 1, 'Food Production', 'Advanced food preparation techniques, food preservation methods, and food safety practices', '2 hours per week'),
  ('HE', 'grade_8', 2, 'Fashion and Design', 'Clothing design principles, pattern making, garment construction, and fashion trends', '2 hours per week'),
  ('HE', 'grade_8', 3, 'Home Management', 'Household organization, time management, resource management, and family budgeting', '2 hours per week'),
  
  -- Grade 9
  ('HE', 'grade_9', 1, 'Hospitality', 'Introduction to hospitality industry including catering, customer service, and event management', '2 hours per week'),
  ('HE', 'grade_9', 2, 'Entrepreneurship in Home Science', 'Starting and managing home-based businesses, marketing home science products and services', '2 hours per week'),
  ('HE', 'grade_9', 3, 'Family Resource Management', 'Managing family resources, child care, elderly care, and work-life balance', '2 hours per week');