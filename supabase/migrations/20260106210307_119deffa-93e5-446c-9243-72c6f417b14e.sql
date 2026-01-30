-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Service role can manage student sessions" ON public.student_sessions;

-- Create restrictive policy - only authenticated users can see their own sessions via edge functions
-- The actual management happens via service role in edge functions which bypasses RLS
CREATE POLICY "No direct access to student sessions"
ON public.student_sessions
FOR ALL
USING (false)
WITH CHECK (false);