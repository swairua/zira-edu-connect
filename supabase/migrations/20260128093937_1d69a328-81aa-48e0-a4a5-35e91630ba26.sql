-- Seed 50 CBC-aligned sample questions as templates
-- Fixed: corrected difficulty values (easy/medium/hard only)

DO $$
DECLARE
  v_institution_id UUID;
  v_math_subject_id UUID;
  v_eng_subject_id UUID;
  v_sci_subject_id UUID;
  v_sst_subject_id UUID;
  v_kis_subject_id UUID;
  v_staff_id UUID;
BEGIN
  -- Get demo institution
  SELECT id INTO v_institution_id FROM institutions WHERE code = 'DEMO' OR name ILIKE '%demo%' LIMIT 1;
  
  IF v_institution_id IS NULL THEN
    SELECT id INTO v_institution_id FROM institutions LIMIT 1;
  END IF;
  
  IF v_institution_id IS NULL THEN
    RAISE NOTICE 'No institution found, skipping sample questions';
    RETURN;
  END IF;
  
  -- Get subject IDs
  SELECT id INTO v_math_subject_id FROM subjects WHERE institution_id = v_institution_id AND (code = 'MATH' OR name ILIKE '%math%') LIMIT 1;
  SELECT id INTO v_eng_subject_id FROM subjects WHERE institution_id = v_institution_id AND (code = 'ENG' OR name ILIKE '%english%') LIMIT 1;
  SELECT id INTO v_sci_subject_id FROM subjects WHERE institution_id = v_institution_id AND (code = 'SCI' OR name ILIKE '%science%') LIMIT 1;
  SELECT id INTO v_sst_subject_id FROM subjects WHERE institution_id = v_institution_id AND (code = 'SST' OR name ILIKE '%social%') LIMIT 1;
  SELECT id INTO v_kis_subject_id FROM subjects WHERE institution_id = v_institution_id AND (code = 'KIS' OR name ILIKE '%kiswahili%' OR name ILIKE '%swahili%') LIMIT 1;
  
  SELECT id INTO v_staff_id FROM staff WHERE institution_id = v_institution_id LIMIT 1;
  
  -- MATH Questions (15)
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, options, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_math_subject_id, '49638527-2b62-4acf-8209-3dd58c35af32', 'Place Value', 'multiple_choice',
    'In the number 45,678, what is the place value of digit 5?',
    '[{"label":"A","text":"Ones","is_correct":false},{"label":"B","text":"Tens","is_correct":false},{"label":"C","text":"Hundreds","is_correct":false},{"label":"D","text":"Thousands","is_correct":true}]'::jsonb,
    1, 'easy', 'knowledge', 'The digit 5 is in the thousands place', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_math_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, correct_answer, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_math_subject_id, '49638527-2b62-4acf-8209-3dd58c35af32', 'Rounding', 'short_answer',
    'Round off 34,567 to the nearest 1,000.', '35,000', 2, 'medium', 'application', 'Since 567 >= 500, round up to 35,000', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_math_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, options, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_math_subject_id, 'c07e98d9-e300-4cd9-8322-cbdddf4547c6', 'Types of Fractions', 'multiple_choice',
    'Which of the following is an improper fraction?',
    '[{"label":"A","text":"2/5","is_correct":false},{"label":"B","text":"3/4","is_correct":false},{"label":"C","text":"7/3","is_correct":true},{"label":"D","text":"1/2","is_correct":false}]'::jsonb,
    1, 'easy', 'knowledge', 'Improper fraction has numerator > denominator', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_math_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, options, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_math_subject_id, '56c33d66-a2ff-4344-b0e4-878883127f52', 'Equivalent Fractions', 'multiple_choice',
    'Which fraction is equivalent to 2/4?',
    '[{"label":"A","text":"1/2","is_correct":true},{"label":"B","text":"3/4","is_correct":false},{"label":"C","text":"2/3","is_correct":false},{"label":"D","text":"4/6","is_correct":false}]'::jsonb,
    1, 'easy', 'comprehension', '2/4 simplifies to 1/2', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_math_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, correct_answer, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_math_subject_id, 'aefb3940-0796-4b15-80a7-9ae0bbdc5596', 'Perimeter', 'short_answer',
    'Calculate the perimeter of a rectangle with length 12 cm and width 8 cm.', '40 cm', 2, 'medium', 'application', 'Perimeter = 2(12 + 8) = 40 cm', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_math_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, correct_answer, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_math_subject_id, 'aefb3940-0796-4b15-80a7-9ae0bbdc5596', 'Area', 'short_answer',
    'Find the area of a square with sides of 9 metres.', '81 square metres', 2, 'medium', 'application', 'Area = 9 x 9 = 81 sq m', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_math_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, options, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_math_subject_id, '97f81c23-4f42-46f3-b8fb-0b1a97989371', 'Order of Operations', 'multiple_choice',
    'Calculate: 3 + 4 x 2 - 1',
    '[{"label":"A","text":"13","is_correct":false},{"label":"B","text":"10","is_correct":true},{"label":"C","text":"14","is_correct":false},{"label":"D","text":"9","is_correct":false}]'::jsonb,
    2, 'medium', 'application', 'BODMAS: 4x2=8, then 3+8-1=10', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_math_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, correct_answer, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_math_subject_id, '16fc0696-39e5-49a9-b4cb-7253f0442397', 'Decimal Operations', 'short_answer',
    'Work out: 3.45 + 2.8', '6.25', 2, 'medium', 'application', 'Align decimal points: 3.45 + 2.80 = 6.25', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_math_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, options, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_math_subject_id, 'ad30576e-95c8-4da7-9209-e4e77eac8d0a', 'Ratios', 'multiple_choice',
    'Simplify the ratio 12:16 to its simplest form.',
    '[{"label":"A","text":"3:4","is_correct":true},{"label":"B","text":"6:8","is_correct":false},{"label":"C","text":"2:3","is_correct":false},{"label":"D","text":"4:5","is_correct":false}]'::jsonb,
    2, 'medium', 'application', 'Divide both by HCF(4): 12/4:16/4 = 3:4', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_math_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, correct_answer, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_math_subject_id, 'aa46838d-0253-4a2c-b894-15d9a6bf04fa', 'Percentages', 'short_answer',
    'Wanjiku scored 72 out of 80 in a test. What percentage did she score?', '90%', 2, 'medium', 'application', '(72/80) x 100 = 90%', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_math_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, options, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_math_subject_id, '41317013-e206-4bea-8620-a4e11a950f4e', 'Angles', 'multiple_choice',
    'An angle that measures exactly 90 degrees is called a:',
    '[{"label":"A","text":"Acute angle","is_correct":false},{"label":"B","text":"Right angle","is_correct":true},{"label":"C","text":"Obtuse angle","is_correct":false},{"label":"D","text":"Reflex angle","is_correct":false}]'::jsonb,
    1, 'easy', 'knowledge', 'A right angle = 90 degrees', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_math_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, options, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_math_subject_id, 'd0826d26-1246-46c0-8a8c-8d4159d9b47c', 'Shapes', 'multiple_choice',
    'How many sides does a hexagon have?',
    '[{"label":"A","text":"4","is_correct":false},{"label":"B","text":"5","is_correct":false},{"label":"C","text":"6","is_correct":true},{"label":"D","text":"8","is_correct":false}]'::jsonb,
    1, 'easy', 'knowledge', 'Hexa = 6 sides', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_math_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, options, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_math_subject_id, 'c1be06c8-f8c1-415c-9372-c950a65d0057', 'Integers', 'multiple_choice',
    'What is the result of (-5) + (+8)?',
    '[{"label":"A","text":"-13","is_correct":false},{"label":"B","text":"-3","is_correct":false},{"label":"C","text":"3","is_correct":true},{"label":"D","text":"13","is_correct":false}]'::jsonb,
    2, 'medium', 'application', '-5 + 8 = 3', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_math_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, correct_answer, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_math_subject_id, 'c1be06c8-f8c1-415c-9372-c950a65d0057', 'Integer Word Problem', 'short_answer',
    'The temperature in Nairobi was 23C. It dropped by 8C. What is the new temperature?', '15C', 2, 'medium', 'application', '23 - 8 = 15C', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_math_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, correct_answer, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_math_subject_id, 'ba3f01d2-461a-49a0-9b3f-f1217806eb43', 'Data Analysis', 'short_answer',
    'Find the mean of: 12, 15, 18, 21, 24', '18', 3, 'hard', 'application', 'Sum=90, Mean=90/5=18', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_math_subject_id IS NOT NULL;
  
  -- ENGLISH Questions (10)
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, options, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_eng_subject_id, '16297f20-a4ea-4a2a-8abe-2164c1d79f5b', 'Parts of Speech', 'multiple_choice',
    'Identify the noun in: "The clever boy solved the puzzle quickly."',
    '[{"label":"A","text":"clever","is_correct":false},{"label":"B","text":"boy","is_correct":true},{"label":"C","text":"solved","is_correct":false},{"label":"D","text":"quickly","is_correct":false}]'::jsonb,
    1, 'easy', 'knowledge', 'Boy is a noun (person)', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_eng_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, options, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_eng_subject_id, 'd1807998-b1ca-4644-a79d-bcd24fdf4071', 'Tenses', 'multiple_choice',
    'Choose the correct past tense: "Yesterday, Amina _____ to school early."',
    '[{"label":"A","text":"go","is_correct":false},{"label":"B","text":"goes","is_correct":false},{"label":"C","text":"went","is_correct":true},{"label":"D","text":"going","is_correct":false}]'::jsonb,
    1, 'easy', 'application', 'Went is past tense of go', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_eng_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, options, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_eng_subject_id, 'a548e879-926f-41dd-8b5d-0f68ed8734f5', 'Punctuation', 'true_false',
    'A question mark should be used at the end of: "What time does the bus arrive"',
    '[{"label":"True","text":"True","is_correct":true},{"label":"False","text":"False","is_correct":false}]'::jsonb,
    1, 'easy', 'knowledge', 'Interrogative sentences need question marks', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_eng_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, correct_answer, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_eng_subject_id, '46bfd071-33ba-42b7-a031-ee707af58ee0', 'Sentence Structure', 'fill_blank',
    'Complete: "Neither Juma _____ Kipchoge came to school today."', 'nor', 1, 'medium', 'application', 'Neither...nor is a correlative conjunction pair', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_eng_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, options, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_eng_subject_id, 'b4332660-b86f-4eff-b8fe-ee0f32973f22', 'Vocabulary', 'multiple_choice',
    'What is the opposite (antonym) of "generous"?',
    '[{"label":"A","text":"kind","is_correct":false},{"label":"B","text":"stingy","is_correct":true},{"label":"C","text":"helpful","is_correct":false},{"label":"D","text":"wealthy","is_correct":false}]'::jsonb,
    1, 'medium', 'knowledge', 'Generous vs stingy', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_eng_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, options, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_eng_subject_id, '8b28dead-a95d-497d-9a37-bd2244489f25', 'Reading Comprehension', 'multiple_choice',
    'Read: "Wafula felt his heart racing as he approached the finish line." How was Wafula feeling?',
    '[{"label":"A","text":"Bored","is_correct":false},{"label":"B","text":"Excited and nervous","is_correct":true},{"label":"C","text":"Angry","is_correct":false},{"label":"D","text":"Sleepy","is_correct":false}]'::jsonb,
    2, 'medium', 'comprehension', 'Racing heart = excitement/nervousness', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_eng_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, correct_answer, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_eng_subject_id, 'dda67071-5051-4ee4-beb0-56e5e74157b2', 'Letter Writing', 'short_answer',
    'What salutation would you use for a formal letter to your headteacher?', 'Dear Sir/Madam', 2, 'medium', 'knowledge', 'Formal salutations for letters', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_eng_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, options, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_eng_subject_id, 'd9f168f5-9ac6-4aa0-8682-30b784b0471e', 'Complex Sentences', 'multiple_choice',
    'Which uses "although" correctly?',
    '[{"label":"A","text":"Although it rained we went swimming.","is_correct":false},{"label":"B","text":"Although it rained, we went swimming.","is_correct":true},{"label":"C","text":"We went swimming, although.","is_correct":false},{"label":"D","text":"It rained although we went swimming.","is_correct":false}]'::jsonb,
    2, 'hard', 'application', 'Subordinate clause needs comma before main clause', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_eng_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, correct_answer, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_eng_subject_id, 'ba5a6676-20d4-42c9-9645-54fd2302c802', 'Essay Writing', 'long_answer',
    'Write a paragraph about your favorite Kenyan holiday.', 'Varied answers. Check for topic sentence, details, grammar.', 5, 'hard', 'synthesis', 'Tests creative writing', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_eng_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, options, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_eng_subject_id, '0e49d6c3-def1-41a3-87db-187f5ae13888', 'Figures of Speech', 'multiple_choice',
    'In "The wind whispered through the trees," the figure of speech is:',
    '[{"label":"A","text":"Simile","is_correct":false},{"label":"B","text":"Personification","is_correct":true},{"label":"C","text":"Metaphor","is_correct":false},{"label":"D","text":"Alliteration","is_correct":false}]'::jsonb,
    2, 'hard', 'analysis', 'Personification gives human qualities to non-human things', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_eng_subject_id IS NOT NULL;
  
  -- SCIENCE Questions (10)
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, options, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_sci_subject_id, '75dbef39-d97a-452d-98bf-54d38b7d6a2a', 'Living Things', 'multiple_choice',
    'Which is NOT a characteristic of living things?',
    '[{"label":"A","text":"Respiration","is_correct":false},{"label":"B","text":"Growth","is_correct":false},{"label":"C","text":"Rusting","is_correct":true},{"label":"D","text":"Reproduction","is_correct":false}]'::jsonb,
    1, 'easy', 'knowledge', 'Rusting is a chemical change in non-living things', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_sci_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, options, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_sci_subject_id, 'c53cdfdb-5390-4fe2-bf95-b6b3eaae7deb', 'Plant Classification', 'true_false',
    'Flowering plants produce seeds inside fruits.',
    '[{"label":"True","text":"True","is_correct":true},{"label":"False","text":"False","is_correct":false}]'::jsonb,
    1, 'easy', 'knowledge', 'Angiosperms produce seeds in fruits', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_sci_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, options, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_sci_subject_id, 'b69d515c-af9a-4c70-9906-d71be917807e', 'Animal Classification', 'multiple_choice',
    'Which group has scales and breathes using gills?',
    '[{"label":"A","text":"Mammals","is_correct":false},{"label":"B","text":"Birds","is_correct":false},{"label":"C","text":"Fish","is_correct":true},{"label":"D","text":"Reptiles","is_correct":false}]'::jsonb,
    1, 'easy', 'knowledge', 'Fish have scales and gills', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_sci_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, options, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_sci_subject_id, 'ef1f87b6-8c70-456d-822a-34aaa18493e9', 'States of Matter', 'multiple_choice',
    'When water turns into steam, this is called:',
    '[{"label":"A","text":"Condensation","is_correct":false},{"label":"B","text":"Evaporation","is_correct":true},{"label":"C","text":"Freezing","is_correct":false},{"label":"D","text":"Melting","is_correct":false}]'::jsonb,
    1, 'medium', 'comprehension', 'Evaporation = liquid to gas', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_sci_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, correct_answer, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_sci_subject_id, '477a2a06-3c66-4955-a494-332d78aed806', 'Ecosystems', 'short_answer',
    'Name TWO producers in a grassland ecosystem.', 'Grass, acacia trees, shrubs (any two)', 2, 'medium', 'knowledge', 'Producers make food via photosynthesis', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_sci_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, options, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_sci_subject_id, '22a2d47c-920a-46fe-b2ce-dc4cb4fe469b', 'Human Body', 'multiple_choice',
    'Which organ pumps blood throughout the body?',
    '[{"label":"A","text":"Brain","is_correct":false},{"label":"B","text":"Lungs","is_correct":false},{"label":"C","text":"Heart","is_correct":true},{"label":"D","text":"Kidneys","is_correct":false}]'::jsonb,
    1, 'easy', 'knowledge', 'Heart pumps blood in circulatory system', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_sci_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, options, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_sci_subject_id, 'db59ff15-e859-40c8-a405-0c688e346cb7', 'Simple Machines', 'multiple_choice',
    'Which is an example of a lever?',
    '[{"label":"A","text":"A screw","is_correct":false},{"label":"B","text":"A wheelbarrow","is_correct":true},{"label":"C","text":"A ramp","is_correct":false},{"label":"D","text":"A pulley","is_correct":false}]'::jsonb,
    1, 'medium', 'application', 'Wheelbarrow is a class 2 lever', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_sci_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, correct_answer, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_sci_subject_id, 'bed7ab76-8cba-4515-ab9b-a908fb30edb9', 'Nutrition', 'short_answer',
    'Give TWO foods rich in proteins.', 'Meat, fish, eggs, beans, milk (any two)', 2, 'easy', 'knowledge', 'Proteins for body building', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_sci_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, correct_answer, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_sci_subject_id, '991882f6-e863-497d-81ae-c41ffbb1a907', 'Plant Reproduction', 'long_answer',
    'Describe the difference between self-pollination and cross-pollination.', 'Self-pollination: same flower/plant. Cross-pollination: different plants, carried by insects/wind.', 5, 'hard', 'analysis', 'Plant reproduction mechanisms', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_sci_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, options, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_sci_subject_id, '60a7510f-f541-4e0b-bf5b-5bb4497c3ec8', 'Energy', 'multiple_choice',
    'A solar panel converts sunlight into:',
    '[{"label":"A","text":"Sound energy","is_correct":false},{"label":"B","text":"Electrical energy","is_correct":true},{"label":"C","text":"Chemical energy","is_correct":false},{"label":"D","text":"Mechanical energy","is_correct":false}]'::jsonb,
    2, 'medium', 'comprehension', 'Solar panels convert light to electricity', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_sci_subject_id IS NOT NULL;
  
  -- SOCIAL STUDIES Questions (10)
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, options, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_sst_subject_id, '0e3d8273-4fc0-4831-8936-4e03a4ae4a5b', 'Counties', 'multiple_choice',
    'How many counties are there in Kenya?',
    '[{"label":"A","text":"45","is_correct":false},{"label":"B","text":"47","is_correct":true},{"label":"C","text":"50","is_correct":false},{"label":"D","text":"42","is_correct":false}]'::jsonb,
    1, 'easy', 'knowledge', 'Kenya has 47 counties (2010 Constitution)', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_sst_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, options, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_sst_subject_id, '923e29b0-ce27-45da-bbab-30760ae96dfd', 'County Government', 'multiple_choice',
    'Who is the head of a county government?',
    '[{"label":"A","text":"President","is_correct":false},{"label":"B","text":"Senator","is_correct":false},{"label":"C","text":"Governor","is_correct":true},{"label":"D","text":"MCA","is_correct":false}]'::jsonb,
    1, 'easy', 'knowledge', 'Governor heads the county executive', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_sst_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, options, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_sst_subject_id, '8b998299-1e1e-4351-a3fc-6f1e5a954a2f', 'Map Reading', 'multiple_choice',
    'A scale of 1:50,000 means:',
    '[{"label":"A","text":"1 cm = 50 km","is_correct":false},{"label":"B","text":"1 cm = 500 m","is_correct":true},{"label":"C","text":"Map is 50,000x bigger","is_correct":false},{"label":"D","text":"1 km = 50,000 cm on map","is_correct":false}]'::jsonb,
    2, 'medium', 'comprehension', '1 cm on map = 50,000 cm = 500 m on ground', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_sst_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, correct_answer, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_sst_subject_id, 'a1aef4c1-16bc-442d-a8ed-1371c2a1f228', 'Physical Features', 'short_answer',
    'Name the highest mountain in Kenya.', 'Mount Kenya', 1, 'easy', 'knowledge', 'Mt Kenya is 5,199m', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_sst_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, options, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_sst_subject_id, 'd3965b6e-7692-48a1-b931-f7fa5678251c', 'Rights', 'true_false',
    'Children have the right to education according to the Kenyan Constitution.',
    '[{"label":"True","text":"True","is_correct":true},{"label":"False","text":"False","is_correct":false}]'::jsonb,
    1, 'easy', 'knowledge', 'Article 53 guarantees right to education', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_sst_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, options, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_sst_subject_id, '485aa6c3-1d9a-488e-99d1-efa647e44e08', 'Constitution', 'multiple_choice',
    'When was the current Kenyan Constitution promulgated?',
    '[{"label":"A","text":"1963","is_correct":false},{"label":"B","text":"2002","is_correct":false},{"label":"C","text":"2010","is_correct":true},{"label":"D","text":"2017","is_correct":false}]'::jsonb,
    1, 'medium', 'knowledge', 'Constitution promulgated August 27, 2010', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_sst_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, correct_answer, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_sst_subject_id, '0737ac7c-8f83-457c-a214-c0486171f442', 'Natural Resources', 'short_answer',
    'Give TWO natural resources found in Kenya.', 'Forests, wildlife, minerals, water (any two)', 2, 'medium', 'knowledge', 'Kenya has diverse natural resources', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_sst_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, options, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_sst_subject_id, '7c289cf6-d871-4164-95c3-aa6974073b72', 'Weather', 'multiple_choice',
    'Which instrument measures rainfall?',
    '[{"label":"A","text":"Thermometer","is_correct":false},{"label":"B","text":"Barometer","is_correct":false},{"label":"C","text":"Rain gauge","is_correct":true},{"label":"D","text":"Anemometer","is_correct":false}]'::jsonb,
    1, 'easy', 'knowledge', 'Rain gauge measures rainfall in mm', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_sst_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, correct_answer, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_sst_subject_id, 'beaa3e36-27e4-4965-9984-476def4fc1cc', 'Conflict Resolution', 'long_answer',
    'Explain THREE ways conflicts can be resolved peacefully in school.', 'Dialogue, mediation, peer counselling, compromise (any three)', 6, 'hard', 'analysis', 'Conflict resolution strategies', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_sst_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, options, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_sst_subject_id, 'd3a13158-bae3-46d8-968b-0ad9e6b816b4', 'Elections', 'multiple_choice',
    'How often are general elections held in Kenya?',
    '[{"label":"A","text":"Every 4 years","is_correct":false},{"label":"B","text":"Every 5 years","is_correct":true},{"label":"C","text":"Every 6 years","is_correct":false},{"label":"D","text":"Every 7 years","is_correct":false}]'::jsonb,
    1, 'medium', 'knowledge', 'Elections every 5 years per Constitution', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_sst_subject_id IS NOT NULL;
  
  -- KISWAHILI Questions (5)
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, options, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_kis_subject_id, '3ed8012f-c3c6-4098-94af-9cad539497c3', 'Sentensi', 'multiple_choice',
    'Chagua sentensi iliyo sahihi:',
    '[{"label":"A","text":"Watoto wamekula chakula","is_correct":true},{"label":"B","text":"Watoto wamekula vyakula","is_correct":false},{"label":"C","text":"Mtoto wamekula chakula","is_correct":false},{"label":"D","text":"Watoto amekula chakula","is_correct":false}]'::jsonb,
    1, 'medium', 'application', 'Upatanisho wa kiima na kiarifu', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_kis_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, correct_answer, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_kis_subject_id, '1a35c13f-56a5-41fd-ad91-2de680312b40', 'Uandishi', 'fill_blank',
    'Jaza nafasi: Mwalimu _____ watoto hadithi nzuri jana.', 'aliwasimulia', 1, 'medium', 'application', 'Kitenzi wakati uliopita', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_kis_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, options, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_kis_subject_id, '1066d0b7-cf04-4a39-b587-4be32767584b', 'Msamiati', 'multiple_choice',
    'Neno "furaha" lina maana sawa na:',
    '[{"label":"A","text":"Huzuni","is_correct":false},{"label":"B","text":"Shangwe","is_correct":true},{"label":"C","text":"Hasira","is_correct":false},{"label":"D","text":"Hofu","is_correct":false}]'::jsonb,
    1, 'easy', 'knowledge', 'Visawe: furaha = shangwe', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_kis_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, options, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_kis_subject_id, '24e85565-0384-4e37-8426-c4cc9b5d73c7', 'Mazungumzo', 'multiple_choice',
    'Unapokutana na mtu asubuhi, unamsalimu:',
    '[{"label":"A","text":"Habari za jioni","is_correct":false},{"label":"B","text":"Habari za asubuhi","is_correct":true},{"label":"C","text":"Habari za usiku","is_correct":false},{"label":"D","text":"Kwaheri","is_correct":false}]'::jsonb,
    1, 'easy', 'knowledge', 'Salamu za wakati', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_kis_subject_id IS NOT NULL;
  
  INSERT INTO question_bank (institution_id, subject_id, sub_strand_id, topic, question_type, question_text, correct_answer, marks, difficulty, cognitive_level, explanation, tags, is_active, created_by)
  SELECT v_institution_id, v_kis_subject_id, '8e8cbd45-cb05-44f2-8fe6-406e7ee75042', 'Wingi', 'short_answer',
    'Andika wingi wa: "Mtoto anacheza mpira."', 'Watoto wanacheza mpira.', 2, 'medium', 'application', 'Umoja/Wingi', ARRAY['sample', 'template', 'cbc-aligned'], true, v_staff_id
  WHERE v_kis_subject_id IS NOT NULL;
  
  RAISE NOTICE 'Inserted 50 sample questions for institution: %', v_institution_id;
END $$;