
-- Phase 1 Part 2: Seed SST (Social Studies) sub-strands for all 26 strands

-- ============================================
-- SST PP1 Sub-strands (3 strands)
-- ============================================

-- SST PP1 - Strand 1: Social Environment
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('7ac4994d-f829-4d01-a837-a4a71ced338b', 1, 'My Family', 
 '["Identify family members", "Name family members", "Show love for family"]'::jsonb,
 '["Who are the members of my family?", "Why is family important?"]'::jsonb,
 '["Draw family pictures", "Family role play", "Family songs"]'::jsonb,
 ARRAY['communication', 'self_efficacy', 'citizenship']::cbc_competency[],
 ARRAY['love', 'respect', 'unity']::cbc_value[],
 4),
('7ac4994d-f829-4d01-a837-a4a71ced338b', 2, 'My School', 
 '["Identify school members", "Name places in school", "Respect school rules"]'::jsonb,
 '["Who helps us in school?", "Why do we come to school?"]'::jsonb,
 '["School tour", "Meet school staff", "Classroom jobs"]'::jsonb,
 ARRAY['communication', 'citizenship', 'self_efficacy']::cbc_competency[],
 ARRAY['respect', 'responsibility', 'love']::cbc_value[],
 4);

-- SST PP1 - Strand 2: Physical Environment
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('d5b55989-3bb8-4a60-9e17-9a2e25c12817', 1, 'Things in My Environment', 
 '["Identify things in the home", "Identify things in school", "Care for things around us"]'::jsonb,
 '["What do we see around us?", "How do we take care of things?"]'::jsonb,
 '["Observation walks", "Drawing activities", "Caring for property"]'::jsonb,
 ARRAY['critical_thinking', 'creativity', 'citizenship']::cbc_competency[],
 ARRAY['responsibility', 'respect', 'love']::cbc_value[],
 4),
('d5b55989-3bb8-4a60-9e17-9a2e25c12817', 2, 'Directions', 
 '["Identify left and right", "Follow simple directions", "Give simple directions"]'::jsonb,
 '["Which way is left? Right?", "How do we find our way?"]'::jsonb,
 '["Direction games", "Treasure hunts", "Movement activities"]'::jsonb,
 ARRAY['critical_thinking', 'communication', 'learning_to_learn']::cbc_competency[],
 ARRAY['responsibility', 'love', 'respect']::cbc_value[],
 4);

-- SST PP1 - Strand 3: Citizenship
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('37bb044c-3a54-46be-8e81-54c227545951', 1, 'Good Behavior', 
 '["Demonstrate good manners", "Show respect to others", "Practice sharing"]'::jsonb,
 '["What is good behavior?", "How do we treat others kindly?"]'::jsonb,
 '["Role play scenarios", "Sharing activities", "Manners songs"]'::jsonb,
 ARRAY['citizenship', 'communication', 'self_efficacy']::cbc_competency[],
 ARRAY['respect', 'love', 'peace']::cbc_value[],
 4),
('37bb044c-3a54-46be-8e81-54c227545951', 2, 'National Symbols', 
 '["Identify the Kenyan flag", "Recognize national anthem", "Show respect for national symbols"]'::jsonb,
 '["What is our national flag?", "Why do we stand during the anthem?"]'::jsonb,
 '["Flag coloring", "Sing anthem", "Symbol recognition games"]'::jsonb,
 ARRAY['citizenship', 'communication', 'self_efficacy']::cbc_competency[],
 ARRAY['patriotism', 'respect', 'unity']::cbc_value[],
 4);

-- ============================================
-- SST PP2 Sub-strands (3 strands)
-- ============================================

-- SST PP2 - Strand 1: Social Environment
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('29ef3a1b-a284-43bf-9882-4e14819f961e', 1, 'Family Roles', 
 '["Describe roles of family members", "Appreciate family contributions", "Help with simple tasks"]'::jsonb,
 '["What does each family member do?", "How can I help at home?"]'::jsonb,
 '["Role play family activities", "Draw family at work", "Task assignments"]'::jsonb,
 ARRAY['citizenship', 'self_efficacy', 'communication']::cbc_competency[],
 ARRAY['responsibility', 'love', 'respect']::cbc_value[],
 5),
('29ef3a1b-a284-43bf-9882-4e14819f961e', 2, 'My Neighborhood', 
 '["Identify neighbors", "Describe community helpers", "Show respect to neighbors"]'::jsonb,
 '["Who are our neighbors?", "How do community helpers help us?"]'::jsonb,
 '["Neighborhood walk", "Community helper visits", "Greeting practice"]'::jsonb,
 ARRAY['citizenship', 'communication', 'critical_thinking']::cbc_competency[],
 ARRAY['respect', 'love', 'peace']::cbc_value[],
 5);

-- SST PP2 - Strand 2: Physical Environment
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('9572987d-34f7-47f7-ad76-de06ff5867eb', 1, 'Natural Features', 
 '["Identify hills, rivers, forests", "Describe features near school", "Appreciate natural beauty"]'::jsonb,
 '["What natural features are near us?", "Why are they important?"]'::jsonb,
 '["Field trips", "Drawing natural features", "Stories about nature"]'::jsonb,
 ARRAY['critical_thinking', 'creativity', 'citizenship']::cbc_competency[],
 ARRAY['love', 'responsibility', 'respect']::cbc_value[],
 5),
('9572987d-34f7-47f7-ad76-de06ff5867eb', 2, 'Simple Maps', 
 '["Understand simple maps", "Follow map directions", "Draw simple maps"]'::jsonb,
 '["What is a map?", "How do maps help us?"]'::jsonb,
 '["Classroom maps", "Treasure map games", "Follow the map activities"]'::jsonb,
 ARRAY['critical_thinking', 'creativity', 'learning_to_learn']::cbc_competency[],
 ARRAY['responsibility', 'love', 'respect']::cbc_value[],
 5);

-- SST PP2 - Strand 3: Citizenship
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('be721040-54be-4466-9336-71f50bd5b4e2', 1, 'Rights and Responsibilities', 
 '["Identify basic rights", "State simple responsibilities", "Practice responsibilities"]'::jsonb,
 '["What rights do children have?", "What responsibilities do we have?"]'::jsonb,
 '["Rights discussions", "Responsibility charts", "Role play"]'::jsonb,
 ARRAY['citizenship', 'self_efficacy', 'communication']::cbc_competency[],
 ARRAY['responsibility', 'respect', 'social_justice']::cbc_value[],
 5),
('be721040-54be-4466-9336-71f50bd5b4e2', 2, 'Living Together', 
 '["Appreciate diversity", "Practice inclusion", "Celebrate differences"]'::jsonb,
 '["Why are we all different?", "How can we live together happily?"]'::jsonb,
 '["Cultural sharing", "Inclusion games", "Friendship activities"]'::jsonb,
 ARRAY['citizenship', 'communication', 'self_efficacy']::cbc_competency[],
 ARRAY['unity', 'respect', 'peace']::cbc_value[],
 5);

-- ============================================
-- SST Grade 1 Sub-strands (4 strands)
-- ============================================

-- SST Grade 1 - Strand 1: Social Environment
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('4b72fc7b-0e2a-45ec-8840-69c2eb7bb571', 1, 'Types of Families', 
 '["Identify different types of families", "Appreciate family diversity", "Respect all families"]'::jsonb,
 '["What types of families exist?", "Why are families different?"]'::jsonb,
 '["Family tree projects", "Story sharing", "Family diversity posters"]'::jsonb,
 ARRAY['citizenship', 'communication', 'critical_thinking']::cbc_competency[],
 ARRAY['love', 'respect', 'unity']::cbc_value[],
 5),
('4b72fc7b-0e2a-45ec-8840-69c2eb7bb571', 2, 'Community Workers', 
 '["Identify community workers", "Describe their roles", "Appreciate their contributions"]'::jsonb,
 '["Who helps our community?", "How do community workers help us?"]'::jsonb,
 '["Career day", "Worker interviews", "Role play activities"]'::jsonb,
 ARRAY['citizenship', 'communication', 'critical_thinking']::cbc_competency[],
 ARRAY['respect', 'responsibility', 'social_justice']::cbc_value[],
 5);

-- SST Grade 1 - Strand 2: Physical Environment
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('cb00e301-c11e-4390-8f12-b88f88724425', 1, 'Cardinal Directions', 
 '["Identify North, South, East, West", "Use directions in daily life", "Read simple compass"]'::jsonb,
 '["How do we know which direction to go?", "Where does the sun rise and set?"]'::jsonb,
 '["Sun observation", "Direction games", "Simple compass activities"]'::jsonb,
 ARRAY['critical_thinking', 'learning_to_learn', 'digital_literacy']::cbc_competency[],
 ARRAY['responsibility', 'love', 'respect']::cbc_value[],
 5),
('cb00e301-c11e-4390-8f12-b88f88724425', 2, 'Land and Water Features', 
 '["Identify mountains, valleys, lakes, rivers", "Locate features on simple maps", "Appreciate natural features"]'::jsonb,
 '["What landforms exist in Kenya?", "How do water bodies help us?"]'::jsonb,
 '["Map reading", "Model making", "Nature documentaries"]'::jsonb,
 ARRAY['critical_thinking', 'creativity', 'citizenship']::cbc_competency[],
 ARRAY['love', 'responsibility', 'respect']::cbc_value[],
 5);

-- SST Grade 1 - Strand 3: Citizenship
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('49d6765a-fe59-46f9-970d-3da8c67dd86e', 1, 'School Rules', 
 '["Identify school rules", "Follow school rules", "Appreciate importance of rules"]'::jsonb,
 '["Why do we have school rules?", "What happens when rules are broken?"]'::jsonb,
 '["Rule discussions", "Rule-making activities", "Consequence scenarios"]'::jsonb,
 ARRAY['citizenship', 'self_efficacy', 'critical_thinking']::cbc_competency[],
 ARRAY['responsibility', 'integrity', 'respect']::cbc_value[],
 5),
('49d6765a-fe59-46f9-970d-3da8c67dd86e', 2, 'Cultural Diversity', 
 '["Identify different cultures in Kenya", "Appreciate cultural practices", "Respect cultural differences"]'::jsonb,
 '["What cultures exist in Kenya?", "How are cultures similar and different?"]'::jsonb,
 '["Cultural day celebrations", "Traditional dress", "Cultural stories"]'::jsonb,
 ARRAY['citizenship', 'communication', 'creativity']::cbc_competency[],
 ARRAY['unity', 'respect', 'peace']::cbc_value[],
 5);

-- SST Grade 1 - Strand 4: History
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('22ee0cc7-4337-4f91-9475-bc12912e215b', 1, 'My Personal History', 
 '["Tell personal story", "Create personal timeline", "Appreciate personal growth"]'::jsonb,
 '["How have I changed since I was a baby?", "What important events have happened in my life?"]'::jsonb,
 '["Photo timelines", "Growth stories", "Birthday celebrations"]'::jsonb,
 ARRAY['communication', 'self_efficacy', 'creativity']::cbc_competency[],
 ARRAY['love', 'responsibility', 'respect']::cbc_value[],
 5),
('22ee0cc7-4337-4f91-9475-bc12912e215b', 2, 'Family History', 
 '["Ask about family history", "Share family stories", "Appreciate family heritage"]'::jsonb,
 '["What stories do my grandparents tell?", "Where did my family come from?"]'::jsonb,
 '["Grandparent interviews", "Family story sharing", "Heritage projects"]'::jsonb,
 ARRAY['communication', 'critical_thinking', 'creativity']::cbc_competency[],
 ARRAY['love', 'respect', 'unity']::cbc_value[],
 5);

-- ============================================
-- SST Grade 2 Sub-strands (4 strands)
-- ============================================

-- SST Grade 2 - Strand 1: Social Environment
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('f166a1bc-5ea5-469d-86f1-f996231b15dc', 1, 'Extended Family', 
 '["Identify extended family members", "Describe family relationships", "Value extended family"]'::jsonb,
 '["Who are my cousins, aunts, uncles?", "How are we related?"]'::jsonb,
 '["Family tree creation", "Relationship mapping", "Family reunion discussions"]'::jsonb,
 ARRAY['communication', 'citizenship', 'self_efficacy']::cbc_competency[],
 ARRAY['love', 'unity', 'respect']::cbc_value[],
 5),
('f166a1bc-5ea5-469d-86f1-f996231b15dc', 2, 'Markets and Shops', 
 '["Identify types of markets and shops", "Describe goods and services", "Practice fair trade"]'::jsonb,
 '["Where do we buy things?", "What services do we need?"]'::jsonb,
 '["Market visits", "Shop role play", "Buying and selling games"]'::jsonb,
 ARRAY['critical_thinking', 'communication', 'digital_literacy']::cbc_competency[],
 ARRAY['integrity', 'responsibility', 'social_justice']::cbc_value[],
 5);

-- SST Grade 2 - Strand 2: Physical Environment
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('d4a1efa3-ed71-4416-b59c-4afff2d18e39', 1, 'Weather and Seasons', 
 '["Describe weather patterns", "Identify rainy and dry seasons", "Prepare for different seasons"]'::jsonb,
 '["How does weather change?", "How do seasons affect our lives?"]'::jsonb,
 '["Weather charting", "Seasonal activities", "Clothing for seasons"]'::jsonb,
 ARRAY['critical_thinking', 'learning_to_learn', 'self_efficacy']::cbc_competency[],
 ARRAY['responsibility', 'love', 'respect']::cbc_value[],
 5),
('d4a1efa3-ed71-4416-b59c-4afff2d18e39', 2, 'Map Reading', 
 '["Read simple maps", "Identify key features on maps", "Create simple maps"]'::jsonb,
 '["How do we read a map?", "What do map symbols mean?"]'::jsonb,
 '["Map interpretation", "Symbol matching", "School map making"]'::jsonb,
 ARRAY['critical_thinking', 'digital_literacy', 'creativity']::cbc_competency[],
 ARRAY['responsibility', 'love', 'respect']::cbc_value[],
 5);

-- SST Grade 2 - Strand 3: Citizenship
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('2ee8ebf0-9f9f-4edf-a758-f5c0ac3b7163', 1, 'Leadership in School', 
 '["Identify school leaders", "Describe leadership qualities", "Practice leadership"]'::jsonb,
 '["Who are leaders in our school?", "What makes a good leader?"]'::jsonb,
 '["Leader interviews", "Class representative elections", "Leadership role play"]'::jsonb,
 ARRAY['citizenship', 'communication', 'self_efficacy']::cbc_competency[],
 ARRAY['integrity', 'responsibility', 'respect']::cbc_value[],
 5),
('2ee8ebf0-9f9f-4edf-a758-f5c0ac3b7163', 2, 'Community Problems', 
 '["Identify community problems", "Suggest solutions", "Participate in community activities"]'::jsonb,
 '["What problems does our community face?", "How can we help solve them?"]'::jsonb,
 '["Problem identification walks", "Solution discussions", "Community service"]'::jsonb,
 ARRAY['citizenship', 'critical_thinking', 'creativity']::cbc_competency[],
 ARRAY['social_justice', 'responsibility', 'love']::cbc_value[],
 5);

-- SST Grade 2 - Strand 4: History
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('0d726bf1-450f-428c-b52a-4d7d71a84757', 1, 'School History', 
 '["Describe school history", "Identify school founders", "Appreciate school traditions"]'::jsonb,
 '["When was our school started?", "Who started our school?"]'::jsonb,
 '["School archive exploration", "Founder''s day celebrations", "School memory books"]'::jsonb,
 ARRAY['communication', 'critical_thinking', 'creativity']::cbc_competency[],
 ARRAY['respect', 'responsibility', 'patriotism']::cbc_value[],
 5),
('0d726bf1-450f-428c-b52a-4d7d71a84757', 2, 'Local History', 
 '["Learn about local area history", "Identify historical sites", "Appreciate local heritage"]'::jsonb,
 '["What is special about our area?", "What historical sites exist nearby?"]'::jsonb,
 '["Local history research", "Historical site visits", "Elder interviews"]'::jsonb,
 ARRAY['communication', 'critical_thinking', 'citizenship']::cbc_competency[],
 ARRAY['patriotism', 'respect', 'love']::cbc_value[],
 5);

-- ============================================
-- SST Grade 3 Sub-strands (4 strands)
-- ============================================

-- SST Grade 3 - Strand 1: Social Environment
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('a9d81682-eb27-4eff-a32f-82c5fb28e950', 1, 'Economic Activities', 
 '["Identify economic activities in the community", "Describe farming, fishing, trade", "Appreciate different occupations"]'::jsonb,
 '["How do people earn a living?", "What economic activities happen around us?"]'::jsonb,
 '["Community surveys", "Occupation research", "Career exploration"]'::jsonb,
 ARRAY['critical_thinking', 'citizenship', 'communication']::cbc_competency[],
 ARRAY['responsibility', 'respect', 'social_justice']::cbc_value[],
 6),
('a9d81682-eb27-4eff-a32f-82c5fb28e950', 2, 'Transportation in Community', 
 '["Identify types of transport", "Describe uses of different transport", "Practice road safety"]'::jsonb,
 '["How do people travel?", "Why do we need different types of transport?"]'::jsonb,
 '["Transport classification", "Road safety lessons", "Transport evolution timeline"]'::jsonb,
 ARRAY['critical_thinking', 'digital_literacy', 'self_efficacy']::cbc_competency[],
 ARRAY['responsibility', 'integrity', 'respect']::cbc_value[],
 6);

-- SST Grade 3 - Strand 2: Physical Environment
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('e1de04c8-5b86-4d79-99df-fe4793c4826d', 1, 'Physical Features of Kenya', 
 '["Locate major physical features of Kenya", "Describe importance of features", "Use maps to identify features"]'::jsonb,
 '["What major landforms does Kenya have?", "How do physical features affect people?"]'::jsonb,
 '["Map studies", "Feature research projects", "Model making"]'::jsonb,
 ARRAY['critical_thinking', 'creativity', 'digital_literacy']::cbc_competency[],
 ARRAY['patriotism', 'responsibility', 'love']::cbc_value[],
 6),
('e1de04c8-5b86-4d79-99df-fe4793c4826d', 2, 'Natural Resources', 
 '["Identify natural resources in Kenya", "Describe uses of resources", "Practice conservation"]'::jsonb,
 '["What resources does Kenya have?", "How can we conserve resources?"]'::jsonb,
 '["Resource mapping", "Conservation projects", "Research presentations"]'::jsonb,
 ARRAY['citizenship', 'critical_thinking', 'creativity']::cbc_competency[],
 ARRAY['responsibility', 'social_justice', 'love']::cbc_value[],
 6);

-- SST Grade 3 - Strand 3: Citizenship
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('a2f32d5d-6d88-48e9-af53-655300803eaa', 1, 'National Symbols and Emblems', 
 '["Describe national symbols of Kenya", "Explain meaning of symbols", "Respect national symbols"]'::jsonb,
 '["What do our national symbols represent?", "Why are national symbols important?"]'::jsonb,
 '["Symbol studies", "Flag ceremonies", "National anthem practice"]'::jsonb,
 ARRAY['citizenship', 'communication', 'critical_thinking']::cbc_competency[],
 ARRAY['patriotism', 'respect', 'unity']::cbc_value[],
 6),
('a2f32d5d-6d88-48e9-af53-655300803eaa', 2, 'Child Rights and Protection', 
 '["State children''s rights", "Identify child protection measures", "Report rights violations"]'::jsonb,
 '["What are children''s rights?", "How can children be protected?"]'::jsonb,
 '["Rights discussions", "Protection scenarios", "Reporting procedures"]'::jsonb,
 ARRAY['citizenship', 'self_efficacy', 'communication']::cbc_competency[],
 ARRAY['social_justice', 'respect', 'integrity']::cbc_value[],
 6);

-- SST Grade 3 - Strand 4: History
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('4d389e67-be9d-41ad-978b-087d6dcf5f43', 1, 'Kenya Before Independence', 
 '["Describe life before colonialism", "Identify early Kenyan communities", "Appreciate cultural heritage"]'::jsonb,
 '["How did people live before colonialism?", "What communities existed in Kenya?"]'::jsonb,
 '["Historical research", "Community studies", "Traditional life stories"]'::jsonb,
 ARRAY['critical_thinking', 'communication', 'creativity']::cbc_competency[],
 ARRAY['patriotism', 'respect', 'love']::cbc_value[],
 6),
('4d389e67-be9d-41ad-978b-087d6dcf5f43', 2, 'Famous Kenyans', 
 '["Identify famous Kenyans", "Describe their contributions", "Appreciate role models"]'::jsonb,
 '["Who are some famous Kenyans?", "What did they do for Kenya?"]'::jsonb,
 '["Biography research", "Role model presentations", "Heritage day celebrations"]'::jsonb,
 ARRAY['communication', 'critical_thinking', 'self_efficacy']::cbc_competency[],
 ARRAY['patriotism', 'integrity', 'respect']::cbc_value[],
 6);

-- ============================================
-- SST Grade 4-9 Additional Strands Sub-strands
-- ============================================

-- SST Grade 4 - Strand 4: Political Development and Governance
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('60b1b2f1-6580-46c5-8f1f-070a831cac9a', 1, 'County Government', 
 '["Describe structure of county government", "Identify county leaders", "Appreciate devolution"]'::jsonb,
 '["How is our county governed?", "What services does county government provide?"]'::jsonb,
 '["County government research", "Leader interviews", "Governance projects"]'::jsonb,
 ARRAY['citizenship', 'critical_thinking', 'communication']::cbc_competency[],
 ARRAY['patriotism', 'responsibility', 'social_justice']::cbc_value[],
 6),
('60b1b2f1-6580-46c5-8f1f-070a831cac9a', 2, 'Democracy and Elections', 
 '["Explain democratic principles", "Describe election process", "Practice democratic values"]'::jsonb,
 '["What is democracy?", "How do elections work?"]'::jsonb,
 '["Mock elections", "Democracy discussions", "Voting simulations"]'::jsonb,
 ARRAY['citizenship', 'critical_thinking', 'self_efficacy']::cbc_competency[],
 ARRAY['integrity', 'responsibility', 'peace']::cbc_value[],
 6);

-- SST Grade 4 - Strand 5: Social Relations
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('bfa448e8-6dec-4027-baee-291a1ea00edb', 1, 'Gender Equality', 
 '["Explain gender equality", "Identify gender stereotypes", "Promote equal opportunities"]'::jsonb,
 '["What is gender equality?", "How can we promote equal opportunities?"]'::jsonb,
 '["Equality discussions", "Role reversal activities", "Equality campaigns"]'::jsonb,
 ARRAY['citizenship', 'critical_thinking', 'communication']::cbc_competency[],
 ARRAY['social_justice', 'respect', 'integrity']::cbc_value[],
 6),
('bfa448e8-6dec-4027-baee-291a1ea00edb', 2, 'Conflict Resolution', 
 '["Identify causes of conflict", "Apply conflict resolution strategies", "Promote peace"]'::jsonb,
 '["Why do conflicts arise?", "How can we resolve conflicts peacefully?"]'::jsonb,
 '["Conflict scenarios", "Mediation practice", "Peace building activities"]'::jsonb,
 ARRAY['citizenship', 'communication', 'self_efficacy']::cbc_competency[],
 ARRAY['peace', 'respect', 'integrity']::cbc_value[],
 6);

-- SST Grade 5 - Strand 4: Political Development and Governance
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('e59492e4-e091-4d57-a4cf-489f34260dde', 1, 'National Government', 
 '["Describe structure of national government", "Identify three arms of government", "Appreciate separation of powers"]'::jsonb,
 '["How is Kenya governed?", "What do the three arms of government do?"]'::jsonb,
 '["Government structure studies", "Parliament visits", "Civic education"]'::jsonb,
 ARRAY['citizenship', 'critical_thinking', 'communication']::cbc_competency[],
 ARRAY['patriotism', 'integrity', 'responsibility']::cbc_value[],
 6),
('e59492e4-e091-4d57-a4cf-489f34260dde', 2, 'Constitution and Law', 
 '["Describe the Constitution of Kenya", "Identify fundamental rights", "Respect the rule of law"]'::jsonb,
 '["What is a constitution?", "Why is the rule of law important?"]'::jsonb,
 '["Constitution studies", "Rights discussions", "Law and order simulations"]'::jsonb,
 ARRAY['citizenship', 'critical_thinking', 'self_efficacy']::cbc_competency[],
 ARRAY['integrity', 'social_justice', 'respect']::cbc_value[],
 6);

-- SST Grade 5 - Strand 5: Social Relations
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('b53c2713-c664-4dc4-8052-6fa44109cd68', 1, 'Community Service', 
 '["Identify community needs", "Plan community service activities", "Participate in service learning"]'::jsonb,
 '["How can we serve our community?", "What needs exist in our community?"]'::jsonb,
 '["Community needs assessment", "Service projects", "Reflection journals"]'::jsonb,
 ARRAY['citizenship', 'creativity', 'self_efficacy']::cbc_competency[],
 ARRAY['social_justice', 'responsibility', 'love']::cbc_value[],
 6),
('b53c2713-c664-4dc4-8052-6fa44109cd68', 2, 'Human Rights', 
 '["Identify human rights", "Describe rights and responsibilities", "Advocate for human rights"]'::jsonb,
 '["What are human rights?", "How can we protect human rights?"]'::jsonb,
 '["Human rights research", "Case studies", "Advocacy projects"]'::jsonb,
 ARRAY['citizenship', 'critical_thinking', 'communication']::cbc_competency[],
 ARRAY['social_justice', 'respect', 'integrity']::cbc_value[],
 6);

-- SST Grade 6 - Strand 5: Social Relations
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('e9fcb673-cdf0-47f4-ad4c-8abb82c143ae', 1, 'Regional Cooperation', 
 '["Identify regional organizations", "Describe benefits of cooperation", "Appreciate regional unity"]'::jsonb,
 '["What regional organizations does Kenya belong to?", "How does regional cooperation benefit Kenya?"]'::jsonb,
 '["EAC and AU studies", "Cooperation benefits analysis", "Regional culture exchange"]'::jsonb,
 ARRAY['citizenship', 'critical_thinking', 'communication']::cbc_competency[],
 ARRAY['unity', 'peace', 'patriotism']::cbc_value[],
 6),
('e9fcb673-cdf0-47f4-ad4c-8abb82c143ae', 2, 'Globalization', 
 '["Explain globalization", "Describe effects of globalization", "Navigate global challenges"]'::jsonb,
 '["What is globalization?", "How does globalization affect Kenya?"]'::jsonb,
 '["Global connections research", "Impact analysis", "Global citizenship projects"]'::jsonb,
 ARRAY['critical_thinking', 'digital_literacy', 'citizenship']::cbc_competency[],
 ARRAY['responsibility', 'integrity', 'unity']::cbc_value[],
 6);

-- SST Grade 7 - Strand 5: Historical Developments
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('d24cbcb8-b07a-4c16-8e62-794ebf91ed80', 1, 'Colonial Period in Kenya', 
 '["Describe colonial rule in Kenya", "Analyze effects of colonialism", "Appreciate struggle for independence"]'::jsonb,
 '["How did colonialism affect Kenya?", "Who were the freedom fighters?"]'::jsonb,
 '["Colonial history research", "Freedom fighter studies", "Historical document analysis"]'::jsonb,
 ARRAY['critical_thinking', 'communication', 'citizenship']::cbc_competency[],
 ARRAY['patriotism', 'integrity', 'social_justice']::cbc_value[],
 8),
('d24cbcb8-b07a-4c16-8e62-794ebf91ed80', 2, 'Independence and Nation Building', 
 '["Describe path to independence", "Identify founding leaders", "Appreciate nation building efforts"]'::jsonb,
 '["How did Kenya gain independence?", "What challenges did new Kenya face?"]'::jsonb,
 '["Independence research", "Jamhuri Day celebrations", "Nation building projects"]'::jsonb,
 ARRAY['citizenship', 'critical_thinking', 'creativity']::cbc_competency[],
 ARRAY['patriotism', 'unity', 'responsibility']::cbc_value[],
 8);

-- SST Grade 8 - Strand 5: Historical Developments
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('41a85298-18f7-4514-b005-74780337686a', 1, 'African History', 
 '["Describe major African civilizations", "Analyze pan-African movements", "Appreciate African heritage"]'::jsonb,
 '["What great civilizations existed in Africa?", "How has Africa contributed to world history?"]'::jsonb,
 '["Civilization research", "Pan-Africanism studies", "Heritage projects"]'::jsonb,
 ARRAY['critical_thinking', 'communication', 'creativity']::cbc_competency[],
 ARRAY['patriotism', 'unity', 'respect']::cbc_value[],
 8),
('41a85298-18f7-4514-b005-74780337686a', 2, 'World History', 
 '["Identify major world historical events", "Analyze global connections", "Appreciate diverse histories"]'::jsonb,
 '["What major events shaped the modern world?", "How is Kenya connected to world history?"]'::jsonb,
 '["World history research", "Global connections mapping", "Historical analysis"]'::jsonb,
 ARRAY['critical_thinking', 'digital_literacy', 'citizenship']::cbc_competency[],
 ARRAY['peace', 'respect', 'responsibility']::cbc_value[],
 8);

-- SST Grade 9 - Strand 5: Historical Developments
INSERT INTO cbc_sub_strands (strand_id, sub_strand_number, name, specific_learning_outcomes, key_inquiry_questions, learning_experiences, core_competencies, values, suggested_lesson_count)
VALUES
('17cdc94f-25eb-4ef4-ba2d-4ca7b92dabf8', 1, 'Contemporary Kenya', 
 '["Analyze political developments since independence", "Describe economic progress", "Evaluate social changes"]'::jsonb,
 '["How has Kenya developed since 1963?", "What challenges and opportunities face Kenya today?"]'::jsonb,
 '["Development research", "Current affairs analysis", "Vision 2030 studies"]'::jsonb,
 ARRAY['critical_thinking', 'citizenship', 'digital_literacy']::cbc_competency[],
 ARRAY['patriotism', 'responsibility', 'integrity']::cbc_value[],
 8),
('17cdc94f-25eb-4ef4-ba2d-4ca7b92dabf8', 2, 'Global Challenges', 
 '["Identify global challenges", "Analyze Kenya''s response to global issues", "Propose solutions to challenges"]'::jsonb,
 '["What global challenges affect Kenya?", "How can Kenya contribute to solving global problems?"]'::jsonb,
 '["Climate change studies", "SDG research", "Solution design projects"]'::jsonb,
 ARRAY['critical_thinking', 'creativity', 'citizenship']::cbc_competency[],
 ARRAY['responsibility', 'social_justice', 'peace']::cbc_value[],
 8);
