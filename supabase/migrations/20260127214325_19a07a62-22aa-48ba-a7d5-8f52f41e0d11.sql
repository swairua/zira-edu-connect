-- Migration 2: SCI (Science) Sub-strands for 15 missing strands

-- PP1 Strand #3: Environment
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Plants Around Us', 
  '["Identify common plants", "Name parts of a plant", "Describe uses of plants"]'::jsonb,
  '["What plants do we see around us?"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 4, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'pp1' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Animals Around Us', 
  '["Identify common animals", "Group animals by features", "Describe animal homes"]'::jsonb,
  '["What animals live near us?"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 4, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'pp1' AND strand_number = 3;

-- PP2 Strand #3: Environment
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Weather Observation', 
  '["Observe daily weather", "Record weather conditions", "Describe weather changes"]'::jsonb,
  '["What is the weather like?"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'pp2' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Seasons and Farming', 
  '["Identify seasons", "Describe seasonal activities", "Relate weather to farming"]'::jsonb,
  '["How do seasons affect farming?"]'::jsonb,
  ARRAY['critical_thinking', 'citizenship']::cbc_competency[],
  ARRAY['responsibility', 'patriotism']::cbc_value[], 4, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'pp2' AND strand_number = 3;

-- Grade 1 Strand #3: Environment / Strand #4: Health
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Living and Non-Living Things', 
  '["Distinguish living from non-living", "Identify characteristics of living things", "Classify objects"]'::jsonb,
  '["What makes something alive?"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'respect']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_1' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Personal Hygiene', 
  '["Practice handwashing", "Maintain body cleanliness", "Care for teeth"]'::jsonb,
  '["How do we keep our bodies clean?"]'::jsonb,
  ARRAY['self_efficacy', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_1' AND strand_number = 4;

-- Grade 2 Strand #3: Environment / Strand #4: Health
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Habitats', 
  '["Identify different habitats", "Describe animals in habitats", "Explain habitat adaptation"]'::jsonb,
  '["Where do animals live?"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'respect']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_2' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Food and Nutrition', 
  '["Identify food groups", "Describe balanced diet", "Practice healthy eating"]'::jsonb,
  '["What foods keep us healthy?"]'::jsonb,
  ARRAY['self_efficacy', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_2' AND strand_number = 4;

-- Grade 3 Strand #3: Environment / Strand #4: Health
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Food Chains', 
  '["Identify producers and consumers", "Construct simple food chains", "Explain energy flow"]'::jsonb,
  '["How do living things depend on each other?"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'respect']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_3' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Environmental Protection', 
  '["Identify environmental problems", "Describe conservation methods", "Practice environmental care"]'::jsonb,
  '["How can we protect our environment?"]'::jsonb,
  ARRAY['citizenship', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'patriotism']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_3' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Common Diseases', 
  '["Identify common childhood diseases", "Describe disease prevention", "Practice healthy habits"]'::jsonb,
  '["How do we prevent diseases?"]'::jsonb,
  ARRAY['self_efficacy', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_3' AND strand_number = 4;

-- Grade 4 Strand #3: Environment / Strand #4: Energy
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Ecosystems', 
  '["Define ecosystem components", "Describe ecosystem interactions", "Explain ecosystem balance"]'::jsonb,
  '["What is an ecosystem?"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'respect']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_4' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Forms of Energy', 
  '["Identify forms of energy", "Describe energy transformations", "Apply energy concepts"]'::jsonb,
  '["What are the different forms of energy?"]'::jsonb,
  ARRAY['critical_thinking', 'creativity']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_4' AND strand_number = 4;

-- Grade 5 Strand #3: Environment / Strand #4: Energy
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Biodiversity', 
  '["Define biodiversity", "Describe importance of biodiversity", "Explain threats to biodiversity"]'::jsonb,
  '["Why is biodiversity important?"]'::jsonb,
  ARRAY['critical_thinking', 'citizenship']::cbc_competency[],
  ARRAY['responsibility', 'patriotism']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_5' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Heat Energy', 
  '["Describe heat transfer methods", "Identify conductors and insulators", "Apply heat concepts"]'::jsonb,
  '["How does heat move?"]'::jsonb,
  ARRAY['critical_thinking', 'creativity']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_5' AND strand_number = 4;

-- Grade 6 Strand #3: Environment / Strand #4: Energy
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Climate and Weather Patterns', 
  '["Differentiate climate from weather", "Describe climatic zones", "Explain climate change effects"]'::jsonb,
  '["What is the difference between weather and climate?"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'patriotism']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_6' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Renewable and Non-Renewable Energy', 
  '["Classify energy sources", "Compare renewable and non-renewable", "Advocate for renewable energy"]'::jsonb,
  '["What energy sources will last?"]'::jsonb,
  ARRAY['critical_thinking', 'citizenship']::cbc_competency[],
  ARRAY['responsibility', 'patriotism']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_6' AND strand_number = 4;

-- Grade 7 Strand #3: Environment / Strand #4: Physics
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Environmental Management', 
  '["Analyze environmental issues", "Design conservation strategies", "Implement environmental projects"]'::jsonb,
  '["How do we manage our environment?"]'::jsonb,
  ARRAY['critical_thinking', 'citizenship']::cbc_competency[],
  ARRAY['responsibility', 'patriotism', 'social_justice']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_7' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Force and Motion', 
  '["Define force and motion", "Describe types of forces", "Apply Newtons laws"]'::jsonb,
  '["What causes objects to move?"]'::jsonb,
  ARRAY['critical_thinking', 'creativity']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_7' AND strand_number = 4;

-- Grade 8 Strand #3: Environment / Strand #4: Physics
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Sustainable Development', 
  '["Define sustainable development", "Analyze sustainability challenges", "Propose sustainable solutions"]'::jsonb,
  '["How do we develop sustainably?"]'::jsonb,
  ARRAY['critical_thinking', 'citizenship']::cbc_competency[],
  ARRAY['responsibility', 'patriotism', 'social_justice']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_8' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Electricity Basics', 
  '["Describe electric circuits", "Identify circuit components", "Build simple circuits"]'::jsonb,
  '["How does electricity work?"]'::jsonb,
  ARRAY['critical_thinking', 'creativity']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_8' AND strand_number = 4;

-- Grade 9 Strand #3: Environment / Strand #4: Physics
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Global Environmental Issues', 
  '["Analyze global environmental challenges", "Evaluate international agreements", "Propose local action for global issues"]'::jsonb,
  '["What environmental issues affect the whole world?"]'::jsonb,
  ARRAY['critical_thinking', 'citizenship']::cbc_competency[],
  ARRAY['responsibility', 'peace', 'social_justice']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_9' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Magnetism and Electromagnetism', 
  '["Describe magnetic properties", "Explain electromagnetic induction", "Apply electromagnetic concepts"]'::jsonb,
  '["How are electricity and magnetism related?"]'::jsonb,
  ARRAY['critical_thinking', 'creativity']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_9' AND strand_number = 4;