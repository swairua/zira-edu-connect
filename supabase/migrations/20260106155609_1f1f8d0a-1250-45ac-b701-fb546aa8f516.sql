-- Add system_settings.delete permission if it doesn't exist
INSERT INTO permissions (domain, action, name, description)
VALUES ('system_settings', 'delete', 'Delete Settings', 'Delete system settings and configurations')
ON CONFLICT (domain, action) DO NOTHING;

-- Get the permission ID and assign to institution_owner
INSERT INTO role_permissions (role, permission_id, institution_id)
SELECT 'institution_owner', id, NULL 
FROM permissions 
WHERE domain = 'system_settings' AND action = 'delete'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role = 'institution_owner' 
  AND rp.permission_id = permissions.id 
  AND rp.institution_id IS NULL
);

-- Assign to institution_admin
INSERT INTO role_permissions (role, permission_id, institution_id)
SELECT 'institution_admin', id, NULL 
FROM permissions 
WHERE domain = 'system_settings' AND action = 'delete'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role = 'institution_admin' 
  AND rp.permission_id = permissions.id 
  AND rp.institution_id IS NULL
);

-- Also add system_settings.edit permission if missing
INSERT INTO permissions (domain, action, name, description)
VALUES ('system_settings', 'edit', 'Edit Settings', 'Edit system settings and configurations')
ON CONFLICT (domain, action) DO NOTHING;

-- Assign edit to institution_owner
INSERT INTO role_permissions (role, permission_id, institution_id)
SELECT 'institution_owner', id, NULL 
FROM permissions 
WHERE domain = 'system_settings' AND action = 'edit'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role = 'institution_owner' 
  AND rp.permission_id = permissions.id 
  AND rp.institution_id IS NULL
);

-- Assign edit to institution_admin
INSERT INTO role_permissions (role, permission_id, institution_id)
SELECT 'institution_admin', id, NULL 
FROM permissions 
WHERE domain = 'system_settings' AND action = 'edit'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role = 'institution_admin' 
  AND rp.permission_id = permissions.id 
  AND rp.institution_id IS NULL
);