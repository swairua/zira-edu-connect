-- Lesson Planning Module Schema
-- Integrates with CBC strands/sub-strands and timetable

-- Lesson Plan Status enum
CREATE TYPE lesson_plan_status AS ENUM ('draft', 'submitted', 'approved', 'rejected', 'revised');

-- Scheme of Work Status
CREATE TYPE scheme_status AS ENUM ('draft', 'active', 'archived');

-- Schemes of Work (Term-level planning)
CREATE TABLE schemes_of_work (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE NOT NULL,
  term_id UUID REFERENCES terms(id) ON DELETE CASCADE NOT NULL,
  
  title TEXT NOT NULL,
  description TEXT,
  total_weeks INTEGER NOT NULL DEFAULT 12,
  status scheme_status DEFAULT 'draft',
  
  -- Approval workflow
  submitted_at TIMESTAMPTZ,
  approved_by UUID REFERENCES staff(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subject_id, class_id, term_id)
);

-- Scheme of Work Entries (Weekly breakdown)
CREATE TABLE scheme_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_id UUID REFERENCES schemes_of_work(id) ON DELETE CASCADE NOT NULL,
  week_number INTEGER NOT NULL,
  
  -- CBC Alignment
  strand_id UUID REFERENCES cbc_strands(id),
  sub_strand_id UUID REFERENCES cbc_sub_strands(id),
  
  topic TEXT NOT NULL,
  sub_topic TEXT,
  objectives JSONB DEFAULT '[]'::jsonb, -- Array of objectives
  learning_activities JSONB DEFAULT '[]'::jsonb,
  teaching_resources JSONB DEFAULT '[]'::jsonb,
  assessment_methods JSONB DEFAULT '[]'::jsonb,
  remarks TEXT,
  lessons_allocated INTEGER DEFAULT 1,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(scheme_id, week_number, topic)
);

-- Lesson Plans (Individual lesson planning)
CREATE TABLE lesson_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES staff(id) ON DELETE SET NULL NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  academic_year_id UUID REFERENCES academic_years(id),
  term_id UUID REFERENCES terms(id),
  
  -- Timing
  lesson_date DATE NOT NULL,
  week_number INTEGER,
  lesson_number INTEGER, -- Lesson within the week
  duration_minutes INTEGER DEFAULT 40,
  timetable_entry_id UUID REFERENCES timetable_entries(id), -- Link to actual slot
  
  -- CBC Alignment
  strand_id UUID REFERENCES cbc_strands(id),
  sub_strand_id UUID REFERENCES cbc_sub_strands(id),
  scheme_entry_id UUID REFERENCES scheme_entries(id), -- Link to scheme of work
  
  -- Lesson Content
  topic TEXT NOT NULL,
  sub_topic TEXT,
  lesson_objectives JSONB DEFAULT '[]'::jsonb, -- Specific lesson objectives
  
  -- Lesson Structure
  introduction TEXT, -- Set induction / lesson opener
  lesson_development JSONB DEFAULT '[]'::jsonb, -- Step-by-step activities [{step, activity, time, resources}]
  conclusion TEXT, -- Summary and closure
  
  -- Resources and Methods
  teaching_aids JSONB DEFAULT '[]'::jsonb, -- [{name, type, source}]
  learning_resources JSONB DEFAULT '[]'::jsonb,
  teaching_methods TEXT[], -- e.g., 'discussion', 'demonstration', 'group_work'
  
  -- CBC Core Competencies and Values
  core_competencies cbc_competency[] DEFAULT '{}',
  values cbc_value[] DEFAULT '{}',
  pertinent_contemporary_issues TEXT[],
  
  -- Differentiation
  differentiation_notes TEXT, -- How to support different learners
  special_needs_accommodations TEXT,
  
  -- Assessment
  assessment_methods JSONB DEFAULT '[]'::jsonb, -- [{method, description}]
  expected_outcomes TEXT,
  
  -- Reflection (filled after lesson)
  reflection TEXT,
  challenges_faced TEXT,
  learner_achievement TEXT, -- How well did learners achieve objectives?
  follow_up_actions TEXT,
  
  -- Status and Workflow
  status lesson_plan_status DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  approved_by UUID REFERENCES staff(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lesson Plan Templates (Reusable templates)
CREATE TABLE lesson_plan_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES staff(id),
  
  name TEXT NOT NULL,
  description TEXT,
  subject_code TEXT, -- Optional: template for specific subject
  level TEXT, -- Optional: template for specific level
  
  -- Template structure (same as lesson plan content)
  lesson_structure JSONB NOT NULL, -- Full template content
  teaching_methods TEXT[],
  
  is_shared BOOLEAN DEFAULT false, -- Shared with other teachers
  is_system BOOLEAN DEFAULT false, -- System-wide template
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_schemes_institution ON schemes_of_work(institution_id);
CREATE INDEX idx_schemes_teacher ON schemes_of_work(teacher_id);
CREATE INDEX idx_schemes_term ON schemes_of_work(term_id);
CREATE INDEX idx_schemes_class_subject ON schemes_of_work(class_id, subject_id);

CREATE INDEX idx_scheme_entries_scheme ON scheme_entries(scheme_id);
CREATE INDEX idx_scheme_entries_week ON scheme_entries(scheme_id, week_number);

CREATE INDEX idx_lesson_plans_institution ON lesson_plans(institution_id);
CREATE INDEX idx_lesson_plans_teacher ON lesson_plans(teacher_id);
CREATE INDEX idx_lesson_plans_date ON lesson_plans(lesson_date);
CREATE INDEX idx_lesson_plans_class_subject ON lesson_plans(class_id, subject_id);
CREATE INDEX idx_lesson_plans_status ON lesson_plans(status);
CREATE INDEX idx_lesson_plans_term ON lesson_plans(term_id);

CREATE INDEX idx_lesson_templates_institution ON lesson_plan_templates(institution_id);

-- Enable RLS
ALTER TABLE schemes_of_work ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheme_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_plan_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Schemes of Work
CREATE POLICY "Users can view schemes in their institution"
  ON schemes_of_work FOR SELECT
  TO authenticated
  USING (public.has_permission(auth.uid(), 'academics', 'view', institution_id));

CREATE POLICY "Teachers can manage their own schemes"
  ON schemes_of_work FOR ALL
  TO authenticated
  USING (
    teacher_id IN (SELECT id FROM staff WHERE user_id = auth.uid())
    OR public.has_permission(auth.uid(), 'academics', 'edit', institution_id)
  );

-- RLS Policies for Scheme Entries
CREATE POLICY "Users can view scheme entries via scheme"
  ON scheme_entries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM schemes_of_work s 
      WHERE s.id = scheme_entries.scheme_id 
      AND public.has_permission(auth.uid(), 'academics', 'view', s.institution_id)
    )
  );

CREATE POLICY "Teachers can manage scheme entries for their schemes"
  ON scheme_entries FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM schemes_of_work s 
      WHERE s.id = scheme_entries.scheme_id 
      AND (
        s.teacher_id IN (SELECT id FROM staff WHERE user_id = auth.uid())
        OR public.has_permission(auth.uid(), 'academics', 'edit', s.institution_id)
      )
    )
  );

-- RLS Policies for Lesson Plans
CREATE POLICY "Users can view lesson plans in their institution"
  ON lesson_plans FOR SELECT
  TO authenticated
  USING (public.has_permission(auth.uid(), 'academics', 'view', institution_id));

CREATE POLICY "Teachers can manage their own lesson plans"
  ON lesson_plans FOR ALL
  TO authenticated
  USING (
    teacher_id IN (SELECT id FROM staff WHERE user_id = auth.uid())
    OR public.has_permission(auth.uid(), 'academics', 'edit', institution_id)
  );

-- RLS Policies for Templates
CREATE POLICY "Users can view templates in their institution"
  ON lesson_plan_templates FOR SELECT
  TO authenticated
  USING (
    is_system = true 
    OR public.has_permission(auth.uid(), 'academics', 'view', institution_id)
  );

CREATE POLICY "Users can manage their own templates"
  ON lesson_plan_templates FOR ALL
  TO authenticated
  USING (
    created_by IN (SELECT id FROM staff WHERE user_id = auth.uid())
    OR public.has_permission(auth.uid(), 'academics', 'edit', institution_id)
  );

-- Triggers for updated_at
CREATE TRIGGER update_schemes_updated_at
  BEFORE UPDATE ON schemes_of_work
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheme_entries_updated_at
  BEFORE UPDATE ON scheme_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_plans_updated_at
  BEFORE UPDATE ON lesson_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_templates_updated_at
  BEFORE UPDATE ON lesson_plan_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();