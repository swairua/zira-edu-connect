// Centralized column definitions for all bulk import dialogs
// Each column includes metadata about requirements, types, valid options, and examples

export type ColumnType = 'text' | 'date' | 'number' | 'list' | 'email' | 'phone' | 'lookup';

export interface ColumnDefinition {
  name: string;
  label: string;
  required: boolean;
  type: ColumnType;
  description: string;
  options?: string[];
  format?: string;
  example?: string;
  lookupKey?: string; // For dynamic lookups (e.g., 'classes', 'subjects')
}

export interface ImportDefinition {
  importType: string;
  title: string;
  description: string;
  columns: ColumnDefinition[];
}

// Student Import Columns
export const STUDENT_IMPORT_DEFINITION: ImportDefinition = {
  importType: 'students',
  title: 'Student Import',
  description: 'Import students with automatic class assignment and parent linking',
  columns: [
    {
      name: 'admission_number',
      label: 'Admission Number',
      required: false,
      type: 'text',
      description: 'Unique student ID. Leave blank to auto-generate.',
      example: 'STU001',
    },
    {
      name: 'first_name',
      label: 'First Name',
      required: true,
      type: 'text',
      description: "Student's first name",
      example: 'John',
    },
    {
      name: 'middle_name',
      label: 'Middle Name',
      required: false,
      type: 'text',
      description: "Student's middle name (optional)",
      example: 'William',
    },
    {
      name: 'last_name',
      label: 'Last Name',
      required: true,
      type: 'text',
      description: "Student's last name/surname",
      example: 'Doe',
    },
    {
      name: 'gender',
      label: 'Gender',
      required: false,
      type: 'list',
      description: "Student's gender",
      options: ['male', 'female', 'other'],
      example: 'male',
    },
    {
      name: 'date_of_birth',
      label: 'Date of Birth',
      required: false,
      type: 'date',
      description: "Student's date of birth",
      format: 'YYYY-MM-DD',
      example: '2010-05-15',
    },
    {
      name: 'nationality',
      label: 'Nationality',
      required: false,
      type: 'text',
      description: "Student's nationality",
      example: 'Kenyan',
    },
    {
      name: 'admission_date',
      label: 'Admission Date',
      required: false,
      type: 'date',
      description: 'Date student was admitted. Defaults to today if blank.',
      format: 'YYYY-MM-DD',
      example: '2024-01-10',
    },
    {
      name: 'class_name',
      label: 'Class Name',
      required: false,
      type: 'lookup',
      description: 'Class to assign student to (must match existing class name)',
      lookupKey: 'classes',
      example: 'Grade 1',
    },
    {
      name: 'stream',
      label: 'Stream',
      required: false,
      type: 'lookup',
      description: 'Stream within the class (e.g., A, B, East, West)',
      lookupKey: 'streams',
      example: 'A',
    },
    {
      name: 'boarding_status',
      label: 'Boarding Status',
      required: false,
      type: 'list',
      description: 'Whether student is a boarder or day scholar',
      options: ['boarder', 'day'],
      example: 'day',
    },
    {
      name: 'parent_phone',
      label: 'Parent Phone',
      required: false,
      type: 'phone',
      description: 'Phone number to auto-create/link parent',
      example: '+254712345678',
    },
    {
      name: 'parent_name',
      label: 'Parent Name',
      required: false,
      type: 'text',
      description: 'Full name of parent (First Last)',
      example: 'Jane Doe',
    },
    {
      name: 'parent_email',
      label: 'Parent Email',
      required: false,
      type: 'email',
      description: "Parent's email address",
      example: 'jane@email.com',
    },
    {
      name: 'parent_relationship',
      label: 'Parent Relationship',
      required: false,
      type: 'list',
      description: "Parent's relationship to student",
      options: ['mother', 'father', 'guardian', 'parent', 'uncle', 'aunt', 'grandparent'],
      example: 'mother',
    },
  ],
};

// Parent Import Columns
export const PARENT_IMPORT_DEFINITION: ImportDefinition = {
  importType: 'parents',
  title: 'Parent Import',
  description: 'Import parents with automatic student linking by admission number',
  columns: [
    {
      name: 'phone',
      label: 'Phone Number',
      required: true,
      type: 'phone',
      description: "Parent's phone number (used as unique identifier)",
      example: '+254712345678',
    },
    {
      name: 'first_name',
      label: 'First Name',
      required: true,
      type: 'text',
      description: "Parent's first name",
      example: 'Jane',
    },
    {
      name: 'last_name',
      label: 'Last Name',
      required: true,
      type: 'text',
      description: "Parent's last name/surname",
      example: 'Doe',
    },
    {
      name: 'email',
      label: 'Email',
      required: false,
      type: 'email',
      description: "Parent's email address",
      example: 'jane@email.com',
    },
    {
      name: 'relationship',
      label: 'Relationship',
      required: false,
      type: 'list',
      description: 'Default relationship to linked students',
      options: ['father', 'mother', 'guardian', 'parent', 'uncle', 'aunt', 'grandparent', 'other'],
      example: 'mother',
    },
    {
      name: 'student_admission_numbers',
      label: 'Student Admission Numbers',
      required: false,
      type: 'text',
      description: 'Semicolon-separated list of student admission numbers to link',
      example: 'STU001;STU002',
    },
    {
      name: 'id_number',
      label: 'ID Number',
      required: false,
      type: 'text',
      description: 'National ID or passport number',
      example: '12345678',
    },
    {
      name: 'occupation',
      label: 'Occupation',
      required: false,
      type: 'text',
      description: "Parent's occupation/profession",
      example: 'Teacher',
    },
    {
      name: 'address',
      label: 'Address',
      required: false,
      type: 'text',
      description: "Parent's physical address",
      example: '123 Main St, Nairobi',
    },
  ],
};

// Staff Import Columns
export const STAFF_IMPORT_DEFINITION: ImportDefinition = {
  importType: 'staff',
  title: 'Staff Import',
  description: 'Import staff with automatic subject and class teacher assignments',
  columns: [
    {
      name: 'employee_number',
      label: 'Employee Number',
      required: true,
      type: 'text',
      description: 'Unique staff employee ID',
      example: 'EMP001',
    },
    {
      name: 'first_name',
      label: 'First Name',
      required: true,
      type: 'text',
      description: "Staff member's first name",
      example: 'John',
    },
    {
      name: 'last_name',
      label: 'Last Name',
      required: true,
      type: 'text',
      description: "Staff member's last name",
      example: 'Smith',
    },
    {
      name: 'email',
      label: 'Email',
      required: true,
      type: 'email',
      description: "Staff member's email address (used for login)",
      example: 'john.smith@school.edu',
    },
    {
      name: 'phone',
      label: 'Phone',
      required: false,
      type: 'phone',
      description: "Staff member's phone number",
      example: '+254712345678',
    },
    {
      name: 'gender',
      label: 'Gender',
      required: false,
      type: 'list',
      description: "Staff member's gender",
      options: ['male', 'female', 'other'],
      example: 'male',
    },
    {
      name: 'id_number',
      label: 'ID Number',
      required: false,
      type: 'text',
      description: 'National ID or passport number',
      example: '12345678',
    },
    {
      name: 'department',
      label: 'Department',
      required: false,
      type: 'text',
      description: 'Department or faculty',
      example: 'Mathematics',
    },
    {
      name: 'designation',
      label: 'Designation',
      required: false,
      type: 'text',
      description: 'Job title or designation. Defaults to "Teacher".',
      example: 'Senior Teacher',
    },
    {
      name: 'date_joined',
      label: 'Date Joined',
      required: false,
      type: 'date',
      description: 'Date staff joined the institution',
      format: 'YYYY-MM-DD',
      example: '2024-01-15',
    },
    {
      name: 'subjects',
      label: 'Subject Codes',
      required: false,
      type: 'text',
      description: 'Semicolon-separated subject codes to assign (must exist in system)',
      lookupKey: 'subjects',
      example: 'MATH;ENG;SCI',
    },
    {
      name: 'class_teacher_of',
      label: 'Class Teacher Of',
      required: false,
      type: 'lookup',
      description: 'Class name if this staff is a class teacher',
      lookupKey: 'classes',
      example: 'Grade 1 A',
    },
  ],
};

// Opening Balances Import Columns
export const OPENING_BALANCES_IMPORT_DEFINITION: ImportDefinition = {
  importType: 'opening_balances',
  title: 'Opening Balances Import',
  description: 'Import student fee balances from your previous system',
  columns: [
    {
      name: 'admission_number',
      label: 'Admission Number',
      required: true,
      type: 'text',
      description: "Student's admission number (must exist in system)",
      example: 'STU001',
    },
    {
      name: 'amount',
      label: 'Amount',
      required: true,
      type: 'number',
      description: 'Opening balance amount. Use positive for amounts owed, negative for credits.',
      example: '15000',
    },
    {
      name: 'balance_date',
      label: 'Balance Date',
      required: true,
      type: 'date',
      description: 'Date the balance was recorded (cutover date)',
      format: 'YYYY-MM-DD',
      example: '2024-01-01',
    },
    {
      name: 'description',
      label: 'Description',
      required: false,
      type: 'text',
      description: 'Optional note about the balance',
      example: 'Balance carried forward from previous system',
    },
  ],
};

// Historical Payments Import Columns
export const HISTORICAL_PAYMENTS_IMPORT_DEFINITION: ImportDefinition = {
  importType: 'historical_payments',
  title: 'Historical Payments Import',
  description: 'Import payment records from your previous system',
  columns: [
    {
      name: 'admission_number',
      label: 'Admission Number',
      required: true,
      type: 'text',
      description: "Student's admission number (must exist in system)",
      example: 'STU001',
    },
    {
      name: 'payment_date',
      label: 'Payment Date',
      required: true,
      type: 'date',
      description: 'Date the payment was made',
      format: 'YYYY-MM-DD',
      example: '2024-01-15',
    },
    {
      name: 'amount',
      label: 'Amount',
      required: true,
      type: 'number',
      description: 'Payment amount in your local currency',
      example: '10000',
    },
    {
      name: 'payment_method',
      label: 'Payment Method',
      required: true,
      type: 'list',
      description: 'How the payment was made',
      options: ['cash', 'bank_transfer', 'mpesa', 'cheque', 'card', 'other'],
      example: 'mpesa',
    },
    {
      name: 'receipt_number',
      label: 'Receipt Number',
      required: false,
      type: 'text',
      description: 'Original receipt number from previous system',
      example: 'RCP-2024-001',
    },
    {
      name: 'transaction_reference',
      label: 'Transaction Reference',
      required: false,
      type: 'text',
      description: 'M-PESA code, cheque number, or bank reference',
      example: 'QBC123456',
    },
    {
      name: 'notes',
      label: 'Notes',
      required: false,
      type: 'text',
      description: 'Additional payment notes',
      example: 'Term 1 fees',
    },
  ],
};

// Historical Grades Import Columns
export const HISTORICAL_GRADES_IMPORT_DEFINITION: ImportDefinition = {
  importType: 'historical_grades',
  title: 'Historical Grades Import',
  description: 'Import exam grades from your previous system',
  columns: [
    {
      name: 'admission_number',
      label: 'Admission Number',
      required: true,
      type: 'text',
      description: "Student's admission number (must exist in system)",
      example: 'STU001',
    },
    {
      name: 'academic_year',
      label: 'Academic Year',
      required: true,
      type: 'text',
      description: 'Year or year range (e.g., "2024" or "2023-2024")',
      example: '2024',
    },
    {
      name: 'term',
      label: 'Term',
      required: true,
      type: 'text',
      description: 'Term name (e.g., "Term 1", "Semester 1")',
      example: 'Term 1',
    },
    {
      name: 'exam_name',
      label: 'Exam Name',
      required: true,
      type: 'text',
      description: 'Name of the exam (e.g., "Mid-Term", "End Term")',
      example: 'Mid-Term Exam',
    },
    {
      name: 'subject_code',
      label: 'Subject Code',
      required: true,
      type: 'lookup',
      description: 'Subject code (must exist in system)',
      lookupKey: 'subjects',
      example: 'MATH',
    },
    {
      name: 'marks',
      label: 'Marks',
      required: true,
      type: 'number',
      description: 'Score obtained (0-100)',
      example: '85',
    },
    {
      name: 'grade',
      label: 'Grade',
      required: false,
      type: 'text',
      description: 'Letter grade (optional, can be calculated)',
      example: 'A',
    },
    {
      name: 'remarks',
      label: 'Remarks',
      required: false,
      type: 'text',
      description: "Teacher's comments",
      example: 'Excellent performance',
    },
  ],
};

// Historical Attendance Import Columns
export const HISTORICAL_ATTENDANCE_IMPORT_DEFINITION: ImportDefinition = {
  importType: 'historical_attendance',
  title: 'Historical Attendance Import',
  description: 'Import attendance records from your previous system',
  columns: [
    {
      name: 'admission_number',
      label: 'Admission Number',
      required: true,
      type: 'text',
      description: "Student's admission number (must exist in system)",
      example: 'STU001',
    },
    {
      name: 'date',
      label: 'Date',
      required: true,
      type: 'date',
      description: 'Attendance date',
      format: 'YYYY-MM-DD or DD-MM-YYYY',
      example: '2024-01-15',
    },
    {
      name: 'status',
      label: 'Status',
      required: true,
      type: 'list',
      description: 'Attendance status',
      options: ['present', 'absent', 'late', 'excused'],
      example: 'present',
    },
    {
      name: 'notes',
      label: 'Notes',
      required: false,
      type: 'text',
      description: 'Additional notes (e.g., reason for absence)',
      example: 'Medical appointment',
    },
  ],
};

// Student Update Columns (for bulk update workflow)
export const STUDENT_UPDATE_DEFINITION: ImportDefinition = {
  importType: 'student_update',
  title: 'Student Update',
  description: 'Update existing student records using admission number as identifier',
  columns: [
    {
      name: 'admission_number',
      label: 'Admission Number',
      required: true,
      type: 'text',
      description: 'Unique identifier - DO NOT MODIFY (used to match existing records)',
      example: 'STU001',
    },
    {
      name: 'first_name',
      label: 'First Name',
      required: false,
      type: 'text',
      description: "Update student's first name",
      example: 'John',
    },
    {
      name: 'middle_name',
      label: 'Middle Name',
      required: false,
      type: 'text',
      description: "Update student's middle name",
      example: 'William',
    },
    {
      name: 'last_name',
      label: 'Last Name',
      required: false,
      type: 'text',
      description: "Update student's last name",
      example: 'Doe',
    },
    {
      name: 'gender',
      label: 'Gender',
      required: false,
      type: 'list',
      description: "Update student's gender",
      options: ['male', 'female', 'other'],
    },
    {
      name: 'date_of_birth',
      label: 'Date of Birth',
      required: false,
      type: 'date',
      description: "Update student's date of birth",
      format: 'YYYY-MM-DD',
      example: '2010-05-15',
    },
    {
      name: 'nationality',
      label: 'Nationality',
      required: false,
      type: 'text',
      description: "Update student's nationality",
      example: 'Kenyan',
    },
    {
      name: 'class_name',
      label: 'Class Name',
      required: false,
      type: 'lookup',
      description: 'Move student to a different class (must match existing class)',
      lookupKey: 'classes',
      example: 'Grade 2 A',
    },
    {
      name: 'boarding_status',
      label: 'Boarding Status',
      required: false,
      type: 'list',
      description: "Update student's boarding status",
      options: ['day', 'boarding', 'day_boarding'],
    },
    {
      name: 'status',
      label: 'Status',
      required: false,
      type: 'list',
      description: "Update student's enrollment status",
      options: ['active', 'graduated', 'transferred', 'suspended', 'withdrawn'],
    },
  ],
};

// Parent Update Columns (for bulk update workflow)
export const PARENT_UPDATE_DEFINITION: ImportDefinition = {
  importType: 'parent_update',
  title: 'Parent Update',
  description: 'Update existing parent records using phone number as identifier',
  columns: [
    {
      name: 'phone',
      label: 'Phone Number',
      required: true,
      type: 'phone',
      description: 'Unique identifier - DO NOT MODIFY (used to match existing records)',
      example: '+254712345678',
    },
    {
      name: 'first_name',
      label: 'First Name',
      required: false,
      type: 'text',
      description: "Update parent's first name",
      example: 'Jane',
    },
    {
      name: 'last_name',
      label: 'Last Name',
      required: false,
      type: 'text',
      description: "Update parent's last name",
      example: 'Doe',
    },
    {
      name: 'email',
      label: 'Email',
      required: false,
      type: 'email',
      description: "Update parent's email address",
      example: 'jane@email.com',
    },
    {
      name: 'relationship_type',
      label: 'Relationship',
      required: false,
      type: 'list',
      description: 'Default relationship type to students',
      options: ['father', 'mother', 'guardian', 'parent', 'uncle', 'aunt', 'grandparent', 'other'],
    },
    {
      name: 'occupation',
      label: 'Occupation',
      required: false,
      type: 'text',
      description: "Update parent's occupation/profession",
      example: 'Teacher',
    },
    {
      name: 'address',
      label: 'Address',
      required: false,
      type: 'text',
      description: "Update parent's physical address",
      example: '123 Main St, Nairobi',
    },
  ],
};

// Staff Update Columns (for bulk update workflow)
export const STAFF_UPDATE_DEFINITION: ImportDefinition = {
  importType: 'staff_update',
  title: 'Staff Update',
  description: 'Update existing staff records using employee number as identifier',
  columns: [
    {
      name: 'employee_number',
      label: 'Employee Number',
      required: true,
      type: 'text',
      description: 'Unique identifier - DO NOT MODIFY (used to match existing records)',
      example: 'EMP001',
    },
    {
      name: 'first_name',
      label: 'First Name',
      required: false,
      type: 'text',
      description: "Update staff member's first name",
      example: 'John',
    },
    {
      name: 'middle_name',
      label: 'Middle Name',
      required: false,
      type: 'text',
      description: "Update staff member's middle name",
      example: 'William',
    },
    {
      name: 'last_name',
      label: 'Last Name',
      required: false,
      type: 'text',
      description: "Update staff member's last name",
      example: 'Smith',
    },
    {
      name: 'email',
      label: 'Email',
      required: false,
      type: 'email',
      description: "Update staff member's email address",
      example: 'john.smith@school.edu',
    },
    {
      name: 'phone',
      label: 'Phone',
      required: false,
      type: 'phone',
      description: "Update staff member's phone number",
      example: '+254712345678',
    },
    {
      name: 'department',
      label: 'Department',
      required: false,
      type: 'list',
      description: "Update staff member's department",
      options: ['Teaching', 'Administration', 'Finance', 'IT', 'Support', 'Library', 'Laboratory', 'Sports', 'Other'],
    },
    {
      name: 'designation',
      label: 'Designation',
      required: false,
      type: 'text',
      description: 'Job title or designation',
      example: 'Senior Teacher',
    },
    {
      name: 'employment_type',
      label: 'Employment Type',
      required: false,
      type: 'list',
      description: 'Type of employment',
      options: ['permanent', 'contract', 'temporary', 'intern'],
    },
    {
      name: 'date_joined',
      label: 'Date Joined',
      required: false,
      type: 'date',
      description: 'Date staff joined the institution',
      format: 'YYYY-MM-DD',
      example: '2024-01-15',
    },
    {
      name: 'is_active',
      label: 'Is Active',
      required: false,
      type: 'list',
      description: 'Whether staff is currently active',
      options: ['true', 'false'],
    },
  ],
};

// Question Bank Import Columns
export const QUESTION_IMPORT_DEFINITION: ImportDefinition = {
  importType: 'questions',
  title: 'Question Bank Import',
  description: 'Import questions for exams with support for MCQ, short answer, and essay types',
  columns: [
    {
      name: 'subject_code',
      label: 'Subject Code',
      required: true,
      type: 'lookup',
      description: 'Subject code (e.g., MATH, ENG). Must exist in system.',
      lookupKey: 'subjects',
      example: 'MATH',
    },
    {
      name: 'topic',
      label: 'Topic',
      required: true,
      type: 'text',
      description: 'Topic or chapter the question belongs to',
      example: 'Fractions',
    },
    {
      name: 'question_type',
      label: 'Question Type',
      required: true,
      type: 'list',
      description: 'Type of question',
      options: ['multiple_choice', 'short_answer', 'long_answer', 'fill_blank', 'true_false', 'matching'],
      example: 'multiple_choice',
    },
    {
      name: 'question_text',
      label: 'Question Text',
      required: true,
      type: 'text',
      description: 'The question to be asked',
      example: 'What is 1/2 + 1/4?',
    },
    {
      name: 'option_a',
      label: 'Option A',
      required: false,
      type: 'text',
      description: 'First option (for MCQ)',
      example: '3/4',
    },
    {
      name: 'option_b',
      label: 'Option B',
      required: false,
      type: 'text',
      description: 'Second option (for MCQ)',
      example: '1/2',
    },
    {
      name: 'option_c',
      label: 'Option C',
      required: false,
      type: 'text',
      description: 'Third option (for MCQ)',
      example: '1/4',
    },
    {
      name: 'option_d',
      label: 'Option D',
      required: false,
      type: 'text',
      description: 'Fourth option (for MCQ)',
      example: '2/3',
    },
    {
      name: 'correct_answer',
      label: 'Correct Answer',
      required: true,
      type: 'text',
      description: 'For MCQ: A, B, C, or D. For others: the answer text.',
      example: 'A',
    },
    {
      name: 'marks',
      label: 'Marks',
      required: true,
      type: 'number',
      description: 'Points awarded for correct answer',
      example: '1',
    },
    {
      name: 'difficulty',
      label: 'Difficulty',
      required: true,
      type: 'list',
      description: 'Difficulty level of the question',
      options: ['easy', 'medium', 'hard'],
      example: 'easy',
    },
    {
      name: 'cognitive_level',
      label: 'Cognitive Level',
      required: false,
      type: 'list',
      description: "Bloom's taxonomy level",
      options: ['knowledge', 'comprehension', 'application', 'analysis', 'synthesis', 'evaluation'],
      example: 'knowledge',
    },
    {
      name: 'explanation',
      label: 'Explanation',
      required: false,
      type: 'text',
      description: 'Explanation of the correct answer',
      example: 'Add by finding common denominator: 2/4 + 1/4 = 3/4',
    },
    {
      name: 'tags',
      label: 'Tags',
      required: false,
      type: 'text',
      description: 'Semicolon-separated tags for categorization',
      example: 'arithmetic;fractions;addition',
    },
  ],
};

// Question Bank Update Columns (includes id for matching)
export const QUESTION_UPDATE_DEFINITION: ImportDefinition = {
  importType: 'question_update',
  title: 'Question Bank Update',
  description: 'Update existing questions by ID. Only include columns you want to change.',
  columns: [
    {
      name: 'id',
      label: 'Question ID',
      required: true,
      type: 'text',
      description: 'Unique question ID (from export). DO NOT CHANGE.',
      example: 'uuid-here',
    },
    {
      name: 'topic',
      label: 'Topic',
      required: false,
      type: 'text',
      description: 'Topic or chapter',
      example: 'Fractions',
    },
    {
      name: 'question_text',
      label: 'Question Text',
      required: false,
      type: 'text',
      description: 'The question text',
      example: 'What is 1/2 + 1/4?',
    },
    {
      name: 'marks',
      label: 'Marks',
      required: false,
      type: 'number',
      description: 'Points awarded',
      example: '1',
    },
    {
      name: 'difficulty',
      label: 'Difficulty',
      required: false,
      type: 'list',
      description: 'Difficulty level',
      options: ['easy', 'medium', 'hard'],
      example: 'easy',
    },
    {
      name: 'cognitive_level',
      label: 'Cognitive Level',
      required: false,
      type: 'list',
      description: "Bloom's taxonomy level",
      options: ['knowledge', 'comprehension', 'application', 'analysis', 'synthesis', 'evaluation'],
      example: 'knowledge',
    },
    {
      name: 'explanation',
      label: 'Explanation',
      required: false,
      type: 'text',
      description: 'Explanation of answer',
      example: 'Add by finding common denominator',
    },
    {
      name: 'is_active',
      label: 'Is Active',
      required: false,
      type: 'list',
      description: 'Whether question is active',
      options: ['true', 'false'],
      example: 'true',
    },
  ],
};

// Export all definitions for easy access
export const IMPORT_DEFINITIONS: Record<string, ImportDefinition> = {
  students: STUDENT_IMPORT_DEFINITION,
  student_update: STUDENT_UPDATE_DEFINITION,
  parents: PARENT_IMPORT_DEFINITION,
  parent_update: PARENT_UPDATE_DEFINITION,
  staff: STAFF_IMPORT_DEFINITION,
  staff_update: STAFF_UPDATE_DEFINITION,
  opening_balances: OPENING_BALANCES_IMPORT_DEFINITION,
  historical_payments: HISTORICAL_PAYMENTS_IMPORT_DEFINITION,
  historical_grades: HISTORICAL_GRADES_IMPORT_DEFINITION,
  historical_attendance: HISTORICAL_ATTENDANCE_IMPORT_DEFINITION,
  questions: QUESTION_IMPORT_DEFINITION,
  question_update: QUESTION_UPDATE_DEFINITION,
};

// Helper to get required columns
export function getRequiredColumns(importType: string): string[] {
  const definition = IMPORT_DEFINITIONS[importType];
  if (!definition) return [];
  return definition.columns.filter(c => c.required).map(c => c.name);
}

// Helper to get optional columns
export function getOptionalColumns(importType: string): string[] {
  const definition = IMPORT_DEFINITIONS[importType];
  if (!definition) return [];
  return definition.columns.filter(c => !c.required).map(c => c.name);
}

// Helper to get all columns
export function getAllColumns(importType: string): string[] {
  const definition = IMPORT_DEFINITIONS[importType];
  if (!definition) return [];
  return definition.columns.map(c => c.name);
}

// Helper to generate CSV template with comments
export function generateTemplateCSV(importType: string, dynamicData?: Record<string, string[]>): string {
  const definition = IMPORT_DEFINITIONS[importType];
  if (!definition) return '';

  const lines: string[] = [];
  
  // Header row
  const headers = definition.columns.map(c => c.name);
  lines.push(headers.join(','));
  
  // Example rows
  const exampleRow = definition.columns.map(c => c.example || '').join(',');
  lines.push(exampleRow);

  return lines.join('\n');
}

// Helper to format validation error with suggestions
export function formatValidationError(
  field: string, 
  value: string, 
  importType: string
): string {
  const definition = IMPORT_DEFINITIONS[importType];
  if (!definition) return `Invalid value for ${field}`;

  const column = definition.columns.find(c => c.name === field);
  if (!column) return `Invalid value for ${field}`;

  if (column.options && column.options.length > 0) {
    return `Invalid ${column.label} "${value}". Valid options: ${column.options.join(', ')}`;
  }

  if (column.format) {
    return `Invalid ${column.label} "${value}". Expected format: ${column.format}`;
  }

  return `Invalid ${column.label}: ${value}`;
}
