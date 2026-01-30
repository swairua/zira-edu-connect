-- Insert the system_settings.create permission
INSERT INTO public.permissions (domain, action, name, description, is_system)
VALUES ('system_settings', 'create', 'system_settings.create', 'Create system settings like academic years, terms, and configurations', true)
ON CONFLICT DO NOTHING;

-- Assign the permission to institution_admin role
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'institution_admin', id 
FROM public.permissions 
WHERE domain = 'system_settings' AND action = 'create'
ON CONFLICT DO NOTHING;