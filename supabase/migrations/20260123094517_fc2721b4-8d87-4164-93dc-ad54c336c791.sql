-- Drop the existing restrictive policy for library_loans manage
DROP POLICY IF EXISTS "library_loans_manage" ON public.library_loans;

-- Create new policy that includes teachers (for distributing allocated books to students)
CREATE POLICY "library_loans_manage" ON public.library_loans
  FOR ALL
  TO authenticated
  USING (
    institution_id IN (
      SELECT ur.institution_id
      FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('librarian', 'teacher', 'institution_admin', 'institution_owner')
    )
  )
  WITH CHECK (
    institution_id IN (
      SELECT ur.institution_id
      FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('librarian', 'teacher', 'institution_admin', 'institution_owner')
    )
  );