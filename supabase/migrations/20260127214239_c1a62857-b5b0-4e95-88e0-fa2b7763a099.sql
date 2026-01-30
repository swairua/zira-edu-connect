-- Migration 1: SST (Social Studies) Sub-strands for 18 missing strands

-- PP1 Strand #3: Environment
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Our Immediate Environment', 
  '["Identify features in immediate environment", "Name things found at home and school", "Appreciate our surroundings"]'::jsonb,
  '["What do we see around us?"]'::jsonb,
  ARRAY['communication', 'citizenship']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 4, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'pp1' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Caring for Our Surroundings', 
  '["Keep environment clean", "Dispose waste properly", "Care for plants and animals"]'::jsonb,
  '["How do we take care of our environment?"]'::jsonb,
  ARRAY['citizenship', 'self_efficacy']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 4, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'pp1' AND strand_number = 3;

-- PP2 Strand #3: Environment
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Weather and Seasons', 
  '["Observe daily weather", "Identify different seasons", "Describe weather changes"]'::jsonb,
  '["What is the weather like today?"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'pp2' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Plants and Animals Around Us', 
  '["Identify common plants", "Name domestic animals", "Describe how we use plants and animals"]'::jsonb,
  '["What plants and animals live near us?"]'::jsonb,
  ARRAY['communication', 'citizenship']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'pp2' AND strand_number = 3;

-- Grade 1 Strand #3: Environment
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Natural and Built Environment', 
  '["Distinguish natural from built features", "Identify natural resources", "Describe human-made structures"]'::jsonb,
  '["What is natural? What is made by people?"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'patriotism']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_1' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Environmental Conservation', 
  '["Practice waste management", "Plant and care for trees", "Conserve water"]'::jsonb,
  '["How can we protect our environment?"]'::jsonb,
  ARRAY['citizenship', 'self_efficacy']::cbc_competency[],
  ARRAY['responsibility', 'patriotism']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_1' AND strand_number = 3;

-- Grade 2 Strand #3: Environment
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Water Sources and Uses', 
  '["Identify sources of water", "Describe uses of water", "Practice water conservation"]'::jsonb,
  '["Where does water come from?"]'::jsonb,
  ARRAY['critical_thinking', 'citizenship']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_2' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Soil and Land Use', 
  '["Identify types of soil", "Describe land uses", "Explain importance of soil"]'::jsonb,
  '["Why is soil important?"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'patriotism']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_2' AND strand_number = 3;

-- Grade 3 Strand #3: Environment / Strand #4: History
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Forests and Wildlife', 
  '["Identify major forests in Kenya", "Name common wild animals", "Explain importance of wildlife"]'::jsonb,
  '["Why are forests and wildlife important?"]'::jsonb,
  ARRAY['critical_thinking', 'citizenship']::cbc_competency[],
  ARRAY['responsibility', 'patriotism']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_3' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Pollution and Conservation', 
  '["Identify types of pollution", "Describe effects of pollution", "Practice conservation measures"]'::jsonb,
  '["How does pollution affect us?"]'::jsonb,
  ARRAY['citizenship', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'social_justice']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_3' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Family History', 
  '["Trace family lineage", "Narrate family stories", "Appreciate family heritage"]'::jsonb,
  '["Where did our families come from?"]'::jsonb,
  ARRAY['communication', 'citizenship']::cbc_competency[],
  ARRAY['love', 'unity', 'respect']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_3' AND strand_number = 4;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Community Stories', 
  '["Collect community oral traditions", "Narrate local legends", "Appreciate cultural heritage"]'::jsonb,
  '["What stories does our community tell?"]'::jsonb,
  ARRAY['communication', 'citizenship']::cbc_competency[],
  ARRAY['patriotism', 'unity', 'respect']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_3' AND strand_number = 4;

-- Grade 4 Strand #3: Citizenship
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Rights and Responsibilities', 
  '["Identify childrens rights", "Describe citizen responsibilities", "Practice responsible citizenship"]'::jsonb,
  '["What are our rights and duties?"]'::jsonb,
  ARRAY['citizenship', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'social_justice', 'integrity']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_4' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Good Governance', 
  '["Describe democratic governance", "Identify leaders and their roles", "Explain importance of good leadership"]'::jsonb,
  '["What makes a good leader?"]'::jsonb,
  ARRAY['citizenship', 'communication']::cbc_competency[],
  ARRAY['integrity', 'responsibility', 'patriotism']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_4' AND strand_number = 3;

-- Grade 5 Strand #3: Citizenship
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'The Constitution', 
  '["Explain purpose of constitution", "Identify key constitutional provisions", "Appreciate constitutional rights"]'::jsonb,
  '["What is the constitution?"]'::jsonb,
  ARRAY['citizenship', 'critical_thinking']::cbc_competency[],
  ARRAY['patriotism', 'integrity', 'social_justice']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_5' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'National Cohesion', 
  '["Describe national unity", "Identify factors that promote cohesion", "Practice tolerance and respect"]'::jsonb,
  '["How do we live together as one nation?"]'::jsonb,
  ARRAY['citizenship', 'communication']::cbc_competency[],
  ARRAY['unity', 'peace', 'respect']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_5' AND strand_number = 3;

-- Grade 6 Strand #3: Citizenship / Strand #4: History
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Devolution in Kenya', 
  '["Explain devolved government structure", "Describe functions of county government", "Appreciate benefits of devolution"]'::jsonb,
  '["How does devolution work in Kenya?"]'::jsonb,
  ARRAY['citizenship', 'critical_thinking']::cbc_competency[],
  ARRAY['patriotism', 'responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_6' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Pre-Colonial Kenya', 
  '["Describe early communities in Kenya", "Explain migration patterns", "Appreciate cultural diversity"]'::jsonb,
  '["Who lived in Kenya before colonization?"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['patriotism', 'unity', 'respect']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_6' AND strand_number = 4;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Colonial Period', 
  '["Describe establishment of colonial rule", "Explain effects of colonialism", "Analyze resistance movements"]'::jsonb,
  '["What happened during colonial times?"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['patriotism', 'social_justice']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_6' AND strand_number = 4;

-- Grade 7 Strand #3: Regional Cooperation / Strand #4: History
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'East African Community', 
  '["Describe EAC formation and objectives", "Identify member states", "Explain benefits of regional cooperation"]'::jsonb,
  '["Why do East African countries work together?"]'::jsonb,
  ARRAY['citizenship', 'critical_thinking']::cbc_competency[],
  ARRAY['unity', 'peace', 'patriotism']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_7' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'African Union', 
  '["Describe AU formation and structure", "Explain AU objectives", "Analyze Africas role in global affairs"]'::jsonb,
  '["How does Africa work together?"]'::jsonb,
  ARRAY['citizenship', 'communication']::cbc_competency[],
  ARRAY['unity', 'peace', 'patriotism']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_7' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Struggle for Independence', 
  '["Describe independence movements in Kenya", "Identify key freedom fighters", "Appreciate sacrifices for independence"]'::jsonb,
  '["How did Kenya gain independence?"]'::jsonb,
  ARRAY['critical_thinking', 'citizenship']::cbc_competency[],
  ARRAY['patriotism', 'social_justice', 'integrity']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_7' AND strand_number = 4;

-- Grade 8 Strand #3: Global Issues / Strand #4: History
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Climate Change', 
  '["Explain causes of climate change", "Describe effects on communities", "Propose mitigation strategies"]'::jsonb,
  '["How is climate change affecting us?"]'::jsonb,
  ARRAY['critical_thinking', 'citizenship']::cbc_competency[],
  ARRAY['responsibility', 'social_justice']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_8' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Resource Management', 
  '["Identify natural resources", "Explain sustainable resource use", "Analyze resource conflicts"]'::jsonb,
  '["How do we manage our resources?"]'::jsonb,
  ARRAY['critical_thinking', 'citizenship']::cbc_competency[],
  ARRAY['responsibility', 'patriotism', 'integrity']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_8' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Post-Independence Kenya', 
  '["Describe nation building efforts", "Analyze development challenges", "Appreciate progress made"]'::jsonb,
  '["How has Kenya developed since independence?"]'::jsonb,
  ARRAY['critical_thinking', 'citizenship']::cbc_competency[],
  ARRAY['patriotism', 'unity', 'integrity']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_8' AND strand_number = 4;

-- Grade 9 Strand #3: Global Citizenship / Strand #4: History
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'United Nations', 
  '["Describe UN structure and organs", "Explain UN objectives", "Analyze Kenyas role in UN"]'::jsonb,
  '["What is the United Nations?"]'::jsonb,
  ARRAY['citizenship', 'communication']::cbc_competency[],
  ARRAY['peace', 'unity', 'social_justice']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_9' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Human Rights', 
  '["Identify universal human rights", "Explain human rights mechanisms", "Advocate for rights protection"]'::jsonb,
  '["What rights do all humans have?"]'::jsonb,
  ARRAY['citizenship', 'critical_thinking']::cbc_competency[],
  ARRAY['social_justice', 'respect', 'integrity']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_9' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'African Independence Movements', 
  '["Describe independence movements across Africa", "Compare decolonization processes", "Analyze pan-African vision"]'::jsonb,
  '["How did African countries gain independence?"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['patriotism', 'unity', 'social_justice']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_9' AND strand_number = 4;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Modern African Challenges', 
  '["Identify contemporary African issues", "Analyze causes and effects", "Propose solutions"]'::jsonb,
  '["What challenges does Africa face today?"]'::jsonb,
  ARRAY['critical_thinking', 'citizenship']::cbc_competency[],
  ARRAY['responsibility', 'social_justice', 'unity']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_9' AND strand_number = 4;