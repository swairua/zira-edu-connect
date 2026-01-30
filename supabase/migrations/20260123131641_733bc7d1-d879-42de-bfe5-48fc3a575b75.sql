-- Add transport.approve permission if not exists
INSERT INTO permissions (domain, action, name, description)
VALUES ('transport', 'approve', 'Approve Transport Requests', 'Approve transport subscription requests')
ON CONFLICT (domain, action) DO NOTHING;

-- Grant transport.approve to appropriate roles
INSERT INTO role_permissions (role, permission_id)
SELECT 'institution_owner', id FROM permissions WHERE domain = 'transport'::permission_domain AND action = 'approve'::permission_action
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT 'institution_admin', id FROM permissions WHERE domain = 'transport'::permission_domain AND action = 'approve'::permission_action
ON CONFLICT DO NOTHING;

-- Ensure finance.approve exists and is granted to appropriate roles
INSERT INTO permissions (domain, action, name, description)
VALUES ('finance', 'approve', 'Approve Financial Items', 'Approve financial adjustments, waivers, and discounts')
ON CONFLICT (domain, action) DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT 'institution_owner', id FROM permissions WHERE domain = 'finance'::permission_domain AND action = 'approve'::permission_action
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT 'institution_admin', id FROM permissions WHERE domain = 'finance'::permission_domain AND action = 'approve'::permission_action
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT 'bursar', id FROM permissions WHERE domain = 'finance'::permission_domain AND action = 'approve'::permission_action
ON CONFLICT DO NOTHING;

-- Ensure academics.approve exists for grade approvals
INSERT INTO permissions (domain, action, name, description)
VALUES ('academics', 'approve', 'Approve Academic Items', 'Approve grade changes and academic requests')
ON CONFLICT (domain, action) DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT 'institution_owner', id FROM permissions WHERE domain = 'academics'::permission_domain AND action = 'approve'::permission_action
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT 'institution_admin', id FROM permissions WHERE domain = 'academics'::permission_domain AND action = 'approve'::permission_action
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT 'academic_dean', id FROM permissions WHERE domain = 'academics'::permission_domain AND action = 'approve'::permission_action
ON CONFLICT DO NOTHING;

-- Ensure staff_hr.approve exists for leave approvals
INSERT INTO permissions (domain, action, name, description)
VALUES ('staff_hr', 'approve', 'Approve HR Items', 'Approve leave requests and HR-related approvals')
ON CONFLICT (domain, action) DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT 'institution_owner', id FROM permissions WHERE domain = 'staff_hr'::permission_domain AND action = 'approve'::permission_action
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT 'institution_admin', id FROM permissions WHERE domain = 'staff_hr'::permission_domain AND action = 'approve'::permission_action
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT 'hr_manager', id FROM permissions WHERE domain = 'staff_hr'::permission_domain AND action = 'approve'::permission_action
ON CONFLICT DO NOTHING;