-- Add is_demo flag to institutions table for demo mode support
ALTER TABLE public.institutions 
ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;

-- Add index for quick demo institution lookups
CREATE INDEX IF NOT EXISTS idx_institutions_is_demo ON public.institutions(is_demo) WHERE is_demo = true;

-- Comment for documentation
COMMENT ON COLUMN public.institutions.is_demo IS 'Marks institution as a demo account. Demo institutions skip real SMS/payment sending.';