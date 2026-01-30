-- Agriculture (AGRI) Sub-strands for Grade 4-6 and Home Science (HE) Sub-strands for Grade 4-6

-- Grade 4 Agriculture
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Soil and Its Types', 
  '["Identify types of soil", "Describe soil properties", "Test soil for farming suitability"]'::jsonb,
  '["What is soil?", "Why is soil important for farming?"]'::jsonb,
  ARRAY['critical_thinking', 'creativity']::cbc_competency[],
  ARRAY['responsibility', 'patriotism']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'AGRI' AND level = 'grade_4' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'School Garden', 
  '["Establish a school garden", "Plant and care for crops", "Maintain garden plots"]'::jsonb,
  '["How do we start a garden?"]'::jsonb,
  ARRAY['self_efficacy', 'creativity']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'AGRI' AND level = 'grade_4' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Farm Tools', 
  '["Identify common farm tools", "Use tools safely", "Maintain farm equipment"]'::jsonb,
  '["What tools do farmers use?"]'::jsonb,
  ARRAY['critical_thinking', 'self_efficacy']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'AGRI' AND level = 'grade_4' AND strand_number = 2;

-- Grade 5 Agriculture
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Crop Production', 
  '["Select appropriate crops", "Prepare land for planting", "Apply crop husbandry practices"]'::jsonb,
  '["How do we grow crops successfully?"]'::jsonb,
  ARRAY['critical_thinking', 'creativity']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'AGRI' AND level = 'grade_5' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Water for Farming', 
  '["Identify water sources for farming", "Practice water conservation", "Apply simple irrigation methods"]'::jsonb,
  '["Why is water important for farming?"]'::jsonb,
  ARRAY['citizenship', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'patriotism']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'AGRI' AND level = 'grade_5' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Small Animals', 
  '["Identify small farm animals", "Care for poultry and rabbits", "Understand animal housing"]'::jsonb,
  '["How do we keep small animals?"]'::jsonb,
  ARRAY['self_efficacy', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'AGRI' AND level = 'grade_5' AND strand_number = 2;

-- Grade 6 Agriculture
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Crop Pests and Diseases', 
  '["Identify common crop pests", "Describe crop diseases", "Apply pest control methods"]'::jsonb,
  '["How do we protect crops from pests?"]'::jsonb,
  ARRAY['critical_thinking', 'creativity']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'AGRI' AND level = 'grade_6' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Organic Farming', 
  '["Understand organic farming principles", "Make compost", "Practice sustainable agriculture"]'::jsonb,
  '["What is organic farming?"]'::jsonb,
  ARRAY['citizenship', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'patriotism', 'social_justice']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'AGRI' AND level = 'grade_6' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Farm Records', 
  '["Keep simple farm records", "Calculate basic farm costs", "Evaluate farm productivity"]'::jsonb,
  '["Why do farmers keep records?"]'::jsonb,
  ARRAY['digital_literacy', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'AGRI' AND level = 'grade_6' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Marketing Farm Products', 
  '["Identify markets for products", "Package farm products", "Understand pricing"]'::jsonb,
  '["How do farmers sell their products?"]'::jsonb,
  ARRAY['creativity', 'communication']::cbc_competency[],
  ARRAY['integrity', 'responsibility']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'AGRI' AND level = 'grade_6' AND strand_number = 2;

-- Grade 4 Home Science
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Personal Hygiene', 
  '["Practice good hygiene habits", "Identify hygiene products", "Maintain cleanliness"]'::jsonb,
  '["Why is hygiene important?"]'::jsonb,
  ARRAY['self_efficacy', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'HE' AND level = 'grade_4' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Basic Nutrition', 
  '["Identify food groups", "Plan balanced meals", "Understand nutrient functions"]'::jsonb,
  '["What should we eat to stay healthy?"]'::jsonb,
  ARRAY['critical_thinking', 'self_efficacy']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'HE' AND level = 'grade_4' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Kitchen Safety', 
  '["Identify kitchen hazards", "Practice safe cooking", "Handle equipment safely"]'::jsonb,
  '["How do we stay safe in the kitchen?"]'::jsonb,
  ARRAY['self_efficacy', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'HE' AND level = 'grade_4' AND strand_number = 2;

-- Grade 5 Home Science
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Food Preparation', 
  '["Prepare simple dishes", "Use basic cooking methods", "Practice food hygiene"]'::jsonb,
  '["How do we prepare food?"]'::jsonb,
  ARRAY['creativity', 'self_efficacy']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'HE' AND level = 'grade_5' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Food Preservation', 
  '["Identify preservation methods", "Preserve food safely", "Store food properly"]'::jsonb,
  '["How do we keep food fresh?"]'::jsonb,
  ARRAY['critical_thinking', 'creativity']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'HE' AND level = 'grade_5' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Basic Sewing', 
  '["Thread a needle", "Make basic stitches", "Repair simple tears"]'::jsonb,
  '["How do we sew?"]'::jsonb,
  ARRAY['creativity', 'self_efficacy']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'HE' AND level = 'grade_5' AND strand_number = 2;

-- Grade 6 Home Science
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Meal Planning', 
  '["Plan nutritious meals", "Consider dietary needs", "Budget for meals"]'::jsonb,
  '["How do we plan healthy meals?"]'::jsonb,
  ARRAY['critical_thinking', 'creativity']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'HE' AND level = 'grade_6' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Baking', 
  '["Measure ingredients accurately", "Bake simple items", "Decorate baked goods"]'::jsonb,
  '["How do we bake?"]'::jsonb,
  ARRAY['creativity', 'self_efficacy']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'HE' AND level = 'grade_6' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Home Management', 
  '["Organize living spaces", "Manage household resources", "Create cleaning schedules"]'::jsonb,
  '["How do we manage a home?"]'::jsonb,
  ARRAY['self_efficacy', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'HE' AND level = 'grade_6' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Clothing Care', 
  '["Wash and dry clothes properly", "Iron clothes safely", "Store clothes correctly"]'::jsonb,
  '["How do we take care of clothes?"]'::jsonb,
  ARRAY['self_efficacy', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'HE' AND level = 'grade_6' AND strand_number = 2;