-- Christian Religious Education (CRE) Sub-strands for PP1-Grade 6

-- PP1 CRE
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'God as Creator', 
  '["Appreciate God as the creator", "Identify things God created", "Thank God for creation"]'::jsonb,
  '["Who made the world?"]'::jsonb,
  ARRAY['communication', 'self_efficacy']::cbc_competency[],
  ARRAY['love', 'respect', 'responsibility']::cbc_value[], 4, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'CRE' AND level = 'pp1' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'My Family', 
  '["Identify family members", "Appreciate role of family", "Show love to family members"]'::jsonb,
  '["Who are the people in my family?"]'::jsonb,
  ARRAY['communication', 'self_efficacy']::cbc_competency[],
  ARRAY['love', 'respect', 'unity']::cbc_value[], 4, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'CRE' AND level = 'pp1' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Simple Prayers', 
  '["Say simple prayers", "Thank God through prayer", "Develop habit of praying"]'::jsonb,
  '["How do we talk to God?"]'::jsonb,
  ARRAY['communication', 'self_efficacy']::cbc_competency[],
  ARRAY['love', 'responsibility']::cbc_value[], 4, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'CRE' AND level = 'pp1' AND strand_number = 2;

-- PP2 CRE
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Bible Stories', 
  '["Listen to Bible stories", "Retell simple Bible stories", "Apply lessons from stories"]'::jsonb,
  '["What can we learn from Bible stories?"]'::jsonb,
  ARRAY['communication', 'learning_to_learn']::cbc_competency[],
  ARRAY['love', 'integrity', 'responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'CRE' AND level = 'pp2' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Caring for Others', 
  '["Show kindness to others", "Help those in need", "Share with friends"]'::jsonb,
  '["How can we help others?"]'::jsonb,
  ARRAY['communication', 'citizenship']::cbc_competency[],
  ARRAY['love', 'social_justice', 'responsibility']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'CRE' AND level = 'pp2' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Church and Worship', 
  '["Identify places of worship", "Describe worship activities", "Participate in worship"]'::jsonb,
  '["Where do we worship God?"]'::jsonb,
  ARRAY['communication', 'self_efficacy']::cbc_competency[],
  ARRAY['love', 'unity', 'peace']::cbc_value[], 4, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'CRE' AND level = 'pp2' AND strand_number = 2;

-- Grade 1 CRE
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Creation Story', 
  '["Narrate the creation story", "Identify days of creation", "Appreciate Gods creation"]'::jsonb,
  '["How did God create the world?"]'::jsonb,
  ARRAY['communication', 'creativity']::cbc_competency[],
  ARRAY['love', 'respect', 'responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'CRE' AND level = 'grade_1' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Obedience', 
  '["Define obedience", "Identify ways to show obedience", "Practice obedience at home and school"]'::jsonb,
  '["Why should we obey?"]'::jsonb,
  ARRAY['self_efficacy', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'respect', 'integrity']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'CRE' AND level = 'grade_1' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'The Lords Prayer', 
  '["Recite the Lords Prayer", "Explain meaning of the prayer", "Pray regularly"]'::jsonb,
  '["What prayer did Jesus teach us?"]'::jsonb,
  ARRAY['communication', 'self_efficacy']::cbc_competency[],
  ARRAY['love', 'responsibility']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'CRE' AND level = 'grade_1' AND strand_number = 2;

-- Grade 2 CRE
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Stories of Jesus', 
  '["Narrate stories about Jesus", "Identify lessons from Jesus stories", "Apply teachings of Jesus"]'::jsonb,
  '["What did Jesus teach us?"]'::jsonb,
  ARRAY['communication', 'learning_to_learn']::cbc_competency[],
  ARRAY['love', 'integrity', 'peace']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'CRE' AND level = 'grade_2' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Honesty and Truthfulness', 
  '["Define honesty", "Identify importance of telling truth", "Practice honesty in daily life"]'::jsonb,
  '["Why is honesty important?"]'::jsonb,
  ARRAY['self_efficacy', 'communication']::cbc_competency[],
  ARRAY['integrity', 'responsibility', 'respect']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'CRE' AND level = 'grade_2' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Christian Celebrations', 
  '["Identify Christian celebrations", "Describe how Christians celebrate", "Participate in celebrations"]'::jsonb,
  '["What do Christians celebrate?"]'::jsonb,
  ARRAY['communication', 'citizenship']::cbc_competency[],
  ARRAY['love', 'unity', 'peace']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'CRE' AND level = 'grade_2' AND strand_number = 2;

-- Grade 3 CRE
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Old Testament Heroes', 
  '["Identify Old Testament heroes", "Narrate stories of heroes", "Apply lessons from their lives"]'::jsonb,
  '["What can we learn from Bible heroes?"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['integrity', 'responsibility', 'love']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'CRE' AND level = 'grade_3' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Ten Commandments', 
  '["List the Ten Commandments", "Explain meaning of commandments", "Apply commandments in life"]'::jsonb,
  '["What rules did God give us?"]'::jsonb,
  ARRAY['self_efficacy', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'integrity', 'respect']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'CRE' AND level = 'grade_3' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Service to Others', 
  '["Identify ways to serve others", "Describe importance of service", "Engage in community service"]'::jsonb,
  '["How can we serve our community?"]'::jsonb,
  ARRAY['citizenship', 'communication']::cbc_competency[],
  ARRAY['love', 'social_justice', 'responsibility']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'CRE' AND level = 'grade_3' AND strand_number = 2;

-- Grade 4 CRE
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Life of Jesus', 
  '["Describe Jesus birth and childhood", "Explain Jesus ministry", "Apply Jesus teachings"]'::jsonb,
  '["Who is Jesus?", "What did Jesus do?"]'::jsonb,
  ARRAY['communication', 'learning_to_learn']::cbc_competency[],
  ARRAY['love', 'integrity', 'peace']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'CRE' AND level = 'grade_4' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Parables of Jesus', 
  '["Identify parables of Jesus", "Explain lessons from parables", "Apply teachings from parables"]'::jsonb,
  '["What are parables?", "What do they teach us?"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['love', 'responsibility', 'social_justice']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'CRE' AND level = 'grade_4' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'The Church', 
  '["Describe the early church", "Explain role of the church", "Participate in church activities"]'::jsonb,
  '["What is the church?"]'::jsonb,
  ARRAY['citizenship', 'communication']::cbc_competency[],
  ARRAY['unity', 'love', 'peace']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'CRE' AND level = 'grade_4' AND strand_number = 2;

-- Grade 5 CRE
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'The Apostles', 
  '["Identify the twelve apostles", "Describe work of the apostles", "Apply lessons from apostles"]'::jsonb,
  '["Who were the apostles?", "What did they do?"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['integrity', 'responsibility', 'love']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'CRE' AND level = 'grade_5' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Miracles of Jesus', 
  '["Narrate miracles of Jesus", "Explain significance of miracles", "Apply faith lessons from miracles"]'::jsonb,
  '["What miracles did Jesus perform?"]'::jsonb,
  ARRAY['communication', 'self_efficacy']::cbc_competency[],
  ARRAY['love', 'integrity', 'peace']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'CRE' AND level = 'grade_5' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Christian Values', 
  '["Identify core Christian values", "Explain importance of values", "Practice Christian values daily"]'::jsonb,
  '["What values should Christians have?"]'::jsonb,
  ARRAY['self_efficacy', 'critical_thinking']::cbc_competency[],
  ARRAY['love', 'integrity', 'responsibility', 'peace']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'CRE' AND level = 'grade_5' AND strand_number = 2;

-- Grade 6 CRE
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Death and Resurrection', 
  '["Narrate Jesus death and resurrection", "Explain significance of Easter", "Apply resurrection hope"]'::jsonb,
  '["Why did Jesus die?", "What is the resurrection?"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['love', 'peace', 'integrity']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'CRE' AND level = 'grade_6' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Holy Spirit', 
  '["Describe the Holy Spirit", "Explain work of the Holy Spirit", "Identify fruits of the Spirit"]'::jsonb,
  '["Who is the Holy Spirit?"]'::jsonb,
  ARRAY['self_efficacy', 'communication']::cbc_competency[],
  ARRAY['love', 'peace', 'integrity']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'CRE' AND level = 'grade_6' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Mission and Evangelism', 
  '["Define mission and evangelism", "Describe spread of Christianity", "Participate in outreach"]'::jsonb,
  '["How does the church grow?"]'::jsonb,
  ARRAY['citizenship', 'communication']::cbc_competency[],
  ARRAY['love', 'unity', 'peace', 'social_justice']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'CRE' AND level = 'grade_6' AND strand_number = 2;