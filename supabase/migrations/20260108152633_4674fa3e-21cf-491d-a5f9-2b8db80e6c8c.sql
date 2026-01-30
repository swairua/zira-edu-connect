-- HR Module Tables

-- Leave Types
CREATE TABLE public.leave_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  days_allowed INTEGER NOT NULL DEFAULT 0,
  carry_forward BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Leave Requests
CREATE TABLE public.leave_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INTEGER NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by UUID REFERENCES public.staff(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Leave Balances
CREATE TABLE public.leave_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  entitled INTEGER NOT NULL DEFAULT 0,
  used INTEGER NOT NULL DEFAULT 0,
  balance INTEGER GENERATED ALWAYS AS (entitled - used) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(staff_id, leave_type_id, year)
);

-- Staff Attendance (HR)
CREATE TABLE public.hr_staff_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half_day', 'on_leave')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(staff_id, date)
);

-- Communication Module Tables

-- Announcements
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  audience TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent')),
  publish_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Announcement Reads
CREATE TABLE public.announcement_reads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(announcement_id, user_id)
);

-- Reports Module Tables

-- Saved Reports
CREATE TABLE public.saved_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('financial', 'academic', 'enrollment', 'attendance', 'custom')),
  config JSONB DEFAULT '{}'::JSONB,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Report Exports
CREATE TABLE public.report_exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('csv', 'excel', 'pdf')),
  file_url TEXT,
  file_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_exports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for HR Tables
CREATE POLICY "Users can view leave types for their institution" ON public.leave_types
  FOR SELECT USING (
    institution_id IN (SELECT institution_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage leave types for their institution" ON public.leave_types
  FOR ALL USING (
    institution_id IN (SELECT institution_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view leave requests for their institution" ON public.leave_requests
  FOR SELECT USING (
    institution_id IN (SELECT institution_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage leave requests for their institution" ON public.leave_requests
  FOR ALL USING (
    institution_id IN (SELECT institution_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view leave balances for their institution" ON public.leave_balances
  FOR SELECT USING (
    institution_id IN (SELECT institution_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage leave balances for their institution" ON public.leave_balances
  FOR ALL USING (
    institution_id IN (SELECT institution_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view staff attendance for their institution" ON public.hr_staff_attendance
  FOR SELECT USING (
    institution_id IN (SELECT institution_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage staff attendance for their institution" ON public.hr_staff_attendance
  FOR ALL USING (
    institution_id IN (SELECT institution_id FROM public.profiles WHERE user_id = auth.uid())
  );

-- RLS Policies for Communication Tables
CREATE POLICY "Users can view announcements for their institution" ON public.announcements
  FOR SELECT USING (
    institution_id IN (SELECT institution_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage announcements for their institution" ON public.announcements
  FOR ALL USING (
    institution_id IN (SELECT institution_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view their announcement reads" ON public.announcement_reads
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create announcement reads" ON public.announcement_reads
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for Reports Tables
CREATE POLICY "Users can view saved reports for their institution" ON public.saved_reports
  FOR SELECT USING (
    institution_id IN (SELECT institution_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage saved reports for their institution" ON public.saved_reports
  FOR ALL USING (
    institution_id IN (SELECT institution_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view report exports for their institution" ON public.report_exports
  FOR SELECT USING (
    institution_id IN (SELECT institution_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage report exports for their institution" ON public.report_exports
  FOR ALL USING (
    institution_id IN (SELECT institution_id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Create indexes for performance
CREATE INDEX idx_leave_requests_institution ON public.leave_requests(institution_id);
CREATE INDEX idx_leave_requests_staff ON public.leave_requests(staff_id);
CREATE INDEX idx_leave_requests_status ON public.leave_requests(status);
CREATE INDEX idx_leave_balances_staff_year ON public.leave_balances(staff_id, year);
CREATE INDEX idx_hr_staff_attendance_date ON public.hr_staff_attendance(institution_id, date);
CREATE INDEX idx_announcements_institution ON public.announcements(institution_id);
CREATE INDEX idx_announcements_published ON public.announcements(is_published, publish_at);
CREATE INDEX idx_saved_reports_institution ON public.saved_reports(institution_id);
CREATE INDEX idx_report_exports_institution ON public.report_exports(institution_id);