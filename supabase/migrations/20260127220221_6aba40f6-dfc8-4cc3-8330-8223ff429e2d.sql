-- Add sub-strands for HE (Home Science) Grade 7-9

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count)
VALUES
  -- HE Grade 7: Nutrition and Food Science
  ('2e98e173-b1eb-4540-a34e-4ad93332d90e', 1, 'Food Groups and Nutrients', 
   '["Classify foods into food groups", "Explain functions of nutrients", "Plan balanced meals"]'::jsonb,
   '["What makes a balanced diet?"]'::jsonb,
   ARRAY['critical_thinking', 'learning_to_learn']::cbc_competency[],
   ARRAY['responsibility', 'love']::cbc_value[], 6),
  ('2e98e173-b1eb-4540-a34e-4ad93332d90e', 2, 'Meal Planning', 
   '["Plan meals for different age groups", "Consider dietary requirements", "Budget for meals"]'::jsonb,
   '["How do we plan nutritious meals?"]'::jsonb,
   ARRAY['critical_thinking', 'creativity']::cbc_competency[],
   ARRAY['responsibility', 'integrity']::cbc_value[], 5),

  -- HE Grade 7: Textile Technology
  ('82df24b0-47b5-48be-8535-78162137431a', 1, 'Fabric Types and Properties', 
   '["Identify different fabric types", "Explain fabric properties", "Select fabrics for different uses"]'::jsonb,
   '["What fabrics are best for different purposes?"]'::jsonb,
   ARRAY['critical_thinking', 'learning_to_learn']::cbc_competency[],
   ARRAY['responsibility', 'integrity']::cbc_value[], 5),
  ('82df24b0-47b5-48be-8535-78162137431a', 2, 'Basic Sewing', 
   '["Use sewing tools safely", "Practice basic stitches", "Construct simple items"]'::jsonb,
   '["How do we sew simple items?"]'::jsonb,
   ARRAY['creativity', 'self_efficacy']::cbc_competency[],
   ARRAY['responsibility', 'integrity']::cbc_value[], 6),

  -- HE Grade 7: Consumer Studies
  ('257b110f-d7d8-47f1-9208-2a5b63de591c', 1, 'Consumer Rights and Responsibilities', 
   '["Explain consumer rights", "Describe consumer responsibilities", "Identify consumer protection agencies"]'::jsonb,
   '["What are our rights as consumers?"]'::jsonb,
   ARRAY['citizenship', 'communication']::cbc_competency[],
   ARRAY['integrity', 'responsibility']::cbc_value[], 5),
  ('257b110f-d7d8-47f1-9208-2a5b63de591c', 2, 'Smart Shopping', 
   '["Compare products before buying", "Read and interpret labels", "Make informed purchasing decisions"]'::jsonb,
   '["How can we be smart shoppers?"]'::jsonb,
   ARRAY['critical_thinking', 'digital_literacy']::cbc_competency[],
   ARRAY['responsibility', 'integrity']::cbc_value[], 5),

  -- HE Grade 8: Food Production
  ('eb53fe23-b3e1-4a08-bca8-d98cf8b52da0', 1, 'Advanced Cooking Techniques', 
   '["Apply various cooking methods", "Prepare complex dishes", "Present food attractively"]'::jsonb,
   '["How do professional chefs prepare food?"]'::jsonb,
   ARRAY['creativity', 'self_efficacy']::cbc_competency[],
   ARRAY['responsibility', 'love']::cbc_value[], 6),
  ('eb53fe23-b3e1-4a08-bca8-d98cf8b52da0', 2, 'Food Preservation', 
   '["Explain food preservation methods", "Practice safe food preservation", "Understand food safety"]'::jsonb,
   '["How can we preserve food safely?"]'::jsonb,
   ARRAY['critical_thinking', 'learning_to_learn']::cbc_competency[],
   ARRAY['responsibility', 'integrity']::cbc_value[], 5),

  -- HE Grade 8: Fashion and Design
  ('b4c691ec-ea89-43c8-afda-b4c180ae54cb', 1, 'Clothing Design Principles', 
   '["Apply design elements and principles", "Sketch clothing designs", "Select appropriate fabrics"]'::jsonb,
   '["What makes clothing well-designed?"]'::jsonb,
   ARRAY['creativity', 'critical_thinking']::cbc_competency[],
   ARRAY['integrity', 'love']::cbc_value[], 6),
  ('b4c691ec-ea89-43c8-afda-b4c180ae54cb', 2, 'Garment Construction', 
   '["Read and interpret patterns", "Construct simple garments", "Apply finishing techniques"]'::jsonb,
   '["How are garments made?"]'::jsonb,
   ARRAY['creativity', 'self_efficacy']::cbc_competency[],
   ARRAY['responsibility', 'integrity']::cbc_value[], 6),

  -- HE Grade 8: Home Management
  ('4b331454-9aef-4498-b916-d09df81c845f', 1, 'Household Organization', 
   '["Plan household activities", "Organize household resources", "Manage time effectively"]'::jsonb,
   '["How do we manage a household efficiently?"]'::jsonb,
   ARRAY['critical_thinking', 'self_efficacy']::cbc_competency[],
   ARRAY['responsibility', 'integrity']::cbc_value[], 5),
  ('4b331454-9aef-4498-b916-d09df81c845f', 2, 'Family Budgeting', 
   '["Prepare household budgets", "Track income and expenses", "Make financial decisions"]'::jsonb,
   '["How can families manage their money?"]'::jsonb,
   ARRAY['critical_thinking', 'digital_literacy']::cbc_competency[],
   ARRAY['responsibility', 'integrity']::cbc_value[], 5),

  -- HE Grade 9: Hospitality
  ('df6ff2ee-10a6-421d-8551-9d5a2b70eb3b', 1, 'Introduction to Hospitality Industry', 
   '["Describe hospitality industry sectors", "Explain career opportunities", "Demonstrate customer service skills"]'::jsonb,
   '["What careers exist in hospitality?"]'::jsonb,
   ARRAY['communication', 'self_efficacy']::cbc_competency[],
   ARRAY['respect', 'love']::cbc_value[], 6),
  ('df6ff2ee-10a6-421d-8551-9d5a2b70eb3b', 2, 'Event Management', 
   '["Plan simple events", "Organize catering services", "Manage event logistics"]'::jsonb,
   '["How do we plan successful events?"]'::jsonb,
   ARRAY['creativity', 'critical_thinking']::cbc_competency[],
   ARRAY['responsibility', 'integrity']::cbc_value[], 5),

  -- HE Grade 9: Entrepreneurship in Home Science
  ('3efd5594-70e6-48d6-9357-044943b54f45', 1, 'Home-Based Business Ideas', 
   '["Identify business opportunities", "Evaluate business ideas", "Develop a business plan"]'::jsonb,
   '["What home-based businesses can we start?"]'::jsonb,
   ARRAY['creativity', 'critical_thinking']::cbc_competency[],
   ARRAY['responsibility', 'integrity']::cbc_value[], 6),
  ('3efd5594-70e6-48d6-9357-044943b54f45', 2, 'Marketing Home Science Products', 
   '["Develop marketing strategies", "Price products competitively", "Build customer relationships"]'::jsonb,
   '["How do we market our products?"]'::jsonb,
   ARRAY['communication', 'self_efficacy']::cbc_competency[],
   ARRAY['integrity', 'responsibility']::cbc_value[], 5),

  -- HE Grade 9: Family Resource Management
  ('93bc99ba-2223-4c0c-8812-003a6de30bb6', 1, 'Managing Family Resources', 
   '["Identify family resources", "Prioritize resource allocation", "Maximize resource utilization"]'::jsonb,
   '["How can families manage their resources?"]'::jsonb,
   ARRAY['critical_thinking', 'self_efficacy']::cbc_competency[],
   ARRAY['responsibility', 'love']::cbc_value[], 5),
  ('93bc99ba-2223-4c0c-8812-003a6de30bb6', 2, 'Child and Elderly Care', 
   '["Explain child development stages", "Describe elderly care needs", "Demonstrate care practices"]'::jsonb,
   '["How do we care for family members?"]'::jsonb,
   ARRAY['learning_to_learn', 'citizenship']::cbc_competency[],
   ARRAY['love', 'respect']::cbc_value[], 6);