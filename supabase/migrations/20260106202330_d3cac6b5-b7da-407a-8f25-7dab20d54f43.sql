-- Create function to get student's institution ID
CREATE OR REPLACE FUNCTION public.get_student_institution_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT institution_id
  FROM public.students
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS policies for students to view their own data

-- Students can view their own student record
CREATE POLICY "Students can view their own record"
ON public.students
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Students can view assignments for their class
CREATE POLICY "Students can view assignments for their class"
ON public.assignments
FOR SELECT
TO authenticated
USING (
  class_id IN (
    SELECT class_id FROM public.students WHERE user_id = auth.uid()
  )
  AND status = 'published'
);

-- Students can view their own assignment submissions
CREATE POLICY "Students can view their own submissions"
ON public.assignment_submissions
FOR SELECT
TO authenticated
USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

-- Students can create their own assignment submissions
CREATE POLICY "Students can create their own submissions"
ON public.assignment_submissions
FOR INSERT
TO authenticated
WITH CHECK (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

-- Students can update their own pending submissions
CREATE POLICY "Students can update their own pending submissions"
ON public.assignment_submissions
FOR UPDATE
TO authenticated
USING (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
  AND status = 'submitted'
);

-- Students can view their own scores
CREATE POLICY "Students can view their own scores"
ON public.student_scores
FOR SELECT
TO authenticated
USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

-- Students can view their own invoices
CREATE POLICY "Students can view their own invoices"
ON public.student_invoices
FOR SELECT
TO authenticated
USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

-- Students can view their own payments
CREATE POLICY "Students can view their own payments"
ON public.student_payments
FOR SELECT
TO authenticated
USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

-- Students can view their attendance
CREATE POLICY "Students can view their own attendance"
ON public.attendance
FOR SELECT
TO authenticated
USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

-- Students can view their class
CREATE POLICY "Students can view their class"
ON public.classes
FOR SELECT
TO authenticated
USING (
  id IN (SELECT class_id FROM public.students WHERE user_id = auth.uid())
);

-- Students can view subjects for their class
CREATE POLICY "Students can view subjects for their class"
ON public.subjects
FOR SELECT
TO authenticated
USING (
  institution_id IN (SELECT institution_id FROM public.students WHERE user_id = auth.uid())
);

-- Students can view terms for their institution
CREATE POLICY "Students can view terms"
ON public.terms
FOR SELECT
TO authenticated
USING (
  institution_id IN (SELECT institution_id FROM public.students WHERE user_id = auth.uid())
);

-- Students can view academic years for their institution
CREATE POLICY "Students can view academic years"
ON public.academic_years
FOR SELECT
TO authenticated
USING (
  institution_id IN (SELECT institution_id FROM public.students WHERE user_id = auth.uid())
);

-- Students can view exams for their institution
CREATE POLICY "Students can view exams"
ON public.exams
FOR SELECT
TO authenticated
USING (
  institution_id IN (SELECT institution_id FROM public.students WHERE user_id = auth.uid())
);