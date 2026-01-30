-- Fix plan type mismatch in limit-check triggers

CREATE OR REPLACE FUNCTION public.check_student_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER;
  plan_id public.subscription_plan;
BEGIN
  -- Get institution's plan and current count
  SELECT i.student_count, i.subscription_plan INTO current_count, plan_id
  FROM public.institutions i WHERE i.id = NEW.institution_id;

  -- Get plan limit
  SELECT sp.max_students INTO max_allowed
  FROM public.subscription_plans sp WHERE sp.id = plan_id;

  -- If no plan found, allow (fail open for safety)
  IF max_allowed IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check limit (-1 means unlimited)
  IF max_allowed != -1 AND current_count >= max_allowed THEN
    RAISE EXCEPTION 'Student limit reached. Your % plan allows % students. Please upgrade your plan.', plan_id::text, max_allowed;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_staff_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER;
  plan_id public.subscription_plan;
BEGIN
  -- Get institution's plan and current count
  SELECT i.staff_count, i.subscription_plan INTO current_count, plan_id
  FROM public.institutions i WHERE i.id = NEW.institution_id;

  -- Get plan limit
  SELECT sp.max_staff INTO max_allowed
  FROM public.subscription_plans sp WHERE sp.id = plan_id;

  -- If no plan found, allow (fail open for safety)
  IF max_allowed IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check limit (-1 means unlimited)
  IF max_allowed != -1 AND current_count >= max_allowed THEN
    RAISE EXCEPTION 'Staff limit reached. Your % plan allows % staff members. Please upgrade your plan.', plan_id::text, max_allowed;
  END IF;

  RETURN NEW;
END;
$$;