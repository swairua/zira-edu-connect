// Comprehensive curriculum configuration for multi-country, multi-system education support

import { CountryCode } from './country-config';

export type CurriculumId =
  // Kenya
  | 'ke_cbc'
  | 'ke_844'
  // Uganda
  | 'ug_uce'
  | 'ug_uace'
  // Tanzania
  | 'tz_csee'
  | 'tz_acsee'
  // Rwanda
  | 'rw_cbc'
  // Nigeria
  | 'ng_waec'
  | 'ng_neco'
  // Ghana
  | 'gh_bece'
  | 'gh_wassce'
  // South Africa
  | 'za_caps'
  // International
  | 'igcse'
  | 'ib_pyp'
  | 'ib_myp'
  | 'ib_dp'
  | 'american';

export interface Grade {
  grade: string;
  minScore: number;
  maxScore: number;
  points?: number;
  description: string;
}

export interface GradingScale {
  id: string;
  name: string;
  type: 'rubric' | 'percentage' | 'points' | 'letter';
  grades: Grade[];
}

export interface CurriculumLevel {
  id: string;
  name: string;
  ageRange?: string;
  duration?: string;
  gradingScaleId: string;
}

export interface CurriculumConfig {
  id: CurriculumId;
  name: string;
  shortName: string;
  description: string;
  regulatoryBody: string;
  isInternational: boolean;
  supportedCountries: CountryCode[] | 'all';
  levels: CurriculumLevel[];
  gradingScales: GradingScale[];
}

// ============= GRADING SCALES =============

// CBC 8-Point Rubric Scale with detailed subdivisions (EE1, EE2, ME1, ME2, etc.)
const CBC_RUBRIC_SCALE: GradingScale = {
  id: 'cbc_rubric',
  name: 'CBC 8-Point Rubric (PP1-Grade 6)',
  type: 'rubric',
  grades: [
    { grade: 'EE1', minScore: 90, maxScore: 100, points: 8, description: 'Highly Exceeding Expectations' },
    { grade: 'EE2', minScore: 80, maxScore: 89, points: 7, description: 'Exceeding Expectations' },
    { grade: 'ME1', minScore: 70, maxScore: 79, points: 6, description: 'Strongly Meeting Expectations' },
    { grade: 'ME2', minScore: 65, maxScore: 69, points: 5, description: 'Meeting Expectations' },
    { grade: 'AE1', minScore: 55, maxScore: 64, points: 4, description: 'Approaching Expectations' },
    { grade: 'AE2', minScore: 50, maxScore: 54, points: 3, description: 'Nearly Approaching Expectations' },
    { grade: 'BE1', minScore: 40, maxScore: 49, points: 2, description: 'Below Expectations' },
    { grade: 'BE2', minScore: 0, maxScore: 39, points: 1, description: 'Significantly Below Expectations' },
  ],
};

// CBC Simplified 4-Grade Scale (alternative for schools preferring simpler grading)
const CBC_SIMPLIFIED_SCALE: GradingScale = {
  id: 'cbc_simplified',
  name: 'CBC Simplified (PP1-Grade 6)',
  type: 'rubric',
  grades: [
    { grade: 'EE', minScore: 80, maxScore: 100, points: 4, description: 'Exceeding Expectations' },
    { grade: 'ME', minScore: 65, maxScore: 79, points: 3, description: 'Meeting Expectations' },
    { grade: 'AE', minScore: 50, maxScore: 64, points: 2, description: 'Approaching Expectations' },
    { grade: 'BE', minScore: 0, maxScore: 49, points: 1, description: 'Below Expectations' },
  ],
};

// KNEC 7-Level Performance Scale for Summative Assessments
const CBC_KNEC_SCALE: GradingScale = {
  id: 'cbc_knec_7level',
  name: 'CBC KNEC 7-Level (Summative)',
  type: 'points',
  grades: [
    { grade: '7', minScore: 85, maxScore: 100, points: 7, description: 'Exceeding Expectations' },
    { grade: '6', minScore: 75, maxScore: 84, points: 6, description: 'Above Expectations' },
    { grade: '5', minScore: 60, maxScore: 74, points: 5, description: 'Meeting Expectations' },
    { grade: '4', minScore: 50, maxScore: 59, points: 4, description: 'Approaching Expectations' },
    { grade: '3', minScore: 40, maxScore: 49, points: 3, description: 'Below Expectations' },
    { grade: '2', minScore: 25, maxScore: 39, points: 2, description: 'Emerging' },
    { grade: '1', minScore: 0, maxScore: 24, points: 1, description: 'Needs Support' },
  ],
};

const CBC_JSS_SCALE: GradingScale = {
  id: 'cbc_jss',
  name: 'CBC Junior Secondary (Grade 7-9)',
  type: 'letter',
  grades: [
    { grade: 'A', minScore: 80, maxScore: 100, points: 5, description: 'Excellent' },
    { grade: 'B', minScore: 65, maxScore: 79, points: 4, description: 'Good' },
    { grade: 'C', minScore: 50, maxScore: 64, points: 3, description: 'Average' },
    { grade: 'D', minScore: 40, maxScore: 49, points: 2, description: 'Below Average' },
    { grade: 'E', minScore: 0, maxScore: 39, points: 1, description: 'Fail' },
  ],
};

const CBC_SSS_SCALE: GradingScale = {
  id: 'cbc_sss',
  name: 'CBC Senior Secondary (Grade 10-12)',
  type: 'letter',
  grades: [
    { grade: 'A', minScore: 80, maxScore: 100, points: 5, description: 'Excellent' },
    { grade: 'B', minScore: 65, maxScore: 79, points: 4, description: 'Good' },
    { grade: 'C', minScore: 50, maxScore: 64, points: 3, description: 'Average' },
    { grade: 'D', minScore: 40, maxScore: 49, points: 2, description: 'Below Average' },
    { grade: 'E', minScore: 0, maxScore: 39, points: 1, description: 'Fail' },
  ],
};

const KCSE_SCALE: GradingScale = {
  id: 'kcse',
  name: 'KCSE Grading (8-4-4 Legacy)',
  type: 'points',
  grades: [
    { grade: 'A', minScore: 80, maxScore: 100, points: 12, description: 'Excellent' },
    { grade: 'A-', minScore: 75, maxScore: 79, points: 11, description: 'Very Good' },
    { grade: 'B+', minScore: 70, maxScore: 74, points: 10, description: 'Good' },
    { grade: 'B', minScore: 65, maxScore: 69, points: 9, description: 'Good' },
    { grade: 'B-', minScore: 60, maxScore: 64, points: 8, description: 'Above Average' },
    { grade: 'C+', minScore: 55, maxScore: 59, points: 7, description: 'Average' },
    { grade: 'C', minScore: 50, maxScore: 54, points: 6, description: 'Average' },
    { grade: 'C-', minScore: 45, maxScore: 49, points: 5, description: 'Below Average' },
    { grade: 'D+', minScore: 40, maxScore: 44, points: 4, description: 'Below Average' },
    { grade: 'D', minScore: 35, maxScore: 39, points: 3, description: 'Poor' },
    { grade: 'D-', minScore: 30, maxScore: 34, points: 2, description: 'Poor' },
    { grade: 'E', minScore: 0, maxScore: 29, points: 1, description: 'Very Poor' },
  ],
};

const IGCSE_SCALE: GradingScale = {
  id: 'igcse_ag',
  name: 'IGCSE A*-G Scale',
  type: 'letter',
  grades: [
    { grade: 'A*', minScore: 90, maxScore: 100, description: 'Outstanding' },
    { grade: 'A', minScore: 80, maxScore: 89, description: 'Excellent' },
    { grade: 'B', minScore: 70, maxScore: 79, description: 'Very Good' },
    { grade: 'C', minScore: 60, maxScore: 69, description: 'Good' },
    { grade: 'D', minScore: 50, maxScore: 59, description: 'Satisfactory' },
    { grade: 'E', minScore: 40, maxScore: 49, description: 'Pass' },
    { grade: 'F', minScore: 30, maxScore: 39, description: 'Low' },
    { grade: 'G', minScore: 20, maxScore: 29, description: 'Very Low' },
    { grade: 'U', minScore: 0, maxScore: 19, description: 'Ungraded' },
  ],
};

const IGCSE_NUMERIC_SCALE: GradingScale = {
  id: 'igcse_numeric',
  name: 'IGCSE 9-1 Scale (New)',
  type: 'points',
  grades: [
    { grade: '9', minScore: 90, maxScore: 100, points: 9, description: 'Outstanding' },
    { grade: '8', minScore: 80, maxScore: 89, points: 8, description: 'Excellent' },
    { grade: '7', minScore: 70, maxScore: 79, points: 7, description: 'Very Good' },
    { grade: '6', minScore: 60, maxScore: 69, points: 6, description: 'Good' },
    { grade: '5', minScore: 50, maxScore: 59, points: 5, description: 'Strong Pass' },
    { grade: '4', minScore: 40, maxScore: 49, points: 4, description: 'Standard Pass' },
    { grade: '3', minScore: 30, maxScore: 39, points: 3, description: 'Below Pass' },
    { grade: '2', minScore: 20, maxScore: 29, points: 2, description: 'Low' },
    { grade: '1', minScore: 10, maxScore: 19, points: 1, description: 'Very Low' },
    { grade: 'U', minScore: 0, maxScore: 9, points: 0, description: 'Ungraded' },
  ],
};

const IB_MYP_SCALE: GradingScale = {
  id: 'ib_myp',
  name: 'IB MYP 1-7 Scale',
  type: 'points',
  grades: [
    { grade: '7', minScore: 85, maxScore: 100, points: 7, description: 'Excellent' },
    { grade: '6', minScore: 70, maxScore: 84, points: 6, description: 'Very Good' },
    { grade: '5', minScore: 55, maxScore: 69, points: 5, description: 'Good' },
    { grade: '4', minScore: 40, maxScore: 54, points: 4, description: 'Satisfactory' },
    { grade: '3', minScore: 30, maxScore: 39, points: 3, description: 'Mediocre' },
    { grade: '2', minScore: 20, maxScore: 29, points: 2, description: 'Poor' },
    { grade: '1', minScore: 0, maxScore: 19, points: 1, description: 'Very Poor' },
  ],
};

const IB_DP_SCALE: GradingScale = {
  id: 'ib_dp',
  name: 'IB Diploma 1-7 Scale',
  type: 'points',
  grades: [
    { grade: '7', minScore: 85, maxScore: 100, points: 7, description: 'Excellent' },
    { grade: '6', minScore: 70, maxScore: 84, points: 6, description: 'Very Good' },
    { grade: '5', minScore: 55, maxScore: 69, points: 5, description: 'Good' },
    { grade: '4', minScore: 40, maxScore: 54, points: 4, description: 'Satisfactory' },
    { grade: '3', minScore: 30, maxScore: 39, points: 3, description: 'Mediocre' },
    { grade: '2', minScore: 20, maxScore: 29, points: 2, description: 'Poor' },
    { grade: '1', minScore: 0, maxScore: 19, points: 1, description: 'Very Poor' },
  ],
};

const IB_PYP_SCALE: GradingScale = {
  id: 'ib_pyp',
  name: 'IB PYP Rubric',
  type: 'rubric',
  grades: [
    { grade: '4', minScore: 75, maxScore: 100, description: 'Exceeding' },
    { grade: '3', minScore: 50, maxScore: 74, description: 'Meeting' },
    { grade: '2', minScore: 25, maxScore: 49, description: 'Approaching' },
    { grade: '1', minScore: 0, maxScore: 24, description: 'Beginning' },
  ],
};

const AMERICAN_GPA_SCALE: GradingScale = {
  id: 'american_gpa',
  name: 'American GPA Scale',
  type: 'points',
  grades: [
    { grade: 'A+', minScore: 97, maxScore: 100, points: 4.0, description: 'Exceptional' },
    { grade: 'A', minScore: 93, maxScore: 96, points: 4.0, description: 'Excellent' },
    { grade: 'A-', minScore: 90, maxScore: 92, points: 3.7, description: 'Very Good' },
    { grade: 'B+', minScore: 87, maxScore: 89, points: 3.3, description: 'Good' },
    { grade: 'B', minScore: 83, maxScore: 86, points: 3.0, description: 'Above Average' },
    { grade: 'B-', minScore: 80, maxScore: 82, points: 2.7, description: 'Satisfactory' },
    { grade: 'C+', minScore: 77, maxScore: 79, points: 2.3, description: 'Average' },
    { grade: 'C', minScore: 73, maxScore: 76, points: 2.0, description: 'Acceptable' },
    { grade: 'C-', minScore: 70, maxScore: 72, points: 1.7, description: 'Below Average' },
    { grade: 'D+', minScore: 67, maxScore: 69, points: 1.3, description: 'Poor' },
    { grade: 'D', minScore: 63, maxScore: 66, points: 1.0, description: 'Barely Passing' },
    { grade: 'D-', minScore: 60, maxScore: 62, points: 0.7, description: 'Nearly Failing' },
    { grade: 'F', minScore: 0, maxScore: 59, points: 0.0, description: 'Fail' },
  ],
};

const UCE_SCALE: GradingScale = {
  id: 'uce',
  name: 'UCE/O-Level Grading',
  type: 'points',
  grades: [
    { grade: 'D1', minScore: 80, maxScore: 100, points: 1, description: 'Distinction' },
    { grade: 'D2', minScore: 70, maxScore: 79, points: 2, description: 'Distinction' },
    { grade: 'C3', minScore: 65, maxScore: 69, points: 3, description: 'Credit' },
    { grade: 'C4', minScore: 60, maxScore: 64, points: 4, description: 'Credit' },
    { grade: 'C5', minScore: 55, maxScore: 59, points: 5, description: 'Credit' },
    { grade: 'C6', minScore: 50, maxScore: 54, points: 6, description: 'Credit' },
    { grade: 'P7', minScore: 45, maxScore: 49, points: 7, description: 'Pass' },
    { grade: 'P8', minScore: 40, maxScore: 44, points: 8, description: 'Pass' },
    { grade: 'F9', minScore: 0, maxScore: 39, points: 9, description: 'Fail' },
  ],
};

const UACE_SCALE: GradingScale = {
  id: 'uace',
  name: 'UACE/A-Level Grading',
  type: 'letter',
  grades: [
    { grade: 'A', minScore: 80, maxScore: 100, points: 6, description: 'Excellent' },
    { grade: 'B', minScore: 70, maxScore: 79, points: 5, description: 'Very Good' },
    { grade: 'C', minScore: 60, maxScore: 69, points: 4, description: 'Good' },
    { grade: 'D', minScore: 50, maxScore: 59, points: 3, description: 'Satisfactory' },
    { grade: 'E', minScore: 45, maxScore: 49, points: 2, description: 'Pass' },
    { grade: 'O', minScore: 40, maxScore: 44, points: 1, description: 'Subsidiary Pass' },
    { grade: 'F', minScore: 0, maxScore: 39, points: 0, description: 'Fail' },
  ],
};

const CSEE_SCALE: GradingScale = {
  id: 'csee',
  name: 'CSEE/O-Level Grading',
  type: 'letter',
  grades: [
    { grade: 'A', minScore: 75, maxScore: 100, points: 1, description: 'Excellent' },
    { grade: 'B', minScore: 65, maxScore: 74, points: 2, description: 'Very Good' },
    { grade: 'C', minScore: 45, maxScore: 64, points: 3, description: 'Good' },
    { grade: 'D', minScore: 30, maxScore: 44, points: 4, description: 'Satisfactory' },
    { grade: 'F', minScore: 0, maxScore: 29, points: 5, description: 'Fail' },
  ],
};

const WAEC_SCALE: GradingScale = {
  id: 'waec',
  name: 'WAEC/WASSCE Grading',
  type: 'points',
  grades: [
    { grade: 'A1', minScore: 75, maxScore: 100, points: 1, description: 'Excellent' },
    { grade: 'B2', minScore: 70, maxScore: 74, points: 2, description: 'Very Good' },
    { grade: 'B3', minScore: 65, maxScore: 69, points: 3, description: 'Good' },
    { grade: 'C4', minScore: 60, maxScore: 64, points: 4, description: 'Credit' },
    { grade: 'C5', minScore: 55, maxScore: 59, points: 5, description: 'Credit' },
    { grade: 'C6', minScore: 50, maxScore: 54, points: 6, description: 'Credit' },
    { grade: 'D7', minScore: 45, maxScore: 49, points: 7, description: 'Pass' },
    { grade: 'E8', minScore: 40, maxScore: 44, points: 8, description: 'Pass' },
    { grade: 'F9', minScore: 0, maxScore: 39, points: 9, description: 'Fail' },
  ],
};

const CAPS_SCALE: GradingScale = {
  id: 'caps',
  name: 'NSC/CAPS Grading',
  type: 'points',
  grades: [
    { grade: '7', minScore: 80, maxScore: 100, points: 7, description: 'Outstanding Achievement' },
    { grade: '6', minScore: 70, maxScore: 79, points: 6, description: 'Meritorious Achievement' },
    { grade: '5', minScore: 60, maxScore: 69, points: 5, description: 'Substantial Achievement' },
    { grade: '4', minScore: 50, maxScore: 59, points: 4, description: 'Adequate Achievement' },
    { grade: '3', minScore: 40, maxScore: 49, points: 3, description: 'Moderate Achievement' },
    { grade: '2', minScore: 30, maxScore: 39, points: 2, description: 'Elementary Achievement' },
    { grade: '1', minScore: 0, maxScore: 29, points: 1, description: 'Not Achieved' },
  ],
};

const RWANDA_CBC_SCALE: GradingScale = {
  id: 'rw_cbc',
  name: 'Rwanda CBC Grading',
  type: 'letter',
  grades: [
    { grade: 'A', minScore: 80, maxScore: 100, description: 'Excellent' },
    { grade: 'B', minScore: 70, maxScore: 79, description: 'Very Good' },
    { grade: 'C', minScore: 60, maxScore: 69, description: 'Good' },
    { grade: 'D', minScore: 50, maxScore: 59, description: 'Satisfactory' },
    { grade: 'E', minScore: 40, maxScore: 49, description: 'Pass' },
    { grade: 'F', minScore: 0, maxScore: 39, description: 'Fail' },
  ],
};

// ============= CURRICULUM DEFINITIONS =============

export const curriculumConfigs: Record<CurriculumId, CurriculumConfig> = {
  // KENYA
  ke_cbc: {
    id: 'ke_cbc',
    name: 'Competency-Based Curriculum',
    shortName: 'CBC',
    description: 'Kenya 2-6-3-3-3 system introduced in 2017. Focuses on competencies, values, and skills development.',
    regulatoryBody: 'Kenya Institute of Curriculum Development (KICD)',
    isInternational: false,
    supportedCountries: ['KE'],
    levels: [
      { id: 'pp', name: 'Pre-Primary (PP1-PP2)', ageRange: '4-5 years', duration: '2 years', gradingScaleId: 'cbc_rubric' },
      { id: 'lower_primary', name: 'Lower Primary (Grade 1-3)', ageRange: '6-8 years', duration: '3 years', gradingScaleId: 'cbc_rubric' },
      { id: 'upper_primary', name: 'Upper Primary (Grade 4-6)', ageRange: '9-11 years', duration: '3 years', gradingScaleId: 'cbc_rubric' },
      { id: 'junior_secondary', name: 'Junior Secondary (Grade 7-9)', ageRange: '12-14 years', duration: '3 years', gradingScaleId: 'cbc_jss' },
      { id: 'senior_secondary', name: 'Senior Secondary (Grade 10-12)', ageRange: '15-17 years', duration: '3 years', gradingScaleId: 'cbc_sss' },
    ],
    gradingScales: [CBC_RUBRIC_SCALE, CBC_SIMPLIFIED_SCALE, CBC_KNEC_SCALE, CBC_JSS_SCALE, CBC_SSS_SCALE],
  },
  ke_844: {
    id: 'ke_844',
    name: '8-4-4 System (Legacy)',
    shortName: '8-4-4/KCSE',
    description: 'Kenya legacy system: 8 years primary, 4 years secondary, 4 years university. Being phased out.',
    regulatoryBody: 'Kenya National Examinations Council (KNEC)',
    isInternational: false,
    supportedCountries: ['KE'],
    levels: [
      { id: 'primary', name: 'Primary (Std 1-8)', ageRange: '6-13 years', duration: '8 years', gradingScaleId: 'kcse' },
      { id: 'secondary', name: 'Secondary (Form 1-4)', ageRange: '14-17 years', duration: '4 years', gradingScaleId: 'kcse' },
    ],
    gradingScales: [KCSE_SCALE],
  },

  // UGANDA
  ug_uce: {
    id: 'ug_uce',
    name: 'Uganda Certificate of Education',
    shortName: 'UCE/O-Level',
    description: 'Uganda O-Level curriculum leading to the UCE examination.',
    regulatoryBody: 'Uganda National Examinations Board (UNEB)',
    isInternational: false,
    supportedCountries: ['UG'],
    levels: [
      { id: 'primary', name: 'Primary (P1-P7)', ageRange: '6-12 years', duration: '7 years', gradingScaleId: 'uce' },
      { id: 'olevel', name: 'O-Level (S1-S4)', ageRange: '13-16 years', duration: '4 years', gradingScaleId: 'uce' },
    ],
    gradingScales: [UCE_SCALE],
  },
  ug_uace: {
    id: 'ug_uace',
    name: 'Uganda Advanced Certificate of Education',
    shortName: 'UACE/A-Level',
    description: 'Uganda A-Level curriculum for senior secondary education.',
    regulatoryBody: 'Uganda National Examinations Board (UNEB)',
    isInternational: false,
    supportedCountries: ['UG'],
    levels: [
      { id: 'alevel', name: 'A-Level (S5-S6)', ageRange: '17-18 years', duration: '2 years', gradingScaleId: 'uace' },
    ],
    gradingScales: [UACE_SCALE],
  },

  // TANZANIA
  tz_csee: {
    id: 'tz_csee',
    name: 'Certificate of Secondary Education Examination',
    shortName: 'CSEE/O-Level',
    description: 'Tanzania O-Level secondary education curriculum.',
    regulatoryBody: 'National Examinations Council of Tanzania (NECTA)',
    isInternational: false,
    supportedCountries: ['TZ'],
    levels: [
      { id: 'primary', name: 'Primary (Std 1-7)', ageRange: '7-13 years', duration: '7 years', gradingScaleId: 'csee' },
      { id: 'olevel', name: 'O-Level (Form 1-4)', ageRange: '14-17 years', duration: '4 years', gradingScaleId: 'csee' },
    ],
    gradingScales: [CSEE_SCALE],
  },
  tz_acsee: {
    id: 'tz_acsee',
    name: 'Advanced Certificate of Secondary Education',
    shortName: 'ACSEE/A-Level',
    description: 'Tanzania A-Level advanced secondary education.',
    regulatoryBody: 'National Examinations Council of Tanzania (NECTA)',
    isInternational: false,
    supportedCountries: ['TZ'],
    levels: [
      { id: 'alevel', name: 'A-Level (Form 5-6)', ageRange: '18-19 years', duration: '2 years', gradingScaleId: 'csee' },
    ],
    gradingScales: [CSEE_SCALE],
  },

  // RWANDA
  rw_cbc: {
    id: 'rw_cbc',
    name: 'Rwanda Competency-Based Curriculum',
    shortName: 'CBC',
    description: 'Rwanda national competency-based curriculum.',
    regulatoryBody: 'Rwanda Education Board (REB)',
    isInternational: false,
    supportedCountries: ['RW'],
    levels: [
      { id: 'nursery', name: 'Nursery', ageRange: '3-5 years', duration: '3 years', gradingScaleId: 'rw_cbc' },
      { id: 'primary', name: 'Primary (P1-P6)', ageRange: '6-11 years', duration: '6 years', gradingScaleId: 'rw_cbc' },
      { id: 'olevel', name: 'O-Level (S1-S3)', ageRange: '12-14 years', duration: '3 years', gradingScaleId: 'rw_cbc' },
      { id: 'alevel', name: 'A-Level (S4-S6)', ageRange: '15-17 years', duration: '3 years', gradingScaleId: 'rw_cbc' },
    ],
    gradingScales: [RWANDA_CBC_SCALE],
  },

  // NIGERIA
  ng_waec: {
    id: 'ng_waec',
    name: 'West African Examinations Council',
    shortName: 'WAEC/WASSCE',
    description: 'Nigeria WAEC curriculum leading to WASSCE examination.',
    regulatoryBody: 'West African Examinations Council (WAEC)',
    isInternational: false,
    supportedCountries: ['NG', 'GH'],
    levels: [
      { id: 'primary', name: 'Primary (Primary 1-6)', ageRange: '6-11 years', duration: '6 years', gradingScaleId: 'waec' },
      { id: 'jss', name: 'Junior Secondary (JSS 1-3)', ageRange: '12-14 years', duration: '3 years', gradingScaleId: 'waec' },
      { id: 'sss', name: 'Senior Secondary (SSS 1-3)', ageRange: '15-17 years', duration: '3 years', gradingScaleId: 'waec' },
    ],
    gradingScales: [WAEC_SCALE],
  },
  ng_neco: {
    id: 'ng_neco',
    name: 'National Examinations Council',
    shortName: 'NECO',
    description: 'Alternative national examination body in Nigeria.',
    regulatoryBody: 'National Examinations Council (NECO)',
    isInternational: false,
    supportedCountries: ['NG'],
    levels: [
      { id: 'jss', name: 'Junior Secondary (JSS 1-3)', ageRange: '12-14 years', duration: '3 years', gradingScaleId: 'waec' },
      { id: 'sss', name: 'Senior Secondary (SSS 1-3)', ageRange: '15-17 years', duration: '3 years', gradingScaleId: 'waec' },
    ],
    gradingScales: [WAEC_SCALE],
  },

  // GHANA
  gh_bece: {
    id: 'gh_bece',
    name: 'Basic Education Certificate Examination',
    shortName: 'BECE',
    description: 'Ghana basic education curriculum for JHS.',
    regulatoryBody: 'West African Examinations Council (WAEC)',
    isInternational: false,
    supportedCountries: ['GH'],
    levels: [
      { id: 'primary', name: 'Primary (P1-P6)', ageRange: '6-11 years', duration: '6 years', gradingScaleId: 'waec' },
      { id: 'jhs', name: 'Junior High School (JHS 1-3)', ageRange: '12-14 years', duration: '3 years', gradingScaleId: 'waec' },
    ],
    gradingScales: [WAEC_SCALE],
  },
  gh_wassce: {
    id: 'gh_wassce',
    name: 'West African Senior School Certificate',
    shortName: 'WASSCE',
    description: 'Ghana senior secondary curriculum.',
    regulatoryBody: 'West African Examinations Council (WAEC)',
    isInternational: false,
    supportedCountries: ['GH'],
    levels: [
      { id: 'shs', name: 'Senior High School (SHS 1-3)', ageRange: '15-17 years', duration: '3 years', gradingScaleId: 'waec' },
    ],
    gradingScales: [WAEC_SCALE],
  },

  // SOUTH AFRICA
  za_caps: {
    id: 'za_caps',
    name: 'Curriculum and Assessment Policy Statement',
    shortName: 'CAPS/NSC',
    description: 'South Africa national curriculum leading to NSC Matric.',
    regulatoryBody: 'Department of Basic Education (DBE)',
    isInternational: false,
    supportedCountries: ['ZA'],
    levels: [
      { id: 'foundation', name: 'Foundation Phase (Grade R-3)', ageRange: '5-9 years', duration: '4 years', gradingScaleId: 'caps' },
      { id: 'intermediate', name: 'Intermediate Phase (Grade 4-6)', ageRange: '10-12 years', duration: '3 years', gradingScaleId: 'caps' },
      { id: 'senior', name: 'Senior Phase (Grade 7-9)', ageRange: '13-15 years', duration: '3 years', gradingScaleId: 'caps' },
      { id: 'fet', name: 'FET Phase (Grade 10-12)', ageRange: '16-18 years', duration: '3 years', gradingScaleId: 'caps' },
    ],
    gradingScales: [CAPS_SCALE],
  },

  // INTERNATIONAL
  igcse: {
    id: 'igcse',
    name: 'International General Certificate of Secondary Education',
    shortName: 'IGCSE/Cambridge',
    description: 'Cambridge Assessment International Education qualification for ages 14-16.',
    regulatoryBody: 'Cambridge Assessment International Education',
    isInternational: true,
    supportedCountries: 'all',
    levels: [
      { id: 'checkpoint', name: 'Cambridge Primary Checkpoint', ageRange: '5-11 years', duration: '6 years', gradingScaleId: 'igcse_ag' },
      { id: 'lower_secondary', name: 'Cambridge Lower Secondary (Year 7-9)', ageRange: '11-14 years', duration: '3 years', gradingScaleId: 'igcse_ag' },
      { id: 'igcse', name: 'IGCSE (Year 10-11)', ageRange: '14-16 years', duration: '2 years', gradingScaleId: 'igcse_ag' },
      { id: 'as_level', name: 'AS Level (Year 12)', ageRange: '16-17 years', duration: '1 year', gradingScaleId: 'igcse_ag' },
      { id: 'a_level', name: 'A Level (Year 13)', ageRange: '17-18 years', duration: '1 year', gradingScaleId: 'igcse_ag' },
    ],
    gradingScales: [IGCSE_SCALE, IGCSE_NUMERIC_SCALE],
  },
  ib_pyp: {
    id: 'ib_pyp',
    name: 'IB Primary Years Programme',
    shortName: 'IB PYP',
    description: 'International Baccalaureate curriculum for ages 3-12.',
    regulatoryBody: 'International Baccalaureate Organization (IBO)',
    isInternational: true,
    supportedCountries: 'all',
    levels: [
      { id: 'early_years', name: 'Early Years', ageRange: '3-5 years', duration: '3 years', gradingScaleId: 'ib_pyp' },
      { id: 'pyp', name: 'PYP (Grade 1-5)', ageRange: '6-11 years', duration: '5 years', gradingScaleId: 'ib_pyp' },
    ],
    gradingScales: [IB_PYP_SCALE],
  },
  ib_myp: {
    id: 'ib_myp',
    name: 'IB Middle Years Programme',
    shortName: 'IB MYP',
    description: 'International Baccalaureate curriculum for ages 11-16.',
    regulatoryBody: 'International Baccalaureate Organization (IBO)',
    isInternational: true,
    supportedCountries: 'all',
    levels: [
      { id: 'myp', name: 'MYP (Year 1-5)', ageRange: '11-16 years', duration: '5 years', gradingScaleId: 'ib_myp' },
    ],
    gradingScales: [IB_MYP_SCALE],
  },
  ib_dp: {
    id: 'ib_dp',
    name: 'IB Diploma Programme',
    shortName: 'IB DP',
    description: 'International Baccalaureate pre-university qualification.',
    regulatoryBody: 'International Baccalaureate Organization (IBO)',
    isInternational: true,
    supportedCountries: 'all',
    levels: [
      { id: 'dp', name: 'Diploma Programme (Year 1-2)', ageRange: '16-19 years', duration: '2 years', gradingScaleId: 'ib_dp' },
    ],
    gradingScales: [IB_DP_SCALE],
  },
  american: {
    id: 'american',
    name: 'American Curriculum',
    shortName: 'US/AP',
    description: 'American K-12 curriculum with optional Advanced Placement courses.',
    regulatoryBody: 'Various US Accreditation Bodies',
    isInternational: true,
    supportedCountries: 'all',
    levels: [
      { id: 'elementary', name: 'Elementary School (K-5)', ageRange: '5-10 years', duration: '6 years', gradingScaleId: 'american_gpa' },
      { id: 'middle', name: 'Middle School (6-8)', ageRange: '11-13 years', duration: '3 years', gradingScaleId: 'american_gpa' },
      { id: 'high', name: 'High School (9-12)', ageRange: '14-17 years', duration: '4 years', gradingScaleId: 'american_gpa' },
    ],
    gradingScales: [AMERICAN_GPA_SCALE],
  },
};

// ============= UTILITY FUNCTIONS =============

export function getCurriculum(id: CurriculumId): CurriculumConfig {
  return curriculumConfigs[id];
}

export function getCurriculaForCountry(countryCode: CountryCode): CurriculumConfig[] {
  return Object.values(curriculumConfigs).filter((curriculum) => {
    if (curriculum.supportedCountries === 'all') return true;
    return curriculum.supportedCountries.includes(countryCode);
  });
}

export function getNationalCurricula(countryCode: CountryCode): CurriculumConfig[] {
  return getCurriculaForCountry(countryCode).filter((c) => !c.isInternational);
}

export function getInternationalCurricula(): CurriculumConfig[] {
  return Object.values(curriculumConfigs).filter((c) => c.isInternational);
}

export function getAllCurricula(): CurriculumConfig[] {
  return Object.values(curriculumConfigs);
}

export function getGradingScale(curriculumId: CurriculumId, scaleId: string): GradingScale | undefined {
  const curriculum = curriculumConfigs[curriculumId];
  return curriculum?.gradingScales.find((s) => s.id === scaleId);
}

export function getGradeFromScore(
  score: number,
  curriculumId: CurriculumId,
  scaleId?: string
): string {
  const curriculum = curriculumConfigs[curriculumId];
  if (!curriculum) return 'N/A';

  const scale = scaleId
    ? curriculum.gradingScales.find((s) => s.id === scaleId)
    : curriculum.gradingScales[0];

  if (!scale) return 'N/A';

  const grade = scale.grades.find((g) => score >= g.minScore && score <= g.maxScore);
  return grade?.grade || 'N/A';
}

export function getDefaultCurriculumForCountry(countryCode: CountryCode): CurriculumId {
  const defaults: Record<CountryCode, CurriculumId> = {
    KE: 'ke_cbc',
    UG: 'ug_uce',
    TZ: 'tz_csee',
    RW: 'rw_cbc',
    NG: 'ng_waec',
    GH: 'gh_bece',
    ZA: 'za_caps',
  };
  return defaults[countryCode];
}
