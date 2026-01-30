-- Add PIN fields to students table
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS login_pin TEXT,
ADD COLUMN IF NOT EXISTS pin_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS pin_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS portal_enabled BOOLEAN DEFAULT FALSE;

-- Create student sessions table for PIN-based auth
CREATE TABLE IF NOT EXISTS public.student_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_sessions_token ON public.student_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_student_sessions_student ON public.student_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_student_sessions_expires ON public.student_sessions(expires_at);

-- Enable RLS
ALTER TABLE public.student_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policy: Only allow edge functions (service role) to manage sessions
CREATE POLICY "Service role can manage student sessions"
ON public.student_sessions
FOR ALL
USING (true)
WITH CHECK (true);

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_student_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.student_sessions WHERE expires_at < NOW();
END;
$$;