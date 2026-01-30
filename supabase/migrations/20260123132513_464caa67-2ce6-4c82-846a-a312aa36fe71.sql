-- Create SMS credit purchases table for tracking purchase flow
CREATE TABLE IF NOT EXISTS public.sms_credit_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) NOT NULL,
  bundle_id UUID REFERENCES public.sms_bundles(id) NOT NULL,
  amount NUMERIC NOT NULL,
  credits_to_add INTEGER NOT NULL,
  phone_number TEXT NOT NULL,
  checkout_request_id TEXT,
  merchant_request_id TEXT,
  mpesa_receipt TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  result_code TEXT,
  result_desc TEXT,
  callback_received_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add index for lookups
CREATE INDEX IF NOT EXISTS idx_sms_credit_purchases_institution ON public.sms_credit_purchases(institution_id);
CREATE INDEX IF NOT EXISTS idx_sms_credit_purchases_checkout ON public.sms_credit_purchases(checkout_request_id);
CREATE INDEX IF NOT EXISTS idx_sms_credit_purchases_status ON public.sms_credit_purchases(status);

-- Enable RLS
ALTER TABLE public.sms_credit_purchases ENABLE ROW LEVEL SECURITY;

-- RLS policies for sms_credit_purchases
CREATE POLICY "Institutions can view their own purchases"
  ON public.sms_credit_purchases FOR SELECT
  USING (
    institution_id IN (
      SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all purchases"
  ON public.sms_credit_purchases FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Add remaining_credits computed column to institution_sms_credits (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'institution_sms_credits' 
    AND column_name = 'remaining_credits'
  ) THEN
    ALTER TABLE public.institution_sms_credits 
    ADD COLUMN remaining_credits INTEGER GENERATED ALWAYS AS (total_credits - used_credits) STORED;
  END IF;
END $$;

-- Add trigger for updated_at on sms_credit_purchases
CREATE OR REPLACE FUNCTION update_sms_credit_purchases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_sms_credit_purchases_updated_at ON public.sms_credit_purchases;
CREATE TRIGGER update_sms_credit_purchases_updated_at
  BEFORE UPDATE ON public.sms_credit_purchases
  FOR EACH ROW EXECUTE FUNCTION update_sms_credit_purchases_updated_at();

-- Enable realtime for sms_credit_purchases so UI can track status
ALTER PUBLICATION supabase_realtime ADD TABLE public.sms_credit_purchases;