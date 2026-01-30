-- Function to check student limit before insert
CREATE OR REPLACE FUNCTION public.check_student_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER;
  plan_id TEXT;
BEGIN
  -- Get institution's plan and current count
  SELECT i.student_count, i.subscription_plan INTO current_count, plan_id
  FROM institutions i WHERE i.id = NEW.institution_id;
  
  -- Get plan limit
  SELECT sp.max_students INTO max_allowed
  FROM subscription_plans sp WHERE sp.id = plan_id;
  
  -- If no plan found, allow (fail open for safety)
  IF max_allowed IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Check limit (-1 means unlimited)
  IF max_allowed != -1 AND current_count >= max_allowed THEN
    RAISE EXCEPTION 'Student limit reached. Your % plan allows % students. Please upgrade your plan.', plan_id, max_allowed;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for student limit
DROP TRIGGER IF EXISTS enforce_student_limit ON students;
CREATE TRIGGER enforce_student_limit
BEFORE INSERT ON students
FOR EACH ROW EXECUTE FUNCTION check_student_limit();

-- Function to check staff limit before insert
CREATE OR REPLACE FUNCTION public.check_staff_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER;
  plan_id TEXT;
BEGIN
  -- Get institution's plan and current count
  SELECT i.staff_count, i.subscription_plan INTO current_count, plan_id
  FROM institutions i WHERE i.id = NEW.institution_id;
  
  -- Get plan limit
  SELECT sp.max_staff INTO max_allowed
  FROM subscription_plans sp WHERE sp.id = plan_id;
  
  -- If no plan found, allow (fail open for safety)
  IF max_allowed IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Check limit (-1 means unlimited)
  IF max_allowed != -1 AND current_count >= max_allowed THEN
    RAISE EXCEPTION 'Staff limit reached. Your % plan allows % staff members. Please upgrade your plan.', plan_id, max_allowed;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for staff limit
DROP TRIGGER IF EXISTS enforce_staff_limit ON staff;
CREATE TRIGGER enforce_staff_limit
BEFORE INSERT ON staff
FOR EACH ROW EXECUTE FUNCTION check_staff_limit();

-- Function to sync modules when plan changes
CREATE OR REPLACE FUNCTION public.sync_institution_modules()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_modules TEXT[];
BEGIN
  -- When subscription_plan changes, update enabled_modules
  IF OLD.subscription_plan IS DISTINCT FROM NEW.subscription_plan THEN
    -- Get new plan's modules
    SELECT COALESCE(modules, ARRAY[]::TEXT[]) INTO new_modules
    FROM subscription_plans
    WHERE id = NEW.subscription_plan;
    
    -- Update the institution's enabled modules
    NEW.enabled_modules := new_modules;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to sync modules on plan change
DROP TRIGGER IF EXISTS sync_modules_on_plan_change ON institutions;
CREATE TRIGGER sync_modules_on_plan_change
BEFORE UPDATE ON institutions
FOR EACH ROW EXECUTE FUNCTION sync_institution_modules();