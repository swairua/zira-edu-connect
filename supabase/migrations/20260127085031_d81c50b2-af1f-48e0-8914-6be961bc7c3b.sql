-- Create institution_notification_settings table for per-institution notification preferences
CREATE TABLE public.institution_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL, -- 'birthday', 'attendance_absent', 'library_due', etc.
  is_enabled BOOLEAN DEFAULT true,
  channels TEXT[] DEFAULT ARRAY['sms', 'in_app'], -- which channels to use
  schedule_time TIME DEFAULT '09:00', -- when to send (for scheduled notifications)
  schedule_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- days of week (1=Mon, 7=Sun)
  custom_template TEXT, -- optional override of default template
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(institution_id, category)
);

-- Enable RLS
ALTER TABLE public.institution_notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for institution admins - using has_permission function
CREATE POLICY "Institution admins can view notification settings"
  ON public.institution_notification_settings FOR SELECT
  USING (public.has_permission(auth.uid(), 'system_settings', 'view', institution_id));

CREATE POLICY "Institution admins can insert notification settings"
  ON public.institution_notification_settings FOR INSERT
  WITH CHECK (public.has_permission(auth.uid(), 'system_settings', 'edit', institution_id));

CREATE POLICY "Institution admins can update notification settings"
  ON public.institution_notification_settings FOR UPDATE
  USING (public.has_permission(auth.uid(), 'system_settings', 'edit', institution_id));

CREATE POLICY "Institution admins can delete notification settings"
  ON public.institution_notification_settings FOR DELETE
  USING (public.has_permission(auth.uid(), 'system_settings', 'edit', institution_id));

-- Create trigger to update updated_at
CREATE TRIGGER update_institution_notification_settings_updated_at
  BEFORE UPDATE ON public.institution_notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster lookups
CREATE INDEX idx_institution_notification_settings_institution_category 
  ON public.institution_notification_settings(institution_id, category);