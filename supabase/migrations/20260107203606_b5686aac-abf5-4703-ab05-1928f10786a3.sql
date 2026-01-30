-- Add platform permissions for super admin routes
INSERT INTO permissions (domain, action, name, description, is_system)
VALUES 
  ('platform', 'view', 'View Platform', 'View platform-level data and dashboards', true),
  ('platform', 'create', 'Create Platform Resources', 'Create institutions and platform configurations', true),
  ('platform', 'edit', 'Edit Platform Settings', 'Modify platform-wide settings', true),
  ('platform', 'delete', 'Delete Platform Resources', 'Delete institutions and platform data', true),
  ('platform', 'export', 'Export Platform Data', 'Export platform-wide reports and data', true)
ON CONFLICT DO NOTHING;

-- Grant platform permissions to super_admin
INSERT INTO role_permissions (role, permission_id)
SELECT 'super_admin', p.id 
FROM permissions p 
WHERE p.domain = 'platform'
ON CONFLICT DO NOTHING;

-- Grant view-only platform permissions to support_admin
INSERT INTO role_permissions (role, permission_id)
SELECT 'support_admin', p.id 
FROM permissions p 
WHERE p.domain = 'platform' AND p.action = 'view'
ON CONFLICT DO NOTHING;