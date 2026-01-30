
-- Function to link staff to user when user is created (matching by email)
CREATE OR REPLACE FUNCTION public.link_staff_to_user()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.staff 
  SET user_id = NEW.user_id
  WHERE LOWER(email) = LOWER(NEW.email) 
    AND user_id IS NULL
    AND deleted_at IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger on profiles table (created after auth.users)
DROP TRIGGER IF EXISTS on_profile_created_link_staff ON public.profiles;
CREATE TRIGGER on_profile_created_link_staff
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.link_staff_to_user();

-- Add index on staff.email for faster lookups
CREATE INDEX IF NOT EXISTS idx_staff_email ON public.staff(email);

-- Create class_teachers table for teacher-class-subject assignments
CREATE TABLE IF NOT EXISTS public.class_teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  is_class_teacher BOOLEAN DEFAULT false,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(class_id, staff_id, subject_id)
);

-- Enable RLS on class_teachers
ALTER TABLE public.class_teachers ENABLE ROW LEVEL SECURITY;

-- Staff can view their own assignments
CREATE POLICY "Staff can view their assignments"
  ON public.class_teachers FOR SELECT
  USING (
    staff_id IN (SELECT id FROM public.staff WHERE user_id = auth.uid())
    OR public.has_permission(auth.uid(), 'classes', 'read', institution_id)
  );

-- Users with class write permission can manage assignments
CREATE POLICY "Admins can manage class teachers"
  ON public.class_teachers FOR ALL
  USING (public.has_permission(auth.uid(), 'classes', 'write', institution_id))
  WITH CHECK (public.has_permission(auth.uid(), 'classes', 'write', institution_id));

-- Enable realtime for class_teachers
ALTER PUBLICATION supabase_realtime ADD TABLE public.class_teachers;
