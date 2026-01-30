-- Migration 4: ART, MUSIC, PE, MATH, AGRI, HE, ENG, KIS Sub-strands

-- ART PP1-Grade 6 Strand #3: Crafts/Modelling
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Simple Crafts', 
  '["Create crafts from local materials", "Use basic tools safely", "Display finished crafts"]'::jsonb,
  '["What crafts can we make?"]'::jsonb,
  ARRAY['creativity', 'self_efficacy']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ART' AND level = 'pp1' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Modelling with Local Materials', 
  '["Create models using clay and mud", "Shape basic forms", "Decorate models"]'::jsonb,
  '["What can we mould?"]'::jsonb,
  ARRAY['creativity', 'self_efficacy']::cbc_competency[],
  ARRAY['responsibility', 'patriotism']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ART' AND level = 'pp2' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Traditional Craftwork', 
  '["Identify traditional crafts", "Create simple traditional items", "Appreciate cultural crafts"]'::jsonb,
  '["What crafts did our ancestors make?"]'::jsonb,
  ARRAY['creativity', 'citizenship']::cbc_competency[],
  ARRAY['patriotism', 'respect']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ART' AND level = 'grade_1' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Puppet Making', 
  '["Design simple puppets", "Use various materials", "Perform with puppets"]'::jsonb,
  '["How do we make puppets?"]'::jsonb,
  ARRAY['creativity', 'communication']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ART' AND level = 'grade_2' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Mask Making', 
  '["Design and create masks", "Use recycled materials", "Appreciate mask traditions"]'::jsonb,
  '["What are masks used for?"]'::jsonb,
  ARRAY['creativity', 'citizenship']::cbc_competency[],
  ARRAY['patriotism', 'respect']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ART' AND level = 'grade_3' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Sculpture Techniques', 
  '["Create 3D sculptures", "Use additive and subtractive methods", "Display sculptural work"]'::jsonb,
  '["How do we create sculptures?"]'::jsonb,
  ARRAY['creativity', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'respect']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ART' AND level = 'grade_4' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Digital Art Introduction', 
  '["Use basic digital tools", "Create simple digital designs", "Combine traditional and digital"]'::jsonb,
  '["How can we create art digitally?"]'::jsonb,
  ARRAY['creativity', 'digital_literacy']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ART' AND level = 'grade_5' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Mixed Media Art', 
  '["Combine different art materials", "Create mixed media projects", "Present multimedia artwork"]'::jsonb,
  '["How do we combine art forms?"]'::jsonb,
  ARRAY['creativity', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'respect']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ART' AND level = 'grade_6' AND strand_number = 3;

-- MUSIC Grade 1-6 Strand #3: Listening/Movement/Composition
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Listening Skills', 
  '["Listen attentively to music", "Identify musical sounds", "Respond to different music"]'::jsonb,
  '["What can we hear in music?"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['respect']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MUSIC' AND level = 'grade_1' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Creative Movement', 
  '["Move expressively to music", "Interpret music through dance", "Create movement patterns"]'::jsonb,
  '["How does music make us move?"]'::jsonb,
  ARRAY['creativity', 'self_efficacy']::cbc_competency[],
  ARRAY['love']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MUSIC' AND level = 'grade_2' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Song Creation', 
  '["Create simple melodies", "Write song lyrics", "Perform original songs"]'::jsonb,
  '["How do we create songs?"]'::jsonb,
  ARRAY['creativity', 'communication']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MUSIC' AND level = 'grade_3' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Music Appreciation', 
  '["Analyze musical elements", "Compare music genres", "Critique performances"]'::jsonb,
  '["What makes music good?"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['respect']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MUSIC' AND level = 'grade_4' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Cultural Music Heritage', 
  '["Explore Kenyan music traditions", "Perform traditional music", "Preserve musical heritage"]'::jsonb,
  '["What music is from our culture?"]'::jsonb,
  ARRAY['citizenship', 'communication']::cbc_competency[],
  ARRAY['patriotism', 'unity']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MUSIC' AND level = 'grade_5' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Music Composition', 
  '["Compose melodies with notation", "Arrange music for groups", "Record compositions"]'::jsonb,
  '["How do composers write music?"]'::jsonb,
  ARRAY['creativity', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MUSIC' AND level = 'grade_6' AND strand_number = 3;

-- PE Grade 1-6 Strand #3: Health/Fitness/Outdoor Activities
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Body Awareness', 
  '["Identify body parts", "Move body parts purposefully", "Develop body control"]'::jsonb,
  '["How do our bodies work?"]'::jsonb,
  ARRAY['self_efficacy', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'PE' AND level = 'grade_1' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Outdoor Play', 
  '["Play safely outdoors", "Use playground equipment", "Explore natural environment"]'::jsonb,
  '["How do we play safely outside?"]'::jsonb,
  ARRAY['self_efficacy', 'citizenship']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'PE' AND level = 'grade_2' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Fitness Activities', 
  '["Perform fitness exercises", "Measure fitness levels", "Set fitness goals"]'::jsonb,
  '["How do we stay fit?"]'::jsonb,
  ARRAY['self_efficacy', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'PE' AND level = 'grade_3' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Adventure Activities', 
  '["Participate in hiking", "Practice orienteering", "Apply outdoor survival skills"]'::jsonb,
  '["What are adventure activities?"]'::jsonb,
  ARRAY['self_efficacy', 'citizenship']::cbc_competency[],
  ARRAY['responsibility', 'unity']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'PE' AND level = 'grade_4' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Sports Nutrition', 
  '["Understand nutrition for sports", "Plan healthy diets", "Apply nutrition knowledge"]'::jsonb,
  '["What should athletes eat?"]'::jsonb,
  ARRAY['critical_thinking', 'self_efficacy']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'PE' AND level = 'grade_5' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Sports First Aid', 
  '["Identify common sports injuries", "Apply basic first aid", "Practice injury prevention"]'::jsonb,
  '["How do we handle sports injuries?"]'::jsonb,
  ARRAY['self_efficacy', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'PE' AND level = 'grade_6' AND strand_number = 3;

-- MATH Grade 1-3 Strand #4-5: Data Handling/Geometry
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Data Collection', 
  '["Collect simple data", "Record data using tallies", "Organize data in tables"]'::jsonb,
  '["How do we collect information?"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_1' AND strand_number = 4;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Pictographs', 
  '["Read pictographs", "Create simple pictographs", "Interpret pictograph data"]'::jsonb,
  '["How do pictures show data?"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_2' AND strand_number = 4;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Bar Graphs', 
  '["Read bar graphs", "Create bar graphs", "Compare data using graphs"]'::jsonb,
  '["How do bar graphs show information?"]'::jsonb,
  ARRAY['critical_thinking', 'digital_literacy']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_3' AND strand_number = 4;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Spatial Awareness', 
  '["Identify positions", "Describe directions", "Navigate simple maps"]'::jsonb,
  '["How do we describe where things are?"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_1' AND strand_number = 5;

-- AGRI Grade 4-6 Strand #3: Farm Tools/Structures/Agribusiness
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Farm Tools and Equipment', 
  '["Identify farm tools", "Use tools safely", "Maintain farm equipment"]'::jsonb,
  '["What tools do farmers need?"]'::jsonb,
  ARRAY['self_efficacy', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'AGRI' AND level = 'grade_4' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Farm Structures', 
  '["Identify farm structures", "Explain purpose of structures", "Design simple structures"]'::jsonb,
  '["What buildings does a farm need?"]'::jsonb,
  ARRAY['creativity', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'AGRI' AND level = 'grade_5' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Agribusiness Basics', 
  '["Understand farm as business", "Calculate simple profits", "Market farm products"]'::jsonb,
  '["How do farmers make money?"]'::jsonb,
  ARRAY['critical_thinking', 'creativity']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'AGRI' AND level = 'grade_6' AND strand_number = 3;

-- HE Grade 4-6 Strand #3: Consumer Education/Home Management/Family Life
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Consumer Education', 
  '["Make wise buying decisions", "Understand product labels", "Practice budgeting"]'::jsonb,
  '["How do we spend money wisely?"]'::jsonb,
  ARRAY['critical_thinking', 'self_efficacy']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'HE' AND level = 'grade_4' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Home Organization', 
  '["Organize living spaces", "Create cleaning routines", "Manage home resources"]'::jsonb,
  '["How do we keep our homes organized?"]'::jsonb,
  ARRAY['self_efficacy', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'HE' AND level = 'grade_5' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Family Life Education', 
  '["Understand family roles", "Practice family communication", "Appreciate family values"]'::jsonb,
  '["What makes a happy family?"]'::jsonb,
  ARRAY['communication', 'citizenship']::cbc_competency[],
  ARRAY['love', 'unity', 'respect']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'HE' AND level = 'grade_6' AND strand_number = 3;

-- ENG Grade 7-9 Strand #4: Grammar
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Parts of Speech', 
  '["Identify all parts of speech", "Use parts of speech correctly", "Analyze sentence structures"]'::jsonb,
  '["What are the building blocks of sentences?"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_7' AND strand_number = 4;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Tenses and Usage', 
  '["Use all tenses correctly", "Apply sequence of tenses", "Identify tense errors"]'::jsonb,
  '["How do tenses affect meaning?"]'::jsonb,
  ARRAY['communication', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_8' AND strand_number = 4;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Advanced Grammar', 
  '["Apply complex grammatical structures", "Edit for grammar accuracy", "Write grammatically correct texts"]'::jsonb,
  '["How does grammar enhance communication?"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_9' AND strand_number = 4;

-- KIS Grade 6-8 Strand #4: Sarufi (Grammar)
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Aina za Maneno', 
  '["Tambua aina za maneno", "Tumia maneno kwa usahihi", "Changanua sentensi"]'::jsonb,
  '["Maneno yanagawanywa vipi?"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'patriotism']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_6' AND strand_number = 4;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Uundaji wa Sentensi', 
  '["Unda sentensi sahihi", "Tumia viambishi", "Badilisha sentensi"]'::jsonb,
  '["Sentensi inaundwaje?"]'::jsonb,
  ARRAY['communication', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility', 'patriotism']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_7' AND strand_number = 4;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Sarufi ya Juu', 
  '["Tumia sarufi changamano", "Hariri makosa ya sarufi", "Andika maandishi sahihi"]'::jsonb,
  '["Sarufi inaboresha mawasiliano vipi?"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'integrity', 'patriotism']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'KIS' AND level = 'grade_8' AND strand_number = 4;