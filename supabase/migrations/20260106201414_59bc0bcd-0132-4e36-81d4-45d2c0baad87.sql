-- Create assignments table
CREATE TABLE public.assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  academic_year_id uuid REFERENCES public.academic_years(id),
  term_id uuid REFERENCES public.terms(id),
  title text NOT NULL,
  description text,
  submission_type text NOT NULL DEFAULT 'file' CHECK (submission_type IN ('file', 'text', 'both')),
  allowed_file_types text[] DEFAULT ARRAY['pdf', 'docx', 'doc', 'jpg', 'png'],
  max_file_size_mb integer DEFAULT 10,
  due_date timestamp with time zone NOT NULL,
  allow_late_submission boolean DEFAULT false,
  allow_resubmission boolean DEFAULT false,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create assignment_submissions table
CREATE TABLE public.assignment_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  submitted_by_user_id uuid,
  submitted_by_type text NOT NULL DEFAULT 'student' CHECK (submitted_by_type IN ('student', 'parent')),
  submitted_by_parent_id uuid REFERENCES public.parents(id),
  submission_type text NOT NULL CHECK (submission_type IN ('file', 'text')),
  text_content text,
  file_url text,
  file_name text,
  file_size_bytes integer,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'late', 'graded')),
  submitted_at timestamp with time zone,
  is_late boolean DEFAULT false,
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_assignments_institution ON public.assignments(institution_id);
CREATE INDEX idx_assignments_class ON public.assignments(class_id);
CREATE INDEX idx_assignments_status ON public.assignments(status);
CREATE INDEX idx_assignments_due_date ON public.assignments(due_date);
CREATE INDEX idx_submissions_assignment ON public.assignment_submissions(assignment_id);
CREATE INDEX idx_submissions_student ON public.assignment_submissions(student_id);
CREATE INDEX idx_submissions_status ON public.assignment_submissions(status);

-- Enable RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assignments table

-- Super admins can manage all assignments
CREATE POLICY "Super admins can manage all assignments"
ON public.assignments FOR ALL
USING (is_super_admin(auth.uid()));

-- Teachers with academics.view can view assignments
CREATE POLICY "Users with academics.view can view assignments"
ON public.assignments FOR SELECT
USING (has_permission(auth.uid(), 'academics'::text, 'view'::text, institution_id));

-- Teachers with academics.create can create assignments
CREATE POLICY "Users with academics.create can create assignments"
ON public.assignments FOR INSERT
WITH CHECK (has_permission(auth.uid(), 'academics'::text, 'create'::text, institution_id));

-- Teachers with academics.edit can update assignments
CREATE POLICY "Users with academics.edit can update assignments"
ON public.assignments FOR UPDATE
USING (has_permission(auth.uid(), 'academics'::text, 'edit'::text, institution_id));

-- Teachers with academics.delete can delete draft assignments
CREATE POLICY "Users with academics.delete can delete draft assignments"
ON public.assignments FOR DELETE
USING (has_permission(auth.uid(), 'academics'::text, 'delete'::text, institution_id) AND status = 'draft');

-- Parents can view published assignments for linked students' classes
CREATE POLICY "Parents can view published assignments for linked students"
ON public.assignments FOR SELECT
USING (
  status = 'published' AND
  class_id IN (
    SELECT s.class_id FROM students s
    WHERE parent_linked_to_student(auth.uid(), s.id)
  )
);

-- RLS Policies for assignment_submissions table

-- Super admins can manage all submissions
CREATE POLICY "Super admins can manage all submissions"
ON public.assignment_submissions FOR ALL
USING (is_super_admin(auth.uid()));

-- Teachers can view submissions for assignments in their institution
CREATE POLICY "Teachers can view submissions"
ON public.assignment_submissions FOR SELECT
USING (has_permission(auth.uid(), 'academics'::text, 'view'::text, institution_id));

-- Students/Parents can view their own submissions
CREATE POLICY "Users can view own submissions"
ON public.assignment_submissions FOR SELECT
USING (parent_linked_to_student(auth.uid(), student_id));

-- Students/Parents can create submissions for linked students
CREATE POLICY "Users can create submissions for linked students"
ON public.assignment_submissions FOR INSERT
WITH CHECK (
  parent_linked_to_student(auth.uid(), student_id) AND
  EXISTS (
    SELECT 1 FROM assignments a
    WHERE a.id = assignment_id
    AND a.status = 'published'
    AND (a.due_date > now() OR a.allow_late_submission = true)
  )
);

-- Students/Parents can update draft submissions
CREATE POLICY "Users can update draft submissions"
ON public.assignment_submissions FOR UPDATE
USING (
  parent_linked_to_student(auth.uid(), student_id) AND
  status = 'draft'
);

-- Create storage bucket for assignment submissions
INSERT INTO storage.buckets (id, name, public)
VALUES ('assignment-submissions', 'assignment-submissions', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for assignment-submissions bucket
CREATE POLICY "Users can upload assignment files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'assignment-submissions' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view own assignment files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'assignment-submissions' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete own assignment files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'assignment-submissions' AND
  auth.uid() IS NOT NULL
);

-- Trigger for updated_at
CREATE TRIGGER update_assignments_updated_at
BEFORE UPDATE ON public.assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at
BEFORE UPDATE ON public.assignment_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for submissions
ALTER PUBLICATION supabase_realtime ADD TABLE public.assignment_submissions;