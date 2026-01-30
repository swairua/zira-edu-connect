// Parent Portal Type Definitions

export interface StudentScore {
  id: string;
  marks: number | null;
  grade: string | null;
  remarks: string | null;
  exams: Exam | null;
  subjects: Subject | null;
}

export interface Exam {
  id: string;
  name: string;
  exam_type: string;
  max_marks: number | null;
  status: string | null;
  academic_years: { name: string } | null;
  terms: { name: string } | null;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface ExamGroup {
  exam: Exam;
  scores: StudentScore[];
  average?: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  total_amount: number;
  due_date: string;
  status: string | null;
  created_at: string | null;
  currency: string | null;
  academic_years: { name: string } | null;
  terms: { name: string } | null;
  invoice_lines: InvoiceLine[];
}

export interface InvoiceLine {
  id: string;
  description: string;
  unit_amount: number;
  quantity: number | null;
  total_amount: number;
}

export interface Payment {
  id: string;
  receipt_number: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  transaction_reference: string | null;
  status: string | null;
  currency: string | null;
}

export interface Announcement {
  id: string;
  content: string;
  recipient_type: string;
  sent_at: string | null;
  created_at: string | null;
  status: string | null;
}

export interface FeeBalance {
  totalInvoiced: number;
  totalPaid: number;
  balance: number;
  isPaid: boolean;
}

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
}
