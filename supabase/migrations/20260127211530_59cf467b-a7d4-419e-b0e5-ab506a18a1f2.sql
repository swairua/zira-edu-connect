-- Migration 1: Add missing strands for KIS (Grade 4-9) and SST (Grade 7-9)

-- Kiswahili Grade 4
INSERT INTO cbc_strands (subject_code, level, strand_number, name, description, suggested_time_allocation)
VALUES 
  ('KIS', 'grade_4', 1, 'Kusikiliza na Kuongea', 'Listening and Speaking skills', '3 lessons/week'),
  ('KIS', 'grade_4', 2, 'Kusoma', 'Reading skills and comprehension', '3 lessons/week'),
  ('KIS', 'grade_4', 3, 'Kuandika', 'Writing skills', '2 lessons/week'),
  ('KIS', 'grade_4', 4, 'Sarufi', 'Grammar and language structure', '2 lessons/week')
ON CONFLICT DO NOTHING;

-- Kiswahili Grade 5
INSERT INTO cbc_strands (subject_code, level, strand_number, name, description, suggested_time_allocation)
VALUES 
  ('KIS', 'grade_5', 1, 'Kusikiliza na Kuongea', 'Listening and Speaking skills', '3 lessons/week'),
  ('KIS', 'grade_5', 2, 'Kusoma', 'Reading skills and comprehension', '3 lessons/week'),
  ('KIS', 'grade_5', 3, 'Kuandika', 'Writing skills', '2 lessons/week'),
  ('KIS', 'grade_5', 4, 'Sarufi', 'Grammar and language structure', '2 lessons/week')
ON CONFLICT DO NOTHING;

-- Kiswahili Grade 6
INSERT INTO cbc_strands (subject_code, level, strand_number, name, description, suggested_time_allocation)
VALUES 
  ('KIS', 'grade_6', 1, 'Kusikiliza na Kuongea', 'Listening and Speaking skills', '3 lessons/week'),
  ('KIS', 'grade_6', 2, 'Kusoma', 'Reading skills and comprehension', '3 lessons/week'),
  ('KIS', 'grade_6', 3, 'Kuandika', 'Writing skills', '2 lessons/week'),
  ('KIS', 'grade_6', 4, 'Sarufi', 'Grammar and language structure', '2 lessons/week')
ON CONFLICT DO NOTHING;

-- Kiswahili Grade 7
INSERT INTO cbc_strands (subject_code, level, strand_number, name, description, suggested_time_allocation)
VALUES 
  ('KIS', 'grade_7', 1, 'Kusikiliza na Kuongea', 'Listening and Speaking skills', '3 lessons/week'),
  ('KIS', 'grade_7', 2, 'Kusoma', 'Reading skills and comprehension', '3 lessons/week'),
  ('KIS', 'grade_7', 3, 'Kuandika', 'Writing skills', '2 lessons/week'),
  ('KIS', 'grade_7', 4, 'Sarufi', 'Grammar and language structure', '2 lessons/week')
ON CONFLICT DO NOTHING;

-- Kiswahili Grade 8
INSERT INTO cbc_strands (subject_code, level, strand_number, name, description, suggested_time_allocation)
VALUES 
  ('KIS', 'grade_8', 1, 'Kusikiliza na Kuongea', 'Listening and Speaking skills', '3 lessons/week'),
  ('KIS', 'grade_8', 2, 'Kusoma', 'Reading skills and comprehension', '3 lessons/week'),
  ('KIS', 'grade_8', 3, 'Kuandika', 'Writing skills', '2 lessons/week'),
  ('KIS', 'grade_8', 4, 'Sarufi', 'Grammar and language structure', '2 lessons/week')
ON CONFLICT DO NOTHING;

-- Kiswahili Grade 9
INSERT INTO cbc_strands (subject_code, level, strand_number, name, description, suggested_time_allocation)
VALUES 
  ('KIS', 'grade_9', 1, 'Kusikiliza na Kuongea', 'Listening and Speaking skills', '3 lessons/week'),
  ('KIS', 'grade_9', 2, 'Kusoma', 'Reading skills and comprehension', '3 lessons/week'),
  ('KIS', 'grade_9', 3, 'Kuandika', 'Writing skills', '2 lessons/week'),
  ('KIS', 'grade_9', 4, 'Sarufi', 'Grammar and language structure', '2 lessons/week')
ON CONFLICT DO NOTHING;

-- Social Studies Grade 7
INSERT INTO cbc_strands (subject_code, level, strand_number, name, description, suggested_time_allocation)
VALUES 
  ('SST', 'grade_7', 1, 'Citizenship and Governance', 'Understanding citizenship, rights and governance', '2 lessons/week'),
  ('SST', 'grade_7', 2, 'Resources and Economic Activities', 'Natural resources and economic development', '2 lessons/week'),
  ('SST', 'grade_7', 3, 'Social Relations', 'Community and social interactions', '2 lessons/week'),
  ('SST', 'grade_7', 4, 'Environment and Sustainability', 'Environmental conservation and sustainability', '2 lessons/week'),
  ('SST', 'grade_7', 5, 'Historical Developments', 'African and world history', '2 lessons/week')
ON CONFLICT DO NOTHING;

-- Social Studies Grade 8
INSERT INTO cbc_strands (subject_code, level, strand_number, name, description, suggested_time_allocation)
VALUES 
  ('SST', 'grade_8', 1, 'Citizenship and Governance', 'Understanding citizenship, rights and governance', '2 lessons/week'),
  ('SST', 'grade_8', 2, 'Resources and Economic Activities', 'Natural resources and economic development', '2 lessons/week'),
  ('SST', 'grade_8', 3, 'Social Relations', 'Community and social interactions', '2 lessons/week'),
  ('SST', 'grade_8', 4, 'Environment and Sustainability', 'Environmental conservation and sustainability', '2 lessons/week'),
  ('SST', 'grade_8', 5, 'Historical Developments', 'African and world history', '2 lessons/week')
ON CONFLICT DO NOTHING;

-- Social Studies Grade 9
INSERT INTO cbc_strands (subject_code, level, strand_number, name, description, suggested_time_allocation)
VALUES 
  ('SST', 'grade_9', 1, 'Citizenship and Governance', 'Understanding citizenship, rights and governance', '2 lessons/week'),
  ('SST', 'grade_9', 2, 'Resources and Economic Activities', 'Natural resources and economic development', '2 lessons/week'),
  ('SST', 'grade_9', 3, 'Social Relations', 'Community and social interactions', '2 lessons/week'),
  ('SST', 'grade_9', 4, 'Environment and Sustainability', 'Environmental conservation and sustainability', '2 lessons/week'),
  ('SST', 'grade_9', 5, 'Historical Developments', 'African and world history', '2 lessons/week')
ON CONFLICT DO NOTHING;