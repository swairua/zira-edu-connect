-- Create backup_history table to track all backups
CREATE TABLE public.backup_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  backup_type TEXT NOT NULL DEFAULT 'manual', -- 'manual', 'scheduled'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  include_modules TEXT[] NOT NULL DEFAULT ARRAY['all'],
  file_name TEXT,
  file_path TEXT,
  file_size_bytes BIGINT,
  download_url TEXT,
  download_expires_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_by UUID,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scheduled_backups table for automated backups
CREATE TABLE public.scheduled_backups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  frequency TEXT NOT NULL DEFAULT 'weekly', -- 'weekly', 'monthly', 'term_end'
  include_modules TEXT[] NOT NULL DEFAULT ARRAY['all'],
  day_of_week INTEGER, -- 0-6 for weekly (Sunday = 0)
  day_of_month INTEGER, -- 1-31 for monthly
  time_of_day TIME NOT NULL DEFAULT '02:00:00', -- Default 2 AM
  notify_emails TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.backup_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_backups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for backup_history
CREATE POLICY "Users can view their institution's backup history"
  ON public.backup_history
  FOR SELECT
  USING (
    institution_id IN (
      SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create backups for their institution"
  ON public.backup_history
  FOR INSERT
  WITH CHECK (
    institution_id IN (
      SELECT ur.institution_id FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('institution_owner', 'institution_admin', 'ict_admin')
    )
  );

CREATE POLICY "Users can update their institution's backups"
  ON public.backup_history
  FOR UPDATE
  USING (
    institution_id IN (
      SELECT ur.institution_id FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('institution_owner', 'institution_admin', 'ict_admin')
    )
  );

CREATE POLICY "Users can delete their institution's backups"
  ON public.backup_history
  FOR DELETE
  USING (
    institution_id IN (
      SELECT ur.institution_id FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('institution_owner', 'institution_admin', 'ict_admin')
    )
  );

-- RLS Policies for scheduled_backups
CREATE POLICY "Users can view their institution's scheduled backups"
  ON public.scheduled_backups
  FOR SELECT
  USING (
    institution_id IN (
      SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create scheduled backups for their institution"
  ON public.scheduled_backups
  FOR INSERT
  WITH CHECK (
    institution_id IN (
      SELECT ur.institution_id FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('institution_owner', 'institution_admin', 'ict_admin')
    )
  );

CREATE POLICY "Users can update their institution's scheduled backups"
  ON public.scheduled_backups
  FOR UPDATE
  USING (
    institution_id IN (
      SELECT ur.institution_id FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('institution_owner', 'institution_admin', 'ict_admin')
    )
  );

CREATE POLICY "Users can delete their institution's scheduled backups"
  ON public.scheduled_backups
  FOR DELETE
  USING (
    institution_id IN (
      SELECT ur.institution_id FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('institution_owner', 'institution_admin', 'ict_admin')
    )
  );

-- Create storage bucket for institution backups
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('institution-backups', 'institution-backups', false, 104857600) -- 100MB limit
ON CONFLICT (id) DO NOTHING;

-- Storage policies for institution-backups bucket
CREATE POLICY "Users can view their institution's backups"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'institution-backups' AND
    (storage.foldername(name))[1] IN (
      SELECT ur.institution_id::text FROM public.user_roles ur WHERE ur.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload backups for their institution"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'institution-backups' AND
    (storage.foldername(name))[1] IN (
      SELECT ur.institution_id::text FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('institution_owner', 'institution_admin', 'ict_admin')
    )
  );

CREATE POLICY "Users can delete their institution's backups"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'institution-backups' AND
    (storage.foldername(name))[1] IN (
      SELECT ur.institution_id::text FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('institution_owner', 'institution_admin', 'ict_admin')
    )
  );

-- Create trigger for updated_at on both tables
CREATE TRIGGER update_backup_history_updated_at
  BEFORE UPDATE ON public.backup_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scheduled_backups_updated_at
  BEFORE UPDATE ON public.scheduled_backups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();