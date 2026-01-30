-- Science (SCI) Sub-strands for Grade 4-9
-- Grade 4 Science
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Characteristics of Living Things', 
  '["Identify characteristics of living things", "Classify organisms as living or non-living", "Explain the importance of living things"]'::jsonb,
  '["What makes something alive?", "How do we know if something is living?"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'respect']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_4' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Classification of Plants', 
  '["Classify plants into flowering and non-flowering", "Identify parts of a plant", "Describe functions of plant parts"]'::jsonb,
  '["How are plants different from each other?"]'::jsonb,
  ARRAY['critical_thinking', 'creativity']::cbc_competency[],
  ARRAY['responsibility', 'respect']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_4' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 3, 'Classification of Animals', 
  '["Classify animals into vertebrates and invertebrates", "Identify characteristics of animal groups", "Describe animal adaptations"]'::jsonb,
  '["How are animals classified?", "What makes animals different?"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['respect', 'responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_4' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'States of Matter', 
  '["Identify three states of matter", "Describe properties of solids, liquids, and gases", "Demonstrate changes in states of matter"]'::jsonb,
  '["What are the different forms of matter?"]'::jsonb,
  ARRAY['critical_thinking', 'creativity']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_4' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Properties of Materials', 
  '["Identify properties of common materials", "Classify materials based on properties", "Select appropriate materials for different uses"]'::jsonb,
  '["Why do we use different materials for different purposes?"]'::jsonb,
  ARRAY['critical_thinking', 'creativity']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[], 5, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_4' AND strand_number = 2;

-- Grade 5 Science
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Human Body Systems', 
  '["Identify major body systems", "Describe functions of body systems", "Explain how body systems work together"]'::jsonb,
  '["How does our body work?", "Why do we need different body systems?"]'::jsonb,
  ARRAY['critical_thinking', 'self_efficacy']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_5' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Nutrition and Health', 
  '["Identify nutrients and their sources", "Explain importance of balanced diet", "Describe effects of malnutrition"]'::jsonb,
  '["Why is eating healthy important?"]'::jsonb,
  ARRAY['self_efficacy', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_5' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Simple Machines', 
  '["Identify types of simple machines", "Explain how simple machines make work easier", "Apply knowledge of simple machines in daily life"]'::jsonb,
  '["How do machines help us?"]'::jsonb,
  ARRAY['critical_thinking', 'creativity']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_5' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Force and Motion', 
  '["Define force and motion", "Identify types of forces", "Demonstrate effects of forces on objects"]'::jsonb,
  '["What makes things move?", "How do forces affect motion?"]'::jsonb,
  ARRAY['critical_thinking', 'creativity']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_5' AND strand_number = 2;

-- Grade 6 Science
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Reproduction in Plants', 
  '["Describe sexual and asexual reproduction in plants", "Identify parts of a flower", "Explain pollination and fertilization"]'::jsonb,
  '["How do plants reproduce?"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'respect']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_6' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Reproduction in Animals', 
  '["Describe reproduction in different animals", "Compare oviparous and viviparous animals", "Explain life cycles"]'::jsonb,
  '["How do animals reproduce and grow?"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['respect', 'responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_6' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Energy Sources', 
  '["Identify renewable and non-renewable energy sources", "Describe uses of different energy sources", "Explain importance of energy conservation"]'::jsonb,
  '["Where does energy come from?", "How can we save energy?"]'::jsonb,
  ARRAY['critical_thinking', 'citizenship']::cbc_competency[],
  ARRAY['responsibility', 'patriotism']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_6' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Electricity', 
  '["Identify sources of electricity", "Describe uses of electricity", "Explain safety measures when using electricity"]'::jsonb,
  '["How is electricity produced and used safely?"]'::jsonb,
  ARRAY['critical_thinking', 'self_efficacy']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_6' AND strand_number = 2;

-- Grade 7 Science
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Cell Structure and Function', 
  '["Describe the structure of cells", "Identify organelles and their functions", "Compare plant and animal cells"]'::jsonb,
  '["What is the basic unit of life?", "How do cells differ?"]'::jsonb,
  ARRAY['critical_thinking', 'digital_literacy']::cbc_competency[],
  ARRAY['responsibility', 'respect']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_7' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Classification of Organisms', 
  '["Explain the classification system", "Classify organisms into kingdoms", "Use dichotomous keys for identification"]'::jsonb,
  '["How are living things organized?"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_7' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Atoms and Elements', 
  '["Describe atomic structure", "Identify elements and their symbols", "Explain the periodic table organization"]'::jsonb,
  '["What is matter made of?"]'::jsonb,
  ARRAY['critical_thinking', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_7' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Chemical Reactions', 
  '["Identify types of chemical reactions", "Balance simple chemical equations", "Describe factors affecting reaction rates"]'::jsonb,
  '["How do substances change?"]'::jsonb,
  ARRAY['critical_thinking', 'creativity']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_7' AND strand_number = 2;

-- Grade 8 Science
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Genetics and Heredity', 
  '["Explain inheritance of traits", "Describe DNA structure and function", "Solve genetic cross problems"]'::jsonb,
  '["How are traits passed from parents to offspring?"]'::jsonb,
  ARRAY['critical_thinking', 'digital_literacy']::cbc_competency[],
  ARRAY['responsibility', 'respect']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_8' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Evolution and Adaptation', 
  '["Explain natural selection", "Describe evidence of evolution", "Analyze adaptations in organisms"]'::jsonb,
  '["How do species change over time?"]'::jsonb,
  ARRAY['critical_thinking', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility', 'respect']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_8' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Acids and Bases', 
  '["Identify properties of acids and bases", "Describe pH scale", "Perform neutralization reactions"]'::jsonb,
  '["What makes substances acidic or basic?"]'::jsonb,
  ARRAY['critical_thinking', 'creativity']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_8' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Organic Chemistry Introduction', 
  '["Identify organic compounds", "Describe hydrocarbons", "Explain uses of organic compounds"]'::jsonb,
  '["What are carbon-based compounds?"]'::jsonb,
  ARRAY['critical_thinking', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_8' AND strand_number = 2;

-- Grade 9 Science
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Ecology and Ecosystems', 
  '["Describe ecosystem components", "Explain food chains and webs", "Analyze ecological relationships"]'::jsonb,
  '["How do living things interact with their environment?"]'::jsonb,
  ARRAY['critical_thinking', 'citizenship']::cbc_competency[],
  ARRAY['responsibility', 'respect', 'patriotism']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_9' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Conservation and Environment', 
  '["Identify environmental issues", "Describe conservation strategies", "Propose solutions for environmental problems"]'::jsonb,
  '["How can we protect our environment?"]'::jsonb,
  ARRAY['citizenship', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'patriotism', 'social_justice']::cbc_value[], 6, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_9' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 1, 'Waves and Sound', 
  '["Describe properties of waves", "Explain sound production and transmission", "Apply wave concepts to real-life situations"]'::jsonb,
  '["How do waves carry energy?"]'::jsonb,
  ARRAY['critical_thinking', 'creativity']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_9' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, core_competencies, values, suggested_lesson_count, suggested_resources, assessment_rubrics)
SELECT id, 2, 'Light and Optics', 
  '["Describe properties of light", "Explain reflection and refraction", "Describe uses of optical instruments"]'::jsonb,
  '["How does light behave?"]'::jsonb,
  ARRAY['critical_thinking', 'digital_literacy']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[], 8, '[]'::jsonb, '{}'::jsonb
FROM cbc_strands WHERE subject_code = 'SCI' AND level = 'grade_9' AND strand_number = 2;