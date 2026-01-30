-- Fix RLS UPDATE policy for in_app_notifications to allow parents and students to mark their notifications as read

-- Drop the existing restrictive UPDATE policy
DROP POLICY IF EXISTS "Users can update own notifications" ON in_app_notifications;

-- Create new inclusive UPDATE policy for users, parents, and students
CREATE POLICY "Users and parents can update own notifications"
ON in_app_notifications
FOR UPDATE
USING (
  (user_id = auth.uid()) 
  OR (parent_id IN (
    SELECT id FROM parents WHERE user_id = auth.uid()
  ))
  OR (student_id IN (
    SELECT id FROM students WHERE user_id = auth.uid()
  ))
);