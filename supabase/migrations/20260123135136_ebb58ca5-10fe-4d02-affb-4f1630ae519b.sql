-- Add secondary approval columns for 3-level voucher workflow
ALTER TABLE public.payment_vouchers 
ADD COLUMN IF NOT EXISTS secondary_approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS secondary_approved_at TIMESTAMPTZ;

-- Add secondary approval columns for financial adjustments
ALTER TABLE public.financial_adjustments
ADD COLUMN IF NOT EXISTS secondary_approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS secondary_approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS requires_secondary_approval BOOLEAN DEFAULT false;

-- Add index for performance on approval queries
CREATE INDEX IF NOT EXISTS idx_payment_vouchers_secondary_approved_by 
ON public.payment_vouchers(secondary_approved_by) WHERE secondary_approved_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_financial_adjustments_secondary_approved_by 
ON public.financial_adjustments(secondary_approved_by) WHERE secondary_approved_by IS NOT NULL;

-- Comment for clarity
COMMENT ON COLUMN public.payment_vouchers.secondary_approved_by IS 'User who provided Level 2 approval for 3-level workflow';
COMMENT ON COLUMN public.payment_vouchers.secondary_approved_at IS 'Timestamp of Level 2 approval';
COMMENT ON COLUMN public.financial_adjustments.requires_secondary_approval IS 'True if amount exceeds threshold requiring senior approval';