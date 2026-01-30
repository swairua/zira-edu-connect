-- Fix critical has_permission function - prevent cross-institution data access
-- Keep the same signature but fix the logic
CREATE OR REPLACE FUNCTION public.has_permission(
  _user_id uuid, 
  _domain text, 
  _action text, 
  _institution_id uuid DEFAULT NULL::uuid
)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
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

  -- ALWAYS get user's institution from their profile - this is the source of truth
  SELECT p.institution_id INTO _user_institution_id
  FROM public.profiles p
  WHERE p.user_id = _user_id
  LIMIT 1;

  -- CRITICAL FIX: If a row's institution_id is provided, user MUST belong to that institution
  -- This prevents data leakage between institutions (e.g., demo school data appearing in Kahawa)
  IF _institution_id IS NOT NULL AND _user_institution_id IS DISTINCT FROM _institution_id THEN
    RETURN false;  -- User cannot access data from other institutions
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
        OR rp.institution_id = _user_institution_id
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

-- Fix function search paths for security
CREATE OR REPLACE FUNCTION public.update_hostel_capacity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE hostels 
  SET capacity = (
    SELECT COALESCE(SUM(bed_capacity), 0) 
    FROM hostel_rooms 
    WHERE hostel_id = COALESCE(NEW.hostel_id, OLD.hostel_id) 
    AND is_active = true
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.hostel_id, OLD.hostel_id);
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_bed_status_on_allocation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE hostel_beds SET status = 'occupied', updated_at = now() WHERE id = NEW.bed_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.status IN ('ended', 'transferred') AND OLD.status = 'active' THEN
    UPDATE hostel_beds SET status = 'available', updated_at = now() WHERE id = OLD.bed_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE hostel_beds SET status = 'available', updated_at = now() WHERE id = OLD.bed_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_allocation_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO bed_allocation_history (
    allocation_id, 
    action, 
    old_values, 
    new_values, 
    changed_by,
    requires_approval
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    CASE WHEN TG_OP = 'UPDATE' AND OLD.created_at < now() - INTERVAL '24 hours' 
         THEN true ELSE false END
  );
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_student_boarding_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    UPDATE students SET boarding_status = 'boarding', updated_at = now() WHERE id = NEW.student_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.status IN ('ended', 'transferred') AND OLD.status = 'active' THEN
    IF NOT EXISTS (
      SELECT 1 FROM bed_allocations 
      WHERE student_id = NEW.student_id 
      AND status = 'active' 
      AND id != NEW.id
    ) THEN
      UPDATE students SET boarding_status = 'day', updated_at = now() WHERE id = NEW.student_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;