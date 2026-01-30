-- Seed CBC Strands for missing subjects and levels
-- Pre-Primary and Additional Core Subjects

-- CRE (Christian Religious Education) - PP1 to Grade 6
INSERT INTO cbc_strands (subject_code, level, strand_number, name, description, suggested_time_allocation)
VALUES
-- PP1
('CRE', 'pp1', 1, 'God Our Creator', 'Understanding God as the creator of everything', '2 lessons/week'),
('CRE', 'pp1', 2, 'Life of Jesus', 'Learning about Jesus and His teachings', '2 lessons/week'),
('CRE', 'pp1', 3, 'Christian Living', 'Living according to Christian values', '2 lessons/week'),
-- PP2
('CRE', 'pp2', 1, 'God Our Creator', 'Deeper understanding of creation', '2 lessons/week'),
('CRE', 'pp2', 2, 'Life of Jesus', 'Stories and miracles of Jesus', '2 lessons/week'),
('CRE', 'pp2', 3, 'Christian Living', 'Practicing Christian values at home', '2 lessons/week'),
-- Grade 1
('CRE', 'grade_1', 1, 'Creation', 'God as the source of life', '2 lessons/week'),
('CRE', 'grade_1', 2, 'The Bible', 'Introduction to the Holy Book', '1 lesson/week'),
('CRE', 'grade_1', 3, 'Christian Communities', 'The church and family', '2 lessons/week'),
-- Grade 2
('CRE', 'grade_2', 1, 'The Bible', 'Bible stories and teachings', '2 lessons/week'),
('CRE', 'grade_2', 2, 'Life of Jesus', 'Birth and childhood of Jesus', '2 lessons/week'),
('CRE', 'grade_2', 3, 'Prayer and Worship', 'Communicating with God', '1 lesson/week'),
-- Grade 3
('CRE', 'grade_3', 1, 'The Bible', 'Structure and use of the Bible', '2 lessons/week'),
('CRE', 'grade_3', 2, 'Old Testament Personalities', 'Abraham, Moses and leaders', '2 lessons/week'),
('CRE', 'grade_3', 3, 'Living in Harmony', 'Relationships and community', '1 lesson/week'),
-- Grade 4
('CRE', 'grade_4', 1, 'The Bible', 'Bible as the Word of God', '2 lessons/week'),
('CRE', 'grade_4', 2, 'Creation', 'Creation accounts and stewardship', '2 lessons/week'),
('CRE', 'grade_4', 3, 'Faith in Action', 'Living out Christian beliefs', '2 lessons/week'),
-- Grade 5
('CRE', 'grade_5', 1, 'The Bible', 'Understanding Scripture', '2 lessons/week'),
('CRE', 'grade_5', 2, 'God''s Promises', 'Covenant with God''s people', '2 lessons/week'),
('CRE', 'grade_5', 3, 'Christian Virtues', 'Developing moral character', '2 lessons/week'),
-- Grade 6
('CRE', 'grade_6', 1, 'The Bible', 'Interpreting biblical texts', '2 lessons/week'),
('CRE', 'grade_6', 2, 'Prophets and Prophecy', 'Old Testament prophets', '2 lessons/week'),
('CRE', 'grade_6', 3, 'Moral Choices', 'Decision making and values', '2 lessons/week')
ON CONFLICT DO NOTHING;

-- IRE (Islamic Religious Education) - PP1 to Grade 6
INSERT INTO cbc_strands (subject_code, level, strand_number, name, description, suggested_time_allocation)
VALUES
-- PP1
('IRE', 'pp1', 1, 'Aqeedah (Faith)', 'Basic beliefs in Islam', '2 lessons/week'),
('IRE', 'pp1', 2, 'Ibadah (Worship)', 'Introduction to prayer and worship', '2 lessons/week'),
('IRE', 'pp1', 3, 'Akhlaq (Character)', 'Good manners and behavior', '2 lessons/week'),
-- PP2
('IRE', 'pp2', 1, 'Aqeedah (Faith)', 'Pillars of Islam', '2 lessons/week'),
('IRE', 'pp2', 2, 'Quran', 'Short surahs and recitation', '2 lessons/week'),
('IRE', 'pp2', 3, 'Akhlaq (Character)', 'Respect and obedience', '2 lessons/week'),
-- Grade 1-6
('IRE', 'grade_1', 1, 'Aqeedah', 'Articles of Faith', '2 lessons/week'),
('IRE', 'grade_1', 2, 'The Quran', 'Learning Quran recitation', '2 lessons/week'),
('IRE', 'grade_1', 3, 'Akhlaq', 'Islamic manners', '1 lesson/week'),
('IRE', 'grade_2', 1, 'Aqeedah', 'Belief in Allah', '2 lessons/week'),
('IRE', 'grade_2', 2, 'Ibadah', 'Learning to pray', '2 lessons/week'),
('IRE', 'grade_2', 3, 'Seerah', 'Life of Prophet Muhammad (PBUH)', '1 lesson/week'),
('IRE', 'grade_3', 1, 'The Quran', 'Memorization and meaning', '2 lessons/week'),
('IRE', 'grade_3', 2, 'Ibadah', 'Salah and wudhu', '2 lessons/week'),
('IRE', 'grade_3', 3, 'Islamic History', 'Early Muslim community', '1 lesson/week'),
('IRE', 'grade_4', 1, 'The Quran', 'Tafsir and tajweed', '2 lessons/week'),
('IRE', 'grade_4', 2, 'Ibadah', 'Fasting and zakah', '2 lessons/week'),
('IRE', 'grade_4', 3, 'Akhlaq', 'Moral values in Islam', '2 lessons/week'),
('IRE', 'grade_5', 1, 'The Quran', 'Selected surahs', '2 lessons/week'),
('IRE', 'grade_5', 2, 'Hadith', 'Sayings of the Prophet', '2 lessons/week'),
('IRE', 'grade_5', 3, 'Islamic Community', 'Ummah and unity', '2 lessons/week'),
('IRE', 'grade_6', 1, 'The Quran', 'Themes in the Quran', '2 lessons/week'),
('IRE', 'grade_6', 2, 'Seerah', 'Prophet''s life events', '2 lessons/week'),
('IRE', 'grade_6', 3, 'Islamic Values', 'Justice and fairness', '2 lessons/week')
ON CONFLICT DO NOTHING;

-- Creative Arts - PP1 to Grade 6
INSERT INTO cbc_strands (subject_code, level, strand_number, name, description, suggested_time_allocation)
VALUES
-- PP1
('ART', 'pp1', 1, 'Drawing and Colouring', 'Basic drawing skills', '2 lessons/week'),
('ART', 'pp1', 2, 'Painting', 'Introduction to paints and colors', '1 lesson/week'),
('ART', 'pp1', 3, 'Crafts', 'Simple paper crafts', '1 lesson/week'),
-- PP2
('ART', 'pp2', 1, 'Drawing', 'Observational drawing', '2 lessons/week'),
('ART', 'pp2', 2, 'Painting and Collage', 'Mixing colors and textures', '1 lesson/week'),
('ART', 'pp2', 3, 'Modelling', '3D shapes with clay/plasticine', '1 lesson/week'),
-- Grade 1-6
('ART', 'grade_1', 1, 'Picture Making', 'Drawing and painting', '2 lessons/week'),
('ART', 'grade_1', 2, 'Pattern Making', 'Creating patterns and designs', '1 lesson/week'),
('ART', 'grade_1', 3, 'Craftwork', 'Paper and fabric crafts', '2 lessons/week'),
('ART', 'grade_2', 1, 'Picture Making', 'Composition and perspective', '2 lessons/week'),
('ART', 'grade_2', 2, 'Pattern Making', 'Geometric patterns', '1 lesson/week'),
('ART', 'grade_2', 3, 'Craftwork', 'Weaving and threading', '2 lessons/week'),
('ART', 'grade_3', 1, 'Picture Making', 'Landscape and portraits', '2 lessons/week'),
('ART', 'grade_3', 2, 'Pattern Making', 'Cultural patterns', '1 lesson/week'),
('ART', 'grade_3', 3, 'Craftwork', 'Recycled materials art', '2 lessons/week'),
('ART', 'grade_4', 1, 'Drawing', 'Shading and texture', '2 lessons/week'),
('ART', 'grade_4', 2, 'Painting', 'Watercolor techniques', '2 lessons/week'),
('ART', 'grade_4', 3, 'Sculpture', 'Clay and paper mache', '1 lesson/week'),
('ART', 'grade_5', 1, 'Drawing and Design', 'Technical drawing basics', '2 lessons/week'),
('ART', 'grade_5', 2, 'Mixed Media', 'Combining art forms', '2 lessons/week'),
('ART', 'grade_5', 3, 'Digital Art', 'Introduction to digital tools', '1 lesson/week'),
('ART', 'grade_6', 1, 'Visual Art', 'Art appreciation and history', '2 lessons/week'),
('ART', 'grade_6', 2, 'Applied Art', 'Functional art and design', '2 lessons/week'),
('ART', 'grade_6', 3, 'Art Exhibition', 'Curating and presenting work', '1 lesson/week')
ON CONFLICT DO NOTHING;

-- Physical Education - PP1 to Grade 6
INSERT INTO cbc_strands (subject_code, level, strand_number, name, description, suggested_time_allocation)
VALUES
-- PP1
('PE', 'pp1', 1, 'Movement Skills', 'Basic motor skills', '3 lessons/week'),
('PE', 'pp1', 2, 'Games', 'Simple group games', '2 lessons/week'),
-- PP2
('PE', 'pp2', 1, 'Movement Skills', 'Locomotor skills', '3 lessons/week'),
('PE', 'pp2', 2, 'Games and Sports', 'Introduction to sports', '2 lessons/week'),
-- Grade 1-6
('PE', 'grade_1', 1, 'Movement Activities', 'Running, jumping, throwing', '2 lessons/week'),
('PE', 'grade_1', 2, 'Games', 'Tag games and relays', '2 lessons/week'),
('PE', 'grade_1', 3, 'Health and Fitness', 'Body awareness', '1 lesson/week'),
('PE', 'grade_2', 1, 'Gymnastics', 'Basic balances and rolls', '2 lessons/week'),
('PE', 'grade_2', 2, 'Ball Games', 'Catching and throwing', '2 lessons/week'),
('PE', 'grade_2', 3, 'Athletics', 'Running and jumping events', '1 lesson/week'),
('PE', 'grade_3', 1, 'Gymnastics', 'Sequences and routines', '2 lessons/week'),
('PE', 'grade_3', 2, 'Team Games', 'Mini football and netball', '2 lessons/week'),
('PE', 'grade_3', 3, 'Swimming', 'Water safety and basics', '1 lesson/week'),
('PE', 'grade_4', 1, 'Athletics', 'Track and field events', '2 lessons/week'),
('PE', 'grade_4', 2, 'Ball Games', 'Football, netball, volleyball', '2 lessons/week'),
('PE', 'grade_4', 3, 'Fitness', 'Strength and endurance', '1 lesson/week'),
('PE', 'grade_5', 1, 'Athletics', 'Competitive events', '2 lessons/week'),
('PE', 'grade_5', 2, 'Team Sports', 'Game strategies', '2 lessons/week'),
('PE', 'grade_5', 3, 'Outdoor Activities', 'Hiking and orienteering', '1 lesson/week'),
('PE', 'grade_6', 1, 'Athletics', 'Performance improvement', '2 lessons/week'),
('PE', 'grade_6', 2, 'Sports Specialization', 'Individual and team sports', '2 lessons/week'),
('PE', 'grade_6', 3, 'Leadership', 'Coaching and officiating', '1 lesson/week')
ON CONFLICT DO NOTHING;

-- Agriculture - Grade 4 to 6
INSERT INTO cbc_strands (subject_code, level, strand_number, name, description, suggested_time_allocation)
VALUES
('AGRI', 'grade_4', 1, 'Soil and Water', 'Soil types and conservation', '2 lessons/week'),
('AGRI', 'grade_4', 2, 'Crop Production', 'Growing vegetables', '2 lessons/week'),
('AGRI', 'grade_4', 3, 'Farm Tools', 'Tools and their uses', '1 lesson/week'),
('AGRI', 'grade_5', 1, 'Crop Production', 'Field crops and rotation', '2 lessons/week'),
('AGRI', 'grade_5', 2, 'Animal Husbandry', 'Keeping small animals', '2 lessons/week'),
('AGRI', 'grade_5', 3, 'Farm Structures', 'Simple farm buildings', '1 lesson/week'),
('AGRI', 'grade_6', 1, 'Crop Production', 'Pest and disease control', '2 lessons/week'),
('AGRI', 'grade_6', 2, 'Animal Husbandry', 'Livestock management', '2 lessons/week'),
('AGRI', 'grade_6', 3, 'Agribusiness', 'Farm records and marketing', '1 lesson/week')
ON CONFLICT DO NOTHING;

-- Home Science - Grade 4 to 6
INSERT INTO cbc_strands (subject_code, level, strand_number, name, description, suggested_time_allocation)
VALUES
('HE', 'grade_4', 1, 'Food and Nutrition', 'Healthy eating habits', '2 lessons/week'),
('HE', 'grade_4', 2, 'Clothing and Textiles', 'Care of clothes', '1 lesson/week'),
('HE', 'grade_4', 3, 'Consumer Education', 'Wise spending', '1 lesson/week'),
('HE', 'grade_5', 1, 'Food Preparation', 'Simple cooking methods', '2 lessons/week'),
('HE', 'grade_5', 2, 'Clothing and Textiles', 'Basic stitches', '2 lessons/week'),
('HE', 'grade_5', 3, 'Home Management', 'Cleaning and organization', '1 lesson/week'),
('HE', 'grade_6', 1, 'Food Preparation', 'Meal planning and cooking', '2 lessons/week'),
('HE', 'grade_6', 2, 'Clothing Construction', 'Simple garment making', '2 lessons/week'),
('HE', 'grade_6', 3, 'Family Life', 'Relationships and responsibilities', '1 lesson/week')
ON CONFLICT DO NOTHING;

-- Music - PP1 to Grade 6
INSERT INTO cbc_strands (subject_code, level, strand_number, name, description, suggested_time_allocation)
VALUES
('MUSIC', 'pp1', 1, 'Singing', 'Songs and rhymes', '2 lessons/week'),
('MUSIC', 'pp1', 2, 'Rhythm', 'Clapping and movement', '2 lessons/week'),
('MUSIC', 'pp2', 1, 'Singing', 'Action songs', '2 lessons/week'),
('MUSIC', 'pp2', 2, 'Percussion', 'Simple instruments', '2 lessons/week'),
('MUSIC', 'grade_1', 1, 'Singing', 'Melody and pitch', '2 lessons/week'),
('MUSIC', 'grade_1', 2, 'Rhythm', 'Beat and tempo', '1 lesson/week'),
('MUSIC', 'grade_1', 3, 'Listening', 'Music appreciation', '1 lesson/week'),
('MUSIC', 'grade_2', 1, 'Singing', 'Part singing', '2 lessons/week'),
('MUSIC', 'grade_2', 2, 'Instruments', 'Playing percussion', '1 lesson/week'),
('MUSIC', 'grade_2', 3, 'Movement', 'Creative dance', '1 lesson/week'),
('MUSIC', 'grade_3', 1, 'Singing', 'Harmony and rounds', '2 lessons/week'),
('MUSIC', 'grade_3', 2, 'Notation', 'Reading simple music', '1 lesson/week'),
('MUSIC', 'grade_3', 3, 'Composition', 'Creating simple tunes', '1 lesson/week'),
('MUSIC', 'grade_4', 1, 'Performance', 'Vocal and instrumental', '2 lessons/week'),
('MUSIC', 'grade_4', 2, 'Theory', 'Music notation', '1 lesson/week'),
('MUSIC', 'grade_4', 3, 'Cultural Music', 'Traditional songs', '1 lesson/week'),
('MUSIC', 'grade_5', 1, 'Performance', 'Choir and ensemble', '2 lessons/week'),
('MUSIC', 'grade_5', 2, 'Theory', 'Scales and keys', '1 lesson/week'),
('MUSIC', 'grade_5', 3, 'Music Technology', 'Recording basics', '1 lesson/week'),
('MUSIC', 'grade_6', 1, 'Performance', 'Concert preparation', '2 lessons/week'),
('MUSIC', 'grade_6', 2, 'Music History', 'Genres and composers', '1 lesson/week'),
('MUSIC', 'grade_6', 3, 'Composition', 'Creating original works', '1 lesson/week')
ON CONFLICT DO NOTHING;

-- Add PP1 and PP2 strands for core subjects
INSERT INTO cbc_strands (subject_code, level, strand_number, name, description, suggested_time_allocation)
VALUES
-- MATH PP1 & PP2
('MATH', 'pp1', 1, 'Numbers', 'Counting 1-10', '5 lessons/week'),
('MATH', 'pp1', 2, 'Measurement', 'Big and small, long and short', '2 lessons/week'),
('MATH', 'pp1', 3, 'Geometry', 'Basic shapes', '2 lessons/week'),
('MATH', 'pp2', 1, 'Numbers', 'Counting 1-20 and beyond', '5 lessons/week'),
('MATH', 'pp2', 2, 'Measurement', 'Comparing quantities', '2 lessons/week'),
('MATH', 'pp2', 3, 'Geometry', 'Shapes and patterns', '2 lessons/week'),
-- ENG PP1 & PP2
('ENG', 'pp1', 1, 'Listening and Speaking', 'Oral communication', '3 lessons/week'),
('ENG', 'pp1', 2, 'Reading Readiness', 'Pre-reading skills', '3 lessons/week'),
('ENG', 'pp1', 3, 'Writing Readiness', 'Pre-writing skills', '2 lessons/week'),
('ENG', 'pp2', 1, 'Listening and Speaking', 'Conversations and stories', '3 lessons/week'),
('ENG', 'pp2', 2, 'Reading', 'Letter recognition and phonics', '3 lessons/week'),
('ENG', 'pp2', 3, 'Writing', 'Letter formation', '2 lessons/week'),
-- KIS PP1 & PP2
('KIS', 'pp1', 1, 'Kusikiliza na Kuzungumza', 'Mawasiliano ya mdomo', '3 lessons/week'),
('KIS', 'pp1', 2, 'Kusoma', 'Ujuzi wa awali wa kusoma', '2 lessons/week'),
('KIS', 'pp1', 3, 'Kuandika', 'Ujuzi wa awali wa kuandika', '2 lessons/week'),
('KIS', 'pp2', 1, 'Kusikiliza na Kuzungumza', 'Hadithi na mazungumzo', '3 lessons/week'),
('KIS', 'pp2', 2, 'Kusoma', 'Herufi na sauti', '2 lessons/week'),
('KIS', 'pp2', 3, 'Kuandika', 'Kuandika herufi', '2 lessons/week')
ON CONFLICT DO NOTHING;

-- Junior Secondary (Grade 7-9) core subjects
INSERT INTO cbc_strands (subject_code, level, strand_number, name, description, suggested_time_allocation)
VALUES
-- MATH Grade 7-9
('MATH', 'grade_7', 1, 'Numbers', 'Integers and rational numbers', '3 lessons/week'),
('MATH', 'grade_7', 2, 'Algebra', 'Linear expressions and equations', '3 lessons/week'),
('MATH', 'grade_7', 3, 'Geometry', 'Angles and constructions', '2 lessons/week'),
('MATH', 'grade_7', 4, 'Statistics', 'Data collection and representation', '1 lesson/week'),
('MATH', 'grade_8', 1, 'Numbers', 'Indices and logarithms', '2 lessons/week'),
('MATH', 'grade_8', 2, 'Algebra', 'Quadratic expressions', '3 lessons/week'),
('MATH', 'grade_8', 3, 'Geometry', 'Circles and transformations', '2 lessons/week'),
('MATH', 'grade_8', 4, 'Statistics', 'Probability and measures of central tendency', '2 lessons/week'),
('MATH', 'grade_9', 1, 'Numbers', 'Surds and complex numbers intro', '2 lessons/week'),
('MATH', 'grade_9', 2, 'Algebra', 'Functions and graphs', '3 lessons/week'),
('MATH', 'grade_9', 3, 'Geometry', 'Trigonometry basics', '2 lessons/week'),
('MATH', 'grade_9', 4, 'Statistics', 'Advanced probability', '2 lessons/week'),
-- ENG Grade 7-9
('ENG', 'grade_7', 1, 'Listening and Speaking', 'Public speaking and debates', '2 lessons/week'),
('ENG', 'grade_7', 2, 'Reading', 'Comprehension and analysis', '3 lessons/week'),
('ENG', 'grade_7', 3, 'Writing', 'Essays and creative writing', '2 lessons/week'),
('ENG', 'grade_7', 4, 'Grammar', 'Advanced grammar structures', '2 lessons/week'),
('ENG', 'grade_8', 1, 'Listening and Speaking', 'Presentations and discussions', '2 lessons/week'),
('ENG', 'grade_8', 2, 'Reading', 'Literature and critical reading', '3 lessons/week'),
('ENG', 'grade_8', 3, 'Writing', 'Argumentative and expository writing', '2 lessons/week'),
('ENG', 'grade_8', 4, 'Grammar', 'Complex sentence structures', '2 lessons/week'),
('ENG', 'grade_9', 1, 'Listening and Speaking', 'Formal communication', '2 lessons/week'),
('ENG', 'grade_9', 2, 'Reading', 'Literary analysis', '3 lessons/week'),
('ENG', 'grade_9', 3, 'Writing', 'Research and academic writing', '2 lessons/week'),
('ENG', 'grade_9', 4, 'Grammar', 'Mastery and style', '2 lessons/week'),
-- SCI Grade 7-9 (Integrated Science)
('SCI', 'grade_7', 1, 'Scientific Investigation', 'Scientific method and inquiry', '2 lessons/week'),
('SCI', 'grade_7', 2, 'Matter', 'States and properties of matter', '2 lessons/week'),
('SCI', 'grade_7', 3, 'Energy', 'Forms and transformation', '2 lessons/week'),
('SCI', 'grade_7', 4, 'Living Things', 'Cells and organisms', '2 lessons/week'),
('SCI', 'grade_8', 1, 'Chemistry Basics', 'Elements, compounds, mixtures', '2 lessons/week'),
('SCI', 'grade_8', 2, 'Physics Basics', 'Forces and motion', '2 lessons/week'),
('SCI', 'grade_8', 3, 'Biology Basics', 'Human body systems', '2 lessons/week'),
('SCI', 'grade_8', 4, 'Environment', 'Ecology and conservation', '2 lessons/week'),
('SCI', 'grade_9', 1, 'Chemistry', 'Reactions and equations', '2 lessons/week'),
('SCI', 'grade_9', 2, 'Physics', 'Electricity and magnetism', '2 lessons/week'),
('SCI', 'grade_9', 3, 'Biology', 'Genetics and reproduction', '2 lessons/week'),
('SCI', 'grade_9', 4, 'Earth Science', 'Climate and geology', '2 lessons/week')
ON CONFLICT DO NOTHING;