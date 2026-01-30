-- Fix student diary RLS policies
-- Issue: Teachers have students:view but not students:edit
-- Solution: Add separate policies for SELECT vs INSERT/UPDATE with appropriate permissions

-- Drop the existing ALL policy that requires edit permission for everything
DROP POLICY IF EXISTS "Staff can manage diary entries for their institution" ON public.student_diary_entries;

-- Create separate policies with correct permission requirements

-- SELECT: Staff with students:view can read diary entries
CREATE POLICY "Staff can view diary entries"
ON public.student_diary_entries
FOR SELECT
USING (has_permission(auth.uid(), 'students', 'view', institution_id));

-- INSERT: Staff with students:edit can create diary entries  
CREATE POLICY "Staff can create diary entries"
ON public.student_diary_entries
FOR INSERT
WITH CHECK (has_permission(auth.uid(), 'students', 'edit', institution_id));

-- UPDATE: Staff with students:edit can update diary entries
CREATE POLICY "Staff can update diary entries"
ON public.student_diary_entries
FOR UPDATE
USING (has_permission(auth.uid(), 'students', 'edit', institution_id))
WITH CHECK (has_permission(auth.uid(), 'students', 'edit', institution_id));

-- DELETE: Staff with students:delete can delete diary entries
CREATE POLICY "Staff can delete diary entries"
ON public.student_diary_entries
FOR DELETE
USING (has_permission(auth.uid(), 'students', 'delete', institution_id));

-- Grant teachers students:edit permission so they can create diary entries
INSERT INTO role_permissions (role, permission_id, institution_id)
SELECT 'teacher', id, NULL
FROM permissions
WHERE domain = 'students' AND action = 'edit'
ON CONFLICT DO NOTHING;