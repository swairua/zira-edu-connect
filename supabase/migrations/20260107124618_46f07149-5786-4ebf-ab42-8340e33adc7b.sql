-- Phase 1: Teacher Grading & Feedback Module - Database Schema

-- 1.1 Extend assignments table with grading configuration
ALTER TABLE public.assignments 
ADD COLUMN IF NOT EXISTS total_marks integer DEFAULT 100,
ADD COLUMN IF NOT EXISTS weight_percentage numeric DEFAULT 100,
ADD COLUMN IF NOT EXISTS grading_deadline timestamp with time zone,
ADD COLUMN IF NOT EXISTS assessment_type text DEFAULT 'assignment';

-- Add check constraint for assessment_type
ALTER TABLE public.assignments 
ADD CONSTRAINT assignments_assessment_type_check 
CHECK (assessment_type IN ('assignment', 'cat', 'project', 'practical'));

-- 1.2 Extend assignment_submissions table with grading fields
ALTER TABLE public.assignment_submissions 
ADD COLUMN IF NOT EXISTS marks numeric,
ADD COLUMN IF NOT EXISTS grade text,
ADD COLUMN IF NOT EXISTS feedback text,
ADD COLUMN IF NOT EXISTS graded_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS graded_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS grading_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS feedback_visible boolean DEFAULT false;

-- Add check constraint for grading_status
ALTER TABLE public.assignment_submissions 
ADD CONSTRAINT assignment_submissions_grading_status_check 
CHECK (grading_status IN ('pending', 'draft', 'submitted', 'approved', 'rejected', 'locked'));

-- 1.3 Create grade_approvals table
CREATE TABLE IF NOT EXISTS public.grade_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  class_id uuid REFERENCES public.classes(id),
  subject_id uuid REFERENCES public.subjects(id),
  exam_id uuid REFERENCES public.exams(id),
  assignment_id uuid REFERENCES public.assignments(id),
  submitted_by uuid NOT NULL REFERENCES auth.users(id),
  submitted_at timestamp with time zone DEFAULT now(),
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamp with time zone,
  review_notes text,
  student_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT grade_approvals_entity_type_check CHECK (entity_type IN ('exam', 'assignment', 'batch')),
  CONSTRAINT grade_approvals_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'revision_requested'))
);

-- 1.4 Create grade_change_logs table for audit trail
CREATE TABLE IF NOT EXISTS public.grade_change_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  student_id uuid NOT NULL REFERENCES public.students(id),
  subject_id uuid REFERENCES public.subjects(id),
  exam_id uuid REFERENCES public.exams(id),
  assignment_id uuid REFERENCES public.assignments(id),
  old_marks numeric,
  new_marks numeric,
  old_grade text,
  new_grade text,
  old_feedback text,
  new_feedback text,
  change_reason text NOT NULL,
  changed_by uuid NOT NULL REFERENCES auth.users(id),
  changed_at timestamp with time zone DEFAULT now(),
  requires_approval boolean DEFAULT false,
  approval_status text DEFAULT 'not_required',
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamp with time zone,
  CONSTRAINT grade_change_logs_entity_type_check CHECK (entity_type IN ('exam_score', 'assignment_submission')),
  CONSTRAINT grade_change_logs_approval_status_check CHECK (approval_status IN ('not_required', 'pending', 'approved', 'rejected'))
);

-- 1.5 Create result_releases table
CREATE TABLE IF NOT EXISTS public.result_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  release_type text NOT NULL,
  exam_id uuid REFERENCES public.exams(id),
  assignment_id uuid REFERENCES public.assignments(id),
  class_id uuid REFERENCES public.classes(id),
  subject_id uuid REFERENCES public.subjects(id),
  term_id uuid REFERENCES public.terms(id),
  academic_year_id uuid REFERENCES public.academic_years(id),
  released_at timestamp with time zone DEFAULT now(),
  released_by uuid NOT NULL REFERENCES auth.users(id),
  notify_parents boolean DEFAULT true,
  notify_students boolean DEFAULT true,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT result_releases_release_type_check CHECK (release_type IN ('exam', 'assignment', 'term_report', 'class_results'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_grade_approvals_institution ON public.grade_approvals(institution_id);
CREATE INDEX IF NOT EXISTS idx_grade_approvals_status ON public.grade_approvals(status);
CREATE INDEX IF NOT EXISTS idx_grade_approvals_submitted_by ON public.grade_approvals(submitted_by);
CREATE INDEX IF NOT EXISTS idx_grade_change_logs_institution ON public.grade_change_logs(institution_id);
CREATE INDEX IF NOT EXISTS idx_grade_change_logs_student ON public.grade_change_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_grade_change_logs_changed_by ON public.grade_change_logs(changed_by);
CREATE INDEX IF NOT EXISTS idx_result_releases_institution ON public.result_releases(institution_id);
CREATE INDEX IF NOT EXISTS idx_result_releases_exam ON public.result_releases(exam_id);
CREATE INDEX IF NOT EXISTS idx_result_releases_class ON public.result_releases(class_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_grading_status ON public.assignment_submissions(grading_status);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_graded_by ON public.assignment_submissions(graded_by);

-- Enable RLS on new tables
ALTER TABLE public.grade_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_change_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.result_releases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for grade_approvals

-- Super admins can manage all
CREATE POLICY "Super admins can manage all grade approvals"
ON public.grade_approvals FOR ALL
USING (is_super_admin(auth.uid()));

-- Teachers can view and create their own approvals
CREATE POLICY "Teachers can view their grade approval submissions"
ON public.grade_approvals FOR SELECT
USING (submitted_by = auth.uid() OR has_permission(auth.uid(), 'academics', 'view', institution_id));

CREATE POLICY "Teachers can submit grades for approval"
ON public.grade_approvals FOR INSERT
WITH CHECK (submitted_by = auth.uid() AND has_permission(auth.uid(), 'academics', 'create', institution_id));

-- Academic directors can approve/reject
CREATE POLICY "Admins can update grade approvals"
ON public.grade_approvals FOR UPDATE
USING (has_permission(auth.uid(), 'academics', 'approve', institution_id) 
  OR has_institution_role(auth.uid(), 'academic_director', institution_id)
  OR has_institution_role(auth.uid(), 'institution_admin', institution_id));

-- RLS Policies for grade_change_logs

-- Super admins can manage all
CREATE POLICY "Super admins can manage all grade change logs"
ON public.grade_change_logs FOR ALL
USING (is_super_admin(auth.uid()));

-- Staff can view their institution's logs
CREATE POLICY "Staff can view institution grade change logs"
ON public.grade_change_logs FOR SELECT
USING (has_permission(auth.uid(), 'academics', 'view', institution_id));

-- Staff can create change logs
CREATE POLICY "Staff can create grade change logs"
ON public.grade_change_logs FOR INSERT
WITH CHECK (changed_by = auth.uid() AND has_permission(auth.uid(), 'academics', 'edit', institution_id));

-- Admins can update approval status
CREATE POLICY "Admins can update grade change log approvals"
ON public.grade_change_logs FOR UPDATE
USING (has_institution_role(auth.uid(), 'academic_director', institution_id)
  OR has_institution_role(auth.uid(), 'institution_admin', institution_id)
  OR is_super_admin(auth.uid()));

-- RLS Policies for result_releases

-- Super admins can manage all
CREATE POLICY "Super admins can manage all result releases"
ON public.result_releases FOR ALL
USING (is_super_admin(auth.uid()));

-- Staff can view releases in their institution
CREATE POLICY "Staff can view result releases"
ON public.result_releases FOR SELECT
USING (has_permission(auth.uid(), 'academics', 'view', institution_id));

-- Admins can create releases
CREATE POLICY "Admins can create result releases"
ON public.result_releases FOR INSERT
WITH CHECK (has_institution_role(auth.uid(), 'academic_director', institution_id)
  OR has_institution_role(auth.uid(), 'institution_admin', institution_id)
  OR is_super_admin(auth.uid()));

-- Admins can delete releases (to undo a release)
CREATE POLICY "Admins can delete result releases"
ON public.result_releases FOR DELETE
USING (has_institution_role(auth.uid(), 'academic_director', institution_id)
  OR has_institution_role(auth.uid(), 'institution_admin', institution_id)
  OR is_super_admin(auth.uid()));

-- Students can view released results for their exams
CREATE POLICY "Students can view their released results"
ON public.result_releases FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM students s 
    WHERE s.user_id = auth.uid() 
    AND s.institution_id = result_releases.institution_id
    AND (
      result_releases.class_id IS NULL 
      OR result_releases.class_id = s.class_id
    )
  )
);

-- Parents can view released results for their children
CREATE POLICY "Parents can view released results for linked students"
ON public.result_releases FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM student_parents sp
    JOIN parents p ON p.id = sp.parent_id
    JOIN students s ON s.id = sp.student_id
    WHERE p.user_id = auth.uid()
    AND s.institution_id = result_releases.institution_id
    AND (
      result_releases.class_id IS NULL 
      OR result_releases.class_id = s.class_id
    )
  )
);

-- Add update trigger for grade_approvals
CREATE TRIGGER update_grade_approvals_updated_at
BEFORE UPDATE ON public.grade_approvals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for grading tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.grade_approvals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.result_releases;