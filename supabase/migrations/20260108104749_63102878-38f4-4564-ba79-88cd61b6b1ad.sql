
-- Library Tables
CREATE TABLE public.library_books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  title TEXT NOT NULL, author TEXT, isbn TEXT, category TEXT, publisher TEXT, publication_year INTEGER,
  description TEXT, location TEXT, total_copies INTEGER NOT NULL DEFAULT 0, available_copies INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.library_book_copies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES public.library_books(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  copy_number TEXT NOT NULL, barcode TEXT, condition TEXT NOT NULL DEFAULT 'good' CHECK (condition IN ('good', 'fair', 'damaged', 'lost')),
  acquisition_date DATE, notes TEXT, is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(institution_id, copy_number)
);

CREATE TABLE public.library_loans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  copy_id UUID NOT NULL REFERENCES public.library_book_copies(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  borrowed_by UUID NOT NULL, borrowed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), due_date DATE NOT NULL,
  returned_at TIMESTAMP WITH TIME ZONE, returned_to UUID,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'returned', 'overdue', 'lost')),
  condition_at_checkout TEXT, condition_at_return TEXT, renewal_count INTEGER NOT NULL DEFAULT 0, notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.library_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE UNIQUE,
  max_books_per_student INTEGER NOT NULL DEFAULT 3, loan_period_days INTEGER NOT NULL DEFAULT 14,
  overdue_penalty_per_day DECIMAL(10,2) NOT NULL DEFAULT 10.00, lost_book_penalty DECIMAL(10,2) NOT NULL DEFAULT 500.00,
  damaged_book_penalty DECIMAL(10,2) NOT NULL DEFAULT 200.00, renewal_allowed BOOLEAN NOT NULL DEFAULT true,
  max_renewals INTEGER NOT NULL DEFAULT 1, grace_period_days INTEGER NOT NULL DEFAULT 0, currency TEXT NOT NULL DEFAULT 'KES',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.library_penalties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  loan_id UUID NOT NULL REFERENCES public.library_loans(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  penalty_type TEXT NOT NULL CHECK (penalty_type IN ('late_return', 'lost_book', 'damaged_book')),
  amount DECIMAL(10,2) NOT NULL, days_overdue INTEGER DEFAULT 0,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), applied_by UUID,
  invoice_id UUID REFERENCES public.student_invoices(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'invoiced', 'paid', 'waived')),
  waived_by UUID, waived_at TIMESTAMP WITH TIME ZONE, waiver_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_book_copies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_penalties ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "library_books_select" ON public.library_books FOR SELECT USING (institution_id IN (SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()));
CREATE POLICY "library_books_manage" ON public.library_books FOR ALL USING (institution_id IN (SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('librarian', 'institution_admin', 'institution_owner')));

CREATE POLICY "library_copies_select" ON public.library_book_copies FOR SELECT USING (institution_id IN (SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()));
CREATE POLICY "library_copies_manage" ON public.library_book_copies FOR ALL USING (institution_id IN (SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('librarian', 'institution_admin', 'institution_owner')));

CREATE POLICY "library_loans_select" ON public.library_loans FOR SELECT USING (institution_id IN (SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()));
CREATE POLICY "library_loans_manage" ON public.library_loans FOR ALL USING (institution_id IN (SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('librarian', 'institution_admin', 'institution_owner')));

CREATE POLICY "library_settings_select" ON public.library_settings FOR SELECT USING (institution_id IN (SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()));
CREATE POLICY "library_settings_manage" ON public.library_settings FOR ALL USING (institution_id IN (SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('institution_admin', 'institution_owner')));

CREATE POLICY "library_penalties_select" ON public.library_penalties FOR SELECT USING (institution_id IN (SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()));
CREATE POLICY "library_penalties_manage" ON public.library_penalties FOR ALL USING (institution_id IN (SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('librarian', 'institution_admin', 'institution_owner')));

-- Permissions
INSERT INTO public.permissions (domain, action, name, description) VALUES
  ('library', 'view', 'View Library', 'View library books and loans'),
  ('library', 'create', 'Create Library Items', 'Add books and checkouts'),
  ('library', 'edit', 'Edit Library Items', 'Edit books and returns'),
  ('library', 'delete', 'Delete Library Items', 'Remove books'),
  ('library', 'approve', 'Approve Library Actions', 'Waive penalties');

-- Role Permissions
INSERT INTO public.role_permissions (role, permission_id) SELECT 'librarian', p.id FROM public.permissions p WHERE p.domain = 'library';
INSERT INTO public.role_permissions (role, permission_id) SELECT 'teacher', p.id FROM public.permissions p WHERE p.domain = 'library' AND p.action = 'view';
INSERT INTO public.role_permissions (role, permission_id) SELECT 'institution_admin', p.id FROM public.permissions p WHERE p.domain = 'library';
INSERT INTO public.role_permissions (role, permission_id) SELECT 'institution_owner', p.id FROM public.permissions p WHERE p.domain = 'library';
