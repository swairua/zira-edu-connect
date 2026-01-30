// Country configuration engine for multi-country support

export type CountryCode = 'KE' | 'UG' | 'TZ' | 'RW' | 'NG' | 'GH' | 'ZA';

export interface GradingScale {
  name: string;
  grades: {
    grade: string;
    minScore: number;
    maxScore: number;
    points?: number;
    description: string;
  }[];
}

export interface AcademicCalendar {
  terms: {
    name: string;
    startMonth: number;
    endMonth: number;
  }[];
  academicYearStart: number; // Month (1-12)
  academicYearEnd: number;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  decimalPlaces: number;
  thousandsSeparator: string;
  decimalSeparator: string;
}

export interface CountryConfig {
  code: CountryCode;
  name: string;
  flag: string;
  timezone: string;
  currency: CurrencyConfig;
  gradingSystem: GradingScale;
  academicCalendar: AcademicCalendar;
  dateFormat: string;
  phoneCode: string;
  regulatoryBody?: string;
}

export const countryConfigs: Record<CountryCode, CountryConfig> = {
  KE: {
    code: 'KE',
    name: 'Kenya',
    flag: '🇰🇪',
    timezone: 'Africa/Nairobi',
    phoneCode: '+254',
    regulatoryBody: 'Kenya National Examinations Council (KNEC)',
    dateFormat: 'DD/MM/YYYY',
    currency: {
      code: 'KES',
      symbol: 'KSh',
      name: 'Kenyan Shilling',
      decimalPlaces: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.',
    },
    gradingSystem: {
      name: 'KCSE Grading',
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
    },
    academicCalendar: {
      academicYearStart: 1,
      academicYearEnd: 11,
      terms: [
        { name: 'Term 1', startMonth: 1, endMonth: 4 },
        { name: 'Term 2', startMonth: 5, endMonth: 8 },
        { name: 'Term 3', startMonth: 9, endMonth: 11 },
      ],
    },
  },
  UG: {
    code: 'UG',
    name: 'Uganda',
    flag: '🇺🇬',
    timezone: 'Africa/Kampala',
    phoneCode: '+256',
    regulatoryBody: 'Uganda National Examinations Board (UNEB)',
    dateFormat: 'DD/MM/YYYY',
    currency: {
      code: 'UGX',
      symbol: 'USh',
      name: 'Ugandan Shilling',
      decimalPlaces: 0,
      thousandsSeparator: ',',
      decimalSeparator: '.',
    },
    gradingSystem: {
      name: 'UCE/UACE Grading',
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
    },
    academicCalendar: {
      academicYearStart: 2,
      academicYearEnd: 12,
      terms: [
        { name: 'Term 1', startMonth: 2, endMonth: 5 },
        { name: 'Term 2', startMonth: 6, endMonth: 8 },
        { name: 'Term 3', startMonth: 9, endMonth: 12 },
      ],
    },
  },
  TZ: {
    code: 'TZ',
    name: 'Tanzania',
    flag: '🇹🇿',
    timezone: 'Africa/Dar_es_Salaam',
    phoneCode: '+255',
    regulatoryBody: 'National Examinations Council of Tanzania (NECTA)',
    dateFormat: 'DD/MM/YYYY',
    currency: {
      code: 'TZS',
      symbol: 'TSh',
      name: 'Tanzanian Shilling',
      decimalPlaces: 0,
      thousandsSeparator: ',',
      decimalSeparator: '.',
    },
    gradingSystem: {
      name: 'CSEE/ACSEE Grading',
      grades: [
        { grade: 'A', minScore: 75, maxScore: 100, points: 1, description: 'Excellent' },
        { grade: 'B', minScore: 65, maxScore: 74, points: 2, description: 'Very Good' },
        { grade: 'C', minScore: 45, maxScore: 64, points: 3, description: 'Good' },
        { grade: 'D', minScore: 30, maxScore: 44, points: 4, description: 'Satisfactory' },
        { grade: 'F', minScore: 0, maxScore: 29, points: 5, description: 'Fail' },
      ],
    },
    academicCalendar: {
      academicYearStart: 1,
      academicYearEnd: 12,
      terms: [
        { name: 'Term 1', startMonth: 1, endMonth: 3 },
        { name: 'Term 2', startMonth: 4, endMonth: 6 },
        { name: 'Term 3', startMonth: 7, endMonth: 9 },
        { name: 'Term 4', startMonth: 10, endMonth: 12 },
      ],
    },
  },
  RW: {
    code: 'RW',
    name: 'Rwanda',
    flag: '🇷🇼',
    timezone: 'Africa/Kigali',
    phoneCode: '+250',
    regulatoryBody: 'Rwanda Education Board (REB)',
    dateFormat: 'DD/MM/YYYY',
    currency: {
      code: 'RWF',
      symbol: 'FRw',
      name: 'Rwandan Franc',
      decimalPlaces: 0,
      thousandsSeparator: ',',
      decimalSeparator: '.',
    },
    gradingSystem: {
      name: 'Rwanda National Grading',
      grades: [
        { grade: 'A', minScore: 80, maxScore: 100, description: 'Excellent' },
        { grade: 'B', minScore: 70, maxScore: 79, description: 'Very Good' },
        { grade: 'C', minScore: 60, maxScore: 69, description: 'Good' },
        { grade: 'D', minScore: 50, maxScore: 59, description: 'Satisfactory' },
        { grade: 'E', minScore: 40, maxScore: 49, description: 'Pass' },
        { grade: 'F', minScore: 0, maxScore: 39, description: 'Fail' },
      ],
    },
    academicCalendar: {
      academicYearStart: 1,
      academicYearEnd: 11,
      terms: [
        { name: 'Term 1', startMonth: 1, endMonth: 4 },
        { name: 'Term 2', startMonth: 5, endMonth: 8 },
        { name: 'Term 3', startMonth: 9, endMonth: 11 },
      ],
    },
  },
  NG: {
    code: 'NG',
    name: 'Nigeria',
    flag: '🇳🇬',
    timezone: 'Africa/Lagos',
    phoneCode: '+234',
    regulatoryBody: 'West African Examinations Council (WAEC)',
    dateFormat: 'DD/MM/YYYY',
    currency: {
      code: 'NGN',
      symbol: '₦',
      name: 'Nigerian Naira',
      decimalPlaces: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.',
    },
    gradingSystem: {
      name: 'WAEC/NECO Grading',
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
    },
    academicCalendar: {
      academicYearStart: 9,
      academicYearEnd: 7,
      terms: [
        { name: '1st Term', startMonth: 9, endMonth: 12 },
        { name: '2nd Term', startMonth: 1, endMonth: 4 },
        { name: '3rd Term', startMonth: 4, endMonth: 7 },
      ],
    },
  },
  GH: {
    code: 'GH',
    name: 'Ghana',
    flag: '🇬🇭',
    timezone: 'Africa/Accra',
    phoneCode: '+233',
    regulatoryBody: 'West African Examinations Council (WAEC)',
    dateFormat: 'DD/MM/YYYY',
    currency: {
      code: 'GHS',
      symbol: 'GH₵',
      name: 'Ghanaian Cedi',
      decimalPlaces: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.',
    },
    gradingSystem: {
      name: 'WASSCE Grading',
      grades: [
        { grade: 'A1', minScore: 80, maxScore: 100, points: 1, description: 'Excellent' },
        { grade: 'B2', minScore: 70, maxScore: 79, points: 2, description: 'Very Good' },
        { grade: 'B3', minScore: 65, maxScore: 69, points: 3, description: 'Good' },
        { grade: 'C4', minScore: 60, maxScore: 64, points: 4, description: 'Credit' },
        { grade: 'C5', minScore: 55, maxScore: 59, points: 5, description: 'Credit' },
        { grade: 'C6', minScore: 50, maxScore: 54, points: 6, description: 'Credit' },
        { grade: 'D7', minScore: 45, maxScore: 49, points: 7, description: 'Pass' },
        { grade: 'E8', minScore: 40, maxScore: 44, points: 8, description: 'Pass' },
        { grade: 'F9', minScore: 0, maxScore: 39, points: 9, description: 'Fail' },
      ],
    },
    academicCalendar: {
      academicYearStart: 9,
      academicYearEnd: 7,
      terms: [
        { name: '1st Term', startMonth: 9, endMonth: 12 },
        { name: '2nd Term', startMonth: 1, endMonth: 4 },
        { name: '3rd Term', startMonth: 5, endMonth: 7 },
      ],
    },
  },
  ZA: {
    code: 'ZA',
    name: 'South Africa',
    flag: '🇿🇦',
    timezone: 'Africa/Johannesburg',
    phoneCode: '+27',
    regulatoryBody: 'Department of Basic Education (DBE)',
    dateFormat: 'YYYY/MM/DD',
    currency: {
      code: 'ZAR',
      symbol: 'R',
      name: 'South African Rand',
      decimalPlaces: 2,
      thousandsSeparator: ' ',
      decimalSeparator: ',',
    },
    gradingSystem: {
      name: 'NSC Grading',
      grades: [
        { grade: '7', minScore: 80, maxScore: 100, description: 'Outstanding Achievement' },
        { grade: '6', minScore: 70, maxScore: 79, description: 'Meritorious Achievement' },
        { grade: '5', minScore: 60, maxScore: 69, description: 'Substantial Achievement' },
        { grade: '4', minScore: 50, maxScore: 59, description: 'Adequate Achievement' },
        { grade: '3', minScore: 40, maxScore: 49, description: 'Moderate Achievement' },
        { grade: '2', minScore: 30, maxScore: 39, description: 'Elementary Achievement' },
        { grade: '1', minScore: 0, maxScore: 29, description: 'Not Achieved' },
      ],
    },
    academicCalendar: {
      academicYearStart: 1,
      academicYearEnd: 12,
      terms: [
        { name: 'Term 1', startMonth: 1, endMonth: 3 },
        { name: 'Term 2', startMonth: 4, endMonth: 6 },
        { name: 'Term 3', startMonth: 7, endMonth: 9 },
        { name: 'Term 4', startMonth: 10, endMonth: 12 },
      ],
    },
  },
};

// Utility functions
export function getCountryConfig(code: CountryCode): CountryConfig {
  return countryConfigs[code];
}

export function formatCurrency(amount: number, countryCode: CountryCode): string {
  const config = countryConfigs[countryCode];
  const { currency } = config;
  
  const formatted = amount
    .toFixed(currency.decimalPlaces)
    .replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandsSeparator);
  
  return `${currency.symbol} ${formatted}`;
}

export function getGradeFromScore(score: number, countryCode: CountryCode): string {
  const config = countryConfigs[countryCode];
  const grade = config.gradingSystem.grades.find(
    (g) => score >= g.minScore && score <= g.maxScore
  );
  return grade?.grade || 'N/A';
}

export function getCurrentTerm(countryCode: CountryCode): string {
  const config = countryConfigs[countryCode];
  const currentMonth = new Date().getMonth() + 1;
  
  const term = config.academicCalendar.terms.find(
    (t) => currentMonth >= t.startMonth && currentMonth <= t.endMonth
  );
  
  return term?.name || 'Break';
}

export function getAcademicYear(countryCode: CountryCode): string {
  const config = countryConfigs[countryCode];
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  
  if (config.academicCalendar.academicYearStart > config.academicCalendar.academicYearEnd) {
    // Academic year spans two calendar years (e.g., Nigeria, Ghana)
    if (currentMonth >= config.academicCalendar.academicYearStart) {
      return `${currentYear}/${currentYear + 1}`;
    } else {
      return `${currentYear - 1}/${currentYear}`;
    }
  } else {
    return `${currentYear}`;
  }
}

export function getAllCountries(): CountryConfig[] {
  return Object.values(countryConfigs);
}
