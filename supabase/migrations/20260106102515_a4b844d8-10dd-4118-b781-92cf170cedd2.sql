-- Phase 1B: Security functions for permission checking
-- =============================================

-- Check if user has a specific permission
CREATE OR REPLACE FUNCTION public.has_permission(
  _user_id UUID,
  _domain TEXT,
  _action TEXT,
  _institution_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _permission_id UUID;
  _has_perm BOOLEAN := false;
  _user_institution_id UUID;
BEGIN
  -- Super admins have all permissions
  IF public.is_super_admin(_user_id) THEN
    RETURN true;
  END IF;

  -- Get the permission ID
  SELECT id INTO _permission_id
  FROM public.permissions
  WHERE domain::text = _domain AND action::text = _action;

  IF _permission_id IS NULL THEN
    RETURN false;
  END IF;

  -- Get user's institution if not provided
  IF _institution_id IS NULL THEN
    SELECT institution_id INTO _user_institution_id
    FROM public.profiles
    WHERE user_id = _user_id
    LIMIT 1;
  ELSE
    _user_institution_id := _institution_id;
  END IF;

  -- Check role-based permissions
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role::text = rp.role
    WHERE ur.user_id = _user_id
      AND rp.permission_id = _permission_id
      AND (
        rp.institution_id IS NULL -- System-wide permission
        OR rp.institution_id = _user_institution_id -- Institution-specific
      )
  ) INTO _has_perm;

  IF _has_perm THEN
    RETURN true;
  END IF;

  -- Check custom role permissions
  SELECT EXISTS (
    SELECT 1
    FROM public.custom_roles cr
    JOIN public.custom_role_permissions crp ON crp.custom_role_id = cr.id
    WHERE cr.institution_id = _user_institution_id
      AND crp.permission_id = _permission_id
      AND cr.is_active = true
  ) INTO _has_perm;

  RETURN _has_perm;
END;
$$;

-- Check if user is a support admin
CREATE OR REPLACE FUNCTION public.is_support_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'support_admin'
  )
$$;

-- Get all permissions for a user at an institution
CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id UUID, _institution_id UUID DEFAULT NULL)
RETURNS TABLE (
  domain TEXT,
  action TEXT,
  permission_name TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_institution_id UUID;
BEGIN
  -- Super admins have all permissions
  IF public.is_super_admin(_user_id) THEN
    RETURN QUERY
    SELECT p.domain::text, p.action::text, p.name
    FROM public.permissions p;
    RETURN;
  END IF;

  -- Get user's institution if not provided
  IF _institution_id IS NULL THEN
    SELECT p.institution_id INTO _user_institution_id
    FROM public.profiles p
    WHERE p.user_id = _user_id
    LIMIT 1;
  ELSE
    _user_institution_id := _institution_id;
  END IF;

  -- Return permissions from roles and custom roles
  RETURN QUERY
  SELECT DISTINCT p.domain::text, p.action::text, p.name
  FROM public.permissions p
  WHERE p.id IN (
    -- Role-based permissions
    SELECT rp.permission_id
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role::text = rp.role
    WHERE ur.user_id = _user_id
      AND (rp.institution_id IS NULL OR rp.institution_id = _user_institution_id)
    UNION
    -- Custom role permissions
    SELECT crp.permission_id
    FROM public.custom_roles cr
    JOIN public.custom_role_permissions crp ON crp.custom_role_id = cr.id
    WHERE cr.institution_id = _user_institution_id
      AND cr.is_active = true
  );
END;
$$;

-- Check if a user can manage a specific role
CREATE OR REPLACE FUNCTION public.can_manage_role(
  _user_id UUID,
  _target_role TEXT,
  _institution_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Super admins can manage all roles
  IF public.is_super_admin(_user_id) THEN
    RETURN true;
  END IF;

  -- Institution owners can manage institution roles (except super_admin and support_admin)
  IF _target_role NOT IN ('super_admin', 'support_admin') THEN
    IF public.has_role(_user_id, 'institution_owner') OR 
       public.has_institution_role(_user_id, 'institution_owner'::app_role, _institution_id) THEN
      RETURN true;
    END IF;
  END IF;

  -- Institution admins can manage lower-tier roles
  IF _target_role NOT IN ('super_admin', 'support_admin', 'institution_owner', 'institution_admin') THEN
    IF public.has_institution_role(_user_id, 'institution_admin'::app_role, _institution_id) THEN
      RETURN true;
    END IF;
  END IF;

  RETURN false;
END;
$$;

-- Seed default role permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'super_admin', id FROM public.permissions
ON CONFLICT DO NOTHING;

-- Support Admin: View-only on all domains except system_settings
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'support_admin', id FROM public.permissions 
WHERE action::text = 'view' AND domain::text != 'system_settings'
ON CONFLICT DO NOTHING;

-- Institution Owner: Full access
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'institution_owner', id FROM public.permissions
ON CONFLICT DO NOTHING;

-- Institution Admin: Full access except approve on system_settings
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'institution_admin', id FROM public.permissions 
WHERE NOT (domain::text = 'system_settings' AND action::text = 'approve')
ON CONFLICT DO NOTHING;

-- Finance Officer: Full finance, view students, view/export reports
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'finance_officer', id FROM public.permissions WHERE domain::text = 'finance'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'finance_officer', id FROM public.permissions 
WHERE domain::text = 'students' AND action::text = 'view'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'finance_officer', id FROM public.permissions 
WHERE domain::text = 'reports' AND action::text IN ('view', 'export')
ON CONFLICT DO NOTHING;

-- Academic Director: Full academics, view/edit students, full reports/communication
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'academic_director', id FROM public.permissions WHERE domain::text = 'academics'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'academic_director', id FROM public.permissions 
WHERE domain::text = 'students' AND action::text IN ('view', 'edit')
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'academic_director', id FROM public.permissions WHERE domain::text = 'reports'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'academic_director', id FROM public.permissions WHERE domain::text = 'communication'
ON CONFLICT DO NOTHING;

-- Teacher: Limited academics, view students, view/create communication
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'teacher', id FROM public.permissions 
WHERE domain::text = 'academics' AND action::text IN ('view', 'create', 'edit')
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'teacher', id FROM public.permissions 
WHERE domain::text = 'students' AND action::text = 'view'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'teacher', id FROM public.permissions 
WHERE domain::text = 'communication' AND action::text IN ('view', 'create')
ON CONFLICT DO NOTHING;

-- HR Manager: Full staff_hr, view others, view/export reports
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'hr_manager', id FROM public.permissions WHERE domain::text = 'staff_hr'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'hr_manager', id FROM public.permissions 
WHERE domain::text IN ('students', 'academics', 'finance') AND action::text = 'view'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'hr_manager', id FROM public.permissions 
WHERE domain::text = 'reports' AND action::text IN ('view', 'export')
ON CONFLICT DO NOTHING;

-- Accountant: Finance view/create/edit, view students, view/export reports
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'accountant', id FROM public.permissions 
WHERE domain::text = 'finance' AND action::text IN ('view', 'create', 'edit')
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'accountant', id FROM public.permissions 
WHERE domain::text = 'students' AND action::text = 'view'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'accountant', id FROM public.permissions 
WHERE domain::text = 'reports' AND action::text IN ('view', 'export')
ON CONFLICT DO NOTHING;

-- ICT Admin: System settings, view all
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'ict_admin', id FROM public.permissions WHERE domain::text = 'system_settings'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'ict_admin', id FROM public.permissions WHERE action::text = 'view'
ON CONFLICT DO NOTHING;

-- Parent: View only for students, academics, finance
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'parent', id FROM public.permissions 
WHERE domain::text IN ('students', 'academics', 'finance') AND action::text = 'view'
ON CONFLICT DO NOTHING;

-- Student: View own academic and student data
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'student', id FROM public.permissions 
WHERE domain::text IN ('students', 'academics') AND action::text = 'view'
ON CONFLICT DO NOTHING;