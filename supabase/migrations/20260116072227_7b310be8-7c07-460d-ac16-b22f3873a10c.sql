-- Allow staff to view their own record
CREATE POLICY "Staff can view their own record"
ON staff
FOR SELECT
TO authenticated
USING (user_id = auth.uid());