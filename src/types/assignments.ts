// Assignment Module Types

export interface Assignment {
  id: string;
  institution_id: string;
  class_id: string;
  subject_id: string;
  academic_year_id: string | null;
  term_id: string | null;
  title: string;
  description: string | null;
  submission_type: 'file' | 'text' | 'both';
  allowed_file_types: string[];
  max_file_size_mb: number;
  due_date: string;
  allow_late_submission: boolean;
  allow_resubmission: boolean;
  status: 'draft' | 'published' | 'closed';
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations
  class?: {
    id: string;
    name: string;
    level: string;
  };
  subject?: {
    id: string;
    name: string;
    code: string;
  };
  academic_year?: {
    id: string;
    name: string;
  };
  term?: {
    id: string;
    name: string;
  };
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  institution_id: string;
  submitted_by_user_id: string | null;
  submitted_by_type: 'student' | 'parent';
  submitted_by_parent_id: string | null;
  submission_type: 'file' | 'text';
  text_content: string | null;
  file_url: string | null;
  file_name: string | null;
  file_size_bytes: number | null;
  status: 'draft' | 'submitted' | 'late' | 'graded';
  submitted_at: string | null;
  is_late: boolean;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Joined relations
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    admission_number: string;
  };
  parent?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  assignment?: Assignment;
}

export interface AssignmentSettings {
  enabled: boolean;
  allow_parent_submission: boolean;
  default_max_file_size_mb: number;
  allowed_file_types: string[];
  default_allow_late: boolean;
  default_allow_resubmission: boolean;
}

export interface AssignmentWithSubmission extends Assignment {
  submission?: AssignmentSubmission | null;
}

export interface CreateAssignmentInput {
  institution_id: string;
  class_id: string;
  subject_id: string;
  academic_year_id?: string;
  term_id?: string;
  title: string;
  description?: string;
  submission_type: 'file' | 'text' | 'both';
  allowed_file_types?: string[];
  max_file_size_mb?: number;
  due_date: string;
  allow_late_submission?: boolean;
  allow_resubmission?: boolean;
}

export interface SubmitAssignmentInput {
  assignment_id: string;
  student_id: string;
  submission_type: 'file' | 'text';
  text_content?: string;
  file?: File;
}

export const DEFAULT_ALLOWED_FILE_TYPES = ['pdf', 'docx', 'doc', 'jpg', 'jpeg', 'png'];
export const DEFAULT_MAX_FILE_SIZE_MB = 10;
