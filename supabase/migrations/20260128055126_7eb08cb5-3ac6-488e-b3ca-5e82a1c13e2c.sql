
-- Phase 2: Question Bank System
-- Create enums, tables, and RLS policies

-- Question type enum
CREATE TYPE question_type AS ENUM (
  'multiple_choice',
  'short_answer',
  'long_answer',
  'fill_blank',
  'matching',
  'true_false'
);

-- Difficulty level enum
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');

-- Cognitive level enum (Bloom's Taxonomy)
CREATE TYPE cognitive_level AS ENUM (
  'knowledge',
  'comprehension',
  'application',
  'analysis',
  'synthesis',
  'evaluation'
);

-- Question bank table
CREATE TABLE question_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  sub_strand_id UUID REFERENCES cbc_sub_strands(id) ON DELETE SET NULL,
  topic TEXT NOT NULL,
  question_type question_type NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB, -- For MCQ: [{label: "A", text: "...", is_correct: true}]
  correct_answer TEXT, -- For non-MCQ answers
  marks INTEGER NOT NULL DEFAULT 1,
  difficulty difficulty_level NOT NULL DEFAULT 'medium',
  cognitive_level cognitive_level NOT NULL DEFAULT 'knowledge',
  image_url TEXT,
  explanation TEXT, -- Marking guide/explanation
  tags TEXT[] DEFAULT '{}',
  usage_count INTEGER DEFAULT 0, -- Track how many times used
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES staff(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;

-- RLS Policies for question_bank
CREATE POLICY "Users can view questions from their institution"
  ON question_bank FOR SELECT
  USING (public.has_permission(auth.uid(), 'academics', 'view', institution_id));

CREATE POLICY "Users can create questions in their institution"
  ON question_bank FOR INSERT
  WITH CHECK (public.has_permission(auth.uid(), 'academics', 'create', institution_id));

CREATE POLICY "Users can update questions in their institution"
  ON question_bank FOR UPDATE
  USING (public.has_permission(auth.uid(), 'academics', 'edit', institution_id));

CREATE POLICY "Users can delete questions in their institution"
  ON question_bank FOR DELETE
  USING (public.has_permission(auth.uid(), 'academics', 'delete', institution_id));

-- Indexes for performance
CREATE INDEX idx_question_bank_institution ON question_bank(institution_id);
CREATE INDEX idx_question_bank_subject ON question_bank(subject_id);
CREATE INDEX idx_question_bank_sub_strand ON question_bank(sub_strand_id);
CREATE INDEX idx_question_bank_difficulty ON question_bank(difficulty);
CREATE INDEX idx_question_bank_type ON question_bank(question_type);
CREATE INDEX idx_question_bank_tags ON question_bank USING GIN(tags);

-- Trigger for updated_at
CREATE TRIGGER update_question_bank_updated_at
  BEFORE UPDATE ON question_bank
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Phase 3: Exam Paper Builder Tables
-- ===========================================

-- Exam paper status enum
CREATE TYPE exam_paper_status AS ENUM ('draft', 'finalized', 'archived');

-- Exam papers table
CREATE TABLE exam_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES exams(id) ON DELETE SET NULL,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  instructions TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 120,
  total_marks INTEGER NOT NULL DEFAULT 100,
  sections JSONB DEFAULT '[]'::jsonb, -- [{name: "Section A", instructions: "...", marks: 30}]
  status exam_paper_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES staff(id) ON DELETE SET NULL,
  finalized_at TIMESTAMPTZ,
  finalized_by UUID REFERENCES staff(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE exam_papers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exam_papers
CREATE POLICY "Users can view exam papers from their institution"
  ON exam_papers FOR SELECT
  USING (public.has_permission(auth.uid(), 'academics', 'view', institution_id));

CREATE POLICY "Users can create exam papers in their institution"
  ON exam_papers FOR INSERT
  WITH CHECK (public.has_permission(auth.uid(), 'academics', 'create', institution_id));

CREATE POLICY "Users can update exam papers in their institution"
  ON exam_papers FOR UPDATE
  USING (public.has_permission(auth.uid(), 'academics', 'edit', institution_id));

CREATE POLICY "Users can delete exam papers in their institution"
  ON exam_papers FOR DELETE
  USING (public.has_permission(auth.uid(), 'academics', 'delete', institution_id));

-- Exam paper questions (link questions to papers)
CREATE TABLE exam_paper_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_paper_id UUID NOT NULL REFERENCES exam_papers(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES question_bank(id) ON DELETE CASCADE,
  section_index INTEGER NOT NULL DEFAULT 0,
  question_order INTEGER NOT NULL,
  marks_override INTEGER, -- Override the question's default marks
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(exam_paper_id, question_id)
);

-- Enable RLS
ALTER TABLE exam_paper_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (inherit from exam_papers)
CREATE POLICY "Users can view exam paper questions"
  ON exam_paper_questions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM exam_papers ep 
    WHERE ep.id = exam_paper_id 
    AND public.has_permission(auth.uid(), 'academics', 'view', ep.institution_id)
  ));

CREATE POLICY "Users can manage exam paper questions"
  ON exam_paper_questions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM exam_papers ep 
    WHERE ep.id = exam_paper_id 
    AND public.has_permission(auth.uid(), 'academics', 'edit', ep.institution_id)
  ));

-- Indexes for exam papers
CREATE INDEX idx_exam_papers_institution ON exam_papers(institution_id);
CREATE INDEX idx_exam_papers_exam ON exam_papers(exam_id);
CREATE INDEX idx_exam_papers_subject ON exam_papers(subject_id);
CREATE INDEX idx_exam_paper_questions_paper ON exam_paper_questions(exam_paper_id);
CREATE INDEX idx_exam_paper_questions_question ON exam_paper_questions(question_id);

-- Trigger for updated_at
CREATE TRIGGER update_exam_papers_updated_at
  BEFORE UPDATE ON exam_papers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to increment question usage count
CREATE OR REPLACE FUNCTION increment_question_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE question_bank 
  SET usage_count = usage_count + 1 
  WHERE id = NEW.question_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER increment_question_usage_on_add
  AFTER INSERT ON exam_paper_questions
  FOR EACH ROW
  EXECUTE FUNCTION increment_question_usage();
