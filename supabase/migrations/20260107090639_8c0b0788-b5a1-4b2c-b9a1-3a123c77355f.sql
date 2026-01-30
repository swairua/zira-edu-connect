-- Create SMS logs table for tracking all SMS communications
CREATE TABLE public.sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
  recipient_phone TEXT NOT NULL,
  recipient_name TEXT,
  recipient_type TEXT, -- 'parent', 'staff', 'student'
  message TEXT NOT NULL,
  message_type TEXT NOT NULL, -- 'pin_delivery', 'payment_reminder', 'announcement', 'test', etc.
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'delivered'
  provider_response JSONB,
  unique_identifier TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  created_by UUID
);

-- Create SMS settings table for provider configuration
CREATE TABLE public.sms_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'roberms',
  api_url TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  username TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for querying
CREATE INDEX idx_sms_logs_institution ON public.sms_logs(institution_id);
CREATE INDEX idx_sms_logs_status ON public.sms_logs(status);
CREATE INDEX idx_sms_logs_created_at ON public.sms_logs(created_at DESC);
CREATE INDEX idx_sms_logs_message_type ON public.sms_logs(message_type);

-- Enable RLS
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for sms_logs
CREATE POLICY "Super admins can manage all SMS logs" ON public.sms_logs
  FOR ALL USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Support admins can view all SMS logs" ON public.sms_logs
  FOR SELECT USING (public.is_support_admin(auth.uid()));

CREATE POLICY "Institution users can view their SMS logs" ON public.sms_logs
  FOR SELECT USING (
    institution_id IS NOT NULL AND
    public.user_belongs_to_institution(auth.uid(), institution_id)
  );

-- RLS policies for sms_settings (super admin only)
CREATE POLICY "Super admins can manage SMS settings" ON public.sms_settings
  FOR ALL USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Support admins can view SMS settings" ON public.sms_settings
  FOR SELECT USING (public.is_support_admin(auth.uid()));

-- Insert default RoberMS settings
INSERT INTO public.sms_settings (provider, api_url, sender_name, username)
VALUES ('roberms', 'https://endpint.roberms.com/roberms/bulk_api/', 'ZIRA TECH', 'ZIRA TECH');

-- Add trigger for updated_at on sms_settings
CREATE TRIGGER update_sms_settings_updated_at
BEFORE UPDATE ON public.sms_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();