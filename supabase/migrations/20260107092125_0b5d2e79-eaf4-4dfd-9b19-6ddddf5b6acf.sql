-- Create otp_codes table for storing OTPs
CREATE TABLE public.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('student', 'parent')),
  entity_id UUID NOT NULL,
  institution_id UUID REFERENCES institutions(id),
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient lookups
CREATE INDEX idx_otp_phone ON otp_codes(phone);
CREATE INDEX idx_otp_expires ON otp_codes(expires_at);
CREATE INDEX idx_otp_entity ON otp_codes(entity_id, user_type);

-- Enable RLS
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Only allow service role to access (edge functions use service role)
CREATE POLICY "Service role only" ON public.otp_codes
  FOR ALL USING (false);

-- Add portal fields to parents table
ALTER TABLE public.parents 
  ADD COLUMN IF NOT EXISTS portal_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Create parent_sessions table for OTP-based parent sessions
CREATE TABLE public.parent_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_parent_sessions_parent ON parent_sessions(parent_id);
CREATE INDEX idx_parent_sessions_token ON parent_sessions(token_hash);
CREATE INDEX idx_parent_sessions_expires ON parent_sessions(expires_at);

-- Enable RLS
ALTER TABLE public.parent_sessions ENABLE ROW LEVEL SECURITY;

-- Only service role can access
CREATE POLICY "Service role only" ON public.parent_sessions
  FOR ALL USING (false);

-- Function to cleanup expired OTPs
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.otp_codes WHERE expires_at < NOW();
END;
$$;

-- Function to cleanup expired parent sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_parent_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.parent_sessions WHERE expires_at < NOW();
END;
$$;