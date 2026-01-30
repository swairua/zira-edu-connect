-- Physical Education (PE) Sub-strands for PP1-Grade 6

-- PP1 PE
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Basic Locomotor Skills', 
  '["Walk with coordination", "Run safely", "Jump and hop"]'::jsonb,
  '["How do we move our bodies?"]'::jsonb,
  ARRAY['self_efficacy', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'PE' AND level = 'pp1' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Manipulative Skills', 
  '["Catch a ball", "Throw a ball", "Kick a ball"]'::jsonb,
  '["How do we handle objects?"]'::jsonb,
  ARRAY['self_efficacy', 'creativity']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'PE' AND level = 'pp1' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Play and Games', 
  '["Participate in simple games", "Follow game rules", "Play safely with others"]'::jsonb,
  '["Why do we play games?"]'::jsonb,
  ARRAY['communication', 'citizenship']::cbc_competency[],
  ARRAY['unity', 'peace', 'respect']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'PE' AND level = 'pp1' AND strand_number = 2;

-- PP2 PE
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Running and Jumping', 
  '["Run with improved coordination", "Jump over obstacles", "Skip and gallop"]'::jsonb,
  '["How can we move faster and better?"]'::jsonb,
  ARRAY['self_efficacy', 'creativity']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'PE' AND level = 'pp2' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Balance Activities', 
  '["Balance on one foot", "Walk on a line", "Perform simple balancing acts"]'::jsonb,
  '["How do we keep our balance?"]'::jsonb,
  ARRAY['self_efficacy', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'PE' AND level = 'pp2' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Team Activities', 
  '["Work in small groups", "Participate in relay activities", "Support team members"]'::jsonb,
  '["Why is teamwork important?"]'::jsonb,
  ARRAY['communication', 'citizenship']::cbc_competency[],
  ARRAY['unity', 'peace', 'love']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'PE' AND level = 'pp2' AND strand_number = 2;

-- Grade 1 PE
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Athletics Basics', 
  '["Run short distances", "Perform standing long jump", "Participate in simple races"]'::jsonb,
  '["What are athletics?"]'::jsonb,
  ARRAY['self_efficacy', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'PE' AND level = 'grade_1' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Ball Games', 
  '["Dribble a ball", "Pass to a partner", "Shoot at targets"]'::jsonb,
  '["How do we play ball games?"]'::jsonb,
  ARRAY['self_efficacy', 'creativity']::cbc_competency[],
  ARRAY['unity', 'responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'PE' AND level = 'grade_1' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Health and Fitness', 
  '["Understand importance of exercise", "Perform warm-up exercises", "Practice good hygiene"]'::jsonb,
  '["Why is exercise important?"]'::jsonb,
  ARRAY['self_efficacy', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'PE' AND level = 'grade_1' AND strand_number = 2;

-- Grade 2 PE
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Running Events', 
  '["Sprint with proper form", "Participate in relay races", "Understand race rules"]'::jsonb,
  '["How do we run faster?"]'::jsonb,
  ARRAY['self_efficacy', 'communication']::cbc_competency[],
  ARRAY['integrity', 'responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'PE' AND level = 'grade_2' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Jumping Events', 
  '["Perform long jump", "Learn high jump basics", "Jump with proper technique"]'::jsonb,
  '["How do we jump higher and farther?"]'::jsonb,
  ARRAY['self_efficacy', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'PE' AND level = 'grade_2' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Traditional Games', 
  '["Play traditional Kenyan games", "Learn rules of indigenous games", "Appreciate cultural games"]'::jsonb,
  '["What games did our ancestors play?"]'::jsonb,
  ARRAY['citizenship', 'communication']::cbc_competency[],
  ARRAY['patriotism', 'unity', 'peace']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'PE' AND level = 'grade_2' AND strand_number = 2;

-- Grade 3 PE
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Throwing Events', 
  '["Throw for distance", "Understand throwing techniques", "Practice shot put basics"]'::jsonb,
  '["How do we throw far?"]'::jsonb,
  ARRAY['self_efficacy', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'PE' AND level = 'grade_3' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Football Basics', 
  '["Dribble and pass football", "Understand basic rules", "Play mini football games"]'::jsonb,
  '["How do we play football?"]'::jsonb,
  ARRAY['communication', 'citizenship']::cbc_competency[],
  ARRAY['unity', 'peace', 'integrity']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'PE' AND level = 'grade_3' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Swimming Introduction', 
  '["Understand water safety", "Practice basic swimming movements", "Float in water"]'::jsonb,
  '["How do we stay safe in water?"]'::jsonb,
  ARRAY['self_efficacy', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'PE' AND level = 'grade_3' AND strand_number = 2;

-- Grade 4 PE
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Athletics Events', 
  '["Compete in track events", "Participate in field events", "Follow athletics rules"]'::jsonb,
  '["What are different athletics events?"]'::jsonb,
  ARRAY['self_efficacy', 'communication']::cbc_competency[],
  ARRAY['integrity', 'responsibility']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'PE' AND level = 'grade_4' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Volleyball Basics', 
  '["Serve and pass", "Understand volleyball rules", "Play mini volleyball"]'::jsonb,
  '["How do we play volleyball?"]'::jsonb,
  ARRAY['communication', 'citizenship']::cbc_competency[],
  ARRAY['unity', 'peace']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'PE' AND level = 'grade_4' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Gymnastics Basics', 
  '["Perform forward roll", "Execute cartwheels", "Practice basic gymnastics"]'::jsonb,
  '["What is gymnastics?"]'::jsonb,
  ARRAY['self_efficacy', 'creativity']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'PE' AND level = 'grade_4' AND strand_number = 2;

-- Grade 5 PE
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Team Sports', 
  '["Play organized team sports", "Understand tactical play", "Demonstrate sportsmanship"]'::jsonb,
  '["How do teams win together?"]'::jsonb,
  ARRAY['communication', 'citizenship']::cbc_competency[],
  ARRAY['unity', 'integrity', 'peace']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'PE' AND level = 'grade_5' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Netball/Basketball', 
  '["Dribble and shoot", "Understand game rules", "Play half-court games"]'::jsonb,
  '["How do we play netball/basketball?"]'::jsonb,
  ARRAY['self_efficacy', 'communication']::cbc_competency[],
  ARRAY['unity', 'responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'PE' AND level = 'grade_5' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Fitness Training', 
  '["Develop personal fitness plan", "Track fitness progress", "Understand body conditioning"]'::jsonb,
  '["How do we get fit?"]'::jsonb,
  ARRAY['self_efficacy', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'PE' AND level = 'grade_5' AND strand_number = 2;

-- Grade 6 PE
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Competitive Sports', 
  '["Compete in school sports", "Apply rules in competition", "Demonstrate fair play"]'::jsonb,
  '["How do we compete fairly?"]'::jsonb,
  ARRAY['communication', 'self_efficacy']::cbc_competency[],
  ARRAY['integrity', 'peace', 'unity']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'PE' AND level = 'grade_6' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Handball/Hockey', 
  '["Learn game rules", "Develop skills", "Play modified games"]'::jsonb,
  '["What are different ball games?"]'::jsonb,
  ARRAY['communication', 'citizenship']::cbc_competency[],
  ARRAY['unity', 'responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'PE' AND level = 'grade_6' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Sports Leadership', 
  '["Lead warm-up sessions", "Officiate games", "Organize sports activities"]'::jsonb,
  '["How can we lead in sports?"]'::jsonb,
  ARRAY['self_efficacy', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'integrity', 'unity']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'PE' AND level = 'grade_6' AND strand_number = 2;