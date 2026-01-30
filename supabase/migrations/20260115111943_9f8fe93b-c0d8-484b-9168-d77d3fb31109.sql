-- Fix Issue 1: Create missing profile record for the teacher user
-- The profiles table has: id (auto), user_id (required), email (required)
INSERT INTO public.profiles (user_id, email)
VALUES ('98d65957-bbef-436b-bd90-76dbed377e2a', 'dmwangui@yahoo.com')
ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email;

-- Fix Issue 2: Ensure handle_new_user trigger creates profile correctly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate trigger to ensure it's attached correctly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix Issue 3: Create class-teacher assignment for Evans Njogu to PP1 - Angels
INSERT INTO public.class_teachers (institution_id, staff_id, class_id, is_class_teacher)
SELECT 
  s.institution_id,
  s.id as staff_id,
  c.id as class_id,
  true as is_class_teacher
FROM public.staff s
CROSS JOIN public.classes c
WHERE s.id = '8ded1dd4-36dd-4d5a-a106-5964477ef870'
  AND c.id = '23cf3c51-15da-4e37-9dee-1d1eeddef44a'
ON CONFLICT DO NOTHING;