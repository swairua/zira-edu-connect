-- Create demo_requests table for lead tracking
CREATE TABLE public.demo_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  school_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for public form submissions)
CREATE POLICY "Anyone can submit demo requests"
  ON public.demo_requests FOR INSERT
  WITH CHECK (true);

-- Only super admins can view requests
CREATE POLICY "Super admins can view demo requests"
  ON public.demo_requests FOR SELECT
  TO authenticated
  USING (public.is_super_admin(auth.uid()));