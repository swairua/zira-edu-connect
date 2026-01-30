-- Create staff_module_access table for institution admins to grant module access to staff
CREATE TABLE public.staff_module_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
  module_id TEXT NOT NULL,
  granted_by UUID,
  granted_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, institution_id, module_id)
);

-- Enable RLS
ALTER TABLE public.staff_module_access ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check if user is institution admin
CREATE OR REPLACE FUNCTION public.is_institution_admin(_user_id uuid, _institution_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND institution_id = _institution_id
      AND role IN ('institution_admin', 'institution_owner')
  )
$$;

-- Create security definer function to check staff module access
CREATE OR REPLACE FUNCTION public.has_module_access(_user_id uuid, _institution_id uuid, _module_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.staff_module_access
    WHERE user_id = _user_id
      AND institution_id = _institution_id
      AND module_id = _module_id
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Policy: Institution admins can manage staff module access
CREATE POLICY "Institution admins manage staff module access"
ON public.staff_module_access
FOR ALL
TO authenticated
USING (
  public.is_institution_admin(auth.uid(), institution_id)
);

-- Policy: Users can view their own module access
CREATE POLICY "Users view own module access"
ON public.staff_module_access
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Add index for faster lookups
CREATE INDEX idx_staff_module_access_user ON public.staff_module_access(user_id, institution_id);
CREATE INDEX idx_staff_module_access_institution ON public.staff_module_access(institution_id);

-- Add bursar role to app_role enum if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'bursar' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'bursar';
  END IF;
END
$$;

-- Insert default permissions for bursar role (same as finance_officer plus approvals)
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'bursar', p.id
FROM public.permissions p
WHERE p.domain = 'finance'
ON CONFLICT DO NOTHING;