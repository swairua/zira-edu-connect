-- Add is_demo_showcase flag to protect demo users from deletion
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS is_demo_showcase boolean DEFAULT false;
ALTER TABLE public.parents ADD COLUMN IF NOT EXISTS is_demo_showcase boolean DEFAULT false;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS is_demo_showcase boolean DEFAULT false;

-- Create function to prevent deletion of showcase users
CREATE OR REPLACE FUNCTION public.prevent_demo_showcase_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.is_demo_showcase = true THEN
    RAISE EXCEPTION 'Cannot delete demo showcase user. This account is protected for demo purposes.';
  END IF;
  RETURN OLD;
END;
$$;

-- Create triggers to prevent deletion
DROP TRIGGER IF EXISTS prevent_student_demo_delete ON public.students;
CREATE TRIGGER prevent_student_demo_delete
BEFORE DELETE ON public.students
FOR EACH ROW EXECUTE FUNCTION public.prevent_demo_showcase_deletion();

DROP TRIGGER IF EXISTS prevent_parent_demo_delete ON public.parents;
CREATE TRIGGER prevent_parent_demo_delete
BEFORE DELETE ON public.parents
FOR EACH ROW EXECUTE FUNCTION public.prevent_demo_showcase_deletion();

DROP TRIGGER IF EXISTS prevent_staff_demo_delete ON public.staff;
CREATE TRIGGER prevent_staff_demo_delete
BEFORE DELETE ON public.staff
FOR EACH ROW EXECUTE FUNCTION public.prevent_demo_showcase_deletion();