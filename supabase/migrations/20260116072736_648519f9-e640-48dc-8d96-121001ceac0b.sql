-- Fix RLS policy for teachers to insert student_scores
-- Current INSERT policy has no WITH CHECK, making it too permissive
-- Replace with proper teacher-based check

DROP POLICY IF EXISTS "Users can create scores" ON student_scores;

-- Teachers can insert scores if they're assigned to teach that class+subject
CREATE POLICY "Teachers can create scores for their classes"
ON student_scores
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM class_teachers ct
    JOIN staff s ON s.id = ct.staff_id
    WHERE s.user_id = auth.uid()
    AND ct.class_id IN (
      SELECT class_id FROM students WHERE id = student_id
    )
    AND (ct.subject_id = student_scores.subject_id OR ct.is_class_teacher = true)
  )
);

-- Allow teachers to update their own entered scores
DROP POLICY IF EXISTS "Users can update scores" ON student_scores;

CREATE POLICY "Teachers can update scores they entered"
ON student_scores
FOR UPDATE
TO authenticated
USING (
  entered_by IN (SELECT id FROM staff WHERE user_id = auth.uid())
);

-- Allow teachers to view scores for their classes
DROP POLICY IF EXISTS "Users can view scores in their institution" ON student_scores;

CREATE POLICY "Teachers can view scores for their classes"
ON student_scores
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM class_teachers ct
    JOIN staff s ON s.id = ct.staff_id
    WHERE s.user_id = auth.uid()
    AND ct.class_id IN (
      SELECT class_id FROM students WHERE id = student_id
    )
  )
  OR has_permission(auth.uid(), 'academics', 'view', institution_id)
);

-- Fix attendance policies similarly
DROP POLICY IF EXISTS "Users can create attendance records" ON attendance;

CREATE POLICY "Teachers can create attendance for their classes"
ON attendance
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM class_teachers ct
    JOIN staff s ON s.id = ct.staff_id
    WHERE s.user_id = auth.uid()
    AND ct.class_id = attendance.class_id
  )
);

-- Teachers can update attendance they recorded
DROP POLICY IF EXISTS "Users can update attendance records" ON attendance;

CREATE POLICY "Teachers can update attendance they recorded"
ON attendance
FOR UPDATE
TO authenticated
USING (
  recorded_by IN (SELECT id FROM staff WHERE user_id = auth.uid())
);

-- Teachers can delete attendance for re-entry
CREATE POLICY "Teachers can delete attendance for their classes"
ON attendance
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM class_teachers ct
    JOIN staff s ON s.id = ct.staff_id
    WHERE s.user_id = auth.uid()
    AND ct.class_id = attendance.class_id
  )
);