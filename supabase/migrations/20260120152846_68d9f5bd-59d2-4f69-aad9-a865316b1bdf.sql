-- Add tracking columns to demo_requests table for lead management
ALTER TABLE public.demo_requests 
ADD COLUMN IF NOT EXISTS contacted_at timestamptz,
ADD COLUMN IF NOT EXISTS contacted_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS converted_institution_id uuid REFERENCES public.institutions(id),
ADD COLUMN IF NOT EXISTS notes text;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_demo_requests_status ON public.demo_requests(status);
CREATE INDEX IF NOT EXISTS idx_demo_requests_created_at ON public.demo_requests(created_at DESC);