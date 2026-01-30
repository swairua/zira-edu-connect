-- Add RLS policies for parents table (institution admin access)
CREATE POLICY "Institution admins can view parents"
ON public.parents FOR SELECT
TO authenticated
USING (
  public.is_super_admin(auth.uid())
  OR institution_id = public.get_user_institution_id(auth.uid())
);

CREATE POLICY "Institution admins can create parents"
ON public.parents FOR INSERT
TO authenticated
WITH CHECK (
  public.is_super_admin(auth.uid())
  OR (
    institution_id = public.get_user_institution_id(auth.uid())
    AND public.has_institution_role(auth.uid(), 'institution_admin'::app_role, institution_id)
  )
);

CREATE POLICY "Institution admins can update parents"
ON public.parents FOR UPDATE
TO authenticated
USING (
  public.is_super_admin(auth.uid())
  OR (
    institution_id = public.get_user_institution_id(auth.uid())
    AND public.has_institution_role(auth.uid(), 'institution_admin'::app_role, institution_id)
  )
);

-- Add RLS policies for student_parents table
CREATE POLICY "Institution admins can view student_parents"
ON public.student_parents FOR SELECT
TO authenticated
USING (
  public.is_super_admin(auth.uid())
  OR institution_id = public.get_user_institution_id(auth.uid())
);

CREATE POLICY "Institution admins can create student_parents"
ON public.student_parents FOR INSERT
TO authenticated
WITH CHECK (
  public.is_super_admin(auth.uid())
  OR (
    institution_id = public.get_user_institution_id(auth.uid())
    AND public.has_institution_role(auth.uid(), 'institution_admin'::app_role, institution_id)
  )
);

CREATE POLICY "Institution admins can update student_parents"
ON public.student_parents FOR UPDATE
TO authenticated
USING (
  public.is_super_admin(auth.uid())
  OR (
    institution_id = public.get_user_institution_id(auth.uid())
    AND public.has_institution_role(auth.uid(), 'institution_admin'::app_role, institution_id)
  )
);

CREATE POLICY "Institution admins can delete student_parents"
ON public.student_parents FOR DELETE
TO authenticated
USING (
  public.is_super_admin(auth.uid())
  OR (
    institution_id = public.get_user_institution_id(auth.uid())
    AND public.has_institution_role(auth.uid(), 'institution_admin'::app_role, institution_id)
  )
);