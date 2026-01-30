-- Allow authenticated users to read billing_settings (needed for pricing display in upgrade dialogs)
CREATE POLICY "Authenticated users can view billing settings"
ON public.billing_settings
FOR SELECT
TO authenticated
USING (true);