-- Add sub-strands for strands that have NONE
-- These are the newly created strands from today's migrations

-- AGRI Grade 7 sub-strands
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count)
VALUES
  -- Crop Production (Grade 7)
  ('e23d87d0-801a-40e4-98e6-76b1794aef42', 1, 'Cereals and Legumes', 
   '["Identify different cereal crops", "Explain cultivation practices for cereals", "Describe post-harvest handling of cereals"]'::jsonb,
   '["What cereals grow best in our region?", "How do we grow and store cereals?"]'::jsonb,
   ARRAY['critical_thinking', 'creativity']::cbc_competency[],
   ARRAY['responsibility', 'patriotism']::cbc_value[], 6),
  ('e23d87d0-801a-40e4-98e6-76b1794aef42', 2, 'Vegetables and Fruits', 
   '["Identify common vegetables and fruits", "Explain growing techniques", "Demonstrate harvesting methods"]'::jsonb,
   '["How do we grow vegetables and fruits?"]'::jsonb,
   ARRAY['learning_to_learn', 'self_efficacy']::cbc_competency[],
   ARRAY['responsibility', 'love']::cbc_value[], 5),
   
  -- Animal Production (Grade 7)
  ('51dbafc9-8c58-4189-99bd-ddce3ff95272', 1, 'Poultry Keeping', 
   '["Identify types of poultry", "Explain poultry management practices", "Describe poultry housing requirements"]'::jsonb,
   '["How do we raise poultry successfully?"]'::jsonb,
   ARRAY['critical_thinking', 'self_efficacy']::cbc_competency[],
   ARRAY['responsibility', 'love']::cbc_value[], 6),
  ('51dbafc9-8c58-4189-99bd-ddce3ff95272', 2, 'Rabbit Keeping', 
   '["Explain rabbit housing and feeding", "Describe rabbit breeds", "Demonstrate rabbit handling"]'::jsonb,
   '["What are the benefits of rabbit keeping?"]'::jsonb,
   ARRAY['learning_to_learn', 'creativity']::cbc_competency[],
   ARRAY['responsibility', 'integrity']::cbc_value[], 5),
   
  -- Agricultural Economics (Grade 7)
  ('36b3dc56-716c-488f-b301-a9899d33b387', 1, 'Farm Records', 
   '["Identify types of farm records", "Explain importance of record keeping", "Maintain simple farm records"]'::jsonb,
   '["Why is record keeping important in farming?"]'::jsonb,
   ARRAY['digital_literacy', 'critical_thinking']::cbc_competency[],
   ARRAY['responsibility', 'integrity']::cbc_value[], 5),
  ('36b3dc56-716c-488f-b301-a9899d33b387', 2, 'Basic Farm Budgeting', 
   '["Explain farm budgeting concepts", "Prepare simple farm budgets", "Calculate farm profits"]'::jsonb,
   '["How do farmers plan their finances?"]'::jsonb,
   ARRAY['critical_thinking', 'learning_to_learn']::cbc_competency[],
   ARRAY['responsibility', 'integrity']::cbc_value[], 5),

  -- AGRI Grade 8 sub-strands
  -- Soil Science (Grade 8)
  ('266231e9-825a-4526-b8b3-24834ea0d461', 1, 'Soil Types and Properties', 
   '["Identify different soil types", "Explain soil properties", "Analyze soil samples"]'::jsonb,
   '["What makes soils different?"]'::jsonb,
   ARRAY['critical_thinking', 'learning_to_learn']::cbc_competency[],
   ARRAY['responsibility', 'love']::cbc_value[], 6),
  ('266231e9-825a-4526-b8b3-24834ea0d461', 2, 'Soil Conservation', 
   '["Explain soil degradation causes", "Describe soil conservation methods", "Practice soil conservation"]'::jsonb,
   '["How can we protect our soils?"]'::jsonb,
   ARRAY['citizenship', 'self_efficacy']::cbc_competency[],
   ARRAY['responsibility', 'patriotism']::cbc_value[], 5),
   
  -- Farm Mechanization (Grade 8)
  ('e6b02748-37b2-466e-83f5-9f18702abccf', 1, 'Farm Tools and Equipment', 
   '["Identify farm tools and equipment", "Explain uses of different tools", "Demonstrate proper tool maintenance"]'::jsonb,
   '["What tools do modern farmers use?"]'::jsonb,
   ARRAY['critical_thinking', 'self_efficacy']::cbc_competency[],
   ARRAY['responsibility', 'integrity']::cbc_value[], 6),
  ('e6b02748-37b2-466e-83f5-9f18702abccf', 2, 'Farm Machinery', 
   '["Identify common farm machinery", "Explain machinery operations", "Describe machinery safety"]'::jsonb,
   '["How does machinery improve farming?"]'::jsonb,
   ARRAY['digital_literacy', 'learning_to_learn']::cbc_competency[],
   ARRAY['responsibility', 'integrity']::cbc_value[], 5),
   
  -- Agribusiness (Grade 8)
  ('5a0031d1-20dd-4a16-9f88-72b08a1229e2', 1, 'Marketing Agricultural Products', 
   '["Explain marketing concepts", "Identify marketing channels", "Describe pricing strategies"]'::jsonb,
   '["How do farmers sell their products?"]'::jsonb,
   ARRAY['communication', 'critical_thinking']::cbc_competency[],
   ARRAY['integrity', 'responsibility']::cbc_value[], 6),
  ('5a0031d1-20dd-4a16-9f88-72b08a1229e2', 2, 'Value Addition', 
   '["Explain value addition in agriculture", "Identify value addition opportunities", "Process simple agricultural products"]'::jsonb,
   '["How can we add value to farm products?"]'::jsonb,
   ARRAY['creativity', 'self_efficacy']::cbc_competency[],
   ARRAY['responsibility', 'patriotism']::cbc_value[], 5),

  -- AGRI Grade 9 sub-strands
  -- Agricultural Technology (Grade 9)
  ('ac36ec5f-e468-40f4-b91c-ff43e9d106fb', 1, 'Irrigation Systems', 
   '["Identify types of irrigation systems", "Explain irrigation principles", "Design simple irrigation systems"]'::jsonb,
   '["How does irrigation improve crop production?"]'::jsonb,
   ARRAY['critical_thinking', 'creativity']::cbc_competency[],
   ARRAY['responsibility', 'love']::cbc_value[], 6),
  ('ac36ec5f-e468-40f4-b91c-ff43e9d106fb', 2, 'Greenhouse Farming', 
   '["Explain greenhouse farming principles", "Identify crops suitable for greenhouses", "Describe greenhouse management"]'::jsonb,
   '["What are the advantages of greenhouse farming?"]'::jsonb,
   ARRAY['learning_to_learn', 'digital_literacy']::cbc_competency[],
   ARRAY['responsibility', 'integrity']::cbc_value[], 5),
   
  -- Sustainable Agriculture (Grade 9)
  ('a5a27beb-cc54-4ec2-9131-c04906949e8a', 1, 'Organic Farming', 
   '["Explain organic farming principles", "Identify organic farming practices", "Compare organic and conventional farming"]'::jsonb,
   '["Why is organic farming important?"]'::jsonb,
   ARRAY['critical_thinking', 'citizenship']::cbc_competency[],
   ARRAY['responsibility', 'love']::cbc_value[], 6),
  ('a5a27beb-cc54-4ec2-9131-c04906949e8a', 2, 'Climate-Smart Agriculture', 
   '["Explain climate change effects on agriculture", "Identify adaptation strategies", "Practice climate-smart techniques"]'::jsonb,
   '["How can farmers adapt to climate change?"]'::jsonb,
   ARRAY['critical_thinking', 'self_efficacy']::cbc_competency[],
   ARRAY['responsibility', 'patriotism']::cbc_value[], 5),
   
  -- Agricultural Entrepreneurship (Grade 9)
  ('2b2de3ac-21dc-4fe7-b554-0eb633bd9f81', 1, 'Agricultural Business Planning', 
   '["Develop a business plan for farming", "Identify sources of capital", "Analyze market opportunities"]'::jsonb,
   '["How do you start an agricultural business?"]'::jsonb,
   ARRAY['critical_thinking', 'creativity']::cbc_competency[],
   ARRAY['responsibility', 'integrity']::cbc_value[], 6),
  ('2b2de3ac-21dc-4fe7-b554-0eb633bd9f81', 2, 'Youth in Agriculture', 
   '["Explore career opportunities in agriculture", "Identify success stories", "Develop entrepreneurship skills"]'::jsonb,
   '["What opportunities exist for youth in agriculture?"]'::jsonb,
   ARRAY['self_efficacy', 'communication']::cbc_competency[],
   ARRAY['patriotism', 'integrity']::cbc_value[], 5);