-- =============================================
-- Phase 4: Digital Diary System
-- =============================================

-- Student Diary Entries table
CREATE TABLE public.student_diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  entry_type TEXT NOT NULL DEFAULT 'daily_report' CHECK (entry_type IN ('daily_report', 'behavior', 'achievement', 'concern', 'health')),
  
  -- Structured fields for young children (PP1-G3)
  mood TEXT CHECK (mood IN ('happy', 'okay', 'tired', 'upset', 'excited')),
  meals JSONB DEFAULT '{}', -- {breakfast: true, snack: true, lunch: true}
  nap_duration_minutes INTEGER,
  activities TEXT[] DEFAULT '{}',
  learning_highlights TEXT,
  
  -- General fields
  teacher_comment TEXT,
  parent_comment TEXT,
  parent_acknowledged_at TIMESTAMPTZ,
  is_flagged BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]', -- [{url, type, name}]
  
  created_by UUID REFERENCES public.staff(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_diary_entries_student ON student_diary_entries(student_id);
CREATE INDEX idx_diary_entries_institution ON student_diary_entries(institution_id);
CREATE INDEX idx_diary_entries_date ON student_diary_entries(entry_date);
CREATE UNIQUE INDEX idx_diary_entries_unique ON student_diary_entries(student_id, entry_date, entry_type);

-- Behavior Records table
CREATE TABLE public.behavior_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  behavior_type TEXT NOT NULL CHECK (behavior_type IN ('positive', 'negative', 'neutral')),
  category TEXT NOT NULL, -- e.g., "Respect", "Responsibility", "Cooperation"
  description TEXT NOT NULL,
  action_taken TEXT,
  parent_notified BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.staff(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_behavior_student ON behavior_records(student_id);
CREATE INDEX idx_behavior_institution ON behavior_records(institution_id);
CREATE INDEX idx_behavior_type ON behavior_records(behavior_type);

-- Enable RLS
ALTER TABLE student_diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for diary entries
CREATE POLICY "Staff can manage diary entries for their institution"
  ON student_diary_entries
  FOR ALL
  USING (public.has_permission(auth.uid(), 'students', 'edit', institution_id))
  WITH CHECK (public.has_permission(auth.uid(), 'students', 'edit', institution_id));

CREATE POLICY "Parents can view diary entries for their children"
  ON student_diary_entries
  FOR SELECT
  USING (public.parent_linked_to_student(auth.uid(), student_id));

CREATE POLICY "Parents can add comments to diary entries"
  ON student_diary_entries
  FOR UPDATE
  USING (public.parent_linked_to_student(auth.uid(), student_id))
  WITH CHECK (public.parent_linked_to_student(auth.uid(), student_id));

-- RLS Policies for behavior records
CREATE POLICY "Staff can manage behavior records for their institution"
  ON behavior_records
  FOR ALL
  USING (public.has_permission(auth.uid(), 'students', 'edit', institution_id))
  WITH CHECK (public.has_permission(auth.uid(), 'students', 'edit', institution_id));

CREATE POLICY "Parents can view behavior records for their children"
  ON behavior_records
  FOR SELECT
  USING (public.parent_linked_to_student(auth.uid(), student_id));

-- =============================================
-- Phase 5: Timetable Constraints
-- =============================================

CREATE TABLE public.timetable_constraints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  constraint_type TEXT NOT NULL CHECK (constraint_type IN ('teacher', 'subject', 'room', 'general')),
  name TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_constraints_institution ON timetable_constraints(institution_id);
CREATE INDEX idx_constraints_type ON timetable_constraints(constraint_type);

ALTER TABLE timetable_constraints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage timetable constraints"
  ON timetable_constraints
  FOR ALL
  USING (public.has_permission(auth.uid(), 'timetable', 'edit', institution_id))
  WITH CHECK (public.has_permission(auth.uid(), 'timetable', 'edit', institution_id));

-- Updated at trigger
CREATE TRIGGER update_diary_entries_updated_at
  BEFORE UPDATE ON student_diary_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_timetable_constraints_updated_at
  BEFORE UPDATE ON timetable_constraints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();