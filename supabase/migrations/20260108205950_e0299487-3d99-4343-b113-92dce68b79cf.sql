-- Add columns for institution-specific and dual sender ID support
ALTER TABLE public.sms_settings 
ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS transactional_sender_id text,
ADD COLUMN IF NOT EXISTS promotional_sender_id text,
ADD COLUMN IF NOT EXISTS transactional_sender_type integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS promotional_sender_type integer DEFAULT 10;

-- Create unique constraint for institution (allowing one config per institution)
CREATE UNIQUE INDEX IF NOT EXISTS unique_institution_sms_settings 
ON public.sms_settings (institution_id) 
WHERE institution_id IS NOT NULL;

-- Add RLS policies for institution-level access
CREATE POLICY "Users can view their institution SMS settings"
ON public.sms_settings
FOR SELECT
USING (
  institution_id IS NULL 
  OR institution_id IN (
    SELECT institution_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can update their institution SMS settings"
ON public.sms_settings
FOR UPDATE
USING (
  institution_id IN (
    SELECT institution_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can insert their institution SMS settings"
ON public.sms_settings
FOR INSERT
WITH CHECK (
  institution_id IN (
    SELECT institution_id FROM public.profiles WHERE user_id = auth.uid()
  )
);