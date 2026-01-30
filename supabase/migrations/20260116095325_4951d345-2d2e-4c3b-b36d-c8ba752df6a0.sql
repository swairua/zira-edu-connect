-- Create grading_scales table for institution-configurable grading
CREATE TABLE public.grading_scales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  scale_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage', 'points', 'cbc'
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(institution_id, name)
);

-- Create grade_levels within each scale
CREATE TABLE public.grade_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grading_scale_id UUID NOT NULL REFERENCES grading_scales(id) ON DELETE CASCADE,
  grade TEXT NOT NULL, -- e.g., 'A', 'B+', 'Exceeds Expectations'
  min_marks NUMERIC(5,2) NOT NULL,
  max_marks NUMERIC(5,2) NOT NULL,
  points NUMERIC(4,2), -- For GPA calculations
  description TEXT, -- e.g., 'Excellent', 'Good'
  color TEXT, -- For UI display
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_range CHECK (min_marks <= max_marks)
);

-- Enable RLS
ALTER TABLE public.grading_scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_levels ENABLE ROW LEVEL SECURITY;

-- RLS Policies for grading_scales
CREATE POLICY "Users can view grading scales in their institution"
ON grading_scales FOR SELECT TO authenticated
USING (
  institution_id IN (SELECT institution_id FROM profiles WHERE user_id = auth.uid())
  OR is_super_admin(auth.uid())
);

CREATE POLICY "Admins can manage grading scales"
ON grading_scales FOR ALL TO authenticated
USING (has_permission(auth.uid(), 'academics', 'manage', institution_id))
WITH CHECK (has_permission(auth.uid(), 'academics', 'manage', institution_id));

-- RLS Policies for grade_levels
CREATE POLICY "Users can view grade levels"
ON grade_levels FOR SELECT TO authenticated
USING (
  grading_scale_id IN (
    SELECT id FROM grading_scales 
    WHERE institution_id IN (SELECT institution_id FROM profiles WHERE user_id = auth.uid())
  )
  OR is_super_admin(auth.uid())
);

CREATE POLICY "Admins can manage grade levels"
ON grade_levels FOR ALL TO authenticated
USING (
  grading_scale_id IN (
    SELECT id FROM grading_scales 
    WHERE has_permission(auth.uid(), 'academics', 'manage', institution_id)
  )
)
WITH CHECK (
  grading_scale_id IN (
    SELECT id FROM grading_scales 
    WHERE has_permission(auth.uid(), 'academics', 'manage', institution_id)
  )
);

-- Insert default Kenya percentage scale for existing institutions
INSERT INTO grading_scales (institution_id, name, description, scale_type, is_default, is_active)
SELECT id, 'Kenya Standard', 'Traditional Kenya A-E percentage grading', 'percentage', true, true
FROM institutions;

-- Insert grade levels for each scale
INSERT INTO grade_levels (grading_scale_id, grade, min_marks, max_marks, points, description, color, sort_order)
SELECT gs.id, g.grade, g.min_marks, g.max_marks, g.points, g.description, g.color, g.sort_order
FROM grading_scales gs
CROSS JOIN (VALUES
  ('A', 80, 100, 12, 'Excellent', '#22c55e', 1),
  ('A-', 75, 79.99, 11, 'Very Good', '#4ade80', 2),
  ('B+', 70, 74.99, 10, 'Good', '#84cc16', 3),
  ('B', 65, 69.99, 9, 'Above Average', '#a3e635', 4),
  ('B-', 60, 64.99, 8, 'Average', '#facc15', 5),
  ('C+', 55, 59.99, 7, 'Fair', '#fbbf24', 6),
  ('C', 50, 54.99, 6, 'Satisfactory', '#f59e0b', 7),
  ('C-', 45, 49.99, 5, 'Below Average', '#fb923c', 8),
  ('D+', 40, 44.99, 4, 'Weak', '#f97316', 9),
  ('D', 35, 39.99, 3, 'Poor', '#ef4444', 10),
  ('D-', 30, 34.99, 2, 'Very Poor', '#dc2626', 11),
  ('E', 0, 29.99, 1, 'Fail', '#b91c1c', 12)
) AS g(grade, min_marks, max_marks, points, description, color, sort_order)
WHERE gs.scale_type = 'percentage';

-- Add updated_at trigger
CREATE TRIGGER update_grading_scales_updated_at
BEFORE UPDATE ON grading_scales
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();