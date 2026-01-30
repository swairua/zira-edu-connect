-- Insert permissions for uniforms domain
INSERT INTO public.permissions (domain, action, name, description)
VALUES 
  ('uniforms', 'view', 'uniforms.view', 'View uniform catalog and orders'),
  ('uniforms', 'create', 'uniforms.create', 'Create uniform items and orders'),
  ('uniforms', 'edit', 'uniforms.edit', 'Edit uniform items and process orders'),
  ('uniforms', 'approve', 'uniforms.approve', 'Approve orders and stock adjustments'),
  ('uniforms', 'delete', 'uniforms.delete', 'Delete uniform items'),
  ('uniforms', 'export', 'uniforms.export', 'Export uniform reports')
ON CONFLICT (domain, action) DO NOTHING;