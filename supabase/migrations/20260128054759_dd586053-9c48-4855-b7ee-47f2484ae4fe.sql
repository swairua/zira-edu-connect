
-- Phase 1: Seed missing CBC sub-strands for all 54 strands
-- Following KICD curriculum structure with learning outcomes, competencies, and values

-- ============================================
-- IRE Grade 7 Sub-strands (3 strands)
-- ============================================

-- IRE Grade 7 - Strand 1: Quran
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('28af7ec3-a2f8-42c6-b39c-ebf9ca731c36', 1, 'Recitation of Surah Al-Mulk', 
 '["Recite Surah Al-Mulk correctly with Tajweed", "Explain the meaning and themes of Surah Al-Mulk", "Apply the teachings of Surah Al-Mulk in daily life"]'::jsonb,
 '["What is the significance of Surah Al-Mulk?", "How does proper Tajweed enhance Quran recitation?"]'::jsonb,
 '["Practice recitation with proper pronunciation", "Discuss themes of sovereignty and creation", "Memorize key verses"]'::jsonb,
 ARRAY['communication', 'learning_to_learn', 'self_efficacy']::cbc_competency[],
 ARRAY['love', 'responsibility', 'integrity']::cbc_value[],
 8),
('28af7ec3-a2f8-42c6-b39c-ebf9ca731c36', 2, 'Recitation of Surah Al-Qalam', 
 '["Recite Surah Al-Qalam with proper Tajweed", "Understand the lessons about character and patience", "Relate the story of the Prophet''s character to modern life"]'::jsonb,
 '["What moral lessons does Surah Al-Qalam teach?", "Why is good character emphasized in Islam?"]'::jsonb,
 '["Practice recitation", "Discuss moral teachings", "Role-play scenarios on good character"]'::jsonb,
 ARRAY['communication', 'critical_thinking', 'self_efficacy']::cbc_competency[],
 ARRAY['integrity', 'respect', 'peace']::cbc_value[],
 8);

-- IRE Grade 7 - Strand 2: Hadith and Sunnah
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('56d2703e-a027-4b0f-979f-2e38c79bfb92', 1, 'Hadith on Knowledge and Learning', 
 '["Identify authentic hadith on seeking knowledge", "Explain the importance of education in Islam", "Apply hadith teachings to academic pursuits"]'::jsonb,
 '["Why is seeking knowledge obligatory in Islam?", "How do we verify authentic hadith?"]'::jsonb,
 '["Research hadith collections", "Discuss application in education", "Create posters on knowledge hadith"]'::jsonb,
 ARRAY['critical_thinking', 'learning_to_learn', 'communication']::cbc_competency[],
 ARRAY['responsibility', 'integrity', 'love']::cbc_value[],
 6),
('56d2703e-a027-4b0f-979f-2e38c79bfb92', 2, 'Sunnah of the Prophet in Social Relations', 
 '["Describe the Prophet''s conduct with neighbors", "Explain Islamic etiquette in social interactions", "Practice Prophetic manners in daily life"]'::jsonb,
 '["How did the Prophet treat his neighbors?", "What social ethics does the Sunnah teach?"]'::jsonb,
 '["Role-play social scenarios", "Discuss case studies", "Community service activities"]'::jsonb,
 ARRAY['citizenship', 'communication', 'self_efficacy']::cbc_competency[],
 ARRAY['respect', 'peace', 'social_justice']::cbc_value[],
 6);

-- IRE Grade 7 - Strand 3: Akhlaq and Muamalat
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('7224d70a-7d30-4e7a-afa1-80fd962822b7', 1, 'Truthfulness and Honesty', 
 '["Define truthfulness (Sidq) in Islamic context", "Explain consequences of lying", "Practice honesty in various situations"]'::jsonb,
 '["Why is truthfulness a core Islamic value?", "What are the effects of dishonesty on society?"]'::jsonb,
 '["Discuss real-life scenarios", "Analyze stories from Islamic history", "Self-reflection activities"]'::jsonb,
 ARRAY['critical_thinking', 'self_efficacy', 'citizenship']::cbc_competency[],
 ARRAY['integrity', 'responsibility', 'social_justice']::cbc_value[],
 6),
('7224d70a-7d30-4e7a-afa1-80fd962822b7', 2, 'Islamic Business Ethics', 
 '["Identify halal and haram in business transactions", "Explain the concept of fair trade in Islam", "Apply Islamic ethics in commercial activities"]'::jsonb,
 '["What makes a business transaction halal?", "How does Islam prohibit exploitation?"]'::jsonb,
 '["Simulate business transactions", "Case study analysis", "Visit local markets"]'::jsonb,
 ARRAY['critical_thinking', 'digital_literacy', 'citizenship']::cbc_competency[],
 ARRAY['integrity', 'social_justice', 'responsibility']::cbc_value[],
 6);

-- ============================================
-- IRE Grade 8 Sub-strands (3 strands)
-- ============================================

-- IRE Grade 8 - Strand 1: Quran
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('85fab13d-5926-49ac-bf12-6b20a0ed7f36', 1, 'Recitation of Surah Al-Muzzammil', 
 '["Recite Surah Al-Muzzammil with proper Tajweed", "Explain the importance of night prayers", "Apply teachings on gradual revelation"]'::jsonb,
 '["What is the significance of Tahajjud prayer?", "How did the Prophet prepare for his mission?"]'::jsonb,
 '["Practice recitation with Tajweed rules", "Discuss night prayer benefits", "Create prayer schedules"]'::jsonb,
 ARRAY['communication', 'self_efficacy', 'learning_to_learn']::cbc_competency[],
 ARRAY['love', 'responsibility', 'integrity']::cbc_value[],
 8),
('85fab13d-5926-49ac-bf12-6b20a0ed7f36', 2, 'Recitation of Surah Al-Muddaththir', 
 '["Recite Surah Al-Muddaththir correctly", "Understand the call to prophethood", "Relate the Surah to personal responsibility"]'::jsonb,
 '["What responsibilities come with knowledge?", "How do we warn others kindly?"]'::jsonb,
 '["Group recitation practice", "Discuss Da''wah methods", "Presentation on responsibilities"]'::jsonb,
 ARRAY['communication', 'critical_thinking', 'citizenship']::cbc_competency[],
 ARRAY['responsibility', 'respect', 'peace']::cbc_value[],
 8);

-- IRE Grade 8 - Strand 2: Hadith and Sunnah
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('b27ddb59-7968-48d8-9017-16c1fb98c1b4', 1, 'Hadith on Environmental Conservation', 
 '["Identify hadith on environmental stewardship", "Explain Islamic teachings on nature preservation", "Practice environmental conservation"]'::jsonb,
 '["What does Islam teach about environmental care?", "How can Muslims contribute to conservation?"]'::jsonb,
 '["Tree planting activities", "Research environmental hadith", "Create conservation campaigns"]'::jsonb,
 ARRAY['citizenship', 'critical_thinking', 'creativity']::cbc_competency[],
 ARRAY['responsibility', 'love', 'social_justice']::cbc_value[],
 6),
('b27ddb59-7968-48d8-9017-16c1fb98c1b4', 2, 'Sunnah of Community Leadership', 
 '["Describe leadership qualities from Sunnah", "Explain consultation (Shura) in Islam", "Apply leadership principles in school activities"]'::jsonb,
 '["What makes a good leader in Islam?", "How did the Prophet consult his companions?"]'::jsonb,
 '["Leadership role-play", "Student council activities", "Case studies of Islamic leaders"]'::jsonb,
 ARRAY['communication', 'critical_thinking', 'self_efficacy']::cbc_competency[],
 ARRAY['integrity', 'unity', 'responsibility']::cbc_value[],
 6);

-- IRE Grade 8 - Strand 3: Akhlaq and Muamalat
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('a3567407-f9ee-40c5-9e5c-2c8b65d4cf23', 1, 'Rights of Parents and Elders', 
 '["Identify rights of parents in Islam", "Explain the concept of Birrul Walidayn", "Practice respect for elders in daily life"]'::jsonb,
 '["Why are parents given special status in Islam?", "How should we treat the elderly?"]'::jsonb,
 '["Discussion on family values", "Gratitude activities", "Community elder care visits"]'::jsonb,
 ARRAY['citizenship', 'self_efficacy', 'communication']::cbc_competency[],
 ARRAY['respect', 'love', 'responsibility']::cbc_value[],
 6),
('a3567407-f9ee-40c5-9e5c-2c8b65d4cf23', 2, 'Islamic Financial Principles', 
 '["Define Riba and its prohibition", "Explain halal investment principles", "Analyze modern financial products from Islamic perspective"]'::jsonb,
 '["Why is interest (Riba) prohibited?", "What are halal alternatives to conventional banking?"]'::jsonb,
 '["Research Islamic banks", "Simulate savings activities", "Debate on financial ethics"]'::jsonb,
 ARRAY['critical_thinking', 'digital_literacy', 'learning_to_learn']::cbc_competency[],
 ARRAY['integrity', 'social_justice', 'responsibility']::cbc_value[],
 6);

-- ============================================
-- MATH Grade 3 - Strand 5: Data Handling
-- ============================================
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('7922f137-19e4-4329-980e-56da349ad593', 1, 'Collecting and Organizing Data', 
 '["Collect data from the immediate environment", "Organize data using tally marks", "Present data in simple tables"]'::jsonb,
 '["How do we collect information about things around us?", "Why is organizing data important?"]'::jsonb,
 '["Survey classmates on favorite colors", "Create tally charts", "Organize objects by categories"]'::jsonb,
 ARRAY['critical_thinking', 'communication', 'digital_literacy']::cbc_competency[],
 ARRAY['responsibility', 'integrity', 'unity']::cbc_value[],
 5),
('7922f137-19e4-4329-980e-56da349ad593', 2, 'Reading Pictographs', 
 '["Interpret data from pictographs", "Answer questions based on pictographs", "Create simple pictographs"]'::jsonb,
 '["What stories do pictures in graphs tell us?", "How do we read a pictograph?"]'::jsonb,
 '["Analyze pictographs from books", "Create pictographs about class data", "Compare information from graphs"]'::jsonb,
 ARRAY['critical_thinking', 'communication', 'creativity']::cbc_competency[],
 ARRAY['responsibility', 'love', 'respect']::cbc_value[],
 5),
('7922f137-19e4-4329-980e-56da349ad593', 3, 'Introduction to Bar Graphs', 
 '["Read and interpret simple bar graphs", "Compare data using bar graphs", "Construct simple bar graphs"]'::jsonb,
 '["How do bar graphs help us compare things?", "What information can we get from bar graphs?"]'::jsonb,
 '["Read bar graphs about weather", "Create bar graphs using squared paper", "Group projects on favorite subjects"]'::jsonb,
 ARRAY['critical_thinking', 'digital_literacy', 'learning_to_learn']::cbc_competency[],
 ARRAY['responsibility', 'unity', 'social_justice']::cbc_value[],
 5);

-- ============================================
-- SCI PP1 Sub-strands (3 strands)
-- ============================================

-- SCI PP1 - Strand 1: Living Things
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('e7a09143-7363-4ed0-b117-2ffb107fb12c', 1, 'Plants Around Us', 
 '["Identify different plants in the environment", "Name parts of a plant", "Care for plants in the school"]'::jsonb,
 '["What plants do we see around us?", "Why are plants important?"]'::jsonb,
 '["Nature walk to observe plants", "Plant seeds in pots", "Draw and color plants"]'::jsonb,
 ARRAY['critical_thinking', 'creativity', 'self_efficacy']::cbc_competency[],
 ARRAY['love', 'responsibility', 'respect']::cbc_value[],
 4),
('e7a09143-7363-4ed0-b117-2ffb107fb12c', 2, 'Animals Around Us', 
 '["Identify common animals", "Describe where animals live", "Show kindness to animals"]'::jsonb,
 '["What animals do we see every day?", "How should we treat animals?"]'::jsonb,
 '["Picture matching of animals", "Songs about animals", "Storytelling about pets"]'::jsonb,
 ARRAY['communication', 'creativity', 'citizenship']::cbc_competency[],
 ARRAY['love', 'respect', 'responsibility']::cbc_value[],
 4);

-- SCI PP1 - Strand 2: Non-Living Things
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('d3126c77-f518-4a6c-bfce-98209fc05be6', 1, 'Things We Use Daily', 
 '["Identify non-living things at home and school", "Group objects by use", "Handle objects safely"]'::jsonb,
 '["What things do we use every day?", "Are all things around us alive?"]'::jsonb,
 '["Sorting activities", "Scavenger hunt for objects", "Drawing objects"]'::jsonb,
 ARRAY['critical_thinking', 'creativity', 'learning_to_learn']::cbc_competency[],
 ARRAY['responsibility', 'respect', 'love']::cbc_value[],
 4),
('d3126c77-f518-4a6c-bfce-98209fc05be6', 2, 'Materials and Their Uses', 
 '["Identify materials like wood, plastic, metal", "Match materials to objects", "Appreciate different materials"]'::jsonb,
 '["What are things made of?", "Why do we use different materials?"]'::jsonb,
 '["Touch and feel activities", "Material sorting games", "Make crafts from materials"]'::jsonb,
 ARRAY['critical_thinking', 'creativity', 'self_efficacy']::cbc_competency[],
 ARRAY['responsibility', 'love', 'respect']::cbc_value[],
 4);

-- SCI PP1 - Strand 3: The Environment
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('172ac70f-f2bc-47c0-aa84-4086d340ddcd', 1, 'Our School Environment', 
 '["Identify features of the school compound", "Keep the school clean", "Appreciate the school environment"]'::jsonb,
 '["What do we see in our school?", "How can we keep our school clean?"]'::jsonb,
 '["School compound walk", "Clean-up activities", "Draw the school"]'::jsonb,
 ARRAY['citizenship', 'self_efficacy', 'creativity']::cbc_competency[],
 ARRAY['responsibility', 'love', 'respect']::cbc_value[],
 4),
('172ac70f-f2bc-47c0-aa84-4086d340ddcd', 2, 'Weather Around Us', 
 '["Describe different types of weather", "Dress appropriately for weather", "Observe daily weather changes"]'::jsonb,
 '["How is the weather today?", "What do we wear when it rains?"]'::jsonb,
 '["Weather observation", "Dress-up activities", "Weather songs"]'::jsonb,
 ARRAY['critical_thinking', 'learning_to_learn', 'self_efficacy']::cbc_competency[],
 ARRAY['responsibility', 'love', 'peace']::cbc_value[],
 4);

-- ============================================
-- SCI PP2 Sub-strands (3 strands)
-- ============================================

-- SCI PP2 - Strand 1: Living Things
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('523793e5-bf84-4d63-93f7-b5dcd6ab7f5f', 1, 'Growth of Plants', 
 '["Observe how plants grow", "Identify what plants need to grow", "Care for growing plants"]'::jsonb,
 '["How do plants grow?", "What do plants need to grow?"]'::jsonb,
 '["Plant bean seeds", "Watering plants daily", "Growth journals"]'::jsonb,
 ARRAY['critical_thinking', 'self_efficacy', 'learning_to_learn']::cbc_competency[],
 ARRAY['responsibility', 'love', 'respect']::cbc_value[],
 5),
('523793e5-bf84-4d63-93f7-b5dcd6ab7f5f', 2, 'Animal Homes', 
 '["Identify where different animals live", "Match animals to their homes", "Appreciate animal habitats"]'::jsonb,
 '["Where do animals live?", "Why do animals need homes?"]'::jsonb,
 '["Picture matching games", "Build simple bird feeders", "Stories about animal homes"]'::jsonb,
 ARRAY['communication', 'creativity', 'citizenship']::cbc_competency[],
 ARRAY['love', 'respect', 'responsibility']::cbc_value[],
 5);

-- SCI PP2 - Strand 2: Non-Living Things
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('f2a76102-a25e-418f-8294-4ba7dbcbddc2', 1, 'Water in Our Lives', 
 '["Identify uses of water", "Practice water conservation", "Keep water clean"]'::jsonb,
 '["How do we use water?", "Why should we save water?"]'::jsonb,
 '["Water use demonstrations", "Turn off tap campaigns", "Water play activities"]'::jsonb,
 ARRAY['citizenship', 'critical_thinking', 'self_efficacy']::cbc_competency[],
 ARRAY['responsibility', 'love', 'respect']::cbc_value[],
 4),
('f2a76102-a25e-418f-8294-4ba7dbcbddc2', 2, 'Sources of Light', 
 '["Identify sources of light", "Differentiate natural and artificial light", "Use light safely"]'::jsonb,
 '["Where does light come from?", "What gives us light at night?"]'::jsonb,
 '["Observe the sun (safely)", "Identify lights at home", "Shadow play"]'::jsonb,
 ARRAY['critical_thinking', 'creativity', 'learning_to_learn']::cbc_competency[],
 ARRAY['responsibility', 'respect', 'love']::cbc_value[],
 4);

-- SCI PP2 - Strand 3: The Environment
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('efadc285-88c6-40de-8356-a982fa4b55de', 1, 'Caring for Our Environment', 
 '["Dispose of waste properly", "Keep surroundings clean", "Plant trees and flowers"]'::jsonb,
 '["How can we keep our environment clean?", "Why should we plant trees?"]'::jsonb,
 '["Clean-up drives", "Tree planting", "Making dustbins from boxes"]'::jsonb,
 ARRAY['citizenship', 'self_efficacy', 'creativity']::cbc_competency[],
 ARRAY['responsibility', 'love', 'social_justice']::cbc_value[],
 5),
('efadc285-88c6-40de-8356-a982fa4b55de', 2, 'Seasons and Changes', 
 '["Identify wet and dry seasons", "Describe changes in each season", "Dress for different seasons"]'::jsonb,
 '["What happens during rainy season?", "How do we prepare for different seasons?"]'::jsonb,
 '["Seasonal calendars", "Weather charts", "Stories about seasons"]'::jsonb,
 ARRAY['critical_thinking', 'learning_to_learn', 'communication']::cbc_competency[],
 ARRAY['responsibility', 'love', 'peace']::cbc_value[],
 5);

-- ============================================
-- SCI Grade 1 Sub-strands (4 strands)
-- ============================================

-- SCI Grade 1 - Strand 1: Living Things
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('02dc1a7f-c960-4740-9705-f7dae1e3d4ea', 1, 'Parts of the Human Body', 
 '["Identify external parts of the body", "State functions of body parts", "Take care of the body"]'::jsonb,
 '["What parts make up our body?", "How do we use our body parts?"]'::jsonb,
 '["Body part songs", "Touch and name games", "Draw yourself"]'::jsonb,
 ARRAY['communication', 'self_efficacy', 'learning_to_learn']::cbc_competency[],
 ARRAY['love', 'responsibility', 'respect']::cbc_value[],
 5),
('02dc1a7f-c960-4740-9705-f7dae1e3d4ea', 2, 'Characteristics of Living Things', 
 '["Identify characteristics of living things", "Differentiate living from non-living", "Appreciate living things"]'::jsonb,
 '["How do we know something is alive?", "What makes living things special?"]'::jsonb,
 '["Sorting activities", "Observe pets and plants", "Picture classification"]'::jsonb,
 ARRAY['critical_thinking', 'communication', 'creativity']::cbc_competency[],
 ARRAY['love', 'respect', 'responsibility']::cbc_value[],
 5);

-- SCI Grade 1 - Strand 2: Non-Living Things
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('7410ccbe-8368-4b79-803e-80d7232f5386', 1, 'Properties of Objects', 
 '["Describe objects by color, shape, size", "Compare objects using senses", "Group objects by properties"]'::jsonb,
 '["How are objects different?", "What can we learn by touching objects?"]'::jsonb,
 '["Sorting by color and size", "Feel and describe activities", "Object scavenger hunt"]'::jsonb,
 ARRAY['critical_thinking', 'learning_to_learn', 'communication']::cbc_competency[],
 ARRAY['responsibility', 'respect', 'love']::cbc_value[],
 5),
('7410ccbe-8368-4b79-803e-80d7232f5386', 2, 'Uses of Simple Tools', 
 '["Identify simple tools at home and school", "Match tools to their uses", "Handle tools safely"]'::jsonb,
 '["What tools do we use?", "How do tools help us?"]'::jsonb,
 '["Tool identification games", "Safety demonstrations", "Draw tools and their uses"]'::jsonb,
 ARRAY['critical_thinking', 'self_efficacy', 'creativity']::cbc_competency[],
 ARRAY['responsibility', 'integrity', 'respect']::cbc_value[],
 5);

-- SCI Grade 1 - Strand 3: The Environment
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('a1b0d136-a293-4e29-945b-839e6ee79c5e', 1, 'Components of the Environment', 
 '["Identify living and non-living things in environment", "Describe the home environment", "Appreciate the environment"]'::jsonb,
 '["What makes up our environment?", "How do living things depend on the environment?"]'::jsonb,
 '["Environment walks", "Collage making", "Sorting games"]'::jsonb,
 ARRAY['critical_thinking', 'citizenship', 'creativity']::cbc_competency[],
 ARRAY['responsibility', 'love', 'respect']::cbc_value[],
 5),
('a1b0d136-a293-4e29-945b-839e6ee79c5e', 2, 'Keeping the Environment Clean', 
 '["Identify sources of litter", "Dispose of waste properly", "Participate in cleaning activities"]'::jsonb,
 '["Why should we not litter?", "How can we keep our environment clean?"]'::jsonb,
 '["Clean-up campaigns", "Poster making", "Waste sorting activities"]'::jsonb,
 ARRAY['citizenship', 'self_efficacy', 'critical_thinking']::cbc_competency[],
 ARRAY['responsibility', 'social_justice', 'love']::cbc_value[],
 5);

-- SCI Grade 1 - Strand 4: Health
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('6994bf74-9b6f-4cd2-b604-8d54c9ba0fbc', 1, 'Personal Hygiene', 
 '["Practice handwashing", "Keep the body clean", "Use toilets properly"]'::jsonb,
 '["Why should we wash our hands?", "How do we stay clean?"]'::jsonb,
 '["Handwashing demonstrations", "Hygiene songs", "Role play"]'::jsonb,
 ARRAY['self_efficacy', 'learning_to_learn', 'communication']::cbc_competency[],
 ARRAY['responsibility', 'love', 'respect']::cbc_value[],
 5),
('6994bf74-9b6f-4cd2-b604-8d54c9ba0fbc', 2, 'Healthy Foods', 
 '["Identify healthy foods", "Choose healthy foods", "Eat balanced meals"]'::jsonb,
 '["What foods make us healthy?", "Why should we eat fruits and vegetables?"]'::jsonb,
 '["Food sorting activities", "Healthy plate designs", "Food tasting"]'::jsonb,
 ARRAY['critical_thinking', 'self_efficacy', 'learning_to_learn']::cbc_competency[],
 ARRAY['responsibility', 'love', 'integrity']::cbc_value[],
 5);

-- ============================================
-- SCI Grade 2 Sub-strands (4 strands)
-- ============================================

-- SCI Grade 2 - Strand 1: Living Things
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('fd12da0b-fa39-49b6-8913-7bb19eff0e82', 1, 'Classification of Animals', 
 '["Group animals by body covering", "Classify animals by movement", "Appreciate animal diversity"]'::jsonb,
 '["How are animals different?", "What covers animal bodies?"]'::jsonb,
 '["Animal classification games", "Picture sorting", "Animal movement mimicry"]'::jsonb,
 ARRAY['critical_thinking', 'communication', 'creativity']::cbc_competency[],
 ARRAY['love', 'respect', 'responsibility']::cbc_value[],
 5),
('fd12da0b-fa39-49b6-8913-7bb19eff0e82', 2, 'Life Cycle of Plants', 
 '["Describe stages of plant growth", "Observe plant germination", "Care for plants"]'::jsonb,
 '["How do plants grow from seeds?", "What do seeds need to grow?"]'::jsonb,
 '["Germination experiments", "Growth diaries", "Seed collection"]'::jsonb,
 ARRAY['critical_thinking', 'learning_to_learn', 'self_efficacy']::cbc_competency[],
 ARRAY['responsibility', 'love', 'respect']::cbc_value[],
 5);

-- SCI Grade 2 - Strand 2: Non-Living Things
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('2f6042d9-a4ed-4952-a15b-2eead8a196dc', 1, 'States of Matter', 
 '["Identify solids, liquids, gases", "Describe properties of each state", "Give examples of each state"]'::jsonb,
 '["In what forms do we find things?", "How are solids different from liquids?"]'::jsonb,
 '["Hands-on exploration", "Sorting activities", "Simple experiments"]'::jsonb,
 ARRAY['critical_thinking', 'learning_to_learn', 'creativity']::cbc_competency[],
 ARRAY['responsibility', 'respect', 'love']::cbc_value[],
 5),
('2f6042d9-a4ed-4952-a15b-2eead8a196dc', 2, 'Properties of Materials', 
 '["Describe materials as hard, soft, rough, smooth", "Choose appropriate materials for tasks", "Handle materials responsibly"]'::jsonb,
 '["Why do we use different materials?", "What makes materials suitable for different uses?"]'::jsonb,
 '["Touch and feel activities", "Material investigation", "Design challenges"]'::jsonb,
 ARRAY['critical_thinking', 'creativity', 'self_efficacy']::cbc_competency[],
 ARRAY['responsibility', 'integrity', 'respect']::cbc_value[],
 5);

-- SCI Grade 2 - Strand 3: The Environment
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('1d4b15d0-7477-4cd5-be92-4549d6e25234', 1, 'Types of Soil', 
 '["Identify types of soil", "Describe characteristics of soils", "State uses of different soils"]'::jsonb,
 '["Why is soil different in different places?", "What can we use soil for?"]'::jsonb,
 '["Soil observation", "Compare soil samples", "Soil in gardening"]'::jsonb,
 ARRAY['critical_thinking', 'learning_to_learn', 'creativity']::cbc_competency[],
 ARRAY['responsibility', 'love', 'respect']::cbc_value[],
 5),
('1d4b15d0-7477-4cd5-be92-4549d6e25234', 2, 'Water Sources', 
 '["Identify sources of water", "Describe importance of water", "Conserve water"]'::jsonb,
 '["Where does water come from?", "Why is water important?"]'::jsonb,
 '["Water source mapping", "Conservation posters", "Water saving pledges"]'::jsonb,
 ARRAY['citizenship', 'critical_thinking', 'self_efficacy']::cbc_competency[],
 ARRAY['responsibility', 'social_justice', 'love']::cbc_value[],
 5);

-- SCI Grade 2 - Strand 4: Health
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('19686363-3020-4877-befc-a4d08ea4200b', 1, 'Common Illnesses', 
 '["Identify common childhood illnesses", "Describe how illnesses spread", "Practice illness prevention"]'::jsonb,
 '["Why do we get sick?", "How can we avoid getting sick?"]'::jsonb,
 '["Hygiene demonstrations", "Health posters", "Role play on visiting doctor"]'::jsonb,
 ARRAY['self_efficacy', 'communication', 'critical_thinking']::cbc_competency[],
 ARRAY['responsibility', 'love', 'respect']::cbc_value[],
 5),
('19686363-3020-4877-befc-a4d08ea4200b', 2, 'Safety at Home and School', 
 '["Identify dangers at home and school", "Practice safety measures", "Respond to emergencies"]'::jsonb,
 '["What dangers are around us?", "How can we stay safe?"]'::jsonb,
 '["Safety walks", "Fire drill participation", "First aid basics"]'::jsonb,
 ARRAY['self_efficacy', 'citizenship', 'critical_thinking']::cbc_competency[],
 ARRAY['responsibility', 'love', 'integrity']::cbc_value[],
 5);

-- ============================================
-- SCI Grade 3 Sub-strands (4 strands)
-- ============================================

-- SCI Grade 3 - Strand 1: Living Things
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('d9aee29b-7635-4528-9e60-406035c71433', 1, 'Parts of a Plant', 
 '["Identify parts of a plant", "Describe functions of plant parts", "Appreciate plant structure"]'::jsonb,
 '["What are the parts of a plant?", "What does each part do?"]'::jsonb,
 '["Plant dissection", "Labeling diagrams", "Nature walks"]'::jsonb,
 ARRAY['critical_thinking', 'communication', 'learning_to_learn']::cbc_competency[],
 ARRAY['love', 'respect', 'responsibility']::cbc_value[],
 5),
('d9aee29b-7635-4528-9e60-406035c71433', 2, 'Types of Animals', 
 '["Classify animals as domestic and wild", "Describe animal habitats", "Care for domestic animals"]'::jsonb,
 '["What is the difference between domestic and wild animals?", "Why do we keep domestic animals?"]'::jsonb,
 '["Classification games", "Habitat research", "Pet care discussions"]'::jsonb,
 ARRAY['critical_thinking', 'citizenship', 'creativity']::cbc_competency[],
 ARRAY['love', 'responsibility', 'respect']::cbc_value[],
 5);

-- SCI Grade 3 - Strand 2: Non-Living Things
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('d9b0770f-809c-46c3-b4d0-02b70fbaff0e', 1, 'Properties of Water', 
 '["Describe properties of water", "Demonstrate water takes shape of container", "Value water as a resource"]'::jsonb,
 '["What are the properties of water?", "Why is water important in our lives?"]'::jsonb,
 '["Water experiments", "Shape demonstrations", "Water conservation activities"]'::jsonb,
 ARRAY['critical_thinking', 'learning_to_learn', 'creativity']::cbc_competency[],
 ARRAY['responsibility', 'love', 'social_justice']::cbc_value[],
 5),
('d9b0770f-809c-46c3-b4d0-02b70fbaff0e', 2, 'Simple Machines', 
 '["Identify simple machines", "Describe uses of simple machines", "Make simple machines"]'::jsonb,
 '["What are simple machines?", "How do simple machines help us?"]'::jsonb,
 '["Machine identification", "Building levers and pulleys", "Machine hunt"]'::jsonb,
 ARRAY['critical_thinking', 'creativity', 'digital_literacy']::cbc_competency[],
 ARRAY['responsibility', 'integrity', 'love']::cbc_value[],
 5);

-- SCI Grade 3 - Strand 3: The Environment
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('c3b02c2d-9d9e-4389-a1d0-cbe5754cb90d', 1, 'Air and Its Properties', 
 '["Describe properties of air", "Demonstrate air occupies space", "Value clean air"]'::jsonb,
 '["What is air made of?", "Why do we need clean air?"]'::jsonb,
 '["Air experiments", "Balloon activities", "Air pollution discussions"]'::jsonb,
 ARRAY['critical_thinking', 'learning_to_learn', 'citizenship']::cbc_competency[],
 ARRAY['responsibility', 'love', 'social_justice']::cbc_value[],
 5),
('c3b02c2d-9d9e-4389-a1d0-cbe5754cb90d', 2, 'Weather and Climate', 
 '["Record weather elements", "Use weather instruments", "Appreciate weather changes"]'::jsonb,
 '["What makes up weather?", "How do we measure weather?"]'::jsonb,
 '["Weather recording", "Make rain gauges", "Weather journals"]'::jsonb,
 ARRAY['critical_thinking', 'digital_literacy', 'learning_to_learn']::cbc_competency[],
 ARRAY['responsibility', 'love', 'respect']::cbc_value[],
 5);

-- SCI Grade 3 - Strand 4: Health
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('03074aba-95f6-41cc-a88b-c9196bfe00f7', 1, 'Dental Health', 
 '["Identify parts of a tooth", "Practice proper tooth brushing", "Avoid foods that harm teeth"]'::jsonb,
 '["How do we care for our teeth?", "What damages our teeth?"]'::jsonb,
 '["Brushing demonstrations", "Tooth models", "Healthy vs unhealthy foods for teeth"]'::jsonb,
 ARRAY['self_efficacy', 'learning_to_learn', 'communication']::cbc_competency[],
 ARRAY['responsibility', 'love', 'integrity']::cbc_value[],
 5),
('03074aba-95f6-41cc-a88b-c9196bfe00f7', 2, 'Physical Exercise', 
 '["Identify types of exercises", "Describe benefits of exercise", "Practice regular exercise"]'::jsonb,
 '["Why should we exercise?", "What exercises can we do?"]'::jsonb,
 '["Exercise routines", "Sports activities", "Exercise logs"]'::jsonb,
 ARRAY['self_efficacy', 'citizenship', 'communication']::cbc_competency[],
 ARRAY['responsibility', 'love', 'unity']::cbc_value[],
 5);

-- ============================================
-- SCI Grade 4-6 Technology Strand Sub-strands
-- ============================================

-- SCI Grade 4 - Strand 5: Technology in Science
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('58f9b0e9-65a9-4c3c-8f6e-4757d9e38d77', 1, 'Introduction to Technology', 
 '["Define technology", "Identify technological devices", "Appreciate role of technology"]'::jsonb,
 '["What is technology?", "How does technology help us?"]'::jsonb,
 '["Device exploration", "Technology timeline", "Innovation discussions"]'::jsonb,
 ARRAY['digital_literacy', 'critical_thinking', 'creativity']::cbc_competency[],
 ARRAY['responsibility', 'integrity', 'love']::cbc_value[],
 6),
('58f9b0e9-65a9-4c3c-8f6e-4757d9e38d77', 2, 'Technology and Daily Life', 
 '["Identify technology in daily activities", "Describe benefits of technology", "Use technology responsibly"]'::jsonb,
 '["How do we use technology every day?", "What problems does technology solve?"]'::jsonb,
 '["Technology diary", "Problem-solving with tech", "Responsible use pledges"]'::jsonb,
 ARRAY['digital_literacy', 'critical_thinking', 'self_efficacy']::cbc_competency[],
 ARRAY['responsibility', 'integrity', 'social_justice']::cbc_value[],
 6);

-- SCI Grade 5 - Strand 5: Technology in Science
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('4bfc27d4-5f6e-437c-befc-a881d842c97d', 1, 'Simple Technological Designs', 
 '["Design simple solutions to problems", "Build simple models", "Test and improve designs"]'::jsonb,
 '["How do we design solutions?", "What makes a good design?"]'::jsonb,
 '["Design challenges", "Model building", "Testing and feedback"]'::jsonb,
 ARRAY['creativity', 'critical_thinking', 'digital_literacy']::cbc_competency[],
 ARRAY['integrity', 'responsibility', 'love']::cbc_value[],
 6),
('4bfc27d4-5f6e-437c-befc-a881d842c97d', 2, 'Technology in Agriculture', 
 '["Identify technology used in farming", "Describe benefits of agricultural technology", "Appreciate food production"]'::jsonb,
 '["How does technology help farmers?", "What machines are used in farming?"]'::jsonb,
 '["Farm visits", "Research on farming technology", "Create farm models"]'::jsonb,
 ARRAY['digital_literacy', 'critical_thinking', 'citizenship']::cbc_competency[],
 ARRAY['responsibility', 'love', 'social_justice']::cbc_value[],
 6);

-- SCI Grade 6 - Strand 5: Technology in Science
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('cd7318a4-cde9-413c-9081-b016417b53fa', 1, 'Energy and Technology', 
 '["Identify energy sources", "Describe renewable vs non-renewable energy", "Conserve energy"]'::jsonb,
 '["Where does energy come from?", "Why should we use renewable energy?"]'::jsonb,
 '["Energy audit", "Solar experiments", "Energy conservation plans"]'::jsonb,
 ARRAY['digital_literacy', 'critical_thinking', 'citizenship']::cbc_competency[],
 ARRAY['responsibility', 'social_justice', 'love']::cbc_value[],
 6),
('cd7318a4-cde9-413c-9081-b016417b53fa', 2, 'Communication Technology', 
 '["Trace evolution of communication", "Use communication devices responsibly", "Appreciate digital communication"]'::jsonb,
 '["How has communication changed?", "What are the benefits and risks of digital communication?"]'::jsonb,
 '["Timeline creation", "Digital safety lessons", "Communication projects"]'::jsonb,
 ARRAY['digital_literacy', 'communication', 'self_efficacy']::cbc_competency[],
 ARRAY['integrity', 'responsibility', 'respect']::cbc_value[],
 6);
