// Lesson Planning Types
import { CBCCompetency, CBCValue, CBCStrand, CBCSubStrand } from './cbc';

export type LessonPlanStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'revised';
export type SchemeStatus = 'draft' | 'submitted' | 'active' | 'rejected' | 'archived';

export interface SchemeOfWork {
  id: string;
  institution_id: string;
  teacher_id: string | null;
  subject_id: string;
  class_id: string;
  academic_year_id: string;
  term_id: string;
  title: string;
  description: string | null;
  total_weeks: number;
  status: SchemeStatus;
  submitted_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  subject?: { id: string; name: string; code: string };
  class?: { id: string; name: string; level: string };
  term?: { id: string; name: string };
  teacher?: { id: string; first_name: string; last_name: string };
  entries?: SchemeEntry[];
}

export interface SchemeEntry {
  id: string;
  scheme_id: string;
  week_number: number;
  strand_id: string | null;
  sub_strand_id: string | null;
  topic: string;
  sub_topic: string | null;
  objectives: string[];
  learning_activities: string[];
  teaching_resources: string[];
  assessment_methods: string[];
  remarks: string | null;
  lessons_allocated: number;
  created_at: string;
  updated_at: string;
  // Joined data
  strand?: CBCStrand;
  sub_strand?: CBCSubStrand;
}

export interface LessonDevelopmentStep {
  step: number;
  activity: string;
  time: string;
  resources?: string;
  teacher_activity?: string;
  learner_activity?: string;
}

export interface TeachingAid {
  name: string;
  type: 'physical' | 'digital' | 'printed' | 'other';
  source?: string;
}

export interface AssessmentMethod {
  method: string;
  description?: string;
  criteria?: string;
}

export interface LessonPlan {
  id: string;
  institution_id: string;
  teacher_id: string;
  subject_id: string;
  class_id: string;
  academic_year_id: string | null;
  term_id: string | null;
  
  // Timing
  lesson_date: string;
  week_number: number | null;
  lesson_number: number | null;
  duration_minutes: number;
  timetable_entry_id: string | null;
  
  // CBC Alignment
  strand_id: string | null;
  sub_strand_id: string | null;
  scheme_entry_id: string | null;
  
  // Lesson Content
  topic: string;
  sub_topic: string | null;
  lesson_objectives: string[];
  
  // Lesson Structure
  introduction: string | null;
  lesson_development: LessonDevelopmentStep[];
  conclusion: string | null;
  
  // Resources and Methods
  teaching_aids: TeachingAid[];
  learning_resources: Record<string, unknown>[];
  teaching_methods: string[];
  
  // CBC Elements
  core_competencies: CBCCompetency[];
  values: CBCValue[];
  pertinent_contemporary_issues: string[] | null;
  
  // Differentiation
  differentiation_notes: string | null;
  special_needs_accommodations: string | null;
  
  // Assessment
  assessment_methods: AssessmentMethod[];
  expected_outcomes: string | null;
  
  // Reflection
  reflection: string | null;
  challenges_faced: string | null;
  learner_achievement: string | null;
  follow_up_actions: string | null;
  
  // Status
  status: LessonPlanStatus;
  submitted_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  
  created_at: string;
  updated_at: string;
  
  // Joined data
  subject?: { id: string; name: string; code: string };
  class?: { id: string; name: string; level: string };
  term?: { id: string; name: string };
  teacher?: { id: string; first_name: string; last_name: string };
  strand?: CBCStrand;
  sub_strand?: CBCSubStrand;
  approver?: { id: string; first_name: string; last_name: string };
}

export interface LessonPlanTemplate {
  id: string;
  institution_id: string;
  created_by: string | null;
  name: string;
  description: string | null;
  subject_code: string | null;
  level: string | null;
  lesson_structure: Record<string, unknown>;
  teaching_methods: string[];
  is_shared: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

// Insert types
export type SchemeOfWorkInsert = Omit<SchemeOfWork, 'id' | 'created_at' | 'updated_at' | 'subject' | 'class' | 'term' | 'teacher' | 'entries'>;
export type SchemeEntryInsert = Omit<SchemeEntry, 'id' | 'created_at' | 'updated_at' | 'strand' | 'sub_strand'>;
export type LessonPlanInsert = Omit<LessonPlan, 'id' | 'created_at' | 'updated_at' | 'subject' | 'class' | 'term' | 'teacher' | 'strand' | 'sub_strand' | 'approver'>;

// Status display helpers
export const lessonPlanStatusLabels: Record<LessonPlanStatus, string> = {
  draft: 'Draft',
  submitted: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  revised: 'Revised',
};

export const lessonPlanStatusVariants: Record<LessonPlanStatus, 'default' | 'secondary' | 'success' | 'destructive' | 'warning'> = {
  draft: 'secondary',
  submitted: 'warning',
  approved: 'success',
  rejected: 'destructive',
  revised: 'default',
};

export const schemeStatusLabels: Record<SchemeStatus, string> = {
  draft: 'Draft',
  submitted: 'Pending Approval',
  active: 'Active',
  rejected: 'Rejected',
  archived: 'Archived',
};

// Teaching methods options
export const TEACHING_METHODS = [
  'Discussion',
  'Demonstration',
  'Group Work',
  'Pair Work',
  'Individual Work',
  'Question & Answer',
  'Role Play',
  'Storytelling',
  'Problem Solving',
  'Discovery Learning',
  'Experimentation',
  'Field Trip',
  'Multimedia',
  'Games',
  'Project-Based',
  'Peer Teaching',
] as const;

// Assessment method options
export const ASSESSMENT_METHODS = [
  'Oral Questions',
  'Written Exercise',
  'Observation',
  'Practical Activity',
  'Project',
  'Portfolio',
  'Peer Assessment',
  'Self-Assessment',
  'Quiz',
  'Assignment',
  'Group Presentation',
] as const;
