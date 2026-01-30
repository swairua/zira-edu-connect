// Kenya Competency-Based Curriculum (CBC) Types
// Based on KICD curriculum structure

export type CBCCompetency = 
  | 'communication'
  | 'critical_thinking'
  | 'creativity'
  | 'citizenship'
  | 'digital_literacy'
  | 'learning_to_learn'
  | 'self_efficacy';

export type CBCValue = 
  | 'love'
  | 'responsibility'
  | 'respect'
  | 'unity'
  | 'peace'
  | 'patriotism'
  | 'social_justice'
  | 'integrity';

export type CBCLevel = 
  | 'pp1'
  | 'pp2'
  | 'grade_1'
  | 'grade_2'
  | 'grade_3'
  | 'grade_4'
  | 'grade_5'
  | 'grade_6'
  | 'grade_7'
  | 'grade_8'
  | 'grade_9'
  | 'grade_10'
  | 'grade_11'
  | 'grade_12';

export type CBCRubricLevel = 'EE' | 'ME' | 'AE' | 'BE';
export type CBCDetailedRubricLevel = 'EE1' | 'EE2' | 'ME1' | 'ME2' | 'AE1' | 'AE2' | 'BE1' | 'BE2';

export interface CBCStrand {
  id: string;
  subject_code: string;
  level: CBCLevel;
  strand_number: number;
  name: string;
  description: string | null;
  suggested_time_allocation: string | null;
  created_at: string;
  updated_at: string;
}

export interface CBCSubStrand {
  id: string;
  strand_id: string;
  sub_strand_number: number;
  name: string;
  specific_learning_outcomes: string[];
  key_inquiry_questions: string[];
  learning_experiences: string[];
  core_competencies: CBCCompetency[];
  values: CBCValue[];
  pertinent_contemporary_issues: string[] | null;
  suggested_resources: Record<string, unknown>[];
  assessment_rubrics: Record<string, unknown>;
  suggested_lesson_count: number | null;
  created_at: string;
  updated_at: string;
  // Joined data
  strand?: CBCStrand;
}

export interface StudentStrandAssessment {
  id: string;
  student_id: string;
  sub_strand_id: string;
  institution_id: string;
  academic_year_id: string | null;
  term_id: string | null;
  exam_id: string | null;
  rubric_level: string;
  score_percentage: number | null;
  teacher_remarks: string | null;
  assessed_at: string;
  assessed_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  sub_strand?: CBCSubStrand;
  student?: { first_name: string; last_name: string; admission_number: string };
}

// Display helpers
export const cbcLevelLabels: Record<CBCLevel, string> = {
  pp1: 'Pre-Primary 1',
  pp2: 'Pre-Primary 2',
  grade_1: 'Grade 1',
  grade_2: 'Grade 2',
  grade_3: 'Grade 3',
  grade_4: 'Grade 4',
  grade_5: 'Grade 5',
  grade_6: 'Grade 6',
  grade_7: 'Grade 7',
  grade_8: 'Grade 8',
  grade_9: 'Grade 9',
  grade_10: 'Grade 10',
  grade_11: 'Grade 11',
  grade_12: 'Grade 12',
};

export const cbcCompetencyLabels: Record<CBCCompetency, string> = {
  communication: 'Communication and Collaboration',
  critical_thinking: 'Critical Thinking and Problem Solving',
  creativity: 'Creativity and Imagination',
  citizenship: 'Citizenship',
  digital_literacy: 'Digital Literacy',
  learning_to_learn: 'Learning to Learn',
  self_efficacy: 'Self-Efficacy',
};

export const cbcValueLabels: Record<CBCValue, string> = {
  love: 'Love',
  responsibility: 'Responsibility',
  respect: 'Respect',
  unity: 'Unity',
  peace: 'Peace',
  patriotism: 'Patriotism',
  social_justice: 'Social Justice',
  integrity: 'Integrity',
};

export const cbcRubricLabels: Record<string, { label: string; description: string; color: string }> = {
  EE: { label: 'Exceeds Expectations', description: 'Exceptional performance beyond grade level', color: 'green' },
  ME: { label: 'Meets Expectations', description: 'Solid understanding at grade level', color: 'blue' },
  AE: { label: 'Approaches Expectations', description: 'Developing understanding, needs support', color: 'yellow' },
  BE: { label: 'Below Expectations', description: 'Requires significant intervention', color: 'red' },
  EE1: { label: 'Exceeds Expectations (High)', description: 'Outstanding performance', color: 'green' },
  EE2: { label: 'Exceeds Expectations (Low)', description: 'Very good performance', color: 'green' },
  ME1: { label: 'Meets Expectations (High)', description: 'Good understanding', color: 'blue' },
  ME2: { label: 'Meets Expectations (Low)', description: 'Adequate understanding', color: 'blue' },
  AE1: { label: 'Approaches Expectations (High)', description: 'Developing well', color: 'yellow' },
  AE2: { label: 'Approaches Expectations (Low)', description: 'Needs more practice', color: 'yellow' },
  BE1: { label: 'Below Expectations (High)', description: 'Struggling, needs support', color: 'red' },
  BE2: { label: 'Below Expectations (Low)', description: 'Significant intervention needed', color: 'red' },
};

// Subject code mapping
export const subjectCodeLabels: Record<string, string> = {
  MATH: 'Mathematics',
  ENG: 'English',
  KIS: 'Kiswahili',
  SCI: 'Science',
  SST: 'Social Studies',
  CRE: 'Christian Religious Education',
  IRE: 'Islamic Religious Education',
  HRE: 'Hindu Religious Education',
  ART: 'Art and Craft',
  MUSIC: 'Music',
  PE: 'Physical Education',
  HE: 'Home Science',
  AGRI: 'Agriculture',
  BS: 'Business Studies',
  ICT: 'Computer Studies',
};

// Get CBC level from class name (e.g., "Grade 4" -> "grade_4")
export function classNameToCBCLevel(className: string): CBCLevel | null {
  const normalized = className.toLowerCase().trim();
  
  if (normalized.includes('pp1') || normalized.includes('pre-primary 1')) return 'pp1';
  if (normalized.includes('pp2') || normalized.includes('pre-primary 2')) return 'pp2';
  
  const gradeMatch = normalized.match(/grade\s*(\d+)/i);
  if (gradeMatch) {
    const gradeNum = parseInt(gradeMatch[1], 10);
    if (gradeNum >= 1 && gradeNum <= 12) {
      return `grade_${gradeNum}` as CBCLevel;
    }
  }
  
  return null;
}

// Get subject code from subject name
export function subjectNameToCode(subjectName: string): string {
  const normalized = subjectName.toLowerCase().trim();
  
  if (normalized.includes('math')) return 'MATH';
  if (normalized.includes('english')) return 'ENG';
  if (normalized.includes('kiswahili') || normalized.includes('swahili')) return 'KIS';
  if (normalized.includes('science') && !normalized.includes('social') && !normalized.includes('home')) return 'SCI';
  if (normalized.includes('social')) return 'SST';
  if (normalized.includes('christian') || normalized === 'cre') return 'CRE';
  if (normalized.includes('islamic') || normalized === 'ire') return 'IRE';
  if (normalized.includes('hindu') || normalized === 'hre') return 'HRE';
  if (normalized.includes('art')) return 'ART';
  if (normalized.includes('music')) return 'MUSIC';
  if (normalized.includes('physical') || normalized === 'pe') return 'PE';
  if (normalized.includes('home')) return 'HE';
  if (normalized.includes('agri')) return 'AGRI';
  if (normalized.includes('business')) return 'BS';
  if (normalized.includes('computer') || normalized.includes('ict')) return 'ICT';
  
  return subjectName.substring(0, 4).toUpperCase();
}
