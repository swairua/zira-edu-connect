-- Phase 3: RLS Policies for all new tables using permission-based access control
-- =============================================

-- STAFF TABLE POLICIES
CREATE POLICY "Super admins can manage all staff" ON public.staff FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "Users with staff_hr.view can view staff" ON public.staff FOR SELECT
USING (has_permission(auth.uid(), 'staff_hr', 'view', institution_id));

CREATE POLICY "Users with staff_hr.create can create staff" ON public.staff FOR INSERT
WITH CHECK (has_permission(auth.uid(), 'staff_hr', 'create', institution_id));

CREATE POLICY "Users with staff_hr.edit can update staff" ON public.staff FOR UPDATE
USING (has_permission(auth.uid(), 'staff_hr', 'edit', institution_id));

CREATE POLICY "Users with staff_hr.delete can delete staff" ON public.staff FOR DELETE
USING (has_permission(auth.uid(), 'staff_hr', 'delete', institution_id));

-- ACADEMIC YEARS POLICIES
CREATE POLICY "Super admins can manage all academic years" ON public.academic_years FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "Users with academics.view can view academic years" ON public.academic_years FOR SELECT
USING (has_permission(auth.uid(), 'academics', 'view', institution_id));

CREATE POLICY "Users with academics.create can create academic years" ON public.academic_years FOR INSERT
WITH CHECK (has_permission(auth.uid(), 'academics', 'create', institution_id));

CREATE POLICY "Users with academics.edit can update academic years" ON public.academic_years FOR UPDATE
USING (has_permission(auth.uid(), 'academics', 'edit', institution_id));

CREATE POLICY "Users with academics.delete can delete academic years" ON public.academic_years FOR DELETE
USING (has_permission(auth.uid(), 'academics', 'delete', institution_id));

-- TERMS POLICIES
CREATE POLICY "Super admins can manage all terms" ON public.terms FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "Users with academics.view can view terms" ON public.terms FOR SELECT
USING (has_permission(auth.uid(), 'academics', 'view', institution_id));

CREATE POLICY "Users with academics.create can create terms" ON public.terms FOR INSERT
WITH CHECK (has_permission(auth.uid(), 'academics', 'create', institution_id));

CREATE POLICY "Users with academics.edit can update terms" ON public.terms FOR UPDATE
USING (has_permission(auth.uid(), 'academics', 'edit', institution_id));

CREATE POLICY "Users with academics.delete can delete terms" ON public.terms FOR DELETE
USING (has_permission(auth.uid(), 'academics', 'delete', institution_id));

-- CLASSES POLICIES
CREATE POLICY "Super admins can manage all classes" ON public.classes FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "Users with academics.view can view classes" ON public.classes FOR SELECT
USING (has_permission(auth.uid(), 'academics', 'view', institution_id));

CREATE POLICY "Users with academics.create can create classes" ON public.classes FOR INSERT
WITH CHECK (has_permission(auth.uid(), 'academics', 'create', institution_id));

CREATE POLICY "Users with academics.edit can update classes" ON public.classes FOR UPDATE
USING (has_permission(auth.uid(), 'academics', 'edit', institution_id));

CREATE POLICY "Users with academics.delete can delete classes" ON public.classes FOR DELETE
USING (has_permission(auth.uid(), 'academics', 'delete', institution_id));

-- SUBJECTS POLICIES
CREATE POLICY "Super admins can manage all subjects" ON public.subjects FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "Users with academics.view can view subjects" ON public.subjects FOR SELECT
USING (has_permission(auth.uid(), 'academics', 'view', institution_id));

CREATE POLICY "Users with academics.create can create subjects" ON public.subjects FOR INSERT
WITH CHECK (has_permission(auth.uid(), 'academics', 'create', institution_id));

CREATE POLICY "Users with academics.edit can update subjects" ON public.subjects FOR UPDATE
USING (has_permission(auth.uid(), 'academics', 'edit', institution_id));

CREATE POLICY "Users with academics.delete can delete subjects" ON public.subjects FOR DELETE
USING (has_permission(auth.uid(), 'academics', 'delete', institution_id));

-- CLASS SUBJECTS POLICIES
CREATE POLICY "Super admins can manage all class subjects" ON public.class_subjects FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "Users with academics.view can view class subjects" ON public.class_subjects FOR SELECT
USING (has_permission(auth.uid(), 'academics', 'view', institution_id));

CREATE POLICY "Users with academics.create can create class subjects" ON public.class_subjects FOR INSERT
WITH CHECK (has_permission(auth.uid(), 'academics', 'create', institution_id));

CREATE POLICY "Users with academics.edit can update class subjects" ON public.class_subjects FOR UPDATE
USING (has_permission(auth.uid(), 'academics', 'edit', institution_id));

CREATE POLICY "Users with academics.delete can delete class subjects" ON public.class_subjects FOR DELETE
USING (has_permission(auth.uid(), 'academics', 'delete', institution_id));

-- STUDENTS POLICIES
CREATE POLICY "Super admins can manage all students" ON public.students FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "Users with students.view can view students" ON public.students FOR SELECT
USING (has_permission(auth.uid(), 'students', 'view', institution_id));

CREATE POLICY "Users with students.create can create students" ON public.students FOR INSERT
WITH CHECK (has_permission(auth.uid(), 'students', 'create', institution_id));

CREATE POLICY "Users with students.edit can update students" ON public.students FOR UPDATE
USING (has_permission(auth.uid(), 'students', 'edit', institution_id));

CREATE POLICY "Users with students.delete can delete students" ON public.students FOR DELETE
USING (has_permission(auth.uid(), 'students', 'delete', institution_id));

-- Students can view their own record
CREATE POLICY "Students can view own record" ON public.students FOR SELECT
USING (user_id = auth.uid());

-- Parents can view their linked students
CREATE POLICY "Parents can view linked students" ON public.students FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM student_parents sp
    JOIN parents p ON sp.parent_id = p.id
    WHERE sp.student_id = students.id AND p.user_id = auth.uid()
  )
);

-- PARENTS POLICIES
CREATE POLICY "Super admins can manage all parents" ON public.parents FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "Users with students.view can view parents" ON public.parents FOR SELECT
USING (has_permission(auth.uid(), 'students', 'view', institution_id));

CREATE POLICY "Users with students.create can create parents" ON public.parents FOR INSERT
WITH CHECK (has_permission(auth.uid(), 'students', 'create', institution_id));

CREATE POLICY "Users with students.edit can update parents" ON public.parents FOR UPDATE
USING (has_permission(auth.uid(), 'students', 'edit', institution_id));

CREATE POLICY "Users with students.delete can delete parents" ON public.parents FOR DELETE
USING (has_permission(auth.uid(), 'students', 'delete', institution_id));

-- Parents can view and update their own record
CREATE POLICY "Parents can view own record" ON public.parents FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Parents can update own record" ON public.parents FOR UPDATE
USING (user_id = auth.uid());

-- STUDENT PARENTS POLICIES
CREATE POLICY "Super admins can manage all student parents" ON public.student_parents FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "Users with students.view can view student parents" ON public.student_parents FOR SELECT
USING (has_permission(auth.uid(), 'students', 'view', institution_id));

CREATE POLICY "Users with students.create can create student parents" ON public.student_parents FOR INSERT
WITH CHECK (has_permission(auth.uid(), 'students', 'create', institution_id));

CREATE POLICY "Users with students.edit can update student parents" ON public.student_parents FOR UPDATE
USING (has_permission(auth.uid(), 'students', 'edit', institution_id));

CREATE POLICY "Users with students.delete can delete student parents" ON public.student_parents FOR DELETE
USING (has_permission(auth.uid(), 'students', 'delete', institution_id));

-- FEE ITEMS POLICIES
CREATE POLICY "Super admins can manage all fee items" ON public.fee_items FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "Users with finance.view can view fee items" ON public.fee_items FOR SELECT
USING (has_permission(auth.uid(), 'finance', 'view', institution_id));

CREATE POLICY "Users with finance.create can create fee items" ON public.fee_items FOR INSERT
WITH CHECK (has_permission(auth.uid(), 'finance', 'create', institution_id));

CREATE POLICY "Users with finance.edit can update fee items" ON public.fee_items FOR UPDATE
USING (has_permission(auth.uid(), 'finance', 'edit', institution_id));

CREATE POLICY "Users with finance.delete can delete fee items" ON public.fee_items FOR DELETE
USING (has_permission(auth.uid(), 'finance', 'delete', institution_id));

-- STUDENT INVOICES POLICIES
CREATE POLICY "Super admins can manage all student invoices" ON public.student_invoices FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "Users with finance.view can view student invoices" ON public.student_invoices FOR SELECT
USING (has_permission(auth.uid(), 'finance', 'view', institution_id));

CREATE POLICY "Users with finance.create can create student invoices" ON public.student_invoices FOR INSERT
WITH CHECK (has_permission(auth.uid(), 'finance', 'create', institution_id));

-- Only draft invoices can be updated
CREATE POLICY "Users with finance.edit can update draft invoices" ON public.student_invoices FOR UPDATE
USING (has_permission(auth.uid(), 'finance', 'edit', institution_id) AND status = 'draft');

-- Only super admins can delete invoices (for data integrity)
CREATE POLICY "Only super admins can delete invoices" ON public.student_invoices FOR DELETE
USING (is_super_admin(auth.uid()));

-- Students can view their own invoices
CREATE POLICY "Students can view own invoices" ON public.student_invoices FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM students s WHERE s.id = student_id AND s.user_id = auth.uid()
  )
);

-- Parents can view linked student invoices
CREATE POLICY "Parents can view linked student invoices" ON public.student_invoices FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM student_parents sp
    JOIN parents p ON sp.parent_id = p.id
    WHERE sp.student_id = student_invoices.student_id AND p.user_id = auth.uid()
  )
);

-- INVOICE LINES POLICIES
CREATE POLICY "Super admins can manage all invoice lines" ON public.invoice_lines FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "Users with finance.view can view invoice lines" ON public.invoice_lines FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM student_invoices si
    WHERE si.id = invoice_id AND has_permission(auth.uid(), 'finance', 'view', si.institution_id)
  )
);

CREATE POLICY "Users with finance.create can create invoice lines" ON public.invoice_lines FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM student_invoices si
    WHERE si.id = invoice_id AND si.status = 'draft'
    AND has_permission(auth.uid(), 'finance', 'create', si.institution_id)
  )
);

CREATE POLICY "Users with finance.edit can update invoice lines for draft invoices" ON public.invoice_lines FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM student_invoices si
    WHERE si.id = invoice_id AND si.status = 'draft'
    AND has_permission(auth.uid(), 'finance', 'edit', si.institution_id)
  )
);

-- STUDENT PAYMENTS POLICIES (Append-only)
CREATE POLICY "Super admins can manage all student payments" ON public.student_payments FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "Users with finance.view can view student payments" ON public.student_payments FOR SELECT
USING (has_permission(auth.uid(), 'finance', 'view', institution_id));

CREATE POLICY "Users with finance.create can create student payments" ON public.student_payments FOR INSERT
WITH CHECK (has_permission(auth.uid(), 'finance', 'create', institution_id));

-- Only approval permission can update payment status (for reversals)
CREATE POLICY "Users with finance.approve can update payment status" ON public.student_payments FOR UPDATE
USING (has_permission(auth.uid(), 'finance', 'approve', institution_id));

-- No delete policy for student_payments - append only

-- Students can view their own payments
CREATE POLICY "Students can view own payments" ON public.student_payments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM students s WHERE s.id = student_id AND s.user_id = auth.uid()
  )
);

-- Parents can view linked student payments
CREATE POLICY "Parents can view linked student payments" ON public.student_payments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM student_parents sp
    JOIN parents p ON sp.parent_id = p.id
    WHERE sp.student_id = student_payments.student_id AND p.user_id = auth.uid()
  )
);

-- PAYMENT ALLOCATIONS POLICIES
CREATE POLICY "Super admins can manage all payment allocations" ON public.payment_allocations FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "Users with finance.view can view payment allocations" ON public.payment_allocations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM student_payments sp
    WHERE sp.id = payment_id AND has_permission(auth.uid(), 'finance', 'view', sp.institution_id)
  )
);

CREATE POLICY "Users with finance.create can create payment allocations" ON public.payment_allocations FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM student_payments sp
    WHERE sp.id = payment_id AND has_permission(auth.uid(), 'finance', 'create', sp.institution_id)
  )
);