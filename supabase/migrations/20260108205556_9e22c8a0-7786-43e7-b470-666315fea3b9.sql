-- Add curriculum column to institutions table
ALTER TABLE public.institutions 
ADD COLUMN IF NOT EXISTS curriculum text DEFAULT 'ke_cbc';

-- Add comment for documentation
COMMENT ON COLUMN public.institutions.curriculum IS 'The curriculum system used by this institution (e.g., ke_cbc, ib_diploma, ug_uce)';