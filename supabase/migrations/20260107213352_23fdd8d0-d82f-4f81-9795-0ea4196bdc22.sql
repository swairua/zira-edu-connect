-- =====================================================
-- SUPER ADMIN-MANAGED BANK & IPN ARCHITECTURE
-- =====================================================

-- 1. Platform Bank Integrations (Super Admin managed)
CREATE TABLE public.platform_bank_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_code TEXT UNIQUE NOT NULL,
  bank_name TEXT NOT NULL,
  provider_type TEXT NOT NULL DEFAULT 'bank_api' CHECK (provider_type IN ('bank_api', 'mobile_money', 'card_processor')),
  credentials JSONB DEFAULT '{}'::jsonb,
  oauth_settings JSONB DEFAULT '{}'::jsonb,
  webhook_config JSONB DEFAULT '{}'::jsonb,
  environment TEXT NOT NULL DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'production')),
  is_active BOOLEAN DEFAULT false,
  supported_countries TEXT[] DEFAULT ARRAY['KE'],
  api_base_url TEXT,
  health_status TEXT DEFAULT 'unknown' CHECK (health_status IN ('healthy', 'degraded', 'down', 'unknown')),
  last_health_check TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Institution Bank Accounts (School managed mappings)
CREATE TABLE public.institution_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  platform_integration_id UUID NOT NULL REFERENCES public.platform_bank_integrations(id) ON DELETE CASCADE,
  account_number TEXT,
  account_name TEXT,
  paybill_number TEXT,
  till_number TEXT,
  account_reference TEXT,
  fee_type_mappings JSONB DEFAULT '[]'::jsonb,
  campus_mappings UUID[] DEFAULT ARRAY[]::UUID[],
  academic_year_id UUID REFERENCES public.academic_years(id),
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(institution_id, platform_integration_id)
);

-- 3. IPN Events (Platform owned, immutable audit log)
CREATE TABLE public.ipn_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES public.platform_bank_integrations(id),
  raw_payload JSONB NOT NULL,
  normalized_payload JSONB,
  event_type TEXT NOT NULL DEFAULT 'payment' CHECK (event_type IN ('payment', 'reversal', 'timeout', 'validation_failure')),
  external_reference TEXT,
  amount NUMERIC(15, 2),
  currency TEXT DEFAULT 'KES',
  sender_phone TEXT,
  sender_name TEXT,
  sender_account TEXT,
  bank_reference TEXT,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'validated', 'queued', 'processed', 'failed', 'duplicate')),
  validation_errors TEXT[],
  source_ip TEXT,
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. IPN Processing Queue
CREATE TABLE public.ipn_processing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ipn_event_id UUID NOT NULL REFERENCES public.ipn_events(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES public.institutions(id),
  institution_bank_account_id UUID REFERENCES public.institution_bank_accounts(id),
  student_id UUID REFERENCES public.students(id),
  invoice_id UUID REFERENCES public.student_invoices(id),
  match_status TEXT NOT NULL DEFAULT 'pending' CHECK (match_status IN ('pending', 'matched', 'partial_match', 'unmatched', 'exception', 'manual_review')),
  match_confidence NUMERIC(5, 2) DEFAULT 0,
  match_details JSONB DEFAULT '{}'::jsonb,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 5,
  next_retry_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  processing_notes TEXT,
  action_taken TEXT,
  action_by UUID,
  action_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Integration Health Logs
CREATE TABLE public.integration_health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES public.platform_bank_integrations(id) ON DELETE CASCADE,
  check_type TEXT NOT NULL CHECK (check_type IN ('api', 'callback', 'auth', 'connectivity')),
  status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'timeout', 'error')),
  response_time_ms INTEGER,
  error_message TEXT,
  error_code TEXT,
  request_details JSONB,
  response_details JSONB,
  checked_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Integration Alerts
CREATE TABLE public.integration_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES public.platform_bank_integrations(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('callback_failure', 'high_latency', 'auth_failure', 'rate_limit', 'service_down', 'queue_backlog')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_institution_bank_accounts_institution ON public.institution_bank_accounts(institution_id);
CREATE INDEX idx_institution_bank_accounts_integration ON public.institution_bank_accounts(platform_integration_id);
CREATE INDEX idx_ipn_events_integration ON public.ipn_events(integration_id);
CREATE INDEX idx_ipn_events_status ON public.ipn_events(status);
CREATE INDEX idx_ipn_events_created ON public.ipn_events(created_at DESC);
CREATE INDEX idx_ipn_events_reference ON public.ipn_events(external_reference);
CREATE INDEX idx_ipn_events_bank_reference ON public.ipn_events(bank_reference);
CREATE INDEX idx_ipn_processing_queue_status ON public.ipn_processing_queue(match_status);
CREATE INDEX idx_ipn_processing_queue_institution ON public.ipn_processing_queue(institution_id);
CREATE INDEX idx_ipn_processing_queue_retry ON public.ipn_processing_queue(next_retry_at) WHERE match_status = 'pending';
CREATE INDEX idx_integration_health_logs_integration ON public.integration_health_logs(integration_id);
CREATE INDEX idx_integration_health_logs_checked ON public.integration_health_logs(checked_at DESC);
CREATE INDEX idx_integration_alerts_integration ON public.integration_alerts(integration_id);
CREATE INDEX idx_integration_alerts_unresolved ON public.integration_alerts(integration_id) WHERE resolved_at IS NULL;

-- TRIGGERS
CREATE TRIGGER update_platform_bank_integrations_updated_at
  BEFORE UPDATE ON public.platform_bank_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_institution_bank_accounts_updated_at
  BEFORE UPDATE ON public.institution_bank_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ipn_processing_queue_updated_at
  BEFORE UPDATE ON public.ipn_processing_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ROW LEVEL SECURITY

-- Platform Bank Integrations - Super Admin only
ALTER TABLE public.platform_bank_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage bank integrations"
  ON public.platform_bank_integrations
  FOR ALL
  USING (public.is_super_admin(auth.uid()) OR public.is_support_admin(auth.uid()));

-- Institution Bank Accounts
ALTER TABLE public.institution_bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage all institution bank accounts"
  ON public.institution_bank_accounts
  FOR ALL
  USING (public.is_super_admin(auth.uid()) OR public.is_support_admin(auth.uid()));

CREATE POLICY "Institution users can view their bank accounts"
  ON public.institution_bank_accounts
  FOR SELECT
  USING (public.user_belongs_to_institution(auth.uid(), institution_id));

CREATE POLICY "Institution admins can manage their bank accounts"
  ON public.institution_bank_accounts
  FOR ALL
  USING (
    public.has_institution_role(auth.uid(), 'institution_admin'::app_role, institution_id) OR
    public.has_institution_role(auth.uid(), 'institution_owner'::app_role, institution_id) OR
    public.has_institution_role(auth.uid(), 'finance_officer'::app_role, institution_id)
  );

-- IPN Events - Platform admins view only
ALTER TABLE public.ipn_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins can view IPN events"
  ON public.ipn_events
  FOR SELECT
  USING (public.is_super_admin(auth.uid()) OR public.is_support_admin(auth.uid()));

-- IPN Processing Queue
ALTER TABLE public.ipn_processing_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins can manage all queue items"
  ON public.ipn_processing_queue
  FOR ALL
  USING (public.is_super_admin(auth.uid()) OR public.is_support_admin(auth.uid()));

CREATE POLICY "Institution users can view their queue items"
  ON public.ipn_processing_queue
  FOR SELECT
  USING (public.user_belongs_to_institution(auth.uid(), institution_id));

CREATE POLICY "Institution finance users can update their queue items"
  ON public.ipn_processing_queue
  FOR UPDATE
  USING (
    institution_id IS NOT NULL AND (
      public.has_institution_role(auth.uid(), 'institution_admin'::app_role, institution_id) OR
      public.has_institution_role(auth.uid(), 'finance_officer'::app_role, institution_id)
    )
  );

-- Integration Health Logs - Platform admins only
ALTER TABLE public.integration_health_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins can view health logs"
  ON public.integration_health_logs
  FOR SELECT
  USING (public.is_super_admin(auth.uid()) OR public.is_support_admin(auth.uid()));

-- Integration Alerts - Platform admins only
ALTER TABLE public.integration_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins can manage alerts"
  ON public.integration_alerts
  FOR ALL
  USING (public.is_super_admin(auth.uid()) OR public.is_support_admin(auth.uid()));

-- SEED DEFAULT BANK INTEGRATIONS
INSERT INTO public.platform_bank_integrations (bank_code, bank_name, provider_type, supported_countries, is_active) VALUES
  ('mpesa', 'M-PESA (Safaricom)', 'mobile_money', ARRAY['KE'], false),
  ('kcb_buni', 'KCB Buni API', 'bank_api', ARRAY['KE', 'UG', 'TZ', 'RW'], false),
  ('equity_jenga', 'Equity Jenga API', 'bank_api', ARRAY['KE', 'UG', 'TZ', 'RW', 'SS', 'CD'], false),
  ('coop_connect', 'Co-operative Bank Connect', 'bank_api', ARRAY['KE'], false),
  ('im_bank', 'I&M Bank API', 'bank_api', ARRAY['KE', 'TZ', 'RW'], false),
  ('dtb', 'DTB Bank API', 'bank_api', ARRAY['KE', 'UG', 'TZ'], false),
  ('ncba', 'NCBA Loop', 'bank_api', ARRAY['KE', 'UG', 'TZ', 'RW'], false),
  ('stanbic', 'Stanbic Bank API', 'bank_api', ARRAY['KE', 'UG', 'TZ'], false);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.ipn_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ipn_processing_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.integration_alerts;