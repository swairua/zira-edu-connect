-- =============================================
-- TIMETABLE MODULE TABLES, FUNCTIONS, RLS, PERMISSIONS
-- =============================================

-- 1. Create rooms table
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  building TEXT,
  floor TEXT,
  capacity INTEGER,
  room_type TEXT DEFAULT 'classroom',
  facilities TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(institution_id, name)
);

-- 2. Create time_slots table
CREATE TABLE public.time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slot_type TEXT DEFAULT 'lesson',
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  sequence_order INTEGER NOT NULL,
  applies_to TEXT DEFAULT 'all',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(institution_id, name, applies_to)
);

-- 3. Create timetables table
CREATE TABLE public.timetables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id),
  term_id UUID REFERENCES terms(id),
  name TEXT NOT NULL,
  timetable_type TEXT DEFAULT 'main',
  status TEXT DEFAULT 'draft',
  effective_from DATE,
  effective_to DATE,
  created_by UUID,
  published_at TIMESTAMPTZ,
  published_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create timetable_entries table
CREATE TABLE public.timetable_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timetable_id UUID NOT NULL REFERENCES timetables(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id),
  subject_id UUID NOT NULL REFERENCES subjects(id),
  teacher_id UUID NOT NULL REFERENCES staff(id),
  room_id UUID REFERENCES rooms(id),
  time_slot_id UUID NOT NULL REFERENCES time_slots(id),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
  is_double_period BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(timetable_id, class_id, day_of_week, time_slot_id)
);

-- 5. Create timetable_exceptions table
CREATE TABLE public.timetable_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  timetable_entry_id UUID NOT NULL REFERENCES timetable_entries(id) ON DELETE CASCADE,
  exception_date DATE NOT NULL,
  exception_type TEXT NOT NULL,
  substitute_teacher_id UUID REFERENCES staff(id),
  substitute_room_id UUID REFERENCES rooms(id),
  reason TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Create function to check teacher clashes
CREATE OR REPLACE FUNCTION public.check_teacher_clash(
  p_timetable_id UUID,
  p_teacher_id UUID,
  p_day_of_week INTEGER,
  p_time_slot_id UUID,
  p_exclude_entry_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM timetable_entries
    WHERE timetable_id = p_timetable_id
      AND teacher_id = p_teacher_id
      AND day_of_week = p_day_of_week
      AND time_slot_id = p_time_slot_id
      AND (p_exclude_entry_id IS NULL OR id != p_exclude_entry_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Create function to check room clashes
CREATE OR REPLACE FUNCTION public.check_room_clash(
  p_timetable_id UUID,
  p_room_id UUID,
  p_day_of_week INTEGER,
  p_time_slot_id UUID,
  p_exclude_entry_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  IF p_room_id IS NULL THEN RETURN FALSE; END IF;
  RETURN EXISTS (
    SELECT 1 FROM timetable_entries
    WHERE timetable_id = p_timetable_id
      AND room_id = p_room_id
      AND day_of_week = p_day_of_week
      AND time_slot_id = p_time_slot_id
      AND (p_exclude_entry_id IS NULL OR id != p_exclude_entry_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. Enable RLS on all tables
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_exceptions ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies for rooms
CREATE POLICY "Users can view rooms in their institution"
  ON public.rooms FOR SELECT
  USING (institution_id IN (
    SELECT ur.institution_id FROM user_roles ur WHERE ur.user_id = auth.uid()
  ));

CREATE POLICY "Admins can insert rooms"
  ON public.rooms FOR INSERT
  WITH CHECK (institution_id IN (
    SELECT ur.institution_id FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('super_admin', 'institution_owner', 'institution_admin')
  ));

CREATE POLICY "Admins can update rooms"
  ON public.rooms FOR UPDATE
  USING (institution_id IN (
    SELECT ur.institution_id FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('super_admin', 'institution_owner', 'institution_admin')
  ));

CREATE POLICY "Admins can delete rooms"
  ON public.rooms FOR DELETE
  USING (institution_id IN (
    SELECT ur.institution_id FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('super_admin', 'institution_owner', 'institution_admin')
  ));

-- 10. RLS Policies for time_slots
CREATE POLICY "Users can view time_slots in their institution"
  ON public.time_slots FOR SELECT
  USING (institution_id IN (
    SELECT ur.institution_id FROM user_roles ur WHERE ur.user_id = auth.uid()
  ));

CREATE POLICY "Admins can insert time_slots"
  ON public.time_slots FOR INSERT
  WITH CHECK (institution_id IN (
    SELECT ur.institution_id FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('super_admin', 'institution_owner', 'institution_admin')
  ));

CREATE POLICY "Admins can update time_slots"
  ON public.time_slots FOR UPDATE
  USING (institution_id IN (
    SELECT ur.institution_id FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('super_admin', 'institution_owner', 'institution_admin')
  ));

CREATE POLICY "Admins can delete time_slots"
  ON public.time_slots FOR DELETE
  USING (institution_id IN (
    SELECT ur.institution_id FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('super_admin', 'institution_owner', 'institution_admin')
  ));

-- 11. RLS Policies for timetables
CREATE POLICY "Users can view published timetables in their institution"
  ON public.timetables FOR SELECT
  USING (
    institution_id IN (
      SELECT ur.institution_id FROM user_roles ur WHERE ur.user_id = auth.uid()
    )
    AND (
      status = 'published'
      OR EXISTS (
        SELECT 1 FROM user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.institution_id = timetables.institution_id
        AND ur.role IN ('super_admin', 'institution_owner', 'institution_admin', 'academic_director')
      )
    )
  );

CREATE POLICY "Admins can insert timetables"
  ON public.timetables FOR INSERT
  WITH CHECK (institution_id IN (
    SELECT ur.institution_id FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('super_admin', 'institution_owner', 'institution_admin', 'academic_director')
  ));

CREATE POLICY "Admins can update timetables"
  ON public.timetables FOR UPDATE
  USING (institution_id IN (
    SELECT ur.institution_id FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('super_admin', 'institution_owner', 'institution_admin', 'academic_director')
  ));

CREATE POLICY "Admins can delete timetables"
  ON public.timetables FOR DELETE
  USING (institution_id IN (
    SELECT ur.institution_id FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('super_admin', 'institution_owner', 'institution_admin', 'academic_director')
  ));

-- 12. RLS Policies for timetable_entries
CREATE POLICY "Users can view timetable entries"
  ON public.timetable_entries FOR SELECT
  USING (institution_id IN (
    SELECT ur.institution_id FROM user_roles ur WHERE ur.user_id = auth.uid()
  ));

CREATE POLICY "Admins can insert timetable entries"
  ON public.timetable_entries FOR INSERT
  WITH CHECK (institution_id IN (
    SELECT ur.institution_id FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('super_admin', 'institution_owner', 'institution_admin', 'academic_director')
  ));

CREATE POLICY "Admins can update timetable entries"
  ON public.timetable_entries FOR UPDATE
  USING (institution_id IN (
    SELECT ur.institution_id FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('super_admin', 'institution_owner', 'institution_admin', 'academic_director')
  ));

CREATE POLICY "Admins can delete timetable entries"
  ON public.timetable_entries FOR DELETE
  USING (institution_id IN (
    SELECT ur.institution_id FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('super_admin', 'institution_owner', 'institution_admin', 'academic_director')
  ));

-- 13. RLS Policies for timetable_exceptions
CREATE POLICY "Users can view timetable exceptions"
  ON public.timetable_exceptions FOR SELECT
  USING (institution_id IN (
    SELECT ur.institution_id FROM user_roles ur WHERE ur.user_id = auth.uid()
  ));

CREATE POLICY "Admins can insert timetable exceptions"
  ON public.timetable_exceptions FOR INSERT
  WITH CHECK (institution_id IN (
    SELECT ur.institution_id FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('super_admin', 'institution_owner', 'institution_admin', 'academic_director')
  ));

CREATE POLICY "Admins can update timetable exceptions"
  ON public.timetable_exceptions FOR UPDATE
  USING (institution_id IN (
    SELECT ur.institution_id FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('super_admin', 'institution_owner', 'institution_admin', 'academic_director')
  ));

CREATE POLICY "Admins can delete timetable exceptions"
  ON public.timetable_exceptions FOR DELETE
  USING (institution_id IN (
    SELECT ur.institution_id FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('super_admin', 'institution_owner', 'institution_admin', 'academic_director')
  ));

-- 14. Create timetable permissions (only if they don't exist)
INSERT INTO permissions (name, domain, action, description)
SELECT 'timetable.view', 'timetable', 'view', 'View timetables and schedules'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'timetable.view');

INSERT INTO permissions (name, domain, action, description)
SELECT 'timetable.create', 'timetable', 'create', 'Create new timetables'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'timetable.create');

INSERT INTO permissions (name, domain, action, description)
SELECT 'timetable.edit', 'timetable', 'edit', 'Edit existing timetables'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'timetable.edit');

INSERT INTO permissions (name, domain, action, description)
SELECT 'timetable.delete', 'timetable', 'delete', 'Delete timetables'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'timetable.delete');

INSERT INTO permissions (name, domain, action, description)
SELECT 'timetable.publish', 'timetable', 'approve', 'Publish timetables'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'timetable.publish');

INSERT INTO permissions (name, domain, action, description)
SELECT 'timetable.export', 'timetable', 'export', 'Export timetables'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'timetable.export');

-- 15. Assign permissions to admin roles
INSERT INTO role_permissions (role, permission_id)
SELECT r.role, p.id
FROM (VALUES
  ('super_admin'),
  ('institution_owner'),
  ('institution_admin'),
  ('academic_director')
) AS r(role)
CROSS JOIN permissions p
WHERE p.domain = 'timetable'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp WHERE rp.role = r.role AND rp.permission_id = p.id
);

-- 16. Grant view permission to teachers
INSERT INTO role_permissions (role, permission_id)
SELECT 'teacher', p.id
FROM permissions p
WHERE p.name = 'timetable.view'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp WHERE rp.role = 'teacher' AND rp.permission_id = p.id
);

-- 17. Create updated_at triggers
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_time_slots_updated_at
  BEFORE UPDATE ON public.time_slots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_timetables_updated_at
  BEFORE UPDATE ON public.timetables
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_timetable_entries_updated_at
  BEFORE UPDATE ON public.timetable_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();