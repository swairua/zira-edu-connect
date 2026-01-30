-- Migration 2: MATH Sub-strands for PP1-Grade 3 and Grade 5-9

-- MATH PP1 Sub-strands
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Counting 1-10', 
  '["Count objects up to 10", "Recite numbers 1-10 in sequence", "Match numbers to quantities"]'::jsonb,
  '["How many objects do we have?", "What comes after 5?"]'::jsonb,
  '["Counting songs", "Object manipulation", "Number games"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'pp1' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 2, 'Number Recognition', 
  '["Recognize written numerals 1-10", "Write numerals 1-10", "Associate numerals with quantities"]'::jsonb,
  '["Which number is this?", "How do we write numbers?"]'::jsonb,
  '["Tracing numbers", "Number flashcards", "Sand writing"]'::jsonb,
  ARRAY['communication', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[],
  6
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'pp1' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Comparing Sizes', 
  '["Compare objects by size (big/small)", "Sort objects by size", "Use size vocabulary"]'::jsonb,
  '["Which one is bigger?", "How do we compare sizes?"]'::jsonb,
  '["Sorting activities", "Size matching games", "Real object comparisons"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['respect']::cbc_value[],
  4
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'pp1' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 2, 'Comparing Lengths', 
  '["Compare objects by length (long/short)", "Order objects by length", "Use length vocabulary"]'::jsonb,
  '["Which one is longer?", "How do we measure length?"]'::jsonb,
  '["Measuring with hands", "String comparisons", "Line drawing"]'::jsonb,
  ARRAY['critical_thinking', 'creativity']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  4
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'pp1' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Basic Shapes', 
  '["Identify circles, squares, triangles", "Name basic shapes", "Find shapes in environment"]'::jsonb,
  '["What shape is this?", "Where do we see shapes around us?"]'::jsonb,
  '["Shape hunts", "Shape sorting", "Shape art"]'::jsonb,
  ARRAY['creativity', 'critical_thinking']::cbc_competency[],
  ARRAY['love', 'unity']::cbc_value[],
  5
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'pp1' AND strand_number = 3;

-- MATH PP2 Sub-strands
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Counting 1-20', 
  '["Count objects up to 20", "Write numerals 1-20", "Count forwards and backwards"]'::jsonb,
  '["How do we count beyond 10?", "What patterns do we see in numbers?"]'::jsonb,
  '["Counting games", "Number lines", "Skip counting songs"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'pp2' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 2, 'Number Ordering', 
  '["Order numbers 1-20", "Compare numbers using more/less", "Identify missing numbers in sequence"]'::jsonb,
  '["Which number is greater?", "What number comes next?"]'::jsonb,
  '["Number puzzles", "Ordering activities", "Number line jumps"]'::jsonb,
  ARRAY['critical_thinking', 'learning_to_learn']::cbc_competency[],
  ARRAY['integrity']::cbc_value[],
  6
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'pp2' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 3, 'Simple Addition', 
  '["Add numbers with sums up to 10", "Use objects for addition", "Understand plus symbol"]'::jsonb,
  '["What happens when we put things together?", "How do we show adding?"]'::jsonb,
  '["Combining objects", "Number stories", "Addition songs"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'peace']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'pp2' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Measuring Length', 
  '["Measure using non-standard units", "Compare lengths directly", "Use measurement vocabulary"]'::jsonb,
  '["How long is this object?", "How can we measure without a ruler?"]'::jsonb,
  '["Measuring with hands/feet", "Comparing heights", "Length estimation"]'::jsonb,
  ARRAY['critical_thinking', 'creativity']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  5
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'pp2' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Shapes and Patterns', 
  '["Identify rectangles and ovals", "Create simple patterns", "Continue shape patterns"]'::jsonb,
  '["What patterns can we make with shapes?", "What comes next in the pattern?"]'::jsonb,
  '["Pattern making", "Shape stamping", "Bead threading"]'::jsonb,
  ARRAY['creativity', 'critical_thinking']::cbc_competency[],
  ARRAY['love', 'unity']::cbc_value[],
  5
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'pp2' AND strand_number = 3;

-- MATH Grade 1 Sub-strands
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Numbers 1-100', 
  '["Count objects up to 100", "Read and write numerals 1-100", "Identify place value (tens and ones)"]'::jsonb,
  '["How do we count large numbers?", "What is place value?"]'::jsonb,
  '["Counting in tens", "Place value charts", "Number representation"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_1' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 2, 'Addition up to 20', 
  '["Add single digit numbers", "Add numbers with sums up to 20", "Solve simple addition word problems"]'::jsonb,
  '["How do we add numbers?", "How does addition help us in daily life?"]'::jsonb,
  '["Number bonds", "Addition stories", "Mental math games"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_1' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 3, 'Subtraction up to 20', 
  '["Subtract single digit numbers", "Understand take away concept", "Solve subtraction word problems"]'::jsonb,
  '["What does subtraction mean?", "When do we use subtraction?"]'::jsonb,
  '["Take away activities", "Subtraction stories", "Number line jumps"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'peace']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_1' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Length Measurement', 
  '["Measure length using standard units", "Use rulers to measure", "Compare and order lengths"]'::jsonb,
  '["How do we measure accurately?", "Why do we need standard units?"]'::jsonb,
  '["Ruler activities", "Measuring classroom objects", "Length estimation"]'::jsonb,
  ARRAY['critical_thinking', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[],
  6
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_1' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 2, 'Time - Days and Weeks', 
  '["Name days of the week", "Order days correctly", "Understand daily routines and time"]'::jsonb,
  '["What day is today?", "How do we organize our time?"]'::jsonb,
  '["Calendar activities", "Daily schedule charts", "Sequencing days"]'::jsonb,
  ARRAY['learning_to_learn', 'self_efficacy']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  5
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_1' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, '2D Shapes', 
  '["Identify and name 2D shapes", "Describe properties of shapes", "Draw basic 2D shapes"]'::jsonb,
  '["What makes each shape special?", "How many sides and corners does it have?"]'::jsonb,
  '["Shape tracing", "Shape hunts", "Shape sorting by properties"]'::jsonb,
  ARRAY['creativity', 'critical_thinking']::cbc_competency[],
  ARRAY['love']::cbc_value[],
  6
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_1' AND strand_number = 3;

-- MATH Grade 2 Sub-strands
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Numbers up to 1000', 
  '["Read and write numbers to 1000", "Understand place value to hundreds", "Compare and order numbers"]'::jsonb,
  '["How do hundreds work?", "How do we compare large numbers?"]'::jsonb,
  '["Place value activities", "Number comparison games", "Abacus work"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_2' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 2, 'Addition and Subtraction', 
  '["Add numbers with sums up to 100", "Subtract numbers within 100", "Use mental math strategies"]'::jsonb,
  '["What strategies help us add and subtract?", "How can we check our answers?"]'::jsonb,
  '["Mental math practice", "Word problems", "Number puzzles"]'::jsonb,
  ARRAY['critical_thinking', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  12
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_2' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 3, 'Multiplication Concepts', 
  '["Understand multiplication as repeated addition", "Learn multiplication tables 2, 5, 10", "Solve simple multiplication problems"]'::jsonb,
  '["What is multiplication?", "How is multiplication related to addition?"]'::jsonb,
  '["Array activities", "Skip counting", "Multiplication songs"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_2' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Length and Mass', 
  '["Measure length in cm and m", "Measure mass in kg", "Estimate measurements"]'::jsonb,
  '["How heavy is this object?", "What unit should we use?"]'::jsonb,
  '["Using measuring tools", "Estimation activities", "Real-world measuring"]'::jsonb,
  ARRAY['critical_thinking', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_2' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 2, 'Time - Hours and Minutes', 
  '["Read time on analog clock", "Tell time to the hour and half hour", "Understand duration"]'::jsonb,
  '["How do we read a clock?", "How long does an activity take?"]'::jsonb,
  '["Clock reading", "Time estimation", "Daily schedules"]'::jsonb,
  ARRAY['learning_to_learn', 'self_efficacy']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  6
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_2' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, '2D and 3D Shapes', 
  '["Identify 3D shapes", "Describe faces, edges, vertices", "Relate 2D and 3D shapes"]'::jsonb,
  '["What 3D shapes do we see around us?", "How are 2D and 3D shapes related?"]'::jsonb,
  '["Shape building", "3D shape hunts", "Net activities"]'::jsonb,
  ARRAY['creativity', 'critical_thinking']::cbc_competency[],
  ARRAY['love', 'unity']::cbc_value[],
  6
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_2' AND strand_number = 3;

-- MATH Grade 3 Sub-strands  
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Numbers up to 10000', 
  '["Read and write numbers to 10000", "Understand place value to thousands", "Round numbers to nearest 10, 100"]'::jsonb,
  '["How do thousands work?", "Why do we round numbers?"]'::jsonb,
  '["Place value games", "Rounding activities", "Number representation"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_3' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 2, 'Four Operations', 
  '["Add and subtract 3-digit numbers", "Multiply by single digits", "Divide with remainders"]'::jsonb,
  '["How do we solve multi-step problems?", "What is a remainder?"]'::jsonb,
  '["Column methods", "Division sharing", "Problem solving"]'::jsonb,
  ARRAY['critical_thinking', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  14
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_3' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 3, 'Fractions Introduction', 
  '["Understand halves, thirds, quarters", "Identify fractions of shapes", "Compare simple fractions"]'::jsonb,
  '["What is a fraction?", "How do we share equally?"]'::jsonb,
  '["Fraction circles", "Paper folding", "Equal sharing activities"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['peace', 'unity']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_3' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Length, Mass and Capacity', 
  '["Convert between units", "Measure capacity in litres", "Solve measurement problems"]'::jsonb,
  '["How do we convert units?", "What is capacity?"]'::jsonb,
  '["Unit conversion", "Capacity experiments", "Real-world measurements"]'::jsonb,
  ARRAY['critical_thinking', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_3' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 2, 'Money', 
  '["Identify Kenya currency", "Add and subtract money", "Make change"]'::jsonb,
  '["How do we handle money?", "How do we calculate change?"]'::jsonb,
  '["Shop role play", "Money calculations", "Budgeting activities"]'::jsonb,
  ARRAY['critical_thinking', 'citizenship']::cbc_competency[],
  ARRAY['integrity', 'responsibility']::cbc_value[],
  6
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_3' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Lines and Angles', 
  '["Identify types of lines", "Recognize right angles", "Draw shapes with right angles"]'::jsonb,
  '["What types of lines exist?", "What is a right angle?"]'::jsonb,
  '["Line drawing", "Angle finding", "Shape construction"]'::jsonb,
  ARRAY['creativity', 'critical_thinking']::cbc_competency[],
  ARRAY['love']::cbc_value[],
  6
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_3' AND strand_number = 3;

-- MATH Grade 5 Sub-strands
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Large Numbers', 
  '["Read and write numbers up to millions", "Round to nearest 1000", "Use number notation"]'::jsonb,
  '["How do we work with very large numbers?", "Where do we encounter millions?"]'::jsonb,
  '["Place value extension", "Real-world large numbers", "Scientific notation intro"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_5' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 2, 'Factors and Multiples', 
  '["Find factors of numbers", "Identify common factors and multiples", "Understand prime numbers"]'::jsonb,
  '["What are prime numbers?", "How do factors and multiples help us?"]'::jsonb,
  '["Factor trees", "LCM and GCD activities", "Prime number sieve"]'::jsonb,
  ARRAY['critical_thinking', 'learning_to_learn']::cbc_competency[],
  ARRAY['integrity']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_5' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 3, 'Order of Operations', 
  '["Apply BODMAS rule", "Solve multi-step problems", "Use brackets correctly"]'::jsonb,
  '["Why does order matter in calculations?", "What is BODMAS?"]'::jsonb,
  '["Operation puzzles", "Step-by-step solving", "Calculator verification"]'::jsonb,
  ARRAY['critical_thinking', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_5' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Equivalent Fractions', 
  '["Find equivalent fractions", "Simplify fractions", "Compare fractions with different denominators"]'::jsonb,
  '["How can fractions look different but be equal?", "How do we simplify fractions?"]'::jsonb,
  '["Fraction strips", "Equivalent fraction charts", "Simplification practice"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['peace', 'unity']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_5' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 2, 'Fraction Operations', 
  '["Add fractions with same denominator", "Subtract fractions", "Multiply fractions by whole numbers"]'::jsonb,
  '["How do we add and subtract fractions?", "What happens when we multiply fractions?"]'::jsonb,
  '["Visual fraction operations", "Word problems", "Fraction calculators"]'::jsonb,
  ARRAY['critical_thinking', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_5' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Decimal Operations', 
  '["Add and subtract decimals", "Multiply decimals by 10, 100, 1000", "Convert fractions to decimals"]'::jsonb,
  '["How do we calculate with decimals?", "How are fractions and decimals related?"]'::jsonb,
  '["Money calculations", "Decimal games", "Conversion practice"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_5' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Perimeter and Area', 
  '["Calculate perimeter of polygons", "Find area of rectangles and squares", "Solve area word problems"]'::jsonb,
  '["How do we measure around shapes?", "What is the difference between perimeter and area?"]'::jsonb,
  '["Grid paper activities", "Real-world measurement", "Shape comparisons"]'::jsonb,
  ARRAY['critical_thinking', 'creativity']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_5' AND strand_number = 4;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Angle Properties', 
  '["Measure angles with protractor", "Identify acute, obtuse, right angles", "Calculate missing angles"]'::jsonb,
  '["How do we measure angles?", "What are the properties of angles?"]'::jsonb,
  '["Protractor practice", "Angle puzzles", "Geometry investigations"]'::jsonb,
  ARRAY['critical_thinking', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_5' AND strand_number = 5;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Data Collection and Display', 
  '["Collect and organize data", "Create bar graphs and pictographs", "Interpret data displays"]'::jsonb,
  '["How do we collect and show data?", "What stories does data tell?"]'::jsonb,
  '["Survey activities", "Graph creation", "Data interpretation"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['integrity', 'responsibility']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_5' AND strand_number = 6;

-- MATH Grade 6 Sub-strands
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Integers', 
  '["Understand positive and negative numbers", "Order integers on number line", "Add and subtract integers"]'::jsonb,
  '["What are negative numbers?", "Where do we use integers in life?"]'::jsonb,
  '["Temperature examples", "Integer number lines", "Real-world contexts"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_6' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 2, 'Ratios and Proportions', 
  '["Understand ratio notation", "Solve proportion problems", "Apply ratios in real contexts"]'::jsonb,
  '["What is a ratio?", "How do we use proportions to solve problems?"]'::jsonb,
  '["Recipe scaling", "Map reading", "Proportion puzzles"]'::jsonb,
  ARRAY['critical_thinking', 'learning_to_learn']::cbc_competency[],
  ARRAY['integrity', 'responsibility']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_6' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Fraction Division', 
  '["Divide fractions by whole numbers", "Divide fractions by fractions", "Solve complex fraction problems"]'::jsonb,
  '["How do we divide fractions?", "What does dividing by a fraction mean?"]'::jsonb,
  '["Visual models", "Word problems", "Step-by-step solutions"]'::jsonb,
  ARRAY['critical_thinking', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_6' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Percentages', 
  '["Convert between fractions, decimals, percentages", "Calculate percentages of amounts", "Apply percentages in context"]'::jsonb,
  '["What is a percentage?", "How are percentages used in everyday life?"]'::jsonb,
  '["Shopping discounts", "Test scores", "Percentage charts"]'::jsonb,
  ARRAY['critical_thinking', 'citizenship']::cbc_competency[],
  ARRAY['integrity', 'responsibility']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_6' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Area and Volume', 
  '["Calculate area of triangles and parallelograms", "Find volume of cubes and cuboids", "Apply formulas to solve problems"]'::jsonb,
  '["How do we find area of different shapes?", "What is volume?"]'::jsonb,
  '["3D model building", "Volume experiments", "Real-world applications"]'::jsonb,
  ARRAY['critical_thinking', 'creativity']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_6' AND strand_number = 4;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Transformations', 
  '["Understand reflection and rotation", "Identify symmetry", "Perform simple translations"]'::jsonb,
  '["What are transformations?", "How do shapes change position?"]'::jsonb,
  '["Mirror activities", "Rotation practice", "Symmetry art"]'::jsonb,
  ARRAY['creativity', 'critical_thinking']::cbc_competency[],
  ARRAY['love', 'unity']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_6' AND strand_number = 5;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Mean, Median, Mode', 
  '["Calculate mean of data sets", "Find median and mode", "Choose appropriate average"]'::jsonb,
  '["What are different types of averages?", "When do we use each type?"]'::jsonb,
  '["Data collection projects", "Average comparisons", "Real data analysis"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['integrity', 'responsibility']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_6' AND strand_number = 6;

-- MATH Grade 7-9 Sub-strands
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Rational Numbers', 
  '["Perform operations on rational numbers", "Convert between forms", "Apply to real-world problems"]'::jsonb,
  '["What are rational numbers?", "How do we operate with rational numbers?"]'::jsonb,
  '["Number line activities", "Operation practice", "Problem solving"]'::jsonb,
  ARRAY['critical_thinking', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_7' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Basic Algebra', 
  '["Simplify algebraic expressions", "Solve linear equations", "Formulate equations from word problems"]'::jsonb,
  '["What is algebra?", "How do variables represent unknown quantities?"]'::jsonb,
  '["Expression building", "Equation solving", "Real-world modeling"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  12
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_7' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Coordinate Geometry', 
  '["Plot points on coordinate plane", "Find distances between points", "Identify gradients"]'::jsonb,
  '["How do we locate points in a plane?", "What is a gradient?"]'::jsonb,
  '["Plotting activities", "Gradient experiments", "Map coordinates"]'::jsonb,
  ARRAY['critical_thinking', 'creativity']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_7' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Probability Basics', 
  '["Understand probability concepts", "Calculate simple probabilities", "Use probability language"]'::jsonb,
  '["What is probability?", "How do we predict outcomes?"]'::jsonb,
  '["Dice and coin experiments", "Probability calculations", "Games of chance"]'::jsonb,
  ARRAY['critical_thinking', 'learning_to_learn']::cbc_competency[],
  ARRAY['integrity']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_7' AND strand_number = 4;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Indices and Powers', 
  '["Understand index notation", "Apply laws of indices", "Simplify expressions with indices"]'::jsonb,
  '["What are indices?", "How do index laws work?"]'::jsonb,
  '["Pattern exploration", "Index calculations", "Scientific notation"]'::jsonb,
  ARRAY['critical_thinking', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_8' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Quadratic Expressions', 
  '["Expand and factorize quadratics", "Solve quadratic equations", "Apply to word problems"]'::jsonb,
  '["What are quadratic expressions?", "How do we solve quadratic equations?"]'::jsonb,
  '["Factoring practice", "Graphing parabolas", "Real applications"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[],
  12
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_8' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Circle Properties', 
  '["Understand circle terminology", "Calculate circumference and area", "Apply circle theorems"]'::jsonb,
  '["What are the properties of circles?", "How do we calculate with circles?"]'::jsonb,
  '["Circle constructions", "Pi investigations", "Real-world circles"]'::jsonb,
  ARRAY['critical_thinking', 'creativity']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_8' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Probability and Statistics', 
  '["Calculate probability of combined events", "Interpret statistical graphs", "Understand measures of spread"]'::jsonb,
  '["How do we combine probabilities?", "What do statistics tell us?"]'::jsonb,
  '["Combined event experiments", "Data projects", "Statistical analysis"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['integrity', 'responsibility']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_8' AND strand_number = 4;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Real Numbers', 
  '["Understand irrational numbers", "Simplify surds", "Apply to calculations"]'::jsonb,
  '["What are real numbers?", "How do we work with surds?"]'::jsonb,
  '["Surd simplification", "Number classifications", "Calculator explorations"]'::jsonb,
  ARRAY['critical_thinking', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_9' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Simultaneous Equations', 
  '["Solve simultaneous equations graphically", "Use substitution method", "Use elimination method"]'::jsonb,
  '["What are simultaneous equations?", "How do we find solutions that satisfy multiple equations?"]'::jsonb,
  '["Graphical solutions", "Algebraic methods", "Word problems"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[],
  12
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_9' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Trigonometry Basics', 
  '["Understand sine, cosine, tangent", "Apply to right triangles", "Solve trigonometric problems"]'::jsonb,
  '["What is trigonometry?", "How do we use trig ratios?"]'::jsonb,
  '["Triangle measurements", "Calculator practice", "Real applications"]'::jsonb,
  ARRAY['critical_thinking', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_9' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Cumulative Frequency', 
  '["Construct cumulative frequency tables", "Draw cumulative frequency curves", "Find quartiles and percentiles"]'::jsonb,
  '["What is cumulative frequency?", "How do we interpret these graphs?"]'::jsonb,
  '["Data collection", "Graph construction", "Interpretation exercises"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['integrity', 'responsibility']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'MATH' AND level = 'grade_9' AND strand_number = 4;