-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.students;
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_invoices;

-- Attendance tracking
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  recorded_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, date)
);

-- Enable RLS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attendance
CREATE POLICY "Users can view attendance in their institution"
ON public.attendance FOR SELECT
USING (public.has_permission(auth.uid(), 'academics', 'view', institution_id));

CREATE POLICY "Users can create attendance records"
ON public.attendance FOR INSERT
WITH CHECK (public.has_permission(auth.uid(), 'academics', 'create', institution_id));

CREATE POLICY "Users can update attendance records"
ON public.attendance FOR UPDATE
USING (public.has_permission(auth.uid(), 'academics', 'edit', institution_id));

-- Exam configuration
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  academic_year_id UUID REFERENCES public.academic_years(id),
  term_id UUID REFERENCES public.terms(id),
  name TEXT NOT NULL,
  exam_type TEXT NOT NULL CHECK (exam_type IN ('cat', 'midterm', 'endterm', 'assignment', 'practical')),
  start_date DATE,
  end_date DATE,
  max_marks INTEGER DEFAULT 100,
  weight_percentage DECIMAL(5,2) DEFAULT 100,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'published')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exams
CREATE POLICY "Users can view exams in their institution"
ON public.exams FOR SELECT
USING (public.has_permission(auth.uid(), 'academics', 'view', institution_id));

CREATE POLICY "Users can create exams"
ON public.exams FOR INSERT
WITH CHECK (public.has_permission(auth.uid(), 'academics', 'create', institution_id));

CREATE POLICY "Users can update exams"
ON public.exams FOR UPDATE
USING (public.has_permission(auth.uid(), 'academics', 'edit', institution_id));

-- Student scores
CREATE TABLE public.student_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  marks DECIMAL(5,2),
  grade TEXT,
  remarks TEXT,
  entered_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(exam_id, student_id, subject_id)
);

-- Enable RLS
ALTER TABLE public.student_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_scores
CREATE POLICY "Users can view scores in their institution"
ON public.student_scores FOR SELECT
USING (public.has_permission(auth.uid(), 'academics', 'view', institution_id));

CREATE POLICY "Users can create scores"
ON public.student_scores FOR INSERT
WITH CHECK (public.has_permission(auth.uid(), 'academics', 'create', institution_id));

CREATE POLICY "Users can update scores"
ON public.student_scores FOR UPDATE
USING (public.has_permission(auth.uid(), 'academics', 'edit', institution_id));

-- Message templates
CREATE TABLE public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('fee_reminder', 'announcement', 'event', 'academic', 'other')),
  variables TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message_templates
CREATE POLICY "Users can view templates in their institution"
ON public.message_templates FOR SELECT
USING (public.has_permission(auth.uid(), 'communication', 'view', institution_id));

CREATE POLICY "Users can create templates"
ON public.message_templates FOR INSERT
WITH CHECK (public.has_permission(auth.uid(), 'communication', 'create', institution_id));

CREATE POLICY "Users can update templates"
ON public.message_templates FOR UPDATE
USING (public.has_permission(auth.uid(), 'communication', 'edit', institution_id));

-- Message log
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.message_templates(id),
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('all_parents', 'class', 'individual', 'staff')),
  recipient_filter JSONB DEFAULT '{}',
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'cancelled')),
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their institution"
ON public.messages FOR SELECT
USING (public.has_permission(auth.uid(), 'communication', 'view', institution_id));

CREATE POLICY "Users can create messages"
ON public.messages FOR INSERT
WITH CHECK (public.has_permission(auth.uid(), 'communication', 'create', institution_id));

-- Add grading_system to institutions
ALTER TABLE public.institutions 
ADD COLUMN IF NOT EXISTS grading_system TEXT DEFAULT 'kcse' CHECK (grading_system IN ('kcse', 'percentage', 'gpa', 'custom'));

-- Add reversal columns to student_payments for append-only audit
ALTER TABLE public.student_payments 
ADD COLUMN IF NOT EXISTS reversed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reversed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reversal_reason TEXT;

-- Add cancellation columns to student_invoices
ALTER TABLE public.student_invoices
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Create audit trigger function for finance tables
CREATE OR REPLACE FUNCTION public.audit_finance_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (
    action,
    entity_type,
    entity_id,
    institution_id,
    user_id,
    user_email,
    old_values,
    new_values,
    created_at
  )
  VALUES (
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    COALESCE(NEW.institution_id, OLD.institution_id),
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    now()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Apply audit triggers to finance tables
DROP TRIGGER IF EXISTS audit_student_invoices ON public.student_invoices;
CREATE TRIGGER audit_student_invoices
AFTER INSERT OR UPDATE OR DELETE ON public.student_invoices
FOR EACH ROW EXECUTE FUNCTION public.audit_finance_changes();

DROP TRIGGER IF EXISTS audit_student_payments ON public.student_payments;
CREATE TRIGGER audit_student_payments
AFTER INSERT OR UPDATE OR DELETE ON public.student_payments
FOR EACH ROW EXECUTE FUNCTION public.audit_finance_changes();

DROP TRIGGER IF EXISTS audit_fee_items ON public.fee_items;
CREATE TRIGGER audit_fee_items
AFTER INSERT OR UPDATE OR DELETE ON public.fee_items
FOR EACH ROW EXECUTE FUNCTION public.audit_finance_changes();

-- Add institution_id to attendance, exams, scores tables for RLS
CREATE INDEX IF NOT EXISTS idx_attendance_institution ON public.attendance(institution_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public.attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_exams_institution ON public.exams(institution_id);
CREATE INDEX IF NOT EXISTS idx_exams_term ON public.exams(term_id);
CREATE INDEX IF NOT EXISTS idx_student_scores_exam ON public.student_scores(exam_id);
CREATE INDEX IF NOT EXISTS idx_student_scores_student ON public.student_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_institution ON public.messages(institution_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON public.messages(status);