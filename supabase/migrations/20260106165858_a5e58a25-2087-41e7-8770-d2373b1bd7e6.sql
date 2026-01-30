-- =============================================
-- PARENT PORTAL: HELPER FUNCTIONS + RLS POLICIES
-- =============================================

-- Helper function: Check if parent is linked to a student
CREATE OR REPLACE FUNCTION public.parent_linked_to_student(_user_id uuid, _student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.parents p
    JOIN public.student_parents sp ON sp.parent_id = p.id
    WHERE p.user_id = _user_id 
      AND sp.student_id = _student_id
  )
$$;

-- Helper function: Get parent's institution ID
CREATE OR REPLACE FUNCTION public.get_parent_institution_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.institution_id
  FROM public.parents p
  WHERE p.user_id = _user_id
  LIMIT 1
$$;

-- Drop existing parent policies if they exist
DROP POLICY IF EXISTS "Parents can view own profile" ON public.parents;
DROP POLICY IF EXISTS "Parents can view linked students" ON public.students;
DROP POLICY IF EXISTS "Parents can view own student linkages" ON public.student_parents;
DROP POLICY IF EXISTS "Parents can view posted invoices for linked students" ON public.student_invoices;
DROP POLICY IF EXISTS "Parents can view invoice lines for linked students" ON public.invoice_lines;
DROP POLICY IF EXISTS "Parents can view payments for linked students" ON public.student_payments;
DROP POLICY IF EXISTS "Parents can view payment allocations for linked students" ON public.payment_allocations;
DROP POLICY IF EXISTS "Parents can view released scores for linked students" ON public.student_scores;
DROP POLICY IF EXISTS "Parents can view released exams" ON public.exams;
DROP POLICY IF EXISTS "Parents can view attendance for linked students" ON public.attendance;
DROP POLICY IF EXISTS "Parents can view linked student classes" ON public.classes;
DROP POLICY IF EXISTS "Parents can view institution subjects" ON public.subjects;
DROP POLICY IF EXISTS "Parents can view institution academic years" ON public.academic_years;
DROP POLICY IF EXISTS "Parents can view institution terms" ON public.terms;
DROP POLICY IF EXISTS "Parents can view parent announcements" ON public.messages;
DROP POLICY IF EXISTS "Parents can view institution fee items" ON public.fee_items;

-- Parents table policy
CREATE POLICY "Parents can view own profile"
ON public.parents FOR SELECT
USING (user_id = auth.uid());

-- Students table policy
CREATE POLICY "Parents can view linked students"
ON public.students FOR SELECT
USING (public.parent_linked_to_student(auth.uid(), id));

-- Student_parents table policy
CREATE POLICY "Parents can view own student linkages"
ON public.student_parents FOR SELECT
USING (parent_id IN (SELECT id FROM public.parents WHERE user_id = auth.uid()));

-- Student_invoices table policy
CREATE POLICY "Parents can view posted invoices for linked students"
ON public.student_invoices FOR SELECT
USING (status = 'posted' AND public.parent_linked_to_student(auth.uid(), student_id));

-- Invoice_lines table policy
CREATE POLICY "Parents can view invoice lines for linked students"
ON public.invoice_lines FOR SELECT
USING (invoice_id IN (
  SELECT si.id FROM public.student_invoices si
  WHERE si.status = 'posted' AND public.parent_linked_to_student(auth.uid(), si.student_id)
));

-- Student_payments table policy
CREATE POLICY "Parents can view payments for linked students"
ON public.student_payments FOR SELECT
USING (public.parent_linked_to_student(auth.uid(), student_id));

-- Payment_allocations table policy
CREATE POLICY "Parents can view payment allocations for linked students"
ON public.payment_allocations FOR SELECT
USING (payment_id IN (
  SELECT sp.id FROM public.student_payments sp
  WHERE public.parent_linked_to_student(auth.uid(), sp.student_id)
));

-- Student_scores table policy (released exams only)
CREATE POLICY "Parents can view released scores for linked students"
ON public.student_scores FOR SELECT
USING (
  public.parent_linked_to_student(auth.uid(), student_id)
  AND exam_id IN (SELECT id FROM public.exams WHERE status = 'released')
);

-- Exams table policy (released only)
CREATE POLICY "Parents can view released exams"
ON public.exams FOR SELECT
USING (status = 'released' AND institution_id = public.get_parent_institution_id(auth.uid()));

-- Attendance table policy
CREATE POLICY "Parents can view attendance for linked students"
ON public.attendance FOR SELECT
USING (public.parent_linked_to_student(auth.uid(), student_id));

-- Classes table policy
CREATE POLICY "Parents can view linked student classes"
ON public.classes FOR SELECT
USING (id IN (
  SELECT s.class_id FROM public.students s
  WHERE public.parent_linked_to_student(auth.uid(), s.id)
));

-- Subjects table policy
CREATE POLICY "Parents can view institution subjects"
ON public.subjects FOR SELECT
USING (institution_id = public.get_parent_institution_id(auth.uid()));

-- Academic_years table policy
CREATE POLICY "Parents can view institution academic years"
ON public.academic_years FOR SELECT
USING (institution_id = public.get_parent_institution_id(auth.uid()));

-- Terms table policy
CREATE POLICY "Parents can view institution terms"
ON public.terms FOR SELECT
USING (institution_id = public.get_parent_institution_id(auth.uid()));

-- Messages table policy (announcements)
CREATE POLICY "Parents can view parent announcements"
ON public.messages FOR SELECT
USING (
  recipient_type IN ('parents', 'all')
  AND status = 'sent'
  AND institution_id = public.get_parent_institution_id(auth.uid())
);

-- Fee_items table policy
CREATE POLICY "Parents can view institution fee items"
ON public.fee_items FOR SELECT
USING (institution_id = public.get_parent_institution_id(auth.uid()));

-- Assign parent permissions
INSERT INTO public.permissions (domain, action, name, description, is_system)
VALUES 
  ('students', 'view', 'View Students', 'View student information', true),
  ('finance', 'view', 'View Finance', 'View financial information', true),
  ('academics', 'view', 'View Academics', 'View academic information', true)
ON CONFLICT (domain, action) DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id, institution_id)
SELECT 'parent', p.id, NULL
FROM public.permissions p
WHERE (p.domain = 'students' AND p.action = 'view')
   OR (p.domain = 'finance' AND p.action = 'view')
   OR (p.domain = 'academics' AND p.action = 'view')
ON CONFLICT DO NOTHING;