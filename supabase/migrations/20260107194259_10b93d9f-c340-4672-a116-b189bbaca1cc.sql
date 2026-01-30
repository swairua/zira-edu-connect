
-- Phase 1: Multi-Campus Database Foundation

-- 1. Create group_role enum
CREATE TYPE public.group_role AS ENUM (
  'group_owner',
  'group_finance_admin',
  'group_academic_admin',
  'group_hr_admin',
  'group_viewer'
);

-- 2. Create institution_groups table
CREATE TABLE public.institution_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  primary_country public.country_code NOT NULL DEFAULT 'KE',
  subscription_plan public.subscription_plan NOT NULL DEFAULT 'starter',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create group_shared_services table
CREATE TABLE public.group_shared_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.institution_groups(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL CHECK (service_type IN ('finance', 'messaging', 'reporting', 'fee_structure', 'academic_calendar', 'staff_management')),
  is_centralized BOOLEAN NOT NULL DEFAULT false,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, service_type)
);

-- 4. Create group_user_roles table
CREATE TABLE public.group_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  group_id UUID NOT NULL REFERENCES public.institution_groups(id) ON DELETE CASCADE,
  role public.group_role NOT NULL,
  campus_access UUID[] DEFAULT NULL,
  granted_by UUID,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, group_id, role)
);

-- 5. Add group columns to institutions table
ALTER TABLE public.institutions 
  ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.institution_groups(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS campus_code TEXT,
  ADD COLUMN IF NOT EXISTS is_headquarters BOOLEAN DEFAULT false;

-- Create index for group lookups
CREATE INDEX IF NOT EXISTS idx_institutions_group_id ON public.institutions(group_id);
CREATE INDEX IF NOT EXISTS idx_group_user_roles_user_id ON public.group_user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_group_user_roles_group_id ON public.group_user_roles(group_id);

-- 6. Create helper function to get user's group IDs
CREATE OR REPLACE FUNCTION public.get_user_group_ids(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT group_id FROM public.group_user_roles
  WHERE user_id = _user_id;
$$;

-- 7. Create helper function to get user's group campus IDs
CREATE OR REPLACE FUNCTION public.get_user_group_campus_ids(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT i.id FROM public.institutions i
  WHERE i.group_id IN (
    SELECT group_id FROM public.group_user_roles
    WHERE user_id = _user_id
    AND (campus_access IS NULL OR i.id = ANY(campus_access))
  );
$$;

-- 8. Create function to check group role
CREATE OR REPLACE FUNCTION public.has_group_role(_user_id UUID, _role public.group_role, _group_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_user_roles
    WHERE user_id = _user_id 
      AND role = _role
      AND (_group_id IS NULL OR group_id = _group_id)
  );
$$;

-- 9. Create function to check if user can access campus
CREATE OR REPLACE FUNCTION public.can_access_campus(_user_id UUID, _institution_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _group_id UUID;
BEGIN
  -- Super admins can access all
  IF public.is_super_admin(_user_id) THEN
    RETURN true;
  END IF;
  
  -- Direct institution access via profiles
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND institution_id = _institution_id
  ) THEN
    RETURN true;
  END IF;
  
  -- Get institution's group
  SELECT group_id INTO _group_id FROM public.institutions WHERE id = _institution_id;
  
  IF _group_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check group-level access
  RETURN EXISTS (
    SELECT 1 FROM public.group_user_roles gur
    WHERE gur.user_id = _user_id
      AND gur.group_id = _group_id
      AND (gur.campus_access IS NULL OR _institution_id = ANY(gur.campus_access))
  );
END;
$$;

-- 10. Enable RLS on new tables
ALTER TABLE public.institution_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_shared_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_user_roles ENABLE ROW LEVEL SECURITY;

-- 11. RLS Policies for institution_groups
CREATE POLICY "Super admins can manage all groups"
  ON public.institution_groups FOR ALL
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Group users can view their groups"
  ON public.institution_groups FOR SELECT
  USING (id IN (SELECT public.get_user_group_ids(auth.uid())));

-- 12. RLS Policies for group_shared_services
CREATE POLICY "Super admins can manage all shared services"
  ON public.group_shared_services FOR ALL
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Group users can view their group services"
  ON public.group_shared_services FOR SELECT
  USING (group_id IN (SELECT public.get_user_group_ids(auth.uid())));

CREATE POLICY "Group owners can manage shared services"
  ON public.group_shared_services FOR ALL
  USING (public.has_group_role(auth.uid(), 'group_owner', group_id));

-- 13. RLS Policies for group_user_roles
CREATE POLICY "Super admins can manage all group roles"
  ON public.group_user_roles FOR ALL
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Users can view their own group roles"
  ON public.group_user_roles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Group owners can manage group roles"
  ON public.group_user_roles FOR ALL
  USING (public.has_group_role(auth.uid(), 'group_owner', group_id));

-- 14. Add triggers for updated_at
CREATE TRIGGER update_institution_groups_updated_at
  BEFORE UPDATE ON public.institution_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_group_shared_services_updated_at
  BEFORE UPDATE ON public.group_shared_services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
