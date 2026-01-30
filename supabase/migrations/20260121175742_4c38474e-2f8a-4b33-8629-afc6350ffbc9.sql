-- Insert transport permissions (only if not exists)
INSERT INTO permissions (domain, action, name, description)
SELECT 'transport', 'view', 'transport.view', 'View transport routes and vehicles'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'transport.view');

INSERT INTO permissions (domain, action, name, description)
SELECT 'transport', 'create', 'transport.create', 'Create transport routes and vehicles'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'transport.create');

INSERT INTO permissions (domain, action, name, description)
SELECT 'transport', 'edit', 'transport.edit', 'Edit transport routes and vehicles'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'transport.edit');

INSERT INTO permissions (domain, action, name, description)
SELECT 'transport', 'delete', 'transport.delete', 'Delete transport routes and vehicles'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'transport.delete');

INSERT INTO permissions (domain, action, name, description)
SELECT 'transport', 'export', 'transport.export', 'Export transport data'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'transport.export');

-- Grant transport permissions to institution_owner
INSERT INTO role_permissions (role, permission_id)
SELECT 'institution_owner', p.id
FROM permissions p
WHERE p.domain = 'transport'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role = 'institution_owner' AND rp.permission_id = p.id
);

-- Grant transport permissions to institution_admin
INSERT INTO role_permissions (role, permission_id)
SELECT 'institution_admin', p.id
FROM permissions p
WHERE p.domain = 'transport'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role = 'institution_admin' AND rp.permission_id = p.id
);

-- Grant transport view to hr_manager
INSERT INTO role_permissions (role, permission_id)
SELECT 'hr_manager', p.id
FROM permissions p
WHERE p.domain = 'transport' AND p.action = 'view'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role = 'hr_manager' AND rp.permission_id = p.id
);

-- Grant students.view to librarian
INSERT INTO role_permissions (role, permission_id)
SELECT 'librarian', p.id
FROM permissions p
WHERE p.domain = 'students' AND p.action = 'view'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role = 'librarian' AND rp.permission_id = p.id
);

-- Grant students.view and communication.view to coach
INSERT INTO role_permissions (role, permission_id)
SELECT 'coach', p.id
FROM permissions p
WHERE ((p.domain = 'students' AND p.action = 'view')
   OR (p.domain = 'communication' AND p.action = 'view'))
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role = 'coach' AND rp.permission_id = p.id
);

-- Grant students.view and reports access to bursar
INSERT INTO role_permissions (role, permission_id)
SELECT 'bursar', p.id
FROM permissions p
WHERE ((p.domain = 'students' AND p.action = 'view')
   OR (p.domain = 'reports' AND p.action IN ('view', 'export')))
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role = 'bursar' AND rp.permission_id = p.id
);