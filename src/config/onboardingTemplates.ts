// Academic Calendar Templates
export interface CalendarTemplate {
  id: string;
  name: string;
  description: string;
  terms: {
    name: string;
    startMonth: number;
    startDay: number;
    endMonth: number;
    endDay: number;
  }[];
}

export const CALENDAR_TEMPLATES: CalendarTemplate[] = [
  {
    id: '3-term-kenya',
    name: '3-Term Calendar (Kenya)',
    description: 'Standard Kenya school calendar with 3 terms',
    terms: [
      { name: 'Term 1', startMonth: 0, startDay: 6, endMonth: 3, endDay: 5 },  // Jan 6 - Apr 5
      { name: 'Term 2', startMonth: 4, startDay: 6, endMonth: 7, endDay: 2 },  // May 6 - Aug 2
      { name: 'Term 3', startMonth: 8, startDay: 2, endMonth: 10, endDay: 22 }, // Sep 2 - Nov 22
    ],
  },
  {
    id: '3-term-standard',
    name: '3-Term Calendar (Standard)',
    description: 'Standard 3-term academic calendar',
    terms: [
      { name: 'Term 1', startMonth: 0, startDay: 8, endMonth: 3, endDay: 12 },  // Jan-Apr
      { name: 'Term 2', startMonth: 4, startDay: 1, endMonth: 7, endDay: 9 },   // May-Aug
      { name: 'Term 3', startMonth: 8, startDay: 1, endMonth: 11, endDay: 6 },  // Sep-Dec
    ],
  },
  {
    id: '4-term',
    name: '4-Term Calendar',
    description: 'Four term academic year with shorter breaks',
    terms: [
      { name: 'Term 1', startMonth: 0, startDay: 8, endMonth: 2, endDay: 15 },  // Jan-Mar
      { name: 'Term 2', startMonth: 3, startDay: 1, endMonth: 5, endDay: 7 },   // Apr-Jun
      { name: 'Term 3', startMonth: 6, startDay: 1, endMonth: 8, endDay: 6 },   // Jul-Sep
      { name: 'Term 4', startMonth: 9, startDay: 1, endMonth: 11, endDay: 6 },  // Oct-Dec
    ],
  },
  {
    id: '2-semester',
    name: '2-Semester Calendar',
    description: 'Two semester system (college style)',
    terms: [
      { name: 'Semester 1', startMonth: 0, startDay: 8, endMonth: 5, endDay: 15 }, // Jan-Jun
      { name: 'Semester 2', startMonth: 6, startDay: 15, endMonth: 11, endDay: 6 }, // Jul-Dec
    ],
  },
];

// Fee Structure Templates
export interface FeeTemplate {
  id: string;
  name: string;
  description: string;
  schoolType: 'primary' | 'secondary-day' | 'secondary-boarding' | 'all';
  items: {
    name: string;
    amount: number;
    category: string;
    is_mandatory: boolean;
    applicable_to?: string[];
  }[];
}

export const FEE_TEMPLATES: FeeTemplate[] = [
  {
    id: 'primary-basic',
    name: 'Primary School (Basic)',
    description: 'Essential fees for primary schools',
    schoolType: 'primary',
    items: [
      { name: 'Tuition Fee', amount: 15000, category: 'tuition', is_mandatory: true },
      { name: 'Activity Fee', amount: 2000, category: 'activity', is_mandatory: true },
      { name: 'Examination Fee', amount: 1500, category: 'examination', is_mandatory: true },
      { name: 'Learning Materials', amount: 3000, category: 'books', is_mandatory: true },
      { name: 'Development Levy', amount: 1000, category: 'other', is_mandatory: false },
    ],
  },
  {
    id: 'secondary-day',
    name: 'Secondary Day School',
    description: 'Standard fees for day secondary schools',
    schoolType: 'secondary-day',
    items: [
      { name: 'Tuition Fee', amount: 25000, category: 'tuition', is_mandatory: true },
      { name: 'Laboratory Fee', amount: 3000, category: 'activity', is_mandatory: true },
      { name: 'Library Fee', amount: 1500, category: 'books', is_mandatory: true },
      { name: 'Examination Fee', amount: 2500, category: 'examination', is_mandatory: true },
      { name: 'ICT Levy', amount: 2000, category: 'activity', is_mandatory: true },
      { name: 'Co-curricular Activities', amount: 1500, category: 'activity', is_mandatory: false },
    ],
  },
  {
    id: 'secondary-boarding',
    name: 'Secondary Boarding School',
    description: 'Comprehensive fees for boarding schools',
    schoolType: 'secondary-boarding',
    items: [
      { name: 'Tuition Fee', amount: 30000, category: 'tuition', is_mandatory: true },
      { name: 'Boarding Fee', amount: 25000, category: 'boarding', is_mandatory: true, applicable_to: ['boarder'] },
      { name: 'Laboratory Fee', amount: 3500, category: 'activity', is_mandatory: true },
      { name: 'Library Fee', amount: 2000, category: 'books', is_mandatory: true },
      { name: 'Examination Fee', amount: 3000, category: 'examination', is_mandatory: true },
      { name: 'ICT Levy', amount: 2500, category: 'activity', is_mandatory: true },
      { name: 'Medical Fee', amount: 1500, category: 'other', is_mandatory: true },
      { name: 'Transport (Day Scholars)', amount: 8000, category: 'transport', is_mandatory: false, applicable_to: ['day'] },
      { name: 'Uniform Deposit', amount: 5000, category: 'uniform', is_mandatory: false },
    ],
  },
  {
    id: 'minimal',
    name: 'Minimal Fee Structure',
    description: 'Basic structure with just tuition and exam fees',
    schoolType: 'all',
    items: [
      { name: 'Tuition Fee', amount: 20000, category: 'tuition', is_mandatory: true },
      { name: 'Examination Fee', amount: 2000, category: 'examination', is_mandatory: true },
    ],
  },
];

// Student Import CSV columns
export const STUDENT_IMPORT_COLUMNS = {
  required: ['admission_number', 'first_name', 'last_name', 'gender', 'date_of_birth'],
  optional: [
    'middle_name',
    'class_name',         // For class assignment
    'stream',             // For stream assignment
    'boarding_status',    // boarder / day
    'transport_zone',     // For transport assignment
    'parent_phone',       // Auto-create/link parent
    'parent_name',        // Parent full name
    'parent_email',       // Parent email
    'parent_relationship', // mother / father / guardian
    'previous_school',
    'medical_notes',
    'special_needs',
  ],
};

// Parent Import CSV columns
export const PARENT_IMPORT_COLUMNS = {
  required: ['phone', 'first_name', 'last_name'],
  optional: [
    'email',
    'relationship',
    'occupation',
    'address',
    'id_number',
    'student_admission_numbers', // Semicolon-separated admission numbers to link
  ],
};

// Staff Import CSV columns
export const STAFF_IMPORT_COLUMNS = {
  required: ['employee_number', 'first_name', 'last_name', 'email', 'role'],
  optional: [
    'phone',
    'id_number',
    'date_of_birth',
    'gender',
    'department',
    'subjects',           // Semicolon-separated subject codes for assignment
    'class_teacher_of',   // Class name if this staff is class teacher
    'hire_date',
    'address',
  ],
};

// Opening Balances Import CSV columns
export const OPENING_BALANCES_IMPORT_COLUMNS = {
  required: ['admission_number', 'amount', 'balance_date'],
  optional: ['description'],
};

// Historical Grades Import CSV columns
export const HISTORICAL_GRADES_IMPORT_COLUMNS = {
  required: ['admission_number', 'academic_year', 'term', 'exam_name', 'subject_code', 'marks'],
  optional: ['grade', 'remarks', 'max_marks'],
};

// Historical Payments Import CSV columns
export const HISTORICAL_PAYMENTS_IMPORT_COLUMNS = {
  required: ['admission_number', 'payment_date', 'amount', 'payment_method'],
  optional: ['receipt_number', 'transaction_reference', 'notes'],
};

// Historical Attendance Import CSV columns
export const HISTORICAL_ATTENDANCE_IMPORT_COLUMNS = {
  required: ['admission_number', 'date', 'status'],
  optional: ['notes'],
};

// Helper function to generate academic year dates from template
export function generateAcademicYearFromTemplate(
  template: CalendarTemplate,
  year: number
): { year: { name: string; startDate: string; endDate: string; }; terms: { name: string; startDate: string; endDate: string; }[] } {
  const terms = template.terms.map((term) => ({
    name: term.name,
    startDate: new Date(year, term.startMonth, term.startDay).toISOString().split('T')[0],
    endDate: new Date(year, term.endMonth, term.endDay).toISOString().split('T')[0],
  }));

  return {
    year: {
      name: `${year} Academic Year`,
      startDate: terms[0].startDate,
      endDate: terms[terms.length - 1].endDate,
    },
    terms,
  };
}
