-- Music Sub-strands for PP1-Grade 6

-- PP1 Music
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Singing Simple Songs', 
  '["Sing age-appropriate songs", "Follow song melodies", "Participate in group singing"]'::jsonb,
  '["Why do we sing?"]'::jsonb,
  ARRAY['communication', 'creativity']::cbc_competency[],
  ARRAY['love', 'unity']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MUSIC' AND level = 'pp1' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Rhythm and Movement', 
  '["Clap to rhythms", "Move to music", "Keep steady beat"]'::jsonb,
  '["How do we move to music?"]'::jsonb,
  ARRAY['creativity', 'self_efficacy']::cbc_competency[],
  ARRAY['love', 'responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MUSIC' AND level = 'pp1' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Exploring Sounds', 
  '["Identify different sounds", "Create sounds with objects", "Distinguish loud and soft"]'::jsonb,
  '["What sounds can we make?"]'::jsonb,
  ARRAY['creativity', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 4, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MUSIC' AND level = 'pp1' AND strand_number = 2;

-- PP2 Music
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Action Songs', 
  '["Sing with actions", "Coordinate movements with lyrics", "Perform songs for others"]'::jsonb,
  '["How do actions help us remember songs?"]'::jsonb,
  ARRAY['communication', 'creativity']::cbc_competency[],
  ARRAY['love', 'unity']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MUSIC' AND level = 'pp2' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Simple Instruments', 
  '["Identify percussion instruments", "Play simple instruments", "Create rhythms with instruments"]'::jsonb,
  '["What instruments can we play?"]'::jsonb,
  ARRAY['creativity', 'self_efficacy']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MUSIC' AND level = 'pp2' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Traditional Songs', 
  '["Learn traditional childrens songs", "Appreciate cultural music", "Sing in local languages"]'::jsonb,
  '["What songs do our communities sing?"]'::jsonb,
  ARRAY['citizenship', 'communication']::cbc_competency[],
  ARRAY['patriotism', 'unity', 'love']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MUSIC' AND level = 'pp2' AND strand_number = 2;

-- Grade 1 Music
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Pitch and Melody', 
  '["Distinguish high and low sounds", "Sing ascending scales", "Follow melodic patterns"]'::jsonb,
  '["What makes sounds high or low?"]'::jsonb,
  ARRAY['creativity', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MUSIC' AND level = 'grade_1' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Music Notation Introduction', 
  '["Identify basic music symbols", "Read simple notation", "Write basic musical patterns"]'::jsonb,
  '["How do we write music?"]'::jsonb,
  ARRAY['learning_to_learn', 'communication']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MUSIC' AND level = 'grade_1' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Cultural Dances', 
  '["Learn simple cultural dances", "Perform dance movements", "Appreciate dance diversity"]'::jsonb,
  '["What dances are from our culture?"]'::jsonb,
  ARRAY['citizenship', 'creativity']::cbc_competency[],
  ARRAY['patriotism', 'unity', 'respect']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MUSIC' AND level = 'grade_1' AND strand_number = 2;

-- Grade 2 Music
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Part Singing', 
  '["Sing in groups", "Maintain own part", "Harmonize with others"]'::jsonb,
  '["How do we sing together in parts?"]'::jsonb,
  ARRAY['communication', 'creativity']::cbc_competency[],
  ARRAY['unity', 'love', 'peace']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MUSIC' AND level = 'grade_2' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Rhythm Patterns', 
  '["Read rhythm notation", "Create rhythm patterns", "Perform rhythms on instruments"]'::jsonb,
  '["What are rhythm patterns?"]'::jsonb,
  ARRAY['creativity', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MUSIC' AND level = 'grade_2' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'African Music', 
  '["Identify African musical styles", "Play African rhythms", "Appreciate African music heritage"]'::jsonb,
  '["What makes African music special?"]'::jsonb,
  ARRAY['citizenship', 'communication']::cbc_competency[],
  ARRAY['patriotism', 'unity']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MUSIC' AND level = 'grade_2' AND strand_number = 2;

-- Grade 3 Music
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Folk Songs', 
  '["Sing Kenyan folk songs", "Understand song meanings", "Perform folk music"]'::jsonb,
  '["What stories do folk songs tell?"]'::jsonb,
  ARRAY['communication', 'citizenship']::cbc_competency[],
  ARRAY['patriotism', 'unity', 'love']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MUSIC' AND level = 'grade_3' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Musical Instruments', 
  '["Classify instruments by type", "Play melodic instruments", "Care for instruments"]'::jsonb,
  '["How are instruments different?"]'::jsonb,
  ARRAY['creativity', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility', 'respect']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MUSIC' AND level = 'grade_3' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Music Performance', 
  '["Prepare for performances", "Perform for an audience", "Evaluate performances"]'::jsonb,
  '["How do we perform music?"]'::jsonb,
  ARRAY['communication', 'self_efficacy']::cbc_competency[],
  ARRAY['responsibility', 'unity']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MUSIC' AND level = 'grade_3' AND strand_number = 2;

-- Grade 4 Music
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Choral Music', 
  '["Sing in choirs", "Follow conductor", "Blend voices harmonically"]'::jsonb,
  '["What is choral singing?"]'::jsonb,
  ARRAY['communication', 'citizenship']::cbc_competency[],
  ARRAY['unity', 'peace', 'love']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MUSIC' AND level = 'grade_4' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Music Theory', 
  '["Read staff notation", "Understand time signatures", "Write simple melodies"]'::jsonb,
  '["How do we read music?"]'::jsonb,
  ARRAY['learning_to_learn', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MUSIC' AND level = 'grade_4' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Music Composition', 
  '["Create simple melodies", "Write lyrics", "Compose short songs"]'::jsonb,
  '["How do we create music?"]'::jsonb,
  ARRAY['creativity', 'self_efficacy']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MUSIC' AND level = 'grade_4' AND strand_number = 2;

-- Grade 5 Music
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Vocal Techniques', 
  '["Apply proper breathing", "Use vocal registers", "Improve vocal quality"]'::jsonb,
  '["How do we sing better?"]'::jsonb,
  ARRAY['self_efficacy', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MUSIC' AND level = 'grade_5' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Instrumental Music', 
  '["Play recorder or similar", "Read instrumental music", "Perform instrumental pieces"]'::jsonb,
  '["How do we play instruments?"]'::jsonb,
  ARRAY['creativity', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility', 'respect']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MUSIC' AND level = 'grade_5' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Music Appreciation', 
  '["Listen critically to music", "Analyze musical elements", "Appreciate diverse genres"]'::jsonb,
  '["What makes music beautiful?"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['respect', 'unity', 'peace']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MUSIC' AND level = 'grade_5' AND strand_number = 2;

-- Grade 6 Music
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Music Festivals', 
  '["Prepare festival pieces", "Compete in music festivals", "Evaluate performances"]'::jsonb,
  '["How do we prepare for festivals?"]'::jsonb,
  ARRAY['communication', 'self_efficacy']::cbc_competency[],
  ARRAY['integrity', 'unity', 'patriotism']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MUSIC' AND level = 'grade_6' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Music Technology', 
  '["Use basic music software", "Record music digitally", "Edit audio recordings"]'::jsonb,
  '["How is technology used in music?"]'::jsonb,
  ARRAY['digital_literacy', 'creativity']::cbc_competency[],
  ARRAY['responsibility', 'respect']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MUSIC' AND level = 'grade_6' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'World Music', 
  '["Explore global music styles", "Compare music traditions", "Perform international songs"]'::jsonb,
  '["What music exists around the world?"]'::jsonb,
  ARRAY['citizenship', 'communication']::cbc_competency[],
  ARRAY['respect', 'unity', 'peace']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MUSIC' AND level = 'grade_6' AND strand_number = 2;