-- Add UPDATE policy for institution admins to modify their module config
CREATE POLICY "Institution admins can update their module config"
ON institution_module_config
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.institution_id = institution_module_config.institution_id
    AND user_roles.role IN ('institution_owner', 'institution_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.institution_id = institution_module_config.institution_id
    AND user_roles.role IN ('institution_owner', 'institution_admin')
  )
);

-- Add INSERT policy for when no config exists yet
CREATE POLICY "Institution admins can insert their module config"
ON institution_module_config
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.institution_id = institution_module_config.institution_id
    AND user_roles.role IN ('institution_owner', 'institution_admin')
  )
);