-- Migration 3: ENG Sub-strands for PP1-Grade 3 and Grade 5-9

-- ENG PP1 Sub-strands
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Following Simple Instructions', 
  '["Listen and follow one-step instructions", "Respond appropriately to commands", "Demonstrate understanding through actions"]'::jsonb,
  '["How do we show we are listening?", "Why is it important to follow instructions?"]'::jsonb,
  '["Action songs", "Simon says games", "Classroom routines"]'::jsonb,
  ARRAY['communication', 'learning_to_learn']::cbc_competency[],
  ARRAY['respect', 'responsibility']::cbc_value[],
  6
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'pp1' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 2, 'Reciting Rhymes and Songs', 
  '["Recite simple rhymes", "Sing action songs", "Use appropriate rhythm and intonation"]'::jsonb,
  '["What rhymes do we know?", "How do songs help us learn?"]'::jsonb,
  '["Nursery rhymes", "Action songs", "Finger plays"]'::jsonb,
  ARRAY['communication', 'creativity']::cbc_competency[],
  ARRAY['love', 'unity']::cbc_value[],
  6
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'pp1' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Letter Recognition', 
  '["Identify letters of the alphabet", "Match uppercase and lowercase", "Recognize letters in environment"]'::jsonb,
  '["What letters can we see around us?", "How do letters make sounds?"]'::jsonb,
  '["Letter hunts", "Alphabet songs", "Letter matching games"]'::jsonb,
  ARRAY['communication', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'pp1' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 2, 'Letter Sounds', 
  '["Associate letters with sounds", "Identify beginning sounds in words", "Blend simple sounds"]'::jsonb,
  '["What sound does this letter make?", "What words start with this sound?"]'::jsonb,
  '["Phonics activities", "Sound sorting", "Beginning sound games"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'pp1' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Pre-writing Patterns', 
  '["Draw pre-writing patterns", "Develop pencil grip", "Trace lines and curves"]'::jsonb,
  '["How do we hold a pencil?", "What patterns can we trace?"]'::jsonb,
  '["Pattern tracing", "Air writing", "Sand trays"]'::jsonb,
  ARRAY['creativity', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  6
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'pp1' AND strand_number = 3;

-- ENG PP2 Sub-strands
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Following Multi-step Instructions', 
  '["Follow two-step instructions", "Ask for clarification", "Demonstrate comprehension"]'::jsonb,
  '["How do we remember multiple steps?", "What do we do when we do not understand?"]'::jsonb,
  '["Sequence activities", "Following recipes", "Classroom tasks"]'::jsonb,
  ARRAY['communication', 'learning_to_learn']::cbc_competency[],
  ARRAY['respect', 'responsibility']::cbc_value[],
  6
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'pp2' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 2, 'Storytelling', 
  '["Listen to short stories", "Retell stories in sequence", "Participate in story discussions"]'::jsonb,
  '["What happened in the story?", "What is the story about?"]'::jsonb,
  '["Story time", "Puppet shows", "Story sequencing"]'::jsonb,
  ARRAY['communication', 'creativity']::cbc_competency[],
  ARRAY['love', 'peace']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'pp2' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Phonics and Word Building', 
  '["Blend sounds to read CVC words", "Read common sight words", "Identify word families"]'::jsonb,
  '["How do we blend sounds?", "What are sight words?"]'::jsonb,
  '["Blending activities", "Sight word games", "Word family practice"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'pp2' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 2, 'Simple Sentence Reading', 
  '["Read simple sentences", "Understand basic punctuation", "Read with expression"]'::jsonb,
  '["What does this sentence say?", "Why do sentences have full stops?"]'::jsonb,
  '["Sentence reading", "Punctuation awareness", "Shared reading"]'::jsonb,
  ARRAY['communication', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'pp2' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Letter Formation', 
  '["Write all letters correctly", "Maintain proper letter size", "Space letters appropriately"]'::jsonb,
  '["How do we form each letter?", "Why is neat writing important?"]'::jsonb,
  '["Letter practice", "Handwriting exercises", "Letter formation games"]'::jsonb,
  ARRAY['creativity', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'pp2' AND strand_number = 3;

-- ENG Grade 1 Sub-strands
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Listening for Information', 
  '["Listen and extract key information", "Answer questions about audio content", "Follow spoken directions"]'::jsonb,
  '["What did you hear?", "What are the important details?"]'::jsonb,
  '["Audio stories", "Information recall", "Following directions"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['respect', 'responsibility']::cbc_value[],
  6
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_1' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 2, 'Oral Expression', 
  '["Express ideas clearly", "Use complete sentences", "Participate in conversations"]'::jsonb,
  '["How do we share our ideas?", "What makes a good conversation?"]'::jsonb,
  '["Show and tell", "Partner discussions", "Circle time sharing"]'::jsonb,
  ARRAY['communication', 'self_efficacy']::cbc_competency[],
  ARRAY['respect', 'love']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_1' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Fluency Development', 
  '["Read with appropriate pace", "Use expression when reading", "Recognize common words quickly"]'::jsonb,
  '["How do good readers sound?", "Why do we pause at punctuation?"]'::jsonb,
  '["Paired reading", "Echo reading", "Performance reading"]'::jsonb,
  ARRAY['communication', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_1' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 2, 'Reading Comprehension', 
  '["Answer literal questions", "Make simple predictions", "Identify main idea"]'::jsonb,
  '["What is the story about?", "What might happen next?"]'::jsonb,
  '["Question and answer", "Prediction activities", "Story mapping"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_1' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Sentence Writing', 
  '["Write complete sentences", "Use capital letters and full stops", "Copy sentences accurately"]'::jsonb,
  '["What makes a complete sentence?", "When do we use capital letters?"]'::jsonb,
  '["Sentence building", "Dictation", "Copy writing"]'::jsonb,
  ARRAY['communication', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_1' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Basic Grammar', 
  '["Identify nouns", "Use correct pronouns", "Form simple plurals"]'::jsonb,
  '["What is a noun?", "How do we make words plural?"]'::jsonb,
  '["Noun hunts", "Pronoun practice", "Plural games"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[],
  6
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_1' AND strand_number = 4;

-- ENG Grade 2 Sub-strands
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Active Listening', 
  '["Demonstrate active listening behaviors", "Summarize spoken messages", "Respond thoughtfully"]'::jsonb,
  '["How do we show we are listening?", "Why is active listening important?"]'::jsonb,
  '["Listening games", "Summarizing activities", "Partner listening"]'::jsonb,
  ARRAY['communication', 'self_efficacy']::cbc_competency[],
  ARRAY['respect', 'responsibility']::cbc_value[],
  6
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_2' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 2, 'Oral Presentations', 
  '["Present information to a group", "Speak clearly and audibly", "Use appropriate gestures"]'::jsonb,
  '["How do we speak to a group?", "What makes a good presentation?"]'::jsonb,
  '["Class presentations", "Show and tell", "Speaking practice"]'::jsonb,
  ARRAY['communication', 'self_efficacy']::cbc_competency[],
  ARRAY['respect', 'love']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_2' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Reading Strategies', 
  '["Use context clues for unknown words", "Self-correct reading errors", "Read longer texts fluently"]'::jsonb,
  '["What do we do when we see an unknown word?", "How can we check our reading?"]'::jsonb,
  '["Context clue practice", "Self-monitoring", "Independent reading"]'::jsonb,
  ARRAY['critical_thinking', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_2' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 2, 'Reading Different Text Types', 
  '["Read fiction and non-fiction texts", "Identify text features", "Compare different text types"]'::jsonb,
  '["What type of text is this?", "How are these texts different?"]'::jsonb,
  '["Genre exploration", "Text comparison", "Feature identification"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'love']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_2' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Paragraph Writing', 
  '["Write connected sentences on a topic", "Use topic sentences", "Organize ideas logically"]'::jsonb,
  '["What is a paragraph?", "How do we organize our writing?"]'::jsonb,
  '["Paragraph building", "Graphic organizers", "Topic development"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_2' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Verbs and Tenses', 
  '["Identify verbs in sentences", "Use present and past tense", "Match subject and verb"]'::jsonb,
  '["What is a verb?", "How do we show when things happen?"]'::jsonb,
  '["Verb identification", "Tense practice", "Subject-verb agreement"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_2' AND strand_number = 4;

-- ENG Grade 3 Sub-strands
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Discussions and Debates', 
  '["Participate in group discussions", "Express and defend opinions", "Listen to different viewpoints"]'::jsonb,
  '["How do we share different ideas?", "Why is it important to listen to others?"]'::jsonb,
  '["Group discussions", "Simple debates", "Opinion sharing"]'::jsonb,
  ARRAY['communication', 'citizenship']::cbc_competency[],
  ARRAY['respect', 'peace']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_3' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Inferential Comprehension', 
  '["Make inferences from text", "Draw conclusions", "Identify author purpose"]'::jsonb,
  '["What does the author mean?", "Why did the author write this?"]'::jsonb,
  '["Inference practice", "Author purpose discussion", "Text analysis"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_3' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Creative Writing', 
  '["Write short stories", "Use descriptive language", "Create imaginative narratives"]'::jsonb,
  '["How do we make our writing interesting?", "What makes a good story?"]'::jsonb,
  '["Story writing", "Descriptive practice", "Creative exercises"]'::jsonb,
  ARRAY['creativity', 'communication']::cbc_competency[],
  ARRAY['love', 'peace']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_3' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Adjectives and Adverbs', 
  '["Use adjectives to describe nouns", "Use adverbs to describe verbs", "Compare using adjectives"]'::jsonb,
  '["How do we describe things?", "How do we make descriptions more interesting?"]'::jsonb,
  '["Description games", "Adverb activities", "Comparison practice"]'::jsonb,
  ARRAY['communication', 'creativity']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_3' AND strand_number = 4;

-- ENG Grade 5 Sub-strands
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Critical Listening', 
  '["Evaluate spoken arguments", "Identify bias in speech", "Distinguish fact from opinion"]'::jsonb,
  '["How do we know if information is reliable?", "What is the difference between fact and opinion?"]'::jsonb,
  '["Media analysis", "Fact vs opinion activities", "Critical listening exercises"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['integrity', 'responsibility']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_5' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 2, 'Formal Speaking', 
  '["Give formal presentations", "Use appropriate register", "Support arguments with evidence"]'::jsonb,
  '["How do we speak in formal situations?", "How do we support our ideas?"]'::jsonb,
  '["Formal presentations", "Evidence-based speaking", "Register practice"]'::jsonb,
  ARRAY['communication', 'self_efficacy']::cbc_competency[],
  ARRAY['respect', 'integrity']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_5' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Literary Analysis', 
  '["Analyze characters and settings", "Identify themes in literature", "Compare literary works"]'::jsonb,
  '["What makes a character interesting?", "What message does the author convey?"]'::jsonb,
  '["Character analysis", "Theme identification", "Literature comparison"]'::jsonb,
  ARRAY['critical_thinking', 'creativity']::cbc_competency[],
  ARRAY['love', 'respect']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_5' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Essay Writing', 
  '["Write structured essays", "Use introduction, body, conclusion", "Support ideas with examples"]'::jsonb,
  '["What is the structure of an essay?", "How do we develop an argument?"]'::jsonb,
  '["Essay practice", "Structure analysis", "Example development"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[],
  12
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_5' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Complex Sentences', 
  '["Use compound sentences", "Use complex sentences", "Apply correct punctuation"]'::jsonb,
  '["How do we join ideas?", "What is the difference between compound and complex sentences?"]'::jsonb,
  '["Sentence combining", "Conjunction practice", "Punctuation exercises"]'::jsonb,
  ARRAY['communication', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_5' AND strand_number = 4;

-- ENG Grade 6 Sub-strands
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Persuasive Speaking', 
  '["Construct persuasive arguments", "Use rhetorical devices", "Respond to counter-arguments"]'::jsonb,
  '["How do we persuade others?", "What makes an argument convincing?"]'::jsonb,
  '["Debate practice", "Persuasive speeches", "Argument analysis"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['integrity', 'peace']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_6' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Critical Reading', 
  '["Evaluate sources", "Identify author bias", "Synthesize information from multiple texts"]'::jsonb,
  '["How do we evaluate what we read?", "How do we combine information from different sources?"]'::jsonb,
  '["Source evaluation", "Bias identification", "Multi-text synthesis"]'::jsonb,
  ARRAY['critical_thinking', 'digital_literacy']::cbc_competency[],
  ARRAY['integrity', 'responsibility']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_6' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Research Writing', 
  '["Conduct basic research", "Cite sources appropriately", "Write research reports"]'::jsonb,
  '["How do we find reliable information?", "Why do we cite sources?"]'::jsonb,
  '["Research projects", "Citation practice", "Report writing"]'::jsonb,
  ARRAY['communication', 'digital_literacy']::cbc_competency[],
  ARRAY['integrity', 'responsibility']::cbc_value[],
  12
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_6' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Advanced Grammar', 
  '["Use passive voice", "Apply correct tense consistency", "Use conditional sentences"]'::jsonb,
  '["When do we use passive voice?", "How do we maintain consistency in writing?"]'::jsonb,
  '["Grammar exercises", "Editing practice", "Style analysis"]'::jsonb,
  ARRAY['communication', 'learning_to_learn']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[],
  8
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_6' AND strand_number = 4;

-- ENG Grade 7-9 Sub-strands
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Academic Discourse', 
  '["Participate in academic discussions", "Use formal language register", "Support claims with evidence"]'::jsonb,
  '["How do we communicate in academic settings?", "What is academic language?"]'::jsonb,
  '["Academic discussions", "Formal presentations", "Evidence-based discourse"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['respect', 'integrity']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_7' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Literary Appreciation', 
  '["Analyze literary devices", "Interpret poetry and prose", "Evaluate literary merit"]'::jsonb,
  '["What literary devices does the author use?", "How does literature reflect society?"]'::jsonb,
  '["Poetry analysis", "Prose interpretation", "Literary critique"]'::jsonb,
  ARRAY['creativity', 'critical_thinking']::cbc_competency[],
  ARRAY['love', 'respect']::cbc_value[],
  12
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_7' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Expository Writing', 
  '["Write expository texts", "Explain complex ideas clearly", "Use appropriate text structure"]'::jsonb,
  '["How do we explain complex ideas?", "What makes writing clear and informative?"]'::jsonb,
  '["Expository essays", "Process writing", "Clarity exercises"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['responsibility', 'integrity']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_7' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Media Literacy', 
  '["Analyze media messages", "Identify propaganda techniques", "Create media content"]'::jsonb,
  '["How does media influence us?", "How do we create responsible media?"]'::jsonb,
  '["Media analysis", "Advertisement critique", "Media creation"]'::jsonb,
  ARRAY['critical_thinking', 'digital_literacy']::cbc_competency[],
  ARRAY['integrity', 'responsibility']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_8' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Comparative Literature', 
  '["Compare texts across genres", "Analyze cultural contexts", "Evaluate literary movements"]'::jsonb,
  '["How do different texts address similar themes?", "How does culture influence literature?"]'::jsonb,
  '["Text comparison", "Cultural analysis", "Movement study"]'::jsonb,
  ARRAY['critical_thinking', 'citizenship']::cbc_competency[],
  ARRAY['respect', 'love']::cbc_value[],
  12
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_8' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Argumentative Writing', 
  '["Construct logical arguments", "Address counterarguments", "Use persuasive techniques"]'::jsonb,
  '["How do we build strong arguments?", "How do we address opposing views?"]'::jsonb,
  '["Argument construction", "Counterargument practice", "Persuasive essays"]'::jsonb,
  ARRAY['communication', 'critical_thinking']::cbc_competency[],
  ARRAY['integrity', 'peace']::cbc_value[],
  12
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_8' AND strand_number = 3;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Synthesis and Evaluation', 
  '["Synthesize multiple perspectives", "Evaluate complex arguments", "Form reasoned judgments"]'::jsonb,
  '["How do we combine different viewpoints?", "How do we evaluate complex issues?"]'::jsonb,
  '["Synthesis activities", "Evaluation exercises", "Critical judgment"]'::jsonb,
  ARRAY['critical_thinking', 'communication']::cbc_competency[],
  ARRAY['integrity', 'responsibility']::cbc_value[],
  10
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_9' AND strand_number = 1;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'World Literature', 
  '["Study literature from different cultures", "Analyze universal themes", "Appreciate diverse perspectives"]'::jsonb,
  '["What themes are universal across cultures?", "How does literature connect us globally?"]'::jsonb,
  '["World literature study", "Theme analysis", "Cultural appreciation"]'::jsonb,
  ARRAY['citizenship', 'creativity']::cbc_competency[],
  ARRAY['respect', 'unity']::cbc_value[],
  12
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_9' AND strand_number = 2;

INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
SELECT id, 1, 'Academic Writing', 
  '["Write formal academic papers", "Apply research methodologies", "Maintain academic integrity"]'::jsonb,
  '["What are the standards for academic writing?", "How do we maintain integrity in research?"]'::jsonb,
  '["Research papers", "Citation practice", "Academic standards"]'::jsonb,
  ARRAY['communication', 'learning_to_learn']::cbc_competency[],
  ARRAY['integrity', 'responsibility']::cbc_value[],
  12
FROM cbc_strands WHERE subject_code = 'ENG' AND level = 'grade_9' AND strand_number = 3;