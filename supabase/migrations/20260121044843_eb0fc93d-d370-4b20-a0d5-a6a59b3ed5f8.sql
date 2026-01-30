-- Create pricing_tiers table for the 6-tier system
CREATE TABLE public.pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  min_students INTEGER NOT NULL,
  max_students INTEGER NOT NULL,  -- -1 for unlimited
  representative_count INTEGER NOT NULL,
  description TEXT,
  is_popular BOOLEAN DEFAULT false,
  is_contact_sales BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add unique constraint on tier_number
ALTER TABLE public.pricing_tiers ADD CONSTRAINT pricing_tiers_tier_number_unique UNIQUE (tier_number);

-- Enable RLS
ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;

-- Allow public read access (pricing is public info)
CREATE POLICY "Pricing tiers are publicly readable"
  ON public.pricing_tiers
  FOR SELECT
  USING (true);

-- Only super_admin can modify tiers
CREATE POLICY "Super admins can manage pricing tiers"
  ON public.pricing_tiers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'super_admin'
    )
  );

-- Seed the 6 tiers
INSERT INTO public.pricing_tiers (tier_number, name, min_students, max_students, representative_count, description, is_popular, is_contact_sales, display_order)
VALUES
  (1, 'Micro', 1, 100, 75, 'Perfect for small private schools and early learning centers', false, false, 1),
  (2, 'Small', 101, 300, 200, 'Ideal for growing primary schools', false, false, 2),
  (3, 'Medium', 301, 600, 450, 'Most popular choice for established schools', true, false, 3),
  (4, 'Large', 601, 1000, 800, 'For large primary and secondary schools', false, false, 4),
  (5, 'Extra Large', 1001, 1500, 1250, 'For major institutions with multiple streams', false, false, 5),
  (6, 'Mega', 1501, -1, 1750, 'Enterprise solutions for the largest institutions', false, true, 6);

-- Create trigger for updated_at
CREATE TRIGGER update_pricing_tiers_updated_at
  BEFORE UPDATE ON public.pricing_tiers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();