-- Phase 1A: Add new role enum values (must be committed before use)
-- =============================================

-- 1.1 Create Permission Enums
CREATE TYPE permission_action AS ENUM ('view', 'create', 'edit', 'approve', 'delete', 'export');

CREATE TYPE permission_domain AS ENUM (
  'students', 'academics', 'finance', 'staff_hr', 
  'communication', 'reports', 'system_settings'
);

-- 1.2 Extend app_role enum with new roles
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'support_admin';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'institution_owner';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'finance_officer';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'academic_director';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'ict_admin';

-- 1.3 Create permissions table (master permission definitions)
CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain permission_domain NOT NULL,
  action permission_action NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (domain, action)
);

-- 1.4 Create role_permissions table (map roles to permissions)
-- Using TEXT for role to avoid enum transaction issues
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (role, permission_id, institution_id)
);

-- 1.5 Create custom_roles table (institution-specific custom roles)
CREATE TABLE public.custom_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_role TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (institution_id, name)
);

-- 1.6 Create custom_role_permissions table
CREATE TABLE public.custom_role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_role_id UUID NOT NULL REFERENCES custom_roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (custom_role_id, permission_id)
);

-- Enable RLS on new tables
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_role_permissions ENABLE ROW LEVEL SECURITY;

-- 1.7 RLS Policies for permission tables

-- Permissions table: Everyone can view, only super admins can modify
CREATE POLICY "Anyone can view permissions"
ON public.permissions FOR SELECT
USING (true);

CREATE POLICY "Super admins can manage permissions"
ON public.permissions FOR ALL
USING (is_super_admin(auth.uid()));

-- Role permissions: Super admins and institution owners can manage
CREATE POLICY "Super admins can view all role permissions"
ON public.role_permissions FOR SELECT
USING (is_super_admin(auth.uid()));

CREATE POLICY "Institution owners can view their role permissions"
ON public.role_permissions FOR SELECT
USING (institution_id = get_user_institution_id(auth.uid()));

CREATE POLICY "Super admins can manage role permissions"
ON public.role_permissions FOR ALL
USING (is_super_admin(auth.uid()));

-- Custom roles: Institution-scoped management
CREATE POLICY "Super admins can view all custom roles"
ON public.custom_roles FOR SELECT
USING (is_super_admin(auth.uid()));

CREATE POLICY "Institution users can view their custom roles"
ON public.custom_roles FOR SELECT
USING (institution_id = get_user_institution_id(auth.uid()));

CREATE POLICY "Institution admins can manage custom roles"
ON public.custom_roles FOR ALL
USING (
  institution_id = get_user_institution_id(auth.uid())
  AND has_role(auth.uid(), 'institution_admin')
);

CREATE POLICY "Super admins can manage all custom roles"
ON public.custom_roles FOR ALL
USING (is_super_admin(auth.uid()));

-- Custom role permissions
CREATE POLICY "Super admins can view all custom role permissions"
ON public.custom_role_permissions FOR SELECT
USING (is_super_admin(auth.uid()));

CREATE POLICY "Institution users can view their custom role permissions"
ON public.custom_role_permissions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM custom_roles cr
    WHERE cr.id = custom_role_id
    AND cr.institution_id = get_user_institution_id(auth.uid())
  )
);

CREATE POLICY "Super admins can manage all custom role permissions"
ON public.custom_role_permissions FOR ALL
USING (is_super_admin(auth.uid()));

-- 1.8 Seed default permissions
INSERT INTO public.permissions (domain, action, name, description) VALUES
-- Students domain
('students', 'view', 'View Students', 'View student records and profiles'),
('students', 'create', 'Create Students', 'Add new students to the system'),
('students', 'edit', 'Edit Students', 'Modify student information'),
('students', 'delete', 'Delete Students', 'Remove students from the system'),
('students', 'export', 'Export Students', 'Export student data'),

-- Academics domain
('academics', 'view', 'View Academics', 'View academic records, grades, and schedules'),
('academics', 'create', 'Create Academics', 'Create classes, subjects, and academic content'),
('academics', 'edit', 'Edit Academics', 'Modify academic records and grades'),
('academics', 'approve', 'Approve Academics', 'Approve academic changes and results'),
('academics', 'delete', 'Delete Academics', 'Delete academic records'),
('academics', 'export', 'Export Academics', 'Export academic data and reports'),

-- Finance domain
('finance', 'view', 'View Finance', 'View financial records and invoices'),
('finance', 'create', 'Create Finance', 'Create invoices and fee structures'),
('finance', 'edit', 'Edit Finance', 'Modify financial records'),
('finance', 'approve', 'Approve Finance', 'Approve payments and financial transactions'),
('finance', 'delete', 'Delete Finance', 'Delete financial records'),
('finance', 'export', 'Export Finance', 'Export financial reports'),

-- Staff/HR domain
('staff_hr', 'view', 'View Staff', 'View staff records and HR information'),
('staff_hr', 'create', 'Create Staff', 'Add new staff members'),
('staff_hr', 'edit', 'Edit Staff', 'Modify staff information'),
('staff_hr', 'approve', 'Approve Staff', 'Approve staff changes and leave requests'),
('staff_hr', 'delete', 'Delete Staff', 'Remove staff from the system'),
('staff_hr', 'export', 'Export Staff', 'Export staff data'),

-- Communication domain
('communication', 'view', 'View Communication', 'View messages and announcements'),
('communication', 'create', 'Create Communication', 'Send messages and create announcements'),
('communication', 'edit', 'Edit Communication', 'Modify messages and announcements'),
('communication', 'delete', 'Delete Communication', 'Delete messages and announcements'),

-- Reports domain
('reports', 'view', 'View Reports', 'View system reports'),
('reports', 'create', 'Create Reports', 'Generate new reports'),
('reports', 'export', 'Export Reports', 'Export reports in various formats'),

-- System Settings domain
('system_settings', 'view', 'View Settings', 'View system configuration'),
('system_settings', 'edit', 'Edit Settings', 'Modify system configuration'),
('system_settings', 'approve', 'Approve Settings', 'Approve critical system changes');

-- 1.9 Update audit_logs with enhanced fields
ALTER TABLE public.audit_logs 
  ADD COLUMN IF NOT EXISTS permission_used TEXT,
  ADD COLUMN IF NOT EXISTS old_values JSONB,
  ADD COLUMN IF NOT EXISTS new_values JSONB,
  ADD COLUMN IF NOT EXISTS request_id UUID,
  ADD COLUMN IF NOT EXISTS user_agent TEXT;