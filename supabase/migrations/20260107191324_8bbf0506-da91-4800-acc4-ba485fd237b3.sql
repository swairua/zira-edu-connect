-- Create onboarding status enum
DO $$ BEGIN
  CREATE TYPE onboarding_status AS ENUM ('not_started', 'in_progress', 'completed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add onboarding columns to institutions
ALTER TABLE public.institutions 
ADD COLUMN IF NOT EXISTS onboarding_status text DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS go_live_at timestamptz;

-- Create onboarding_progress table
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  current_step text NOT NULL DEFAULT 'institution_profile',
  completed_steps text[] DEFAULT '{}',
  step_data jsonb DEFAULT '{}',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  completed_by uuid,
  is_locked boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(institution_id)
);

-- Create data_imports table
CREATE TABLE IF NOT EXISTS public.data_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  import_type text NOT NULL CHECK (import_type IN ('students', 'parents', 'staff', 'opening_balances')),
  file_name text,
  file_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'validating', 'validated', 'importing', 'completed', 'failed', 'rolled_back')),
  is_dry_run boolean DEFAULT false,
  total_rows integer DEFAULT 0,
  valid_rows integer DEFAULT 0,
  imported_rows integer DEFAULT 0,
  failed_rows integer DEFAULT 0,
  validation_errors jsonb DEFAULT '[]',
  imported_ids uuid[] DEFAULT '{}',
  imported_by uuid,
  validated_at timestamptz,
  imported_at timestamptz,
  rolled_back_at timestamptz,
  rolled_back_by uuid,
  created_at timestamptz DEFAULT now()
);

-- Create opening_balances table
CREATE TABLE IF NOT EXISTS public.opening_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  import_id uuid REFERENCES public.data_imports(id) ON DELETE SET NULL,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  admission_number text NOT NULL,
  balance_date date NOT NULL,
  amount integer NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Add imported_from to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS imported_from uuid REFERENCES public.data_imports(id) ON DELETE SET NULL;

-- Add imported_from to parents table
ALTER TABLE public.parents 
ADD COLUMN IF NOT EXISTS imported_from uuid REFERENCES public.data_imports(id) ON DELETE SET NULL;

-- Add imported_from to staff table
ALTER TABLE public.staff 
ADD COLUMN IF NOT EXISTS imported_from uuid REFERENCES public.data_imports(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opening_balances ENABLE ROW LEVEL SECURITY;

-- RLS for onboarding_progress
CREATE POLICY "Users can view their institution onboarding" 
ON public.onboarding_progress FOR SELECT 
USING (
  institution_id IN (
    SELECT p.institution_id FROM profiles p WHERE p.user_id = auth.uid()
  ) OR
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'support_admin'))
);

CREATE POLICY "Users can update their institution onboarding" 
ON public.onboarding_progress FOR UPDATE 
USING (
  institution_id IN (
    SELECT p.institution_id FROM profiles p WHERE p.user_id = auth.uid()
  ) OR
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'support_admin'))
);

CREATE POLICY "Users can insert onboarding for their institution" 
ON public.onboarding_progress FOR INSERT 
WITH CHECK (
  institution_id IN (
    SELECT p.institution_id FROM profiles p WHERE p.user_id = auth.uid()
  ) OR
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'support_admin'))
);

-- RLS for data_imports
CREATE POLICY "Users can view their institution imports" 
ON public.data_imports FOR SELECT 
USING (
  institution_id IN (
    SELECT p.institution_id FROM profiles p WHERE p.user_id = auth.uid()
  ) OR
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'support_admin'))
);

CREATE POLICY "Users can insert imports for their institution" 
ON public.data_imports FOR INSERT 
WITH CHECK (
  institution_id IN (
    SELECT p.institution_id FROM profiles p WHERE p.user_id = auth.uid()
  ) OR
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'support_admin'))
);

CREATE POLICY "Users can update their institution imports" 
ON public.data_imports FOR UPDATE 
USING (
  institution_id IN (
    SELECT p.institution_id FROM profiles p WHERE p.user_id = auth.uid()
  ) OR
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'support_admin'))
);

-- RLS for opening_balances
CREATE POLICY "Users can view their institution opening balances" 
ON public.opening_balances FOR SELECT 
USING (
  institution_id IN (
    SELECT p.institution_id FROM profiles p WHERE p.user_id = auth.uid()
  ) OR
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'support_admin'))
);

CREATE POLICY "Users can insert opening balances for their institution" 
ON public.opening_balances FOR INSERT 
WITH CHECK (
  institution_id IN (
    SELECT p.institution_id FROM profiles p WHERE p.user_id = auth.uid()
  ) OR
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'support_admin'))
);

CREATE POLICY "Users can delete opening balances for their institution" 
ON public.opening_balances FOR DELETE 
USING (
  institution_id IN (
    SELECT p.institution_id FROM profiles p WHERE p.user_id = auth.uid()
  ) OR
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'support_admin'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_institution ON public.onboarding_progress(institution_id);
CREATE INDEX IF NOT EXISTS idx_data_imports_institution ON public.data_imports(institution_id);
CREATE INDEX IF NOT EXISTS idx_data_imports_status ON public.data_imports(status);
CREATE INDEX IF NOT EXISTS idx_opening_balances_student ON public.opening_balances(student_id);
CREATE INDEX IF NOT EXISTS idx_opening_balances_import ON public.opening_balances(import_id);

-- Update trigger for onboarding_progress
CREATE TRIGGER update_onboarding_progress_updated_at
BEFORE UPDATE ON public.onboarding_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();