-- Art and Craft (ART) Sub-strands for PP1-Grade 6 (Fixed - removed 'creativity' from values array)

-- PP1 Art
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Drawing and Colouring', 
  '["Draw simple shapes", "Colour within outlines", "Create simple drawings"]'::jsonb,
  '["How can we express ourselves through drawing?"]'::jsonb,
  ARRAY['creativity', 'self_efficacy']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ART' AND level = 'pp1' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Modelling with Clay', 
  '["Manipulate clay/plasticine", "Create simple shapes", "Make basic objects"]'::jsonb,
  '["What can we make with clay?"]'::jsonb,
  ARRAY['creativity', 'self_efficacy']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ART' AND level = 'pp1' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Paper Crafts', 
  '["Tear paper along lines", "Create paper collages", "Fold simple paper shapes"]'::jsonb,
  '["What can we make with paper?"]'::jsonb,
  ARRAY['creativity', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ART' AND level = 'pp1' AND strand_number = 2;

-- PP2 Art
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Pattern Making', 
  '["Create simple patterns", "Identify patterns in nature", "Use patterns in artwork"]'::jsonb,
  '["What patterns do we see around us?"]'::jsonb,
  ARRAY['creativity', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'respect']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ART' AND level = 'pp2' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Painting', 
  '["Use brushes correctly", "Mix basic colours", "Create simple paintings"]'::jsonb,
  '["How do we paint?"]'::jsonb,
  ARRAY['creativity', 'self_efficacy']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ART' AND level = 'pp2' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Weaving Introduction', 
  '["Understand over-under pattern", "Create simple paper weaving", "Appreciate woven items"]'::jsonb,
  '["How are baskets made?"]'::jsonb,
  ARRAY['creativity', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'patriotism']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ART' AND level = 'pp2' AND strand_number = 2;

-- Grade 1 Art
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Drawing from Observation', 
  '["Observe objects carefully", "Draw objects from observation", "Add details to drawings"]'::jsonb,
  '["How can we draw what we see?"]'::jsonb,
  ARRAY['creativity', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'respect']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ART' AND level = 'grade_1' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Printmaking', 
  '["Create prints using objects", "Make leaf and vegetable prints", "Explore print patterns"]'::jsonb,
  '["What is printmaking?"]'::jsonb,
  ARRAY['creativity', 'self_efficacy']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ART' AND level = 'grade_1' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Indigenous Crafts', 
  '["Identify local craft items", "Create simple traditional crafts", "Appreciate cultural heritage"]'::jsonb,
  '["What crafts are from our culture?"]'::jsonb,
  ARRAY['creativity', 'citizenship']::cbc_competency[],
  ARRAY['patriotism', 'respect', 'unity']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ART' AND level = 'grade_1' AND strand_number = 2;

-- Grade 2 Art
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Colour Theory', 
  '["Identify primary colours", "Mix colours to create new ones", "Apply colour knowledge in art"]'::jsonb,
  '["How are colours made?"]'::jsonb,
  ARRAY['creativity', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ART' AND level = 'grade_2' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Collage Making', 
  '["Select appropriate materials", "Create thematic collages", "Present collage work"]'::jsonb,
  '["How do we make collages?"]'::jsonb,
  ARRAY['creativity', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'respect']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ART' AND level = 'grade_2' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Basketry', 
  '["Identify basketry materials", "Create simple woven items", "Appreciate traditional baskets"]'::jsonb,
  '["How are baskets woven?"]'::jsonb,
  ARRAY['creativity', 'critical_thinking']::cbc_competency[],
  ARRAY['patriotism', 'responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ART' AND level = 'grade_2' AND strand_number = 2;

-- Grade 3 Art
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Perspective Drawing', 
  '["Understand foreground and background", "Draw with depth perception", "Create landscape drawings"]'::jsonb,
  '["How do we show distance in drawings?"]'::jsonb,
  ARRAY['creativity', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ART' AND level = 'grade_3' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Sculpture', 
  '["Create 3D art forms", "Use various materials for sculpture", "Present sculptural work"]'::jsonb,
  '["What is sculpture?"]'::jsonb,
  ARRAY['creativity', 'self_efficacy']::cbc_competency[],
  ARRAY['responsibility', 'respect']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ART' AND level = 'grade_3' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Beadwork', 
  '["Identify beadwork patterns", "Create simple beaded items", "Appreciate cultural significance"]'::jsonb,
  '["How is beadwork done?"]'::jsonb,
  ARRAY['creativity', 'citizenship']::cbc_competency[],
  ARRAY['patriotism', 'respect', 'unity']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ART' AND level = 'grade_3' AND strand_number = 2;

-- Grade 4 Art
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Still Life Drawing', 
  '["Arrange objects for still life", "Draw still life compositions", "Apply shading techniques"]'::jsonb,
  '["How do we draw still life?"]'::jsonb,
  ARRAY['creativity', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'respect']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ART' AND level = 'grade_4' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Batik and Tie-Dye', 
  '["Understand batik techniques", "Create tie-dye patterns", "Appreciate textile arts"]'::jsonb,
  '["How are fabric patterns made?"]'::jsonb,
  ARRAY['creativity', 'self_efficacy']::cbc_competency[],
  ARRAY['responsibility', 'patriotism']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ART' AND level = 'grade_4' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Pottery', 
  '["Identify pottery techniques", "Create pottery items", "Appreciate pottery traditions"]'::jsonb,
  '["How is pottery made?"]'::jsonb,
  ARRAY['creativity', 'critical_thinking']::cbc_competency[],
  ARRAY['patriotism', 'responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ART' AND level = 'grade_4' AND strand_number = 2;

-- Grade 5 Art
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Portrait Drawing', 
  '["Understand facial proportions", "Draw human portraits", "Apply shading to portraits"]'::jsonb,
  '["How do we draw faces?"]'::jsonb,
  ARRAY['creativity', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'respect']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ART' AND level = 'grade_5' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Graphic Design Basics', 
  '["Create simple logos", "Design posters", "Understand visual communication"]'::jsonb,
  '["How are images used to communicate?"]'::jsonb,
  ARRAY['creativity', 'digital_literacy']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ART' AND level = 'grade_5' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Leatherwork', 
  '["Identify leather crafting techniques", "Create simple leather items", "Appreciate leather traditions"]'::jsonb,
  '["How is leather crafted?"]'::jsonb,
  ARRAY['creativity', 'self_efficacy']::cbc_competency[],
  ARRAY['patriotism', 'responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ART' AND level = 'grade_5' AND strand_number = 2;

-- Grade 6 Art
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Advanced Painting', 
  '["Use various painting techniques", "Create thematic paintings", "Critique artwork"]'::jsonb,
  '["What makes a good painting?"]'::jsonb,
  ARRAY['creativity', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'respect']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ART' AND level = 'grade_6' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Photography Basics', 
  '["Understand camera basics", "Compose photographs", "Edit basic images"]'::jsonb,
  '["How do we take good photos?"]'::jsonb,
  ARRAY['creativity', 'digital_literacy']::cbc_competency[],
  ARRAY['responsibility', 'respect']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ART' AND level = 'grade_6' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Art Exhibition', 
  '["Plan an art exhibition", "Display artwork professionally", "Present and discuss art"]'::jsonb,
  '["How do we share our art?"]'::jsonb,
  ARRAY['creativity', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'respect', 'unity']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'ART' AND level = 'grade_6' AND strand_number = 2;