-- Table to track invoice email delivery history
CREATE TABLE IF NOT EXISTS public.invoice_email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.student_invoices(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  sent_to TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'delivered', 'bounced')),
  resend_message_id TEXT,
  error_message TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoice_email_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view email logs for their institution"
ON public.invoice_email_logs
FOR SELECT
USING (
  public.is_super_admin(auth.uid()) OR
  public.user_belongs_to_institution(auth.uid(), institution_id)
);

CREATE POLICY "Users can insert email logs for their institution"
ON public.invoice_email_logs
FOR INSERT
WITH CHECK (
  public.is_super_admin(auth.uid()) OR
  public.user_belongs_to_institution(auth.uid(), institution_id)
);

-- Indexes for performance
CREATE INDEX idx_invoice_email_logs_invoice ON public.invoice_email_logs(invoice_id);
CREATE INDEX idx_invoice_email_logs_institution ON public.invoice_email_logs(institution_id);
CREATE INDEX idx_invoice_email_logs_sent_at ON public.invoice_email_logs(sent_at DESC);