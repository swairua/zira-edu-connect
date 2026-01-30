-- Migration 3: CRE (8 strands) + IRE (8 strands) Sub-strands

-- CRE PP1 Strand #3: Christian Living
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Loving Others', 
  '["Show love to family", "Care for friends", "Help those in need"]'::jsonb,
  '["How do we show love to others?"]'::jsonb,
  ARRAY['communication', 'citizenship']::cbc_competency[],
  ARRAY['love', 'responsibility']::cbc_value[], 4, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'CRE' AND level = 'pp1' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Being Thankful', 
  '["Express gratitude to God", "Thank parents and teachers", "Appreciate Gods blessings"]'::jsonb,
  '["Why should we be thankful?"]'::jsonb,
  ARRAY['communication', 'self_efficacy']::cbc_competency[],
  ARRAY['love', 'respect']::cbc_value[], 4, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'CRE' AND level = 'pp1' AND strand_number = 3;

-- CRE PP2 Strand #3
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Sharing with Others', 
  '["Share belongings with friends", "Practice generosity", "Understand joy of giving"]'::jsonb,
  '["Why should we share?"]'::jsonb,
  ARRAY['citizenship', 'communication']::cbc_competency[],
  ARRAY['love', 'social_justice']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'CRE' AND level = 'pp2' AND strand_number = 3;

-- CRE Grade 1 Strand #3
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Respecting Others', 
  '["Show respect to elders", "Respect peers and friends", "Practice good manners"]'::jsonb,
  '["How do we show respect?"]'::jsonb,
  ARRAY['communication', 'citizenship']::cbc_competency[],
  ARRAY['respect', 'love']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'CRE' AND level = 'grade_1' AND strand_number = 3;

-- CRE Grade 2 Strand #3
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Forgiveness', 
  '["Understand meaning of forgiveness", "Practice forgiving others", "Ask for forgiveness when wrong"]'::jsonb,
  '["Why should we forgive?"]'::jsonb,
  ARRAY['self_efficacy', 'communication']::cbc_competency[],
  ARRAY['love', 'peace']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'CRE' AND level = 'grade_2' AND strand_number = 3;

-- CRE Grade 3 Strand #3
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Moral Decision Making', 
  '["Distinguish right from wrong", "Make good choices", "Accept consequences of actions"]'::jsonb,
  '["How do we make good decisions?"]'::jsonb,
  ARRAY['critical_thinking', 'self_efficacy']::cbc_competency[],
  ARRAY['integrity', 'responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'CRE' AND level = 'grade_3' AND strand_number = 3;

-- CRE Grade 4 Strand #3
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Living Out Faith', 
  '["Apply Christian teachings daily", "Witness through actions", "Serve the community"]'::jsonb,
  '["How do we live as Christians?"]'::jsonb,
  ARRAY['citizenship', 'self_efficacy']::cbc_competency[],
  ARRAY['love', 'integrity', 'responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'CRE' AND level = 'grade_4' AND strand_number = 3;

-- CRE Grade 5 Strand #3
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Christian Stewardship', 
  '["Care for Gods creation", "Use resources responsibly", "Serve others with talents"]'::jsonb,
  '["What is stewardship?"]'::jsonb,
  ARRAY['citizenship', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'love', 'integrity']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'CRE' AND level = 'grade_5' AND strand_number = 3;

-- CRE Grade 6 Strand #3
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Christian Social Responsibility', 
  '["Identify social issues", "Apply Christian principles to social problems", "Engage in community service"]'::jsonb,
  '["How should Christians respond to social issues?"]'::jsonb,
  ARRAY['citizenship', 'critical_thinking']::cbc_competency[],
  ARRAY['social_justice', 'love', 'responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'CRE' AND level = 'grade_6' AND strand_number = 3;

-- IRE PP1 Strand #3: Akhlaq (Character)
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Good Manners (Adab)', 
  '["Greet others properly", "Show respect to elders", "Practice Islamic etiquette"]'::jsonb,
  '["What are good manners in Islam?"]'::jsonb,
  ARRAY['communication', 'citizenship']::cbc_competency[],
  ARRAY['respect', 'love']::cbc_value[], 4, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'IRE' AND level = 'pp1' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Cleanliness (Taharah)', 
  '["Practice personal cleanliness", "Keep environment clean", "Understand importance of hygiene in Islam"]'::jsonb,
  '["Why is cleanliness important?"]'::jsonb,
  ARRAY['self_efficacy', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 4, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'IRE' AND level = 'pp1' AND strand_number = 3;

-- IRE PP2 Strand #3
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Kindness to Parents', 
  '["Obey parents", "Help parents at home", "Show gratitude to parents"]'::jsonb,
  '["Why should we be kind to our parents?"]'::jsonb,
  ARRAY['communication', 'citizenship']::cbc_competency[],
  ARRAY['love', 'respect', 'responsibility']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'IRE' AND level = 'pp2' AND strand_number = 3;

-- IRE Grade 1 Strand #3
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Brotherhood in Islam', 
  '["Treat Muslims as brothers/sisters", "Show kindness to neighbors", "Practice sharing"]'::jsonb,
  '["What is brotherhood in Islam?"]'::jsonb,
  ARRAY['citizenship', 'communication']::cbc_competency[],
  ARRAY['love', 'unity']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'IRE' AND level = 'grade_1' AND strand_number = 3;

-- IRE Grade 2 Strand #3
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Patience (Sabr)', 
  '["Practice patience in difficulties", "Control anger", "Wait calmly"]'::jsonb,
  '["What is patience in Islam?"]'::jsonb,
  ARRAY['self_efficacy', 'communication']::cbc_competency[],
  ARRAY['peace', 'responsibility']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'IRE' AND level = 'grade_2' AND strand_number = 3;

-- IRE Grade 3 Strand #3
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Humility (Tawadhu)', 
  '["Practice humble behavior", "Avoid arrogance", "Treat all people equally"]'::jsonb,
  '["What is humility?"]'::jsonb,
  ARRAY['self_efficacy', 'communication']::cbc_competency[],
  ARRAY['respect', 'love', 'peace']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'IRE' AND level = 'grade_3' AND strand_number = 3;

-- IRE Grade 4 Strand #3
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Justice (Adl)', 
  '["Practice fairness", "Stand for justice", "Treat others justly"]'::jsonb,
  '["What is justice in Islam?"]'::jsonb,
  ARRAY['citizenship', 'critical_thinking']::cbc_competency[],
  ARRAY['social_justice', 'integrity']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'IRE' AND level = 'grade_4' AND strand_number = 3;

-- IRE Grade 5 Strand #3
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Gratitude (Shukr)', 
  '["Express gratitude to Allah", "Thank people for kindness", "Appreciate blessings"]'::jsonb,
  '["How do we show gratitude?"]'::jsonb,
  ARRAY['self_efficacy', 'communication']::cbc_competency[],
  ARRAY['love', 'responsibility']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'IRE' AND level = 'grade_5' AND strand_number = 3;

-- IRE Grade 6 Strand #3
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Islamic Social Ethics', 
  '["Apply Islamic ethics in society", "Promote peace and harmony", "Engage in community welfare"]'::jsonb,
  '["How should Muslims behave in society?"]'::jsonb,
  ARRAY['citizenship', 'critical_thinking']::cbc_competency[],
  ARRAY['social_justice', 'peace', 'unity']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'IRE' AND level = 'grade_6' AND strand_number = 3;