-- Drop existing policies
DROP POLICY IF EXISTS "Staff can insert allocations in their institution" ON library_teacher_allocations;
DROP POLICY IF EXISTS "Staff can view allocations in their institution" ON library_teacher_allocations;
DROP POLICY IF EXISTS "Staff can update allocations in their institution" ON library_teacher_allocations;
DROP POLICY IF EXISTS "Staff can delete allocations in their institution" ON library_teacher_allocations;

-- Create new policies that include institution admins and support for staff who manage library
CREATE POLICY "Users can view allocations in their institution"
ON library_teacher_allocations FOR SELECT
USING (
  public.is_super_admin(auth.uid()) OR
  public.is_institution_admin(auth.uid(), institution_id) OR
  EXISTS (
    SELECT 1 FROM staff
    WHERE staff.user_id = auth.uid() 
    AND staff.institution_id = library_teacher_allocations.institution_id
    AND staff.deleted_at IS NULL
  )
);

CREATE POLICY "Users can insert allocations in their institution"
ON library_teacher_allocations FOR INSERT
WITH CHECK (
  public.is_super_admin(auth.uid()) OR
  public.is_institution_admin(auth.uid(), institution_id) OR
  EXISTS (
    SELECT 1 FROM staff
    WHERE staff.user_id = auth.uid() 
    AND staff.institution_id = library_teacher_allocations.institution_id
    AND staff.deleted_at IS NULL
  )
);

CREATE POLICY "Users can update allocations in their institution"
ON library_teacher_allocations FOR UPDATE
USING (
  public.is_super_admin(auth.uid()) OR
  public.is_institution_admin(auth.uid(), institution_id) OR
  EXISTS (
    SELECT 1 FROM staff
    WHERE staff.user_id = auth.uid() 
    AND staff.institution_id = library_teacher_allocations.institution_id
    AND staff.deleted_at IS NULL
  )
);

CREATE POLICY "Users can delete allocations in their institution"
ON library_teacher_allocations FOR DELETE
USING (
  public.is_super_admin(auth.uid()) OR
  public.is_institution_admin(auth.uid(), institution_id) OR
  EXISTS (
    SELECT 1 FROM staff
    WHERE staff.user_id = auth.uid() 
    AND staff.institution_id = library_teacher_allocations.institution_id
    AND staff.deleted_at IS NULL
  )
);

-- Also fix the allocation copies table if it has similar issues
DROP POLICY IF EXISTS "Staff can view allocation copies in their institution" ON library_teacher_allocation_copies;
DROP POLICY IF EXISTS "Staff can insert allocation copies in their institution" ON library_teacher_allocation_copies;
DROP POLICY IF EXISTS "Staff can update allocation copies in their institution" ON library_teacher_allocation_copies;
DROP POLICY IF EXISTS "Staff can delete allocation copies in their institution" ON library_teacher_allocation_copies;

CREATE POLICY "Users can view allocation copies in their institution"
ON library_teacher_allocation_copies FOR SELECT
USING (
  public.is_super_admin(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM library_teacher_allocations a
    WHERE a.id = library_teacher_allocation_copies.allocation_id
    AND (
      public.is_institution_admin(auth.uid(), a.institution_id) OR
      EXISTS (
        SELECT 1 FROM staff s
        WHERE s.user_id = auth.uid() 
        AND s.institution_id = a.institution_id
        AND s.deleted_at IS NULL
      )
    )
  )
);

CREATE POLICY "Users can insert allocation copies in their institution"
ON library_teacher_allocation_copies FOR INSERT
WITH CHECK (
  public.is_super_admin(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM library_teacher_allocations a
    WHERE a.id = library_teacher_allocation_copies.allocation_id
    AND (
      public.is_institution_admin(auth.uid(), a.institution_id) OR
      EXISTS (
        SELECT 1 FROM staff s
        WHERE s.user_id = auth.uid() 
        AND s.institution_id = a.institution_id
        AND s.deleted_at IS NULL
      )
    )
  )
);

CREATE POLICY "Users can update allocation copies in their institution"
ON library_teacher_allocation_copies FOR UPDATE
USING (
  public.is_super_admin(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM library_teacher_allocations a
    WHERE a.id = library_teacher_allocation_copies.allocation_id
    AND (
      public.is_institution_admin(auth.uid(), a.institution_id) OR
      EXISTS (
        SELECT 1 FROM staff s
        WHERE s.user_id = auth.uid() 
        AND s.institution_id = a.institution_id
        AND s.deleted_at IS NULL
      )
    )
  )
);

CREATE POLICY "Users can delete allocation copies in their institution"
ON library_teacher_allocation_copies FOR DELETE
USING (
  public.is_super_admin(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM library_teacher_allocations a
    WHERE a.id = library_teacher_allocation_copies.allocation_id
    AND (
      public.is_institution_admin(auth.uid(), a.institution_id) OR
      EXISTS (
        SELECT 1 FROM staff s
        WHERE s.user_id = auth.uid() 
        AND s.institution_id = a.institution_id
        AND s.deleted_at IS NULL
      )
    )
  )
);