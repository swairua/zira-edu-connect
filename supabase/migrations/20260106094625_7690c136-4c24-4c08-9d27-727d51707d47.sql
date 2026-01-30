-- Add new values to institution_status enum
ALTER TYPE institution_status ADD VALUE IF NOT EXISTS 'churned';
ALTER TYPE institution_status ADD VALUE IF NOT EXISTS 'expired';

-- Add lifecycle tracking columns to institutions
ALTER TABLE public.institutions 
ADD COLUMN IF NOT EXISTS subscription_started_at timestamptz,
ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz,
ADD COLUMN IF NOT EXISTS last_payment_at timestamptz,
ADD COLUMN IF NOT EXISTS churn_reason text;

-- Create index for subscription expiry queries
CREATE INDEX IF NOT EXISTS idx_institutions_subscription_expires 
ON public.institutions(subscription_expires_at) 
WHERE status IN ('active', 'trial');

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_institutions_status 
ON public.institutions(status);