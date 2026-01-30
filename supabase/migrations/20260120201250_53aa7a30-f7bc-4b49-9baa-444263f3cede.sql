-- Add RLS policy for finance users to view academic years
CREATE POLICY "Users with finance.view can view academic years"
ON public.academic_years
FOR SELECT
USING (
  public.has_permission(auth.uid(), 'finance', 'view', institution_id)
);

-- Add RLS policy for finance users to view terms
CREATE POLICY "Users with finance.view can view terms"
ON public.terms
FOR SELECT
USING (
  public.has_permission(auth.uid(), 'finance', 'view', institution_id)
);