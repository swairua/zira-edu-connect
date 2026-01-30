-- Create activities table
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  activity_type TEXT NOT NULL DEFAULT 'club',
  category TEXT NOT NULL DEFAULT 'other',
  description TEXT,
  meeting_schedule TEXT,
  location TEXT,
  max_capacity INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  requires_fee BOOLEAN NOT NULL DEFAULT false,
  fee_amount NUMERIC(10,2),
  currency TEXT DEFAULT 'KES',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.activity_coaches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'coach',
  is_primary BOOLEAN NOT NULL DEFAULT false,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(activity_id, staff_id)
);

CREATE TABLE public.activity_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  academic_year_id UUID REFERENCES public.academic_years(id),
  term_id UUID REFERENCES public.terms(id),
  status TEXT NOT NULL DEFAULT 'pending',
  enrolled_date DATE NOT NULL DEFAULT CURRENT_DATE,
  withdrawn_date DATE,
  notes TEXT,
  enrolled_by UUID,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(activity_id, student_id, academic_year_id)
);

CREATE TABLE public.activity_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES public.activity_enrollments(id) ON DELETE CASCADE,
  fee_type TEXT NOT NULL DEFAULT 'participation',
  description TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'KES',
  status TEXT NOT NULL DEFAULT 'pending',
  invoice_id UUID REFERENCES public.student_invoices(id),
  waived_by UUID,
  waived_at TIMESTAMP WITH TIME ZONE,
  waiver_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.activity_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'practice',
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  description TEXT,
  budget NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.activity_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.activity_events(id) ON DELETE SET NULL,
  attendance_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'present',
  marked_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_attendance ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies based on institution
CREATE POLICY "View activities" ON public.activities FOR SELECT USING (institution_id IN (SELECT institution_id FROM public.user_roles WHERE user_id = auth.uid()));
CREATE POLICY "Manage activities" ON public.activities FOR ALL USING (institution_id IN (SELECT institution_id FROM public.user_roles WHERE user_id = auth.uid()));

CREATE POLICY "View coaches" ON public.activity_coaches FOR SELECT USING (institution_id IN (SELECT institution_id FROM public.user_roles WHERE user_id = auth.uid()));
CREATE POLICY "Manage coaches" ON public.activity_coaches FOR ALL USING (institution_id IN (SELECT institution_id FROM public.user_roles WHERE user_id = auth.uid()));

CREATE POLICY "View enrollments" ON public.activity_enrollments FOR SELECT USING (institution_id IN (SELECT institution_id FROM public.user_roles WHERE user_id = auth.uid()));
CREATE POLICY "Manage enrollments" ON public.activity_enrollments FOR ALL USING (institution_id IN (SELECT institution_id FROM public.user_roles WHERE user_id = auth.uid()));

CREATE POLICY "View fees" ON public.activity_fees FOR SELECT USING (institution_id IN (SELECT institution_id FROM public.user_roles WHERE user_id = auth.uid()));
CREATE POLICY "Manage fees" ON public.activity_fees FOR ALL USING (institution_id IN (SELECT institution_id FROM public.user_roles WHERE user_id = auth.uid()));

CREATE POLICY "View events" ON public.activity_events FOR SELECT USING (institution_id IN (SELECT institution_id FROM public.user_roles WHERE user_id = auth.uid()));
CREATE POLICY "Manage events" ON public.activity_events FOR ALL USING (institution_id IN (SELECT institution_id FROM public.user_roles WHERE user_id = auth.uid()));

CREATE POLICY "View attendance" ON public.activity_attendance FOR SELECT USING (institution_id IN (SELECT institution_id FROM public.user_roles WHERE user_id = auth.uid()));
CREATE POLICY "Manage attendance" ON public.activity_attendance FOR ALL USING (institution_id IN (SELECT institution_id FROM public.user_roles WHERE user_id = auth.uid()));

-- Indexes
CREATE INDEX idx_activities_institution ON public.activities(institution_id);
CREATE INDEX idx_activity_enrollments_activity ON public.activity_enrollments(activity_id);
CREATE INDEX idx_activity_enrollments_student ON public.activity_enrollments(student_id);
CREATE INDEX idx_activity_events_activity ON public.activity_events(activity_id);
CREATE INDEX idx_activity_attendance_activity ON public.activity_attendance(activity_id);

-- Triggers
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_activity_enrollments_updated_at BEFORE UPDATE ON public.activity_enrollments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_activity_fees_updated_at BEFORE UPDATE ON public.activity_fees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_activity_events_updated_at BEFORE UPDATE ON public.activity_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Permissions
INSERT INTO public.permissions (domain, action, name, description) VALUES
  ('activities'::permission_domain, 'view'::permission_action, 'activities.view', 'View activities'),
  ('activities'::permission_domain, 'create'::permission_action, 'activities.create', 'Create activities'),
  ('activities'::permission_domain, 'edit'::permission_action, 'activities.edit', 'Edit activities'),
  ('activities'::permission_domain, 'approve'::permission_action, 'activities.approve', 'Approve enrollments'),
  ('activities'::permission_domain, 'delete'::permission_action, 'activities.delete', 'Delete activities'),
  ('activities'::permission_domain, 'export'::permission_action, 'activities.export', 'Export reports');

INSERT INTO public.role_permissions (role, permission_id) SELECT 'coach'::app_role, id FROM public.permissions WHERE domain = 'activities'::permission_domain AND action IN ('view'::permission_action, 'create'::permission_action, 'edit'::permission_action);
INSERT INTO public.role_permissions (role, permission_id) SELECT 'institution_admin'::app_role, id FROM public.permissions WHERE domain = 'activities'::permission_domain;
INSERT INTO public.role_permissions (role, permission_id) SELECT 'institution_owner'::app_role, id FROM public.permissions WHERE domain = 'activities'::permission_domain;
INSERT INTO public.role_permissions (role, permission_id) SELECT 'teacher'::app_role, id FROM public.permissions WHERE domain = 'activities'::permission_domain AND action = 'view'::permission_action;