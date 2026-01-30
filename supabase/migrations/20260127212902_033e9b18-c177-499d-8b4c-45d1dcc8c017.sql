-- Islamic Religious Education (IRE) Sub-strands for PP1-Grade 6

-- PP1 IRE
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Allah the Creator', 
  '["Appreciate Allah as the creator", "Identify things Allah created", "Thank Allah for creation"]'::jsonb,
  '["Who created everything?"]'::jsonb,
  ARRAY['communication', 'self_efficacy']::cbc_competency[],
  ARRAY['love', 'respect', 'responsibility']::cbc_value[], 4, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'IRE' AND level = 'pp1' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'My Muslim Family', 
  '["Identify family members", "Appreciate Islamic family values", "Show respect to elders"]'::jsonb,
  '["Who is in my family?"]'::jsonb,
  ARRAY['communication', 'self_efficacy']::cbc_competency[],
  ARRAY['love', 'respect', 'unity']::cbc_value[], 4, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'IRE' AND level = 'pp1' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Simple Duas', 
  '["Recite simple duas", "Say bismillah before activities", "Develop habit of making dua"]'::jsonb,
  '["How do we talk to Allah?"]'::jsonb,
  ARRAY['communication', 'self_efficacy']::cbc_competency[],
  ARRAY['love', 'responsibility']::cbc_value[], 4, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'IRE' AND level = 'pp1' AND strand_number = 2;

-- PP2 IRE
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Stories of Prophets', 
  '["Listen to stories of prophets", "Retell simple prophet stories", "Apply lessons from stories"]'::jsonb,
  '["What can we learn from prophets?"]'::jsonb,
  ARRAY['communication', 'learning_to_learn']::cbc_competency[],
  ARRAY['love', 'integrity', 'responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'IRE' AND level = 'pp2' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Kindness in Islam', 
  '["Show kindness to others", "Help those in need", "Practice generosity"]'::jsonb,
  '["How can we be kind?"]'::jsonb,
  ARRAY['communication', 'citizenship']::cbc_competency[],
  ARRAY['love', 'social_justice', 'responsibility']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'IRE' AND level = 'pp2' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'The Mosque', 
  '["Identify the mosque", "Describe activities in the mosque", "Show respect for the mosque"]'::jsonb,
  '["Where do Muslims worship?"]'::jsonb,
  ARRAY['communication', 'self_efficacy']::cbc_competency[],
  ARRAY['love', 'unity', 'peace']::cbc_value[], 4, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'IRE' AND level = 'pp2' AND strand_number = 2;

-- Grade 1 IRE
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Kalimah Shahada', 
  '["Recite the Shahada", "Explain meaning of Shahada", "Understand oneness of Allah"]'::jsonb,
  '["What is the first pillar of Islam?"]'::jsonb,
  ARRAY['communication', 'self_efficacy']::cbc_competency[],
  ARRAY['love', 'integrity', 'responsibility']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'IRE' AND level = 'grade_1' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Basic Arabic Letters', 
  '["Identify Arabic letters", "Write basic Arabic letters", "Recognize letters in simple words"]'::jsonb,
  '["How do we read the Quran?"]'::jsonb,
  ARRAY['communication', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'IRE' AND level = 'grade_1' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Salah Introduction', 
  '["Identify times of prayer", "Observe adults praying", "Practice basic prayer positions"]'::jsonb,
  '["When do Muslims pray?"]'::jsonb,
  ARRAY['self_efficacy', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'IRE' AND level = 'grade_1' AND strand_number = 2;

-- Grade 2 IRE
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Short Surahs', 
  '["Recite Al-Fatiha", "Memorize short surahs", "Understand basic meanings"]'::jsonb,
  '["What surahs should we memorize?"]'::jsonb,
  ARRAY['communication', 'learning_to_learn']::cbc_competency[],
  ARRAY['love', 'responsibility']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'IRE' AND level = 'grade_2' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Truthfulness (Sidq)', 
  '["Define truthfulness in Islam", "Identify importance of truth", "Practice honesty"]'::jsonb,
  '["Why is truth important?"]'::jsonb,
  ARRAY['self_efficacy', 'communication']::cbc_competency[],
  ARRAY['integrity', 'responsibility', 'respect']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'IRE' AND level = 'grade_2' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Islamic Celebrations', 
  '["Identify Eid celebrations", "Describe how Muslims celebrate", "Participate in celebrations"]'::jsonb,
  '["What do Muslims celebrate?"]'::jsonb,
  ARRAY['communication', 'citizenship']::cbc_competency[],
  ARRAY['love', 'unity', 'peace']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'IRE' AND level = 'grade_2' AND strand_number = 2;

-- Grade 3 IRE
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Five Pillars of Islam', 
  '["List the five pillars", "Explain each pillar", "Practice the pillars"]'::jsonb,
  '["What are the pillars of Islam?"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'love', 'integrity']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'IRE' AND level = 'grade_3' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Wudhu (Ablution)', 
  '["Describe steps of wudhu", "Demonstrate wudhu", "Understand importance of cleanliness"]'::jsonb,
  '["How do we prepare for prayer?"]'::jsonb,
  ARRAY['self_efficacy', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'IRE' AND level = 'grade_3' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Zakat and Charity', 
  '["Define zakat", "Explain importance of charity", "Practice generosity"]'::jsonb,
  '["Why should we give to others?"]'::jsonb,
  ARRAY['citizenship', 'communication']::cbc_competency[],
  ARRAY['love', 'social_justice', 'responsibility']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'IRE' AND level = 'grade_3' AND strand_number = 2;

-- Grade 4 IRE
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Life of Prophet Muhammad', 
  '["Describe Prophets birth and childhood", "Explain Prophets mission", "Apply Prophets teachings"]'::jsonb,
  '["Who was Prophet Muhammad?"]'::jsonb,
  ARRAY['communication', 'learning_to_learn']::cbc_competency[],
  ARRAY['love', 'integrity', 'peace']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'IRE' AND level = 'grade_4' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Hadith Studies', 
  '["Define hadith", "Memorize selected hadiths", "Apply hadith teachings"]'::jsonb,
  '["What are the sayings of the Prophet?"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['love', 'responsibility', 'integrity']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'IRE' AND level = 'grade_4' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Salah Performance', 
  '["Perform complete salah", "Recite prayer components", "Pray with congregation"]'::jsonb,
  '["How do we perform salah correctly?"]'::jsonb,
  ARRAY['self_efficacy', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility', 'love', 'unity']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'IRE' AND level = 'grade_4' AND strand_number = 2;

-- Grade 5 IRE
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Other Prophets', 
  '["Identify major prophets", "Narrate stories of prophets", "Apply lessons from prophets"]'::jsonb,
  '["What prophets came before Muhammad?"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['integrity', 'responsibility', 'love']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'IRE' AND level = 'grade_5' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Quran Recitation (Tajweed)', 
  '["Apply basic tajweed rules", "Recite with proper pronunciation", "Memorize more surahs"]'::jsonb,
  '["How do we recite Quran properly?"]'::jsonb,
  ARRAY['learning_to_learn', 'communication']::cbc_competency[],
  ARRAY['love', 'responsibility']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'IRE' AND level = 'grade_5' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Islamic Morals (Akhlaq)', 
  '["Identify Islamic morals", "Explain importance of good character", "Practice Islamic ethics"]'::jsonb,
  '["What is good character in Islam?"]'::jsonb,
  ARRAY['self_efficacy', 'critical_thinking']::cbc_competency[],
  ARRAY['love', 'integrity', 'responsibility', 'peace']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'IRE' AND level = 'grade_5' AND strand_number = 2;

-- Grade 6 IRE
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Ramadan and Fasting', 
  '["Explain significance of Ramadan", "Describe rules of fasting", "Practice fasting if able"]'::jsonb,
  '["Why do Muslims fast?"]'::jsonb,
  ARRAY['self_efficacy', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'love', 'integrity']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'IRE' AND level = 'grade_6' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Hajj (Pilgrimage)', 
  '["Describe the Hajj pilgrimage", "Explain rituals of Hajj", "Understand significance of Hajj"]'::jsonb,
  '["What is Hajj?"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['unity', 'love', 'peace']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'IRE' AND level = 'grade_6' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Islamic History', 
  '["Describe early Islamic history", "Identify key events and figures", "Apply historical lessons"]'::jsonb,
  '["How did Islam spread?"]'::jsonb,
  ARRAY['citizenship', 'communication']::cbc_competency[],
  ARRAY['love', 'unity', 'peace', 'integrity']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'IRE' AND level = 'grade_6' AND strand_number = 2;