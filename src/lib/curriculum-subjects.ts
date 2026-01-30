import { CurriculumId } from './curriculum-config';

export type SubjectCategory = 'core' | 'elective' | 'science' | 'humanities' | 'technical' | 'language' | 'arts';

export interface CurriculumSubject {
  name: string;
  code: string;
  category: SubjectCategory;
  isCompulsory: boolean;
  levels?: string[]; // e.g., ['lower_primary', 'upper_primary']
  hoursPerWeek?: number;
}

export interface CurriculumLevelSubjects {
  levelId: string;
  levelName: string;
  subjects: CurriculumSubject[];
}

export interface CurriculumSubjectConfig {
  curriculumId: CurriculumId;
  curriculumName: string;
  levels: CurriculumLevelSubjects[];
}

// Kenya CBC Subjects
const kenyaCBCSubjects: CurriculumSubjectConfig = {
  curriculumId: 'ke_cbc',
  curriculumName: 'Kenya CBC',
  levels: [
    {
      levelId: 'pre_primary',
      levelName: 'Pre-Primary (PP1-PP2)',
      subjects: [
        { name: 'Language Activities', code: 'LANG', category: 'core', isCompulsory: true },
        { name: 'Mathematical Activities', code: 'MATH', category: 'core', isCompulsory: true },
        { name: 'Environmental Activities', code: 'ENV', category: 'core', isCompulsory: true },
        { name: 'Psychomotor & Creative Activities', code: 'PCA', category: 'arts', isCompulsory: true },
        { name: 'Religious Education Activities', code: 'REA', category: 'core', isCompulsory: true },
      ],
    },
    {
      levelId: 'lower_primary',
      levelName: 'Lower Primary (Grade 1-3)',
      subjects: [
        { name: 'Kiswahili', code: 'KIS', category: 'language', isCompulsory: true },
        { name: 'English', code: 'ENG', category: 'language', isCompulsory: true },
        { name: 'Mathematics', code: 'MATH', category: 'core', isCompulsory: true },
        { name: 'Environmental Activities', code: 'ENV', category: 'core', isCompulsory: true },
        { name: 'Hygiene & Nutrition', code: 'HN', category: 'core', isCompulsory: true },
        { name: 'Religious Education', code: 'RE', category: 'core', isCompulsory: true },
        { name: 'Movement & Creative Activities', code: 'MCA', category: 'arts', isCompulsory: true },
        { name: 'Indigenous Language', code: 'IL', category: 'language', isCompulsory: false },
      ],
    },
    {
      levelId: 'upper_primary',
      levelName: 'Upper Primary (Grade 4-6)',
      subjects: [
        { name: 'Kiswahili', code: 'KIS', category: 'language', isCompulsory: true },
        { name: 'English', code: 'ENG', category: 'language', isCompulsory: true },
        { name: 'Mathematics', code: 'MATH', category: 'core', isCompulsory: true },
        { name: 'Science & Technology', code: 'SCI', category: 'science', isCompulsory: true },
        { name: 'Social Studies', code: 'SST', category: 'humanities', isCompulsory: true },
        { name: 'Religious Education', code: 'RE', category: 'core', isCompulsory: true },
        { name: 'Creative Arts', code: 'ART', category: 'arts', isCompulsory: true },
        { name: 'Agriculture', code: 'AGR', category: 'elective', isCompulsory: false },
        { name: 'Home Science', code: 'HS', category: 'elective', isCompulsory: false },
        { name: 'Arabic', code: 'ARB', category: 'language', isCompulsory: false },
      ],
    },
    {
      levelId: 'junior_secondary',
      levelName: 'Junior Secondary (Grade 7-9)',
      subjects: [
        { name: 'English', code: 'ENG', category: 'language', isCompulsory: true },
        { name: 'Kiswahili', code: 'KIS', category: 'language', isCompulsory: true },
        { name: 'Mathematics', code: 'MATH', category: 'core', isCompulsory: true },
        { name: 'Integrated Science', code: 'ISCI', category: 'science', isCompulsory: true },
        { name: 'Health Education', code: 'HE', category: 'core', isCompulsory: true },
        { name: 'Pre-Technical Studies', code: 'PTS', category: 'technical', isCompulsory: true },
        { name: 'Social Studies', code: 'SST', category: 'humanities', isCompulsory: true },
        { name: 'Religious Education', code: 'RE', category: 'core', isCompulsory: true },
        { name: 'Business Studies', code: 'BS', category: 'elective', isCompulsory: false },
        { name: 'Agriculture', code: 'AGR', category: 'elective', isCompulsory: false },
        { name: 'Life Skills', code: 'LS', category: 'core', isCompulsory: true },
        { name: 'Visual Arts', code: 'VA', category: 'arts', isCompulsory: false },
        { name: 'Performing Arts', code: 'PA', category: 'arts', isCompulsory: false },
        { name: 'Home Science', code: 'HS', category: 'elective', isCompulsory: false },
        { name: 'Computer Science', code: 'CS', category: 'technical', isCompulsory: false },
        { name: 'Foreign Languages', code: 'FL', category: 'language', isCompulsory: false },
      ],
    },
    {
      levelId: 'senior_secondary',
      levelName: 'Senior Secondary (Grade 10-12)',
      subjects: [
        // Core subjects
        { name: 'English', code: 'ENG', category: 'language', isCompulsory: true },
        { name: 'Kiswahili', code: 'KIS', category: 'language', isCompulsory: true },
        { name: 'Mathematics', code: 'MATH', category: 'core', isCompulsory: true },
        // STEM Track
        { name: 'Physics', code: 'PHY', category: 'science', isCompulsory: false },
        { name: 'Chemistry', code: 'CHEM', category: 'science', isCompulsory: false },
        { name: 'Biology', code: 'BIO', category: 'science', isCompulsory: false },
        { name: 'Computer Science', code: 'CS', category: 'technical', isCompulsory: false },
        // Arts & Social Sciences Track
        { name: 'History', code: 'HIST', category: 'humanities', isCompulsory: false },
        { name: 'Geography', code: 'GEO', category: 'humanities', isCompulsory: false },
        { name: 'Religious Education', code: 'RE', category: 'humanities', isCompulsory: false },
        { name: 'Economics', code: 'ECON', category: 'elective', isCompulsory: false },
        { name: 'Business Studies', code: 'BS', category: 'elective', isCompulsory: false },
        { name: 'Agriculture', code: 'AGR', category: 'elective', isCompulsory: false },
      ],
    },
  ],
};

// Kenya 8-4-4 Subjects
const kenya844Subjects: CurriculumSubjectConfig = {
  curriculumId: 'ke_844',
  curriculumName: 'Kenya 8-4-4',
  levels: [
    {
      levelId: 'primary',
      levelName: 'Primary (Class 1-8)',
      subjects: [
        { name: 'English', code: 'ENG', category: 'language', isCompulsory: true },
        { name: 'Kiswahili', code: 'KIS', category: 'language', isCompulsory: true },
        { name: 'Mathematics', code: 'MATH', category: 'core', isCompulsory: true },
        { name: 'Science', code: 'SCI', category: 'science', isCompulsory: true },
        { name: 'Social Studies', code: 'SST', category: 'humanities', isCompulsory: true },
        { name: 'Religious Education', code: 'RE', category: 'core', isCompulsory: true },
        { name: 'Creative Arts', code: 'ART', category: 'arts', isCompulsory: true },
        { name: 'Physical Education', code: 'PE', category: 'core', isCompulsory: true },
      ],
    },
    {
      levelId: 'secondary',
      levelName: 'Secondary (Form 1-4)',
      subjects: [
        { name: 'English', code: 'ENG', category: 'language', isCompulsory: true },
        { name: 'Kiswahili', code: 'KIS', category: 'language', isCompulsory: true },
        { name: 'Mathematics', code: 'MATH', category: 'core', isCompulsory: true },
        { name: 'Biology', code: 'BIO', category: 'science', isCompulsory: false },
        { name: 'Physics', code: 'PHY', category: 'science', isCompulsory: false },
        { name: 'Chemistry', code: 'CHEM', category: 'science', isCompulsory: false },
        { name: 'History', code: 'HIST', category: 'humanities', isCompulsory: false },
        { name: 'Geography', code: 'GEO', category: 'humanities', isCompulsory: false },
        { name: 'Religious Education', code: 'RE', category: 'humanities', isCompulsory: false },
        { name: 'Business Studies', code: 'BS', category: 'elective', isCompulsory: false },
        { name: 'Agriculture', code: 'AGR', category: 'elective', isCompulsory: false },
        { name: 'Computer Studies', code: 'CS', category: 'technical', isCompulsory: false },
        { name: 'Home Science', code: 'HS', category: 'elective', isCompulsory: false },
        { name: 'Art & Design', code: 'AD', category: 'arts', isCompulsory: false },
        { name: 'Music', code: 'MUS', category: 'arts', isCompulsory: false },
        { name: 'French', code: 'FRE', category: 'language', isCompulsory: false },
        { name: 'German', code: 'GER', category: 'language', isCompulsory: false },
        { name: 'Arabic', code: 'ARB', category: 'language', isCompulsory: false },
      ],
    },
  ],
};

// Uganda UCE Subjects
const ugandaUCESubjects: CurriculumSubjectConfig = {
  curriculumId: 'ug_uce',
  curriculumName: 'Uganda UCE',
  levels: [
    {
      levelId: 'primary',
      levelName: 'Primary (P1-P7)',
      subjects: [
        { name: 'English', code: 'ENG', category: 'language', isCompulsory: true },
        { name: 'Mathematics', code: 'MATH', category: 'core', isCompulsory: true },
        { name: 'Science', code: 'SCI', category: 'science', isCompulsory: true },
        { name: 'Social Studies', code: 'SST', category: 'humanities', isCompulsory: true },
        { name: 'Luganda', code: 'LUG', category: 'language', isCompulsory: true },
        { name: 'Religious Education', code: 'RE', category: 'core', isCompulsory: true },
        { name: 'Physical Education', code: 'PE', category: 'core', isCompulsory: false },
        { name: 'Music, Dance & Drama', code: 'MDD', category: 'arts', isCompulsory: false },
      ],
    },
    {
      levelId: 'o_level',
      levelName: 'O-Level (S1-S4)',
      subjects: [
        { name: 'English Language', code: 'ENG', category: 'language', isCompulsory: true },
        { name: 'Mathematics', code: 'MATH', category: 'core', isCompulsory: true },
        { name: 'Physics', code: 'PHY', category: 'science', isCompulsory: false },
        { name: 'Chemistry', code: 'CHEM', category: 'science', isCompulsory: false },
        { name: 'Biology', code: 'BIO', category: 'science', isCompulsory: false },
        { name: 'History', code: 'HIST', category: 'humanities', isCompulsory: false },
        { name: 'Geography', code: 'GEO', category: 'humanities', isCompulsory: false },
        { name: 'Commerce', code: 'COM', category: 'elective', isCompulsory: false },
        { name: 'Religious Education', code: 'RE', category: 'humanities', isCompulsory: false },
        { name: 'Agriculture', code: 'AGR', category: 'elective', isCompulsory: false },
        { name: 'Computer Studies', code: 'CS', category: 'technical', isCompulsory: false },
        { name: 'Literature in English', code: 'LIT', category: 'language', isCompulsory: false },
        { name: 'Fine Art', code: 'FA', category: 'arts', isCompulsory: false },
        { name: 'French', code: 'FRE', category: 'language', isCompulsory: false },
      ],
    },
  ],
};

// Tanzania CSEE Subjects
const tanzaniaCSEESubjects: CurriculumSubjectConfig = {
  curriculumId: 'tz_csee',
  curriculumName: 'Tanzania CSEE',
  levels: [
    {
      levelId: 'primary',
      levelName: 'Primary (Std 1-7)',
      subjects: [
        { name: 'Kiswahili', code: 'KIS', category: 'language', isCompulsory: true },
        { name: 'English', code: 'ENG', category: 'language', isCompulsory: true },
        { name: 'Mathematics', code: 'MATH', category: 'core', isCompulsory: true },
        { name: 'Science', code: 'SCI', category: 'science', isCompulsory: true },
        { name: 'Social Studies', code: 'SST', category: 'humanities', isCompulsory: true },
        { name: 'Vocational Skills', code: 'VS', category: 'technical', isCompulsory: true },
        { name: 'Personality & Sports', code: 'PS', category: 'core', isCompulsory: true },
      ],
    },
    {
      levelId: 'o_level',
      levelName: 'O-Level (Form 1-4)',
      subjects: [
        { name: 'Civics', code: 'CIV', category: 'humanities', isCompulsory: true },
        { name: 'History', code: 'HIST', category: 'humanities', isCompulsory: true },
        { name: 'Geography', code: 'GEO', category: 'humanities', isCompulsory: true },
        { name: 'Kiswahili', code: 'KIS', category: 'language', isCompulsory: true },
        { name: 'English', code: 'ENG', category: 'language', isCompulsory: true },
        { name: 'Physics', code: 'PHY', category: 'science', isCompulsory: false },
        { name: 'Chemistry', code: 'CHEM', category: 'science', isCompulsory: false },
        { name: 'Biology', code: 'BIO', category: 'science', isCompulsory: false },
        { name: 'Basic Mathematics', code: 'BMATH', category: 'core', isCompulsory: true },
        { name: 'Additional Mathematics', code: 'AMATH', category: 'core', isCompulsory: false },
        { name: 'Commerce', code: 'COM', category: 'elective', isCompulsory: false },
        { name: 'Book-Keeping', code: 'BK', category: 'elective', isCompulsory: false },
        { name: 'Information & Computer Studies', code: 'ICS', category: 'technical', isCompulsory: false },
      ],
    },
  ],
};

// Nigeria WAEC Subjects
const nigeriaWAECSubjects: CurriculumSubjectConfig = {
  curriculumId: 'ng_waec',
  curriculumName: 'Nigeria WAEC',
  levels: [
    {
      levelId: 'jss',
      levelName: 'Junior Secondary (JSS 1-3)',
      subjects: [
        { name: 'English Language', code: 'ENG', category: 'language', isCompulsory: true },
        { name: 'Mathematics', code: 'MATH', category: 'core', isCompulsory: true },
        { name: 'Basic Science', code: 'BSCI', category: 'science', isCompulsory: true },
        { name: 'Social Studies', code: 'SST', category: 'humanities', isCompulsory: true },
        { name: 'Civic Education', code: 'CIV', category: 'humanities', isCompulsory: true },
        { name: 'Computer Studies', code: 'CS', category: 'technical', isCompulsory: true },
        { name: 'Basic Technology', code: 'BT', category: 'technical', isCompulsory: true },
        { name: 'Agricultural Science', code: 'AGR', category: 'elective', isCompulsory: false },
        { name: 'Home Economics', code: 'HE', category: 'elective', isCompulsory: false },
        { name: 'Physical & Health Education', code: 'PHE', category: 'core', isCompulsory: true },
        { name: 'Religious Studies', code: 'RS', category: 'humanities', isCompulsory: false },
        { name: 'French', code: 'FRE', category: 'language', isCompulsory: false },
        { name: 'Nigerian Language', code: 'NL', category: 'language', isCompulsory: false },
      ],
    },
    {
      levelId: 'sss',
      levelName: 'Senior Secondary (SSS 1-3)',
      subjects: [
        { name: 'English Language', code: 'ENG', category: 'language', isCompulsory: true },
        { name: 'Mathematics', code: 'MATH', category: 'core', isCompulsory: true },
        { name: 'Physics', code: 'PHY', category: 'science', isCompulsory: false },
        { name: 'Chemistry', code: 'CHEM', category: 'science', isCompulsory: false },
        { name: 'Biology', code: 'BIO', category: 'science', isCompulsory: false },
        { name: 'Further Mathematics', code: 'FM', category: 'core', isCompulsory: false },
        { name: 'Economics', code: 'ECON', category: 'elective', isCompulsory: false },
        { name: 'Government', code: 'GOV', category: 'humanities', isCompulsory: false },
        { name: 'Commerce', code: 'COM', category: 'elective', isCompulsory: false },
        { name: 'Accounting', code: 'ACC', category: 'elective', isCompulsory: false },
        { name: 'Literature in English', code: 'LIT', category: 'language', isCompulsory: false },
        { name: 'Geography', code: 'GEO', category: 'humanities', isCompulsory: false },
        { name: 'Civic Education', code: 'CIV', category: 'humanities', isCompulsory: true },
        { name: 'Computer Science', code: 'CS', category: 'technical', isCompulsory: false },
        { name: 'Agricultural Science', code: 'AGR', category: 'elective', isCompulsory: false },
      ],
    },
  ],
};

// Ghana BECE Subjects
const ghanaBECESubjects: CurriculumSubjectConfig = {
  curriculumId: 'gh_bece',
  curriculumName: 'Ghana BECE',
  levels: [
    {
      levelId: 'primary',
      levelName: 'Primary (P1-P6)',
      subjects: [
        { name: 'English Language', code: 'ENG', category: 'language', isCompulsory: true },
        { name: 'Mathematics', code: 'MATH', category: 'core', isCompulsory: true },
        { name: 'Science', code: 'SCI', category: 'science', isCompulsory: true },
        { name: 'Our World Our People', code: 'OWOP', category: 'humanities', isCompulsory: true },
        { name: 'Ghanaian Language', code: 'GL', category: 'language', isCompulsory: true },
        { name: 'Religious & Moral Education', code: 'RME', category: 'core', isCompulsory: true },
        { name: 'Creative Arts', code: 'CA', category: 'arts', isCompulsory: true },
        { name: 'Physical Education', code: 'PE', category: 'core', isCompulsory: true },
        { name: 'Computing', code: 'ICT', category: 'technical', isCompulsory: true },
      ],
    },
    {
      levelId: 'jhs',
      levelName: 'Junior High School (JHS 1-3)',
      subjects: [
        { name: 'English Language', code: 'ENG', category: 'language', isCompulsory: true },
        { name: 'Mathematics', code: 'MATH', category: 'core', isCompulsory: true },
        { name: 'Integrated Science', code: 'ISCI', category: 'science', isCompulsory: true },
        { name: 'Social Studies', code: 'SST', category: 'humanities', isCompulsory: true },
        { name: 'Ghanaian Language', code: 'GL', category: 'language', isCompulsory: true },
        { name: 'Religious & Moral Education', code: 'RME', category: 'core', isCompulsory: true },
        { name: 'Creative Arts & Design', code: 'CAD', category: 'arts', isCompulsory: true },
        { name: 'Career Technology', code: 'CT', category: 'technical', isCompulsory: true },
        { name: 'Computing', code: 'ICT', category: 'technical', isCompulsory: true },
        { name: 'French', code: 'FRE', category: 'language', isCompulsory: false },
      ],
    },
    {
      levelId: 'shs',
      levelName: 'Senior High School (SHS 1-3)',
      subjects: [
        { name: 'English Language', code: 'ENG', category: 'language', isCompulsory: true },
        { name: 'Core Mathematics', code: 'CMATH', category: 'core', isCompulsory: true },
        { name: 'Integrated Science', code: 'ISCI', category: 'science', isCompulsory: true },
        { name: 'Social Studies', code: 'SST', category: 'humanities', isCompulsory: true },
        { name: 'Elective Mathematics', code: 'EMATH', category: 'core', isCompulsory: false },
        { name: 'Physics', code: 'PHY', category: 'science', isCompulsory: false },
        { name: 'Chemistry', code: 'CHEM', category: 'science', isCompulsory: false },
        { name: 'Biology', code: 'BIO', category: 'science', isCompulsory: false },
        { name: 'Economics', code: 'ECON', category: 'elective', isCompulsory: false },
        { name: 'Geography', code: 'GEO', category: 'humanities', isCompulsory: false },
        { name: 'Government', code: 'GOV', category: 'humanities', isCompulsory: false },
        { name: 'History', code: 'HIST', category: 'humanities', isCompulsory: false },
        { name: 'Literature in English', code: 'LIT', category: 'language', isCompulsory: false },
        { name: 'Business Management', code: 'BM', category: 'elective', isCompulsory: false },
        { name: 'Accounting', code: 'ACC', category: 'elective', isCompulsory: false },
        { name: 'French', code: 'FRE', category: 'language', isCompulsory: false },
      ],
    },
  ],
};

// South Africa CAPS Subjects
const southAfricaCAPSSubjects: CurriculumSubjectConfig = {
  curriculumId: 'za_caps',
  curriculumName: 'South Africa CAPS',
  levels: [
    {
      levelId: 'foundation',
      levelName: 'Foundation Phase (Grade R-3)',
      subjects: [
        { name: 'Home Language', code: 'HL', category: 'language', isCompulsory: true },
        { name: 'First Additional Language', code: 'FAL', category: 'language', isCompulsory: true },
        { name: 'Mathematics', code: 'MATH', category: 'core', isCompulsory: true },
        { name: 'Life Skills', code: 'LS', category: 'core', isCompulsory: true },
      ],
    },
    {
      levelId: 'intermediate',
      levelName: 'Intermediate Phase (Grade 4-6)',
      subjects: [
        { name: 'Home Language', code: 'HL', category: 'language', isCompulsory: true },
        { name: 'First Additional Language', code: 'FAL', category: 'language', isCompulsory: true },
        { name: 'Mathematics', code: 'MATH', category: 'core', isCompulsory: true },
        { name: 'Natural Sciences & Technology', code: 'NST', category: 'science', isCompulsory: true },
        { name: 'Social Sciences', code: 'SS', category: 'humanities', isCompulsory: true },
        { name: 'Life Skills', code: 'LS', category: 'core', isCompulsory: true },
      ],
    },
    {
      levelId: 'senior',
      levelName: 'Senior Phase (Grade 7-9)',
      subjects: [
        { name: 'Home Language', code: 'HL', category: 'language', isCompulsory: true },
        { name: 'First Additional Language', code: 'FAL', category: 'language', isCompulsory: true },
        { name: 'Mathematics', code: 'MATH', category: 'core', isCompulsory: true },
        { name: 'Natural Sciences', code: 'NS', category: 'science', isCompulsory: true },
        { name: 'Social Sciences', code: 'SS', category: 'humanities', isCompulsory: true },
        { name: 'Technology', code: 'TECH', category: 'technical', isCompulsory: true },
        { name: 'Economic & Management Sciences', code: 'EMS', category: 'elective', isCompulsory: true },
        { name: 'Life Orientation', code: 'LO', category: 'core', isCompulsory: true },
        { name: 'Creative Arts', code: 'CA', category: 'arts', isCompulsory: true },
      ],
    },
    {
      levelId: 'fet',
      levelName: 'FET Phase (Grade 10-12)',
      subjects: [
        { name: 'Home Language', code: 'HL', category: 'language', isCompulsory: true },
        { name: 'First Additional Language', code: 'FAL', category: 'language', isCompulsory: true },
        { name: 'Mathematics', code: 'MATH', category: 'core', isCompulsory: false },
        { name: 'Mathematical Literacy', code: 'ML', category: 'core', isCompulsory: false },
        { name: 'Life Orientation', code: 'LO', category: 'core', isCompulsory: true },
        { name: 'Physical Sciences', code: 'PS', category: 'science', isCompulsory: false },
        { name: 'Life Sciences', code: 'LS', category: 'science', isCompulsory: false },
        { name: 'Geography', code: 'GEO', category: 'humanities', isCompulsory: false },
        { name: 'History', code: 'HIST', category: 'humanities', isCompulsory: false },
        { name: 'Accounting', code: 'ACC', category: 'elective', isCompulsory: false },
        { name: 'Business Studies', code: 'BS', category: 'elective', isCompulsory: false },
        { name: 'Economics', code: 'ECON', category: 'elective', isCompulsory: false },
        { name: 'Information Technology', code: 'IT', category: 'technical', isCompulsory: false },
        { name: 'Computer Applications Technology', code: 'CAT', category: 'technical', isCompulsory: false },
      ],
    },
  ],
};

// IGCSE Subjects
const igcseSubjects: CurriculumSubjectConfig = {
  curriculumId: 'igcse',
  curriculumName: 'Cambridge IGCSE',
  levels: [
    {
      levelId: 'primary',
      levelName: 'Cambridge Primary (Age 5-11)',
      subjects: [
        { name: 'English', code: 'ENG', category: 'language', isCompulsory: true },
        { name: 'Mathematics', code: 'MATH', category: 'core', isCompulsory: true },
        { name: 'Science', code: 'SCI', category: 'science', isCompulsory: true },
        { name: 'Global Perspectives', code: 'GP', category: 'humanities', isCompulsory: false },
        { name: 'Computing', code: 'ICT', category: 'technical', isCompulsory: false },
        { name: 'Music', code: 'MUS', category: 'arts', isCompulsory: false },
        { name: 'Art & Design', code: 'AD', category: 'arts', isCompulsory: false },
        { name: 'Physical Education', code: 'PE', category: 'core', isCompulsory: false },
      ],
    },
    {
      levelId: 'lower_secondary',
      levelName: 'Cambridge Lower Secondary (Age 11-14)',
      subjects: [
        { name: 'English', code: 'ENG', category: 'language', isCompulsory: true },
        { name: 'Mathematics', code: 'MATH', category: 'core', isCompulsory: true },
        { name: 'Science', code: 'SCI', category: 'science', isCompulsory: true },
        { name: 'Global Perspectives', code: 'GP', category: 'humanities', isCompulsory: false },
        { name: 'Computing', code: 'ICT', category: 'technical', isCompulsory: false },
        { name: 'Additional Languages', code: 'AL', category: 'language', isCompulsory: false },
      ],
    },
    {
      levelId: 'igcse',
      levelName: 'IGCSE (Age 14-16)',
      subjects: [
        { name: 'English Language', code: 'ENG', category: 'language', isCompulsory: true },
        { name: 'Mathematics', code: 'MATH', category: 'core', isCompulsory: true },
        { name: 'Co-ordinated Sciences', code: 'CSCI', category: 'science', isCompulsory: false },
        { name: 'Physics', code: 'PHY', category: 'science', isCompulsory: false },
        { name: 'Chemistry', code: 'CHEM', category: 'science', isCompulsory: false },
        { name: 'Biology', code: 'BIO', category: 'science', isCompulsory: false },
        { name: 'History', code: 'HIST', category: 'humanities', isCompulsory: false },
        { name: 'Geography', code: 'GEO', category: 'humanities', isCompulsory: false },
        { name: 'Economics', code: 'ECON', category: 'elective', isCompulsory: false },
        { name: 'Business Studies', code: 'BS', category: 'elective', isCompulsory: false },
        { name: 'Accounting', code: 'ACC', category: 'elective', isCompulsory: false },
        { name: 'Computer Science', code: 'CS', category: 'technical', isCompulsory: false },
        { name: 'Information & Communication Technology', code: 'ICT', category: 'technical', isCompulsory: false },
        { name: 'French', code: 'FRE', category: 'language', isCompulsory: false },
        { name: 'Spanish', code: 'SPA', category: 'language', isCompulsory: false },
        { name: 'German', code: 'GER', category: 'language', isCompulsory: false },
        { name: 'Art & Design', code: 'AD', category: 'arts', isCompulsory: false },
        { name: 'Music', code: 'MUS', category: 'arts', isCompulsory: false },
        { name: 'Physical Education', code: 'PE', category: 'core', isCompulsory: false },
        { name: 'English Literature', code: 'ELIT', category: 'language', isCompulsory: false },
        { name: 'Global Perspectives', code: 'GP', category: 'humanities', isCompulsory: false },
      ],
    },
  ],
};

// IB PYP (Primary Years Programme) Subjects
const ibPYPSubjects: CurriculumSubjectConfig = {
  curriculumId: 'ib_pyp',
  curriculumName: 'IB Primary Years Programme',
  levels: [
    {
      levelId: 'pyp',
      levelName: 'Primary Years Programme (Age 3-12)',
      subjects: [
        { name: 'Language', code: 'LANG', category: 'language', isCompulsory: true },
        { name: 'Mathematics', code: 'MATH', category: 'core', isCompulsory: true },
        { name: 'Science', code: 'SCI', category: 'science', isCompulsory: true },
        { name: 'Social Studies', code: 'SST', category: 'humanities', isCompulsory: true },
        { name: 'Personal, Social & Physical Education', code: 'PSPE', category: 'core', isCompulsory: true },
        { name: 'Arts', code: 'ART', category: 'arts', isCompulsory: true },
      ],
    },
    {
      levelId: 'myp',
      levelName: 'Middle Years Programme (Age 11-16)',
      subjects: [
        { name: 'Language & Literature', code: 'LL', category: 'language', isCompulsory: true },
        { name: 'Language Acquisition', code: 'LA', category: 'language', isCompulsory: true },
        { name: 'Individuals & Societies', code: 'IS', category: 'humanities', isCompulsory: true },
        { name: 'Sciences', code: 'SCI', category: 'science', isCompulsory: true },
        { name: 'Mathematics', code: 'MATH', category: 'core', isCompulsory: true },
        { name: 'Arts', code: 'ART', category: 'arts', isCompulsory: true },
        { name: 'Physical & Health Education', code: 'PHE', category: 'core', isCompulsory: true },
        { name: 'Design', code: 'DES', category: 'technical', isCompulsory: true },
      ],
    },
    {
      levelId: 'dp',
      levelName: 'Diploma Programme (Age 16-19)',
      subjects: [
        // Group 1: Studies in Language & Literature
        { name: 'English A: Literature', code: 'ELIT', category: 'language', isCompulsory: false },
        { name: 'English A: Language & Literature', code: 'ELL', category: 'language', isCompulsory: false },
        // Group 2: Language Acquisition
        { name: 'French B', code: 'FRB', category: 'language', isCompulsory: false },
        { name: 'Spanish B', code: 'SPB', category: 'language', isCompulsory: false },
        { name: 'French Ab Initio', code: 'FRAI', category: 'language', isCompulsory: false },
        // Group 3: Individuals & Societies
        { name: 'History', code: 'HIST', category: 'humanities', isCompulsory: false },
        { name: 'Geography', code: 'GEO', category: 'humanities', isCompulsory: false },
        { name: 'Economics', code: 'ECON', category: 'elective', isCompulsory: false },
        { name: 'Business Management', code: 'BM', category: 'elective', isCompulsory: false },
        { name: 'Psychology', code: 'PSY', category: 'humanities', isCompulsory: false },
        // Group 4: Sciences
        { name: 'Physics', code: 'PHY', category: 'science', isCompulsory: false },
        { name: 'Chemistry', code: 'CHEM', category: 'science', isCompulsory: false },
        { name: 'Biology', code: 'BIO', category: 'science', isCompulsory: false },
        { name: 'Computer Science', code: 'CS', category: 'science', isCompulsory: false },
        { name: 'Environmental Systems & Societies', code: 'ESS', category: 'science', isCompulsory: false },
        // Group 5: Mathematics
        { name: 'Mathematics: Analysis & Approaches', code: 'MAA', category: 'core', isCompulsory: false },
        { name: 'Mathematics: Applications & Interpretation', code: 'MAI', category: 'core', isCompulsory: false },
        // Group 6: The Arts
        { name: 'Visual Arts', code: 'VA', category: 'arts', isCompulsory: false },
        { name: 'Music', code: 'MUS', category: 'arts', isCompulsory: false },
        { name: 'Theatre', code: 'THE', category: 'arts', isCompulsory: false },
        { name: 'Film', code: 'FLM', category: 'arts', isCompulsory: false },
        // Core
        { name: 'Theory of Knowledge', code: 'TOK', category: 'core', isCompulsory: true },
      ],
    },
  ],
};

// American Curriculum Subjects
const americanSubjects: CurriculumSubjectConfig = {
  curriculumId: 'american',
  curriculumName: 'American Curriculum',
  levels: [
    {
      levelId: 'elementary',
      levelName: 'Elementary School (K-5)',
      subjects: [
        { name: 'English Language Arts', code: 'ELA', category: 'language', isCompulsory: true },
        { name: 'Mathematics', code: 'MATH', category: 'core', isCompulsory: true },
        { name: 'Science', code: 'SCI', category: 'science', isCompulsory: true },
        { name: 'Social Studies', code: 'SST', category: 'humanities', isCompulsory: true },
        { name: 'Physical Education', code: 'PE', category: 'core', isCompulsory: true },
        { name: 'Art', code: 'ART', category: 'arts', isCompulsory: false },
        { name: 'Music', code: 'MUS', category: 'arts', isCompulsory: false },
        { name: 'Technology', code: 'TECH', category: 'technical', isCompulsory: false },
      ],
    },
    {
      levelId: 'middle',
      levelName: 'Middle School (6-8)',
      subjects: [
        { name: 'English Language Arts', code: 'ELA', category: 'language', isCompulsory: true },
        { name: 'Mathematics', code: 'MATH', category: 'core', isCompulsory: true },
        { name: 'Science', code: 'SCI', category: 'science', isCompulsory: true },
        { name: 'Social Studies', code: 'SST', category: 'humanities', isCompulsory: true },
        { name: 'Physical Education', code: 'PE', category: 'core', isCompulsory: true },
        { name: 'World Languages', code: 'WL', category: 'language', isCompulsory: false },
        { name: 'Art', code: 'ART', category: 'arts', isCompulsory: false },
        { name: 'Music', code: 'MUS', category: 'arts', isCompulsory: false },
        { name: 'Computer Science', code: 'CS', category: 'technical', isCompulsory: false },
        { name: 'Health', code: 'HLT', category: 'core', isCompulsory: false },
      ],
    },
    {
      levelId: 'high',
      levelName: 'High School (9-12)',
      subjects: [
        { name: 'English', code: 'ENG', category: 'language', isCompulsory: true },
        { name: 'Mathematics', code: 'MATH', category: 'core', isCompulsory: true },
        { name: 'Biology', code: 'BIO', category: 'science', isCompulsory: false },
        { name: 'Chemistry', code: 'CHEM', category: 'science', isCompulsory: false },
        { name: 'Physics', code: 'PHY', category: 'science', isCompulsory: false },
        { name: 'Environmental Science', code: 'ESCI', category: 'science', isCompulsory: false },
        { name: 'US History', code: 'USHI', category: 'humanities', isCompulsory: true },
        { name: 'World History', code: 'WHI', category: 'humanities', isCompulsory: false },
        { name: 'US Government', code: 'GOV', category: 'humanities', isCompulsory: true },
        { name: 'Economics', code: 'ECON', category: 'elective', isCompulsory: false },
        { name: 'Spanish', code: 'SPA', category: 'language', isCompulsory: false },
        { name: 'French', code: 'FRE', category: 'language', isCompulsory: false },
        { name: 'Art', code: 'ART', category: 'arts', isCompulsory: false },
        { name: 'Music', code: 'MUS', category: 'arts', isCompulsory: false },
        { name: 'Physical Education', code: 'PE', category: 'core', isCompulsory: true },
        { name: 'AP English Literature', code: 'APEL', category: 'language', isCompulsory: false },
        { name: 'AP Calculus', code: 'APCAL', category: 'core', isCompulsory: false },
        { name: 'AP Physics', code: 'APHY', category: 'science', isCompulsory: false },
        { name: 'AP Chemistry', code: 'APCHEM', category: 'science', isCompulsory: false },
        { name: 'AP Biology', code: 'APBIO', category: 'science', isCompulsory: false },
        { name: 'Computer Science', code: 'CS', category: 'technical', isCompulsory: false },
      ],
    },
  ],
};

// IB MYP (Middle Years Programme) Subjects
const ibMYPSubjects: CurriculumSubjectConfig = {
  curriculumId: 'ib_myp',
  curriculumName: 'IB Middle Years Programme',
  levels: [
    {
      levelId: 'myp',
      levelName: 'Middle Years Programme (Age 11-16)',
      subjects: [
        { name: 'Language & Literature', code: 'LL', category: 'language', isCompulsory: true },
        { name: 'Language Acquisition', code: 'LA', category: 'language', isCompulsory: true },
        { name: 'Individuals & Societies', code: 'IS', category: 'humanities', isCompulsory: true },
        { name: 'Sciences', code: 'SCI', category: 'science', isCompulsory: true },
        { name: 'Mathematics', code: 'MATH', category: 'core', isCompulsory: true },
        { name: 'Arts', code: 'ART', category: 'arts', isCompulsory: true },
        { name: 'Physical & Health Education', code: 'PHE', category: 'core', isCompulsory: true },
        { name: 'Design', code: 'DES', category: 'technical', isCompulsory: true },
      ],
    },
  ],
};

// IB DP (Diploma Programme) Subjects
const ibDPSubjects: CurriculumSubjectConfig = {
  curriculumId: 'ib_dp',
  curriculumName: 'IB Diploma Programme',
  levels: [
    {
      levelId: 'dp',
      levelName: 'Diploma Programme (Age 16-19)',
      subjects: [
        // Group 1: Studies in Language & Literature
        { name: 'English A: Literature', code: 'ELIT', category: 'language', isCompulsory: false },
        { name: 'English A: Language & Literature', code: 'ELL', category: 'language', isCompulsory: false },
        // Group 2: Language Acquisition
        { name: 'French B', code: 'FRB', category: 'language', isCompulsory: false },
        { name: 'Spanish B', code: 'SPB', category: 'language', isCompulsory: false },
        { name: 'French Ab Initio', code: 'FRAI', category: 'language', isCompulsory: false },
        // Group 3: Individuals & Societies
        { name: 'History', code: 'HIST', category: 'humanities', isCompulsory: false },
        { name: 'Geography', code: 'GEO', category: 'humanities', isCompulsory: false },
        { name: 'Economics', code: 'ECON', category: 'elective', isCompulsory: false },
        { name: 'Business Management', code: 'BM', category: 'elective', isCompulsory: false },
        { name: 'Psychology', code: 'PSY', category: 'humanities', isCompulsory: false },
        // Group 4: Sciences
        { name: 'Physics', code: 'PHY', category: 'science', isCompulsory: false },
        { name: 'Chemistry', code: 'CHEM', category: 'science', isCompulsory: false },
        { name: 'Biology', code: 'BIO', category: 'science', isCompulsory: false },
        { name: 'Computer Science', code: 'CS', category: 'science', isCompulsory: false },
        { name: 'Environmental Systems & Societies', code: 'ESS', category: 'science', isCompulsory: false },
        // Group 5: Mathematics
        { name: 'Mathematics: Analysis & Approaches', code: 'MAA', category: 'core', isCompulsory: false },
        { name: 'Mathematics: Applications & Interpretation', code: 'MAI', category: 'core', isCompulsory: false },
        // Group 6: The Arts
        { name: 'Visual Arts', code: 'VA', category: 'arts', isCompulsory: false },
        { name: 'Music', code: 'MUS', category: 'arts', isCompulsory: false },
        { name: 'Theatre', code: 'THE', category: 'arts', isCompulsory: false },
        { name: 'Film', code: 'FLM', category: 'arts', isCompulsory: false },
        // Core
        { name: 'Theory of Knowledge', code: 'TOK', category: 'core', isCompulsory: true },
      ],
    },
  ],
};

// All curriculum subject configurations - partial Record for supported curricula
export const curriculumSubjectConfigs: Partial<Record<CurriculumId, CurriculumSubjectConfig>> = {
  ke_cbc: kenyaCBCSubjects,
  ke_844: kenya844Subjects,
  ug_uce: ugandaUCESubjects,
  tz_csee: tanzaniaCSEESubjects,
  ng_waec: nigeriaWAECSubjects,
  gh_bece: ghanaBECESubjects,
  za_caps: southAfricaCAPSSubjects,
  igcse: igcseSubjects,
  ib_pyp: ibPYPSubjects,
  ib_myp: ibMYPSubjects,
  ib_dp: ibDPSubjects,
  american: americanSubjects,
};

// Helper functions
export function getCurriculumSubjectConfig(curriculumId: CurriculumId): CurriculumSubjectConfig | null {
  return curriculumSubjectConfigs[curriculumId] || null;
}

export function getSubjectsForCurriculumLevel(
  curriculumId: CurriculumId,
  levelId?: string
): CurriculumSubject[] {
  const config = curriculumSubjectConfigs[curriculumId];
  if (!config) return [];

  if (levelId) {
    const level = config.levels.find((l) => l.levelId === levelId);
    return level?.subjects || [];
  }

  // If no level specified, return all unique subjects across all levels
  const allSubjects = config.levels.flatMap((l) => l.subjects);
  const uniqueSubjects = allSubjects.reduce((acc, subject) => {
    if (!acc.find((s) => s.code === subject.code)) {
      acc.push(subject);
    }
    return acc;
  }, [] as CurriculumSubject[]);

  return uniqueSubjects;
}

export function getCurriculumLevels(curriculumId: CurriculumId): CurriculumLevelSubjects[] {
  const config = curriculumSubjectConfigs[curriculumId];
  return config?.levels || [];
}

export function getCompulsorySubjects(
  curriculumId: CurriculumId,
  levelId?: string
): CurriculumSubject[] {
  return getSubjectsForCurriculumLevel(curriculumId, levelId).filter((s) => s.isCompulsory);
}

export function getElectiveSubjects(
  curriculumId: CurriculumId,
  levelId?: string
): CurriculumSubject[] {
  return getSubjectsForCurriculumLevel(curriculumId, levelId).filter((s) => !s.isCompulsory);
}

export function getCategoryLabel(category: CurriculumSubject['category']): string {
  const labels: Record<CurriculumSubject['category'], string> = {
    core: 'Core',
    elective: 'Elective',
    science: 'Science',
    humanities: 'Humanities',
    technical: 'Technical',
    language: 'Language',
    arts: 'Arts',
  };
  return labels[category];
}

export function getCategoryColor(category: CurriculumSubject['category']): string {
  const colors: Record<CurriculumSubject['category'], string> = {
    core: 'bg-primary/10 text-primary border-primary/20',
    elective: 'bg-secondary/50 text-secondary-foreground border-secondary/30',
    science: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    humanities: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    technical: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    language: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
    arts: 'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20',
  };
  return colors[category];
}

// Map institution type to most appropriate curriculum level
export function getDefaultLevelForInstitutionType(
  curriculumId: CurriculumId,
  institutionType: string
): string | undefined {
  const config = curriculumSubjectConfigs[curriculumId];
  if (!config || config.levels.length === 0) return undefined;

  const typeMapping: Record<string, string[]> = {
    pre_primary: ['pre_primary', 'foundation', 'pyp', 'elementary'],
    primary: ['upper_primary', 'lower_primary', 'primary', 'ks2', 'elementary', 'intermediate'],
    secondary: ['secondary', 'o_level', 'jhs', 'shs', 'igcse', 'ks4', 'high', 'myp', 'dp'],
    junior_secondary: ['junior_secondary', 'jss', 'jhs', 'lower_secondary', 'ks3', 'middle', 'myp'],
    senior_secondary: ['senior_secondary', 'sss', 'shs', 'igcse', 'ks4', 'high', 'dp', 'fet'],
    college: ['dp', 'high'],
  };

  const preferredLevels = typeMapping[institutionType] || [];
  
  for (const preferred of preferredLevels) {
    const match = config.levels.find((l) => l.levelId.includes(preferred));
    if (match) return match.levelId;
  }

  // Fallback to first level
  return config.levels[0].levelId;
}
