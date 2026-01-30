
-- Add missing CBC strands for Junior Secondary (Grade 7-9) and Lower Primary (PP1-Grade 3)

-- ===== ART: Grade 7-9 (3 strands each) =====
INSERT INTO cbc_strands (subject_code, level, strand_number, name, description, suggested_time_allocation) VALUES
-- Grade 7
('ART', 'grade_7', 1, 'Drawing and Painting', 'Advanced techniques in drawing and painting for self-expression', '2 hours per week'),
('ART', 'grade_7', 2, 'Design and Technology', 'Creative design principles and digital tools application', '2 hours per week'),
('ART', 'grade_7', 3, 'Sculpture and Crafts', 'Three-dimensional art forms and traditional craftwork', '2 hours per week'),
-- Grade 8
('ART', 'grade_8', 1, 'Drawing and Painting', 'Exploring artistic styles and advanced media techniques', '2 hours per week'),
('ART', 'grade_8', 2, 'Design and Technology', 'Product design and digital art creation', '2 hours per week'),
('ART', 'grade_8', 3, 'Sculpture and Crafts', 'Contemporary sculpture and cultural craft traditions', '2 hours per week'),
-- Grade 9
('ART', 'grade_9', 1, 'Drawing and Painting', 'Portfolio development and artistic specialization', '2 hours per week'),
('ART', 'grade_9', 2, 'Design and Technology', 'Commercial design and multimedia applications', '2 hours per week'),
('ART', 'grade_9', 3, 'Sculpture and Crafts', 'Exhibition preparation and entrepreneurship in art', '2 hours per week'),

-- ===== CRE: Grade 7-9 (3 strands each) =====
-- Grade 7
('CRE', 'grade_7', 1, 'The Bible', 'In-depth study of Old and New Testament teachings', '2 hours per week'),
('CRE', 'grade_7', 2, 'Christian Living', 'Applying Christian principles in contemporary society', '2 hours per week'),
('CRE', 'grade_7', 3, 'Christian Community', 'Church history and the role of Christians in community', '2 hours per week'),
-- Grade 8
('CRE', 'grade_8', 1, 'The Bible', 'Prophets, Epistles, and Biblical interpretation', '2 hours per week'),
('CRE', 'grade_8', 2, 'Christian Living', 'Ethics, morality, and Christian decision-making', '2 hours per week'),
('CRE', 'grade_8', 3, 'Christian Community', 'Ecumenism and interfaith dialogue', '2 hours per week'),
-- Grade 9
('CRE', 'grade_9', 1, 'The Bible', 'Advanced Biblical studies and theological concepts', '2 hours per week'),
('CRE', 'grade_9', 2, 'Christian Living', 'Christian worldview and contemporary issues', '2 hours per week'),
('CRE', 'grade_9', 3, 'Christian Community', 'Christian service and leadership in society', '2 hours per week'),

-- ===== IRE: Grade 7-9 (3 strands each) =====
-- Grade 7
('IRE', 'grade_7', 1, 'Quran', 'Advanced Quran recitation and tafsir', '2 hours per week'),
('IRE', 'grade_7', 2, 'Hadith and Sunnah', 'Collections of Hadith and their applications', '2 hours per week'),
('IRE', 'grade_7', 3, 'Akhlaq and Muamalat', 'Islamic ethics and social transactions', '2 hours per week'),
-- Grade 8
('IRE', 'grade_8', 1, 'Quran', 'Thematic study of Quranic chapters', '2 hours per week'),
('IRE', 'grade_8', 2, 'Hadith and Sunnah', 'Hadith sciences and authentication', '2 hours per week'),
('IRE', 'grade_8', 3, 'Akhlaq and Muamalat', 'Islamic jurisprudence and contemporary issues', '2 hours per week'),
-- Grade 9
('IRE', 'grade_9', 1, 'Quran', 'Quranic sciences and memorization', '2 hours per week'),
('IRE', 'grade_9', 2, 'Hadith and Sunnah', 'Comparative Hadith study and Islamic history', '2 hours per week'),
('IRE', 'grade_9', 3, 'Akhlaq and Muamalat', 'Islamic worldview and civic responsibility', '2 hours per week'),

-- ===== MUSIC: Grade 7-9 (3 strands each) =====
-- Grade 7
('MUSIC', 'grade_7', 1, 'Performing Music', 'Vocal and instrumental performance skills', '2 hours per week'),
('MUSIC', 'grade_7', 2, 'Creating Music', 'Music composition and arrangement', '2 hours per week'),
('MUSIC', 'grade_7', 3, 'Listening and Responding', 'Music appreciation and critical analysis', '2 hours per week'),
-- Grade 8
('MUSIC', 'grade_8', 1, 'Performing Music', 'Ensemble performance and stage presence', '2 hours per week'),
('MUSIC', 'grade_8', 2, 'Creating Music', 'Digital music production and songwriting', '2 hours per week'),
('MUSIC', 'grade_8', 3, 'Listening and Responding', 'World music traditions and cultural contexts', '2 hours per week'),
-- Grade 9
('MUSIC', 'grade_9', 1, 'Performing Music', 'Advanced performance and music entrepreneurship', '2 hours per week'),
('MUSIC', 'grade_9', 2, 'Creating Music', 'Film scoring and multimedia music', '2 hours per week'),
('MUSIC', 'grade_9', 3, 'Listening and Responding', 'Music careers and industry knowledge', '2 hours per week'),

-- ===== PE: Grade 7-9 (3 strands each) =====
-- Grade 7
('PE', 'grade_7', 1, 'Movement and Physical Activities', 'Advanced sports skills and athletic training', '3 hours per week'),
('PE', 'grade_7', 2, 'Health and Fitness', 'Personal fitness planning and nutrition', '2 hours per week'),
('PE', 'grade_7', 3, 'Games and Sports', 'Team sports tactics and fair play', '2 hours per week'),
-- Grade 8
('PE', 'grade_8', 1, 'Movement and Physical Activities', 'Specialized athletic techniques and conditioning', '3 hours per week'),
('PE', 'grade_8', 2, 'Health and Fitness', 'Lifestyle diseases prevention and wellness', '2 hours per week'),
('PE', 'grade_8', 3, 'Games and Sports', 'Sports officiating and leadership', '2 hours per week'),
-- Grade 9
('PE', 'grade_9', 1, 'Movement and Physical Activities', 'Sports science and performance optimization', '3 hours per week'),
('PE', 'grade_9', 2, 'Health and Fitness', 'Mental health and holistic wellness', '2 hours per week'),
('PE', 'grade_9', 3, 'Games and Sports', 'Sports management and career pathways', '2 hours per week'),

-- ===== SCI: PP1-Grade 3 (3-4 strands each) =====
-- PP1
('SCI', 'pp1', 1, 'Living Things', 'Introduction to plants and animals around us', '2 hours per week'),
('SCI', 'pp1', 2, 'Non-Living Things', 'Exploring objects and materials in the environment', '2 hours per week'),
('SCI', 'pp1', 3, 'The Environment', 'Weather, seasons, and caring for nature', '2 hours per week'),
-- PP2
('SCI', 'pp2', 1, 'Living Things', 'Parts of plants and animals and their needs', '2 hours per week'),
('SCI', 'pp2', 2, 'Non-Living Things', 'Properties of materials and simple machines', '2 hours per week'),
('SCI', 'pp2', 3, 'The Environment', 'Natural resources and environmental care', '2 hours per week'),
-- Grade 1
('SCI', 'grade_1', 1, 'Living Things', 'Characteristics of living organisms', '3 hours per week'),
('SCI', 'grade_1', 2, 'Non-Living Things', 'States of matter and physical properties', '3 hours per week'),
('SCI', 'grade_1', 3, 'The Environment', 'Habitats and ecosystems introduction', '2 hours per week'),
('SCI', 'grade_1', 4, 'Health', 'Personal hygiene and basic nutrition', '2 hours per week'),
-- Grade 2
('SCI', 'grade_2', 1, 'Living Things', 'Life cycles and plant growth', '3 hours per week'),
('SCI', 'grade_2', 2, 'Non-Living Things', 'Forces and energy in daily life', '3 hours per week'),
('SCI', 'grade_2', 3, 'The Environment', 'Weather patterns and water cycle', '2 hours per week'),
('SCI', 'grade_2', 4, 'Health', 'Disease prevention and safety', '2 hours per week'),
-- Grade 3
('SCI', 'grade_3', 1, 'Living Things', 'Animal classification and adaptations', '3 hours per week'),
('SCI', 'grade_3', 2, 'Non-Living Things', 'Simple circuits and magnets', '3 hours per week'),
('SCI', 'grade_3', 3, 'The Environment', 'Soil types and conservation', '2 hours per week'),
('SCI', 'grade_3', 4, 'Health', 'Balanced diet and exercise', '2 hours per week'),

-- ===== SST: PP1-Grade 3 (3-4 strands each) =====
-- PP1
('SST', 'pp1', 1, 'Social Environment', 'Family and school community', '2 hours per week'),
('SST', 'pp1', 2, 'Physical Environment', 'Our home and school surroundings', '2 hours per week'),
('SST', 'pp1', 3, 'Citizenship', 'Rules, sharing, and working together', '2 hours per week'),
-- PP2
('SST', 'pp2', 1, 'Social Environment', 'Extended family and neighborhood', '2 hours per week'),
('SST', 'pp2', 2, 'Physical Environment', 'Local environment and landmarks', '2 hours per week'),
('SST', 'pp2', 3, 'Citizenship', 'Responsibilities at home and school', '2 hours per week'),
-- Grade 1
('SST', 'grade_1', 1, 'Social Environment', 'Community helpers and services', '3 hours per week'),
('SST', 'grade_1', 2, 'Physical Environment', 'Maps and directions in the community', '2 hours per week'),
('SST', 'grade_1', 3, 'Citizenship', 'National symbols and patriotism', '2 hours per week'),
('SST', 'grade_1', 4, 'History', 'Family history and traditions', '2 hours per week'),
-- Grade 2
('SST', 'grade_2', 1, 'Social Environment', 'Economic activities in the community', '3 hours per week'),
('SST', 'grade_2', 2, 'Physical Environment', 'Physical features and climate', '2 hours per week'),
('SST', 'grade_2', 3, 'Citizenship', 'Rights and responsibilities of children', '2 hours per week'),
('SST', 'grade_2', 4, 'History', 'Community stories and heritage', '2 hours per week'),
-- Grade 3
('SST', 'grade_3', 1, 'Social Environment', 'Population and settlement patterns', '3 hours per week'),
('SST', 'grade_3', 2, 'Physical Environment', 'Kenya geography and resources', '2 hours per week'),
('SST', 'grade_3', 3, 'Citizenship', 'Democracy and leadership', '2 hours per week'),
('SST', 'grade_3', 4, 'History', 'Pre-colonial Kenyan communities', '2 hours per week');
