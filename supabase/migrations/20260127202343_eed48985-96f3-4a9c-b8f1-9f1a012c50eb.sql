-- CBC Strands and Sub-strands Foundation Tables
-- Based on Kenya's Competency-Based Curriculum (KICD) structure

-- CBC Core Competencies enum
CREATE TYPE cbc_competency AS ENUM (
  'communication',
  'critical_thinking',
  'creativity',
  'citizenship',
  'digital_literacy',
  'learning_to_learn',
  'self_efficacy'
);

-- CBC Values enum
CREATE TYPE cbc_value AS ENUM (
  'love',
  'responsibility',
  'respect',
  'unity',
  'peace',
  'patriotism',
  'social_justice',
  'integrity'
);

-- CBC Education Level
CREATE TYPE cbc_level AS ENUM (
  'pp1',
  'pp2',
  'grade_1',
  'grade_2',
  'grade_3',
  'grade_4',
  'grade_5',
  'grade_6',
  'grade_7',
  'grade_8',
  'grade_9',
  'grade_10',
  'grade_11',
  'grade_12'
);

-- CBC Strands (Main Topics/Themes within a Learning Area)
CREATE TABLE cbc_strands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_code TEXT NOT NULL, -- e.g., 'MATH', 'ENG', 'SCI'
  level cbc_level NOT NULL,
  strand_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  suggested_time_allocation TEXT, -- e.g., '12 lessons'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subject_code, level, strand_number)
);

-- CBC Sub-strands (Sub-topics within a Strand)
CREATE TABLE cbc_sub_strands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strand_id UUID REFERENCES cbc_strands(id) ON DELETE CASCADE NOT NULL,
  sub_strand_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  specific_learning_outcomes JSONB DEFAULT '[]'::jsonb, -- Array of SLOs
  key_inquiry_questions JSONB DEFAULT '[]'::jsonb,
  learning_experiences JSONB DEFAULT '[]'::jsonb,
  core_competencies cbc_competency[] DEFAULT '{}',
  values cbc_value[] DEFAULT '{}',
  pertinent_contemporary_issues TEXT[], -- PCIs
  suggested_resources JSONB DEFAULT '[]'::jsonb,
  assessment_rubrics JSONB DEFAULT '{}'::jsonb,
  suggested_lesson_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(strand_id, sub_strand_number)
);

-- Link student assessments/scores to sub-strands for granular CBC reporting
CREATE TABLE student_strand_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  sub_strand_id UUID REFERENCES cbc_sub_strands(id) ON DELETE CASCADE NOT NULL,
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE NOT NULL,
  academic_year_id UUID REFERENCES academic_years(id),
  term_id UUID REFERENCES terms(id),
  exam_id UUID REFERENCES exams(id),
  rubric_level TEXT NOT NULL, -- 'EE', 'ME', 'AE', 'BE' (or EE1-BE2 for detailed)
  score_percentage DECIMAL(5,2),
  teacher_remarks TEXT,
  assessed_at TIMESTAMPTZ DEFAULT NOW(),
  assessed_by UUID REFERENCES staff(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, sub_strand_id, exam_id)
);

-- Link assignments to strands/sub-strands for CBC alignment
ALTER TABLE assignments 
  ADD COLUMN strand_id UUID REFERENCES cbc_strands(id),
  ADD COLUMN sub_strand_id UUID REFERENCES cbc_sub_strands(id);

-- Link exams to strands for reporting
ALTER TABLE exams
  ADD COLUMN strand_coverage JSONB DEFAULT '[]'::jsonb; -- Array of {strand_id, weight_percentage}

-- Create indexes for performance
CREATE INDEX idx_cbc_strands_subject_level ON cbc_strands(subject_code, level);
CREATE INDEX idx_cbc_sub_strands_strand ON cbc_sub_strands(strand_id);
CREATE INDEX idx_student_strand_assessments_student ON student_strand_assessments(student_id);
CREATE INDEX idx_student_strand_assessments_sub_strand ON student_strand_assessments(sub_strand_id);
CREATE INDEX idx_student_strand_assessments_exam ON student_strand_assessments(exam_id);
CREATE INDEX idx_assignments_strand ON assignments(strand_id);

-- Enable RLS
ALTER TABLE cbc_strands ENABLE ROW LEVEL SECURITY;
ALTER TABLE cbc_sub_strands ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_strand_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies: CBC strands/sub-strands are public curriculum data (read by all authenticated)
CREATE POLICY "Authenticated users can read CBC strands"
  ON cbc_strands FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can manage CBC strands"
  ON cbc_strands FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Authenticated users can read CBC sub-strands"
  ON cbc_sub_strands FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can manage CBC sub-strands"
  ON cbc_sub_strands FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- Student assessments - institution-scoped
CREATE POLICY "Users can view strand assessments in their institution"
  ON student_strand_assessments FOR SELECT
  TO authenticated
  USING (public.has_permission(auth.uid(), 'academics', 'view', institution_id));

CREATE POLICY "Users can manage strand assessments in their institution"
  ON student_strand_assessments FOR ALL
  TO authenticated
  USING (public.has_permission(auth.uid(), 'academics', 'edit', institution_id));

-- Triggers for updated_at
CREATE TRIGGER update_cbc_strands_updated_at
  BEFORE UPDATE ON cbc_strands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cbc_sub_strands_updated_at
  BEFORE UPDATE ON cbc_sub_strands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_strand_assessments_updated_at
  BEFORE UPDATE ON student_strand_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();