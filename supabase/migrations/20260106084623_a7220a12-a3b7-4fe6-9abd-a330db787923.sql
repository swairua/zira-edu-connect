-- =============================================
-- ZIRA EDUSUITE MULTI-TENANT DATABASE SCHEMA
-- =============================================

-- 1. Create ENUM types for the platform
CREATE TYPE public.institution_type AS ENUM ('primary', 'secondary', 'tvet', 'college', 'university');
CREATE TYPE public.institution_status AS ENUM ('active', 'suspended', 'pending', 'trial');
CREATE TYPE public.subscription_plan AS ENUM ('starter', 'professional', 'enterprise', 'custom');
CREATE TYPE public.app_role AS ENUM ('super_admin', 'institution_admin', 'teacher', 'accountant', 'hr_manager', 'parent', 'student');
CREATE TYPE public.country_code AS ENUM ('KE', 'UG', 'TZ', 'RW', 'NG', 'GH', 'ZA');

-- 2. Create subscription_plans table (reference data)
CREATE TABLE public.subscription_plans (
  id public.subscription_plan PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly INTEGER NOT NULL DEFAULT 0,
  price_yearly INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'KES',
  max_students INTEGER NOT NULL DEFAULT 500,
  max_staff INTEGER NOT NULL DEFAULT 50,
  features JSONB DEFAULT '[]'::jsonb,
  modules TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create institutions table
CREATE TABLE public.institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  type public.institution_type NOT NULL DEFAULT 'secondary',
  status public.institution_status NOT NULL DEFAULT 'pending',
  subscription_plan public.subscription_plan NOT NULL DEFAULT 'starter',
  country public.country_code NOT NULL DEFAULT 'KE',
  county TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  student_count INTEGER NOT NULL DEFAULT 0,
  staff_count INTEGER NOT NULL DEFAULT 0,
  enabled_modules TEXT[] DEFAULT ARRAY['academics', 'finance']::TEXT[],
  settings JSONB DEFAULT '{}'::jsonb,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create user_roles table (CRITICAL: roles separate from profiles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, institution_id)
);

-- 6. Create audit_logs table for compliance
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Create indexes for performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_institution_id ON public.profiles(institution_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_institution_id ON public.user_roles(institution_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_institutions_status ON public.institutions(status);
CREATE INDEX idx_institutions_country ON public.institutions(country);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_institution_id ON public.audit_logs(institution_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- =============================================
-- SECURITY DEFINER FUNCTIONS FOR RLS
-- =============================================

-- Check if user has a specific role (globally or per institution)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Check if user has a specific role for a specific institution
CREATE OR REPLACE FUNCTION public.has_institution_role(_user_id UUID, _role public.app_role, _institution_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
      AND role = _role 
      AND (institution_id = _institution_id OR institution_id IS NULL)
  )
$$;

-- Check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'super_admin'
  )
$$;

-- Get user's institution ID
CREATE OR REPLACE FUNCTION public.get_user_institution_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT institution_id FROM public.profiles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Check if user belongs to an institution
CREATE OR REPLACE FUNCTION public.user_belongs_to_institution(_user_id UUID, _institution_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND institution_id = _institution_id
  ) OR public.is_super_admin(_user_id)
$$;

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES FOR SUBSCRIPTION_PLANS
-- =============================================

-- Everyone can view active subscription plans
CREATE POLICY "Anyone can view active subscription plans"
ON public.subscription_plans FOR SELECT
USING (is_active = true);

-- Only super admins can manage subscription plans
CREATE POLICY "Super admins can manage subscription plans"
ON public.subscription_plans FOR ALL
USING (public.is_super_admin(auth.uid()));

-- =============================================
-- RLS POLICIES FOR INSTITUTIONS
-- =============================================

-- Super admins can view all institutions
CREATE POLICY "Super admins can view all institutions"
ON public.institutions FOR SELECT
USING (public.is_super_admin(auth.uid()));

-- Users can view their own institution
CREATE POLICY "Users can view their own institution"
ON public.institutions FOR SELECT
USING (
  id = public.get_user_institution_id(auth.uid())
);

-- Super admins can create institutions
CREATE POLICY "Super admins can create institutions"
ON public.institutions FOR INSERT
WITH CHECK (public.is_super_admin(auth.uid()));

-- Super admins can update any institution
CREATE POLICY "Super admins can update institutions"
ON public.institutions FOR UPDATE
USING (public.is_super_admin(auth.uid()));

-- Institution admins can update their own institution (limited fields handled in app)
CREATE POLICY "Institution admins can update own institution"
ON public.institutions FOR UPDATE
USING (
  public.has_institution_role(auth.uid(), 'institution_admin', id)
);

-- Super admins can delete institutions
CREATE POLICY "Super admins can delete institutions"
ON public.institutions FOR DELETE
USING (public.is_super_admin(auth.uid()));

-- =============================================
-- RLS POLICIES FOR PROFILES
-- =============================================

-- Super admins can view all profiles
CREATE POLICY "Super admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.is_super_admin(auth.uid()));

-- Users can view profiles in their institution
CREATE POLICY "Users can view institution profiles"
ON public.profiles FOR SELECT
USING (
  institution_id = public.get_user_institution_id(auth.uid())
);

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (user_id = auth.uid());

-- Super admins and institution admins can update profiles
CREATE POLICY "Admins can update profiles"
ON public.profiles FOR UPDATE
USING (
  public.is_super_admin(auth.uid()) OR
  public.has_institution_role(auth.uid(), 'institution_admin', institution_id)
);

-- New profiles created via trigger or super admin
CREATE POLICY "Allow profile creation"
ON public.profiles FOR INSERT
WITH CHECK (
  auth.uid() = user_id OR
  public.is_super_admin(auth.uid())
);

-- =============================================
-- RLS POLICIES FOR USER_ROLES
-- =============================================

-- Super admins can view all roles
CREATE POLICY "Super admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.is_super_admin(auth.uid()));

-- Users can view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (user_id = auth.uid());

-- Institution admins can view roles in their institution
CREATE POLICY "Institution admins can view institution roles"
ON public.user_roles FOR SELECT
USING (
  institution_id = public.get_user_institution_id(auth.uid()) AND
  public.has_role(auth.uid(), 'institution_admin')
);

-- Super admins can manage all roles
CREATE POLICY "Super admins can manage roles"
ON public.user_roles FOR ALL
USING (public.is_super_admin(auth.uid()));

-- Institution admins can grant non-admin roles in their institution
CREATE POLICY "Institution admins can grant institution roles"
ON public.user_roles FOR INSERT
WITH CHECK (
  public.has_institution_role(auth.uid(), 'institution_admin', institution_id) AND
  role NOT IN ('super_admin', 'institution_admin')
);

-- =============================================
-- RLS POLICIES FOR AUDIT_LOGS
-- =============================================

-- Super admins can view all audit logs
CREATE POLICY "Super admins can view all audit logs"
ON public.audit_logs FOR SELECT
USING (public.is_super_admin(auth.uid()));

-- Institution admins can view their institution's audit logs
CREATE POLICY "Institution admins can view institution audit logs"
ON public.audit_logs FOR SELECT
USING (
  institution_id = public.get_user_institution_id(auth.uid()) AND
  public.has_role(auth.uid(), 'institution_admin')
);

-- Anyone authenticated can create audit logs
CREATE POLICY "Authenticated users can create audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_institutions_updated_at
  BEFORE UPDATE ON public.institutions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- SEED SUBSCRIPTION PLANS DATA
-- =============================================

INSERT INTO public.subscription_plans (id, name, description, price_monthly, price_yearly, max_students, max_staff, features, modules) VALUES
('starter', 'Starter', 'Perfect for small schools getting started', 5000, 48000, 500, 50, 
  '["Basic student management", "Fee collection", "SMS notifications", "Basic reports"]'::jsonb,
  ARRAY['academics', 'finance']),
('professional', 'Professional', 'For growing institutions with advanced needs', 15000, 144000, 2000, 150,
  '["Everything in Starter", "HR management", "Advanced analytics", "WhatsApp integration", "Custom report builder"]'::jsonb,
  ARRAY['academics', 'finance', 'communication', 'hr']),
('enterprise', 'Enterprise', 'Full-featured solution for large institutions', 35000, 336000, 10000, 500,
  '["Everything in Professional", "Multi-campus support", "API access", "Dedicated support", "Custom integrations", "White-labeling"]'::jsonb,
  ARRAY['academics', 'finance', 'communication', 'hr', 'inventory', 'library', 'transport']),
('custom', 'Custom', 'Tailored solutions for unique requirements', 0, 0, -1, -1,
  '["Fully customizable", "Dedicated infrastructure", "On-premise option", "24/7 priority support", "Custom development"]'::jsonb,
  ARRAY['all']);