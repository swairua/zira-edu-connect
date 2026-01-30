-- Social Studies (SST) Sub-strands for Grade 4-9

-- Grade 4 Social Studies
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Our County', 
  '["Identify features of our county", "Describe economic activities in the county", "Explain the importance of county resources"]'::jsonb,
  '["What makes our county special?"]'::jsonb,
  ARRAY['citizenship', 'communication']::cbc_competency[],
  ARRAY['patriotism', 'unity']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_4' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'County Government', 
  '["Describe structure of county government", "Identify roles of county leaders", "Explain importance of civic participation"]'::jsonb,
  '["How is our county governed?"]'::jsonb,
  ARRAY['citizenship', 'critical_thinking']::cbc_competency[],
  ARRAY['patriotism', 'responsibility', 'integrity']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_4' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Map Reading Skills', 
  '["Interpret map symbols and keys", "Use cardinal directions", "Calculate distances using scale"]'::jsonb,
  '["How do we read and use maps?"]'::jsonb,
  ARRAY['critical_thinking', 'digital_literacy']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_4' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Physical Features', 
  '["Identify major physical features in Kenya", "Describe formation of landforms", "Explain influence of physical features on human activities"]'::jsonb,
  '["How do physical features affect our lives?"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'patriotism']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_4' AND strand_number = 2;

-- Grade 5 Social Studies
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Kenya Our Homeland', 
  '["Describe location of Kenya", "Identify neighboring countries", "Explain Kenyas position in Africa and the world"]'::jsonb,
  '["Where is Kenya located?", "Who are our neighbors?"]'::jsonb,
  ARRAY['citizenship', 'communication']::cbc_competency[],
  ARRAY['patriotism', 'unity']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_5' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'National Government', 
  '["Describe structure of national government", "Explain separation of powers", "Identify roles of government branches"]'::jsonb,
  '["How is Kenya governed?"]'::jsonb,
  ARRAY['citizenship', 'critical_thinking']::cbc_competency[],
  ARRAY['patriotism', 'integrity', 'responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_5' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Climate and Weather', 
  '["Differentiate between weather and climate", "Describe climatic regions of Kenya", "Explain effects of climate on activities"]'::jsonb,
  '["How does climate affect our lives?"]'::jsonb,
  ARRAY['critical_thinking', 'digital_literacy']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_5' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Natural Resources', 
  '["Identify natural resources in Kenya", "Describe uses of natural resources", "Explain importance of resource conservation"]'::jsonb,
  '["What resources does Kenya have?", "How can we conserve them?"]'::jsonb,
  ARRAY['citizenship', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'patriotism']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_5' AND strand_number = 2;

-- Grade 6 Social Studies
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Democracy and Human Rights', 
  '["Define democracy and its principles", "Identify human rights", "Explain importance of respecting rights"]'::jsonb,
  '["What is democracy?", "What are our rights?"]'::jsonb,
  ARRAY['citizenship', 'communication']::cbc_competency[],
  ARRAY['social_justice', 'respect', 'integrity']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_6' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'National Symbols and Unity', 
  '["Identify national symbols", "Explain meaning of national symbols", "Describe activities that promote national unity"]'::jsonb,
  '["What do our national symbols represent?"]'::jsonb,
  ARRAY['citizenship', 'communication']::cbc_competency[],
  ARRAY['patriotism', 'unity', 'peace']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_6' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Economic Activities', 
  '["Identify major economic activities in Kenya", "Describe factors influencing economic activities", "Explain contribution to national economy"]'::jsonb,
  '["How do people earn a living in Kenya?"]'::jsonb,
  ARRAY['critical_thinking', 'creativity']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_6' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Trade and Commerce', 
  '["Describe internal and external trade", "Identify trading partners", "Explain importance of trade"]'::jsonb,
  '["Why is trade important?"]'::jsonb,
  ARRAY['critical_thinking', 'digital_literacy']::cbc_competency[],
  ARRAY['integrity', 'responsibility']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_6' AND strand_number = 2;

-- Grade 7 Social Studies
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Africa: The Continent', 
  '["Describe Africas physical features", "Identify African countries and capitals", "Explain Africas position in the world"]'::jsonb,
  '["What makes Africa unique?"]'::jsonb,
  ARRAY['citizenship', 'communication']::cbc_competency[],
  ARRAY['patriotism', 'unity']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_7' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'African History', 
  '["Describe early African civilizations", "Explain colonization and its effects", "Analyze independence movements"]'::jsonb,
  '["How did Africa become what it is today?"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['patriotism', 'social_justice']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_7' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Regional Organizations', 
  '["Identify regional organizations (AU, EAC)", "Describe objectives of regional bodies", "Explain benefits of regional cooperation"]'::jsonb,
  '["Why do African countries work together?"]'::jsonb,
  ARRAY['citizenship', 'critical_thinking']::cbc_competency[],
  ARRAY['unity', 'peace', 'patriotism']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_7' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Population and Urbanization', 
  '["Describe population distribution in Africa", "Explain causes and effects of urbanization", "Analyze population challenges"]'::jsonb,
  '["Why are cities growing so fast?"]'::jsonb,
  ARRAY['critical_thinking', 'citizenship']::cbc_competency[],
  ARRAY['responsibility', 'social_justice']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_7' AND strand_number = 2;

-- Grade 8 Social Studies
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'World Geography', 
  '["Describe major world regions", "Identify continents and oceans", "Explain global physical features"]'::jsonb,
  '["How is the world organized geographically?"]'::jsonb,
  ARRAY['communication', 'digital_literacy']::cbc_competency[],
  ARRAY['respect', 'peace']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_8' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'World Cultures', 
  '["Describe major world cultures", "Explain cultural diversity", "Analyze cultural interactions"]'::jsonb,
  '["What can we learn from other cultures?"]'::jsonb,
  ARRAY['communication', 'citizenship']::cbc_competency[],
  ARRAY['respect', 'unity', 'peace']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_8' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'International Organizations', 
  '["Identify major international organizations (UN)", "Describe roles of international bodies", "Explain Kenyas participation in global affairs"]'::jsonb,
  '["How do countries work together globally?"]'::jsonb,
  ARRAY['citizenship', 'critical_thinking']::cbc_competency[],
  ARRAY['peace', 'unity', 'social_justice']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_8' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Global Challenges', 
  '["Identify global challenges (climate change, poverty)", "Analyze causes and effects of global issues", "Propose solutions to global problems"]'::jsonb,
  '["What challenges does the world face?"]'::jsonb,
  ARRAY['critical_thinking', 'citizenship']::cbc_competency[],
  ARRAY['responsibility', 'social_justice', 'peace']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_8' AND strand_number = 2;

-- Grade 9 Social Studies
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Globalization', 
  '["Define globalization", "Describe effects of globalization on Kenya", "Analyze benefits and challenges of globalization"]'::jsonb,
  '["How is the world becoming interconnected?"]'::jsonb,
  ARRAY['critical_thinking', 'digital_literacy']::cbc_competency[],
  ARRAY['responsibility', 'patriotism']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_9' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Sustainable Development', 
  '["Define sustainable development", "Describe SDGs", "Propose ways to achieve sustainability"]'::jsonb,
  '["How can we develop without harming future generations?"]'::jsonb,
  ARRAY['citizenship', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'social_justice', 'patriotism']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_9' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Entrepreneurship', 
  '["Define entrepreneurship", "Identify characteristics of entrepreneurs", "Develop basic business plans"]'::jsonb,
  '["How can we create job opportunities?"]'::jsonb,
  ARRAY['creativity', 'self_efficacy']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_9' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Career Guidance', 
  '["Identify career options", "Describe pathways to different careers", "Set personal career goals"]'::jsonb,
  '["What career is right for me?"]'::jsonb,
  ARRAY['self_efficacy', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SST' AND level = 'grade_9' AND strand_number = 2;