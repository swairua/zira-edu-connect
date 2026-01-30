-- =============================================
-- Enhanced Subscription System - Complete Migration
-- =============================================

-- 1. Create ownership_type enum
DO $$ BEGIN
  CREATE TYPE public.ownership_type AS ENUM ('public', 'private');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Add ownership_type column to institutions
ALTER TABLE public.institutions 
ADD COLUMN IF NOT EXISTS ownership_type public.ownership_type DEFAULT 'private';

-- 3. Create subscription_tier_pricing table for population-based pricing
CREATE TABLE public.subscription_tier_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id public.subscription_plan NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
  ownership_type public.ownership_type NOT NULL,
  min_students INTEGER NOT NULL DEFAULT 0,
  max_students INTEGER NOT NULL DEFAULT 150,
  setup_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  annual_subscription NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'KES',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(plan_id, ownership_type, min_students, max_students)
);

-- Enable RLS on subscription_tier_pricing
ALTER TABLE public.subscription_tier_pricing ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscription_tier_pricing
CREATE POLICY "Anyone can view active tier pricing" ON public.subscription_tier_pricing
  FOR SELECT USING (is_active = true);

CREATE POLICY "Super admins can manage tier pricing" ON public.subscription_tier_pricing
  FOR ALL USING (public.is_super_admin(auth.uid()));

-- 4. Create sms_bundles table for prepaid SMS packages
CREATE TABLE public.sms_bundles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL,
  credits INTEGER NOT NULL,
  bonus_credits INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'KES',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on sms_bundles
ALTER TABLE public.sms_bundles ENABLE ROW LEVEL SECURITY;

-- RLS policies for sms_bundles
CREATE POLICY "Anyone can view active SMS bundles" ON public.sms_bundles
  FOR SELECT USING (is_active = true);

CREATE POLICY "Super admins can manage SMS bundles" ON public.sms_bundles
  FOR ALL USING (public.is_super_admin(auth.uid()));

-- 5. Create institution_sms_credits table for tracking institution SMS balances
CREATE TABLE public.institution_sms_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE UNIQUE,
  total_credits INTEGER NOT NULL DEFAULT 0,
  used_credits INTEGER NOT NULL DEFAULT 0,
  low_balance_threshold INTEGER NOT NULL DEFAULT 100,
  last_topup_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on institution_sms_credits
ALTER TABLE public.institution_sms_credits ENABLE ROW LEVEL SECURITY;

-- RLS policies for institution_sms_credits
CREATE POLICY "Users can view their institution SMS credits" ON public.institution_sms_credits
  FOR SELECT USING (
    public.is_super_admin(auth.uid()) OR 
    public.can_access_campus(auth.uid(), institution_id)
  );

CREATE POLICY "Super admins can manage SMS credits" ON public.institution_sms_credits
  FOR ALL USING (public.is_super_admin(auth.uid()));

-- 6. Create sms_credit_transactions table for tracking SMS credit history
CREATE TABLE public.sms_credit_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'refund', 'bonus', 'adjustment')),
  credits INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  bundle_id UUID REFERENCES public.sms_bundles(id),
  payment_id UUID REFERENCES public.institution_payments(id),
  sms_log_id UUID,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on sms_credit_transactions
ALTER TABLE public.sms_credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for sms_credit_transactions
CREATE POLICY "Users can view their institution SMS transactions" ON public.sms_credit_transactions
  FOR SELECT USING (
    public.is_super_admin(auth.uid()) OR 
    public.can_access_campus(auth.uid(), institution_id)
  );

CREATE POLICY "Super admins can manage SMS transactions" ON public.sms_credit_transactions
  FOR ALL USING (public.is_super_admin(auth.uid()));

-- 7. Add updated_at triggers
CREATE TRIGGER update_subscription_tier_pricing_updated_at
  BEFORE UPDATE ON public.subscription_tier_pricing
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sms_bundles_updated_at
  BEFORE UPDATE ON public.sms_bundles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_institution_sms_credits_updated_at
  BEFORE UPDATE ON public.institution_sms_credits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Create indexes for faster lookups
CREATE INDEX idx_subscription_tier_pricing_lookup 
  ON public.subscription_tier_pricing(plan_id, ownership_type, is_active);

CREATE INDEX idx_sms_credit_transactions_institution 
  ON public.sms_credit_transactions(institution_id, created_at DESC);

-- 9. Update subscription_plans to add new fields
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS includes_setup_year1 BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS core_modules TEXT[] DEFAULT ARRAY['academics', 'finance'],
ADD COLUMN IF NOT EXISTS supports_tier_pricing BOOLEAN DEFAULT false;