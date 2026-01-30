// Question Bank Types

export type QuestionType = 
  | 'multiple_choice'
  | 'short_answer'
  | 'long_answer'
  | 'fill_blank'
  | 'matching'
  | 'true_false';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type CognitiveLevel = 
  | 'knowledge'
  | 'comprehension'
  | 'application'
  | 'analysis'
  | 'synthesis'
  | 'evaluation';

export interface MCQOption {
  label: string;
  text: string;
  is_correct: boolean;
}

export interface Question {
  id: string;
  institution_id: string;
  subject_id: string;
  sub_strand_id: string | null;
  topic: string;
  question_type: QuestionType;
  question_text: string;
  options: MCQOption[] | null;
  correct_answer: string | null;
  marks: number;
  difficulty: DifficultyLevel;
  cognitive_level: CognitiveLevel;
  image_url: string | null;
  explanation: string | null;
  tags: string[];
  usage_count: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  subject?: { name: string; code: string };
  sub_strand?: { name: string; strand?: { name: string; subject_code: string } };
  creator?: { first_name: string; last_name: string };
}

export type ExamPaperStatus = 'draft' | 'finalized' | 'archived';

export interface ExamPaperSection {
  name: string;
  instructions: string;
  marks: number;
}

export interface ExamPaper {
  id: string;
  institution_id: string;
  exam_id: string | null;
  subject_id: string;
  class_id: string | null;
  title: string;
  instructions: string | null;
  duration_minutes: number;
  total_marks: number;
  sections: ExamPaperSection[];
  status: ExamPaperStatus;
  created_by: string | null;
  finalized_at: string | null;
  finalized_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  subject?: { name: string };
  class?: { name: string };
  exam?: { name: string };
  creator?: { first_name: string; last_name: string };
  question_count?: number;
}

export interface ExamPaperQuestion {
  id: string;
  exam_paper_id: string;
  question_id: string;
  section_index: number;
  question_order: number;
  marks_override: number | null;
  created_at: string;
  // Joined data
  question?: Question;
}

// Display helpers
export const questionTypeLabels: Record<QuestionType, string> = {
  multiple_choice: 'Multiple Choice',
  short_answer: 'Short Answer',
  long_answer: 'Long Answer/Essay',
  fill_blank: 'Fill in the Blank',
  matching: 'Matching',
  true_false: 'True/False',
};

export const difficultyLabels: Record<DifficultyLevel, { label: string; color: string }> = {
  easy: { label: 'Easy', color: 'green' },
  medium: { label: 'Medium', color: 'yellow' },
  hard: { label: 'Hard', color: 'red' },
};

export const cognitiveLevelLabels: Record<CognitiveLevel, string> = {
  knowledge: 'Knowledge (Remember)',
  comprehension: 'Comprehension (Understand)',
  application: 'Application (Apply)',
  analysis: 'Analysis (Analyze)',
  synthesis: 'Synthesis (Create)',
  evaluation: 'Evaluation (Evaluate)',
};

// Question Templates for quick creation
export interface QuestionTemplate {
  id: string;
  label: string;
  icon: string;
  questionType: QuestionType;
  difficulty: DifficultyLevel;
  cognitiveLevel: CognitiveLevel;
  defaultMarks: number;
  optionCount?: number;
}

export const QUESTION_TEMPLATES: QuestionTemplate[] = [
  {
    id: 'quick_mcq_easy',
    label: 'Quick MCQ (Easy)',
    icon: '🟢',
    questionType: 'multiple_choice',
    difficulty: 'easy',
    cognitiveLevel: 'knowledge',
    defaultMarks: 1,
    optionCount: 4,
  },
  {
    id: 'quick_mcq_medium',
    label: 'Quick MCQ (Medium)',
    icon: '🟡',
    questionType: 'multiple_choice',
    difficulty: 'medium',
    cognitiveLevel: 'comprehension',
    defaultMarks: 2,
    optionCount: 4,
  },
  {
    id: 'quick_mcq_hard',
    label: 'Quick MCQ (Hard)',
    icon: '🔴',
    questionType: 'multiple_choice',
    difficulty: 'hard',
    cognitiveLevel: 'application',
    defaultMarks: 3,
    optionCount: 4,
  },
  {
    id: 'true_false',
    label: 'True/False',
    icon: '✓✗',
    questionType: 'true_false',
    difficulty: 'easy',
    cognitiveLevel: 'knowledge',
    defaultMarks: 1,
  },
  {
    id: 'short_answer',
    label: 'Short Answer',
    icon: '📝',
    questionType: 'short_answer',
    difficulty: 'medium',
    cognitiveLevel: 'comprehension',
    defaultMarks: 2,
  },
  {
    id: 'fill_blank',
    label: 'Fill in Blank',
    icon: '___',
    questionType: 'fill_blank',
    difficulty: 'medium',
    cognitiveLevel: 'application',
    defaultMarks: 2,
  },
  {
    id: 'essay',
    label: 'Essay Question',
    icon: '📄',
    questionType: 'long_answer',
    difficulty: 'hard',
    cognitiveLevel: 'evaluation',
    defaultMarks: 10,
  },
];

// Exam Paper Templates
export interface ExamPaperTemplateSection {
  name: string;
  instructions: string;
  marks: number;
  questionTypes?: QuestionType[];
  difficultyDistribution?: { easy: number; medium: number; hard: number };
}

export interface ExamPaperTemplate {
  id: string;
  label: string;
  description: string;
  durationMinutes: number;
  totalMarks: number;
  sections: ExamPaperTemplateSection[];
}

export const EXAM_PAPER_TEMPLATES: ExamPaperTemplate[] = [
  {
    id: 'standard_endterm',
    label: 'Standard End-Term Exam',
    description: '3 sections: MCQ, Short Answer, Essay (100 marks, 2 hours)',
    durationMinutes: 120,
    totalMarks: 100,
    sections: [
      {
        name: 'Section A: Multiple Choice',
        instructions: 'Answer ALL questions. Each question carries 1 mark.',
        marks: 30,
        questionTypes: ['multiple_choice', 'true_false'],
        difficultyDistribution: { easy: 50, medium: 30, hard: 20 },
      },
      {
        name: 'Section B: Short Answer',
        instructions: 'Answer ALL questions.',
        marks: 30,
        questionTypes: ['short_answer', 'fill_blank'],
      },
      {
        name: 'Section C: Essay',
        instructions: 'Answer any TWO questions.',
        marks: 40,
        questionTypes: ['long_answer'],
      },
    ],
  },
  {
    id: 'cat_quiz',
    label: 'CAT/Quiz',
    description: '1 section: MCQ only (30 marks, 30 min)',
    durationMinutes: 30,
    totalMarks: 30,
    sections: [
      {
        name: 'Section A: Multiple Choice',
        instructions: 'Answer ALL questions.',
        marks: 30,
        questionTypes: ['multiple_choice', 'true_false'],
        difficultyDistribution: { easy: 40, medium: 40, hard: 20 },
      },
    ],
  },
  {
    id: 'midterm',
    label: 'Mid-Term Exam',
    description: '2 sections: MCQ + Short Answer (60 marks, 1 hour)',
    durationMinutes: 60,
    totalMarks: 60,
    sections: [
      {
        name: 'Section A: Multiple Choice',
        instructions: 'Answer ALL questions. Each question carries 1 mark.',
        marks: 30,
        questionTypes: ['multiple_choice', 'true_false'],
      },
      {
        name: 'Section B: Short Answer',
        instructions: 'Answer ALL questions.',
        marks: 30,
        questionTypes: ['short_answer', 'fill_blank'],
      },
    ],
  },
  {
    id: 'practical',
    label: 'Practical Exam',
    description: '2 sections: Theory + Practical (50 marks, 90 min)',
    durationMinutes: 90,
    totalMarks: 50,
    sections: [
      {
        name: 'Section A: Theory',
        instructions: 'Answer ALL theory questions.',
        marks: 20,
        questionTypes: ['short_answer', 'multiple_choice'],
      },
      {
        name: 'Section B: Practical',
        instructions: 'Complete all practical tasks.',
        marks: 30,
        questionTypes: ['long_answer'],
      },
    ],
  },
  {
    id: 'custom',
    label: 'Custom Paper',
    description: 'Start with a blank paper and add your own sections',
    durationMinutes: 120,
    totalMarks: 100,
    sections: [
      {
        name: 'Section A',
        instructions: 'Answer all questions.',
        marks: 100,
      },
    ],
  },
];
