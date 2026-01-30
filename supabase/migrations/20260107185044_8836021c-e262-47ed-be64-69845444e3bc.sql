-- ================================================
-- AUTOMATED FEE COLLECTION WORKFLOWS - DATABASE SCHEMA
-- ================================================

-- MODULE 1: M-PESA STK PUSH REQUESTS
CREATE TABLE public.mpesa_stk_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES public.student_invoices(id) ON DELETE SET NULL,
    phone_number TEXT NOT NULL,
    amount INTEGER NOT NULL CHECK (amount > 0),
    checkout_request_id TEXT,
    merchant_request_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'timeout', 'cancelled')),
    triggered_by TEXT NOT NULL DEFAULT 'admin' CHECK (triggered_by IN ('parent', 'system', 'admin')),
    result_code TEXT,
    result_desc TEXT,
    mpesa_receipt TEXT,
    transaction_date TIMESTAMP WITH TIME ZONE,
    callback_received_at TIMESTAMP WITH TIME ZONE,
    retry_count INTEGER DEFAULT 0,
    last_retry_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for duplicate prevention
CREATE INDEX idx_mpesa_stk_pending ON public.mpesa_stk_requests(phone_number, invoice_id, created_at) 
WHERE status IN ('pending', 'processing');

-- Index for status queries
CREATE INDEX idx_mpesa_stk_status ON public.mpesa_stk_requests(institution_id, status, created_at DESC);

-- Enable RLS
ALTER TABLE public.mpesa_stk_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Institution staff can view M-PESA requests" ON public.mpesa_stk_requests
    FOR SELECT USING (
        institution_id IN (
            SELECT institution_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Institution staff can create M-PESA requests" ON public.mpesa_stk_requests
    FOR INSERT WITH CHECK (
        institution_id IN (
            SELECT institution_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "System can update M-PESA requests" ON public.mpesa_stk_requests
    FOR UPDATE USING (true);

-- ================================================
-- MODULE 2: REMINDER SCHEDULES
-- ================================================

CREATE TABLE public.reminder_schedules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    reminder_type TEXT NOT NULL CHECK (reminder_type IN ('upcoming_due', 'due_date', 'overdue', 'penalty_applied')),
    days_offset INTEGER NOT NULL DEFAULT 0,
    channels TEXT[] NOT NULL DEFAULT ARRAY['sms'],
    message_template TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    send_time TIME DEFAULT '09:00:00',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reminder_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institution staff can manage reminder schedules" ON public.reminder_schedules
    FOR ALL USING (
        institution_id IN (
            SELECT institution_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

-- ================================================
-- REMINDER LOGS
-- ================================================

CREATE TABLE public.reminder_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    schedule_id UUID REFERENCES public.reminder_schedules(id) ON DELETE SET NULL,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES public.student_invoices(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES public.parents(id) ON DELETE SET NULL,
    channel TEXT NOT NULL CHECK (channel IN ('sms', 'email', 'whatsapp', 'in_app')),
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'opted_out')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_reminder_logs_institution ON public.reminder_logs(institution_id, created_at DESC);
CREATE INDEX idx_reminder_logs_student ON public.reminder_logs(student_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.reminder_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institution staff can view reminder logs" ON public.reminder_logs
    FOR SELECT USING (
        institution_id IN (
            SELECT institution_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert reminder logs" ON public.reminder_logs
    FOR INSERT WITH CHECK (true);

-- ================================================
-- NOTIFICATION PREFERENCES (Opt-in/Opt-out)
-- ================================================

CREATE TABLE public.notification_preferences (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID NOT NULL REFERENCES public.parents(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('sms', 'email', 'whatsapp')),
    is_opted_in BOOLEAN NOT NULL DEFAULT true,
    opted_out_at TIMESTAMP WITH TIME ZONE,
    opted_out_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(parent_id, institution_id, channel)
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own preferences" ON public.notification_preferences
    FOR SELECT USING (
        parent_id IN (SELECT id FROM public.parents WHERE user_id = auth.uid())
    );

CREATE POLICY "Parents can update own preferences" ON public.notification_preferences
    FOR UPDATE USING (
        parent_id IN (SELECT id FROM public.parents WHERE user_id = auth.uid())
    );

CREATE POLICY "Institution staff can view preferences" ON public.notification_preferences
    FOR SELECT USING (
        institution_id IN (
            SELECT institution_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

-- ================================================
-- IN-APP NOTIFICATIONS
-- ================================================

CREATE TABLE public.in_app_notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    user_id UUID,
    parent_id UUID REFERENCES public.parents(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    user_type TEXT NOT NULL CHECK (user_type IN ('staff', 'parent', 'student')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('reminder', 'payment', 'penalty', 'alert', 'info', 'success')),
    reference_type TEXT,
    reference_id UUID,
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON public.in_app_notifications(user_id, is_read, created_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_notifications_parent ON public.in_app_notifications(parent_id, is_read, created_at DESC) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_notifications_student ON public.in_app_notifications(student_id, is_read, created_at DESC) WHERE student_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.in_app_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.in_app_notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.in_app_notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON public.in_app_notifications
    FOR INSERT WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.in_app_notifications;

-- ================================================
-- MODULE 3: APPLIED PENALTIES
-- ================================================

CREATE TABLE public.applied_penalties (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES public.student_invoices(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    penalty_rule_id UUID REFERENCES public.late_payment_penalties(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL CHECK (amount > 0),
    days_overdue INTEGER NOT NULL,
    applied_date DATE NOT NULL DEFAULT CURRENT_DATE,
    applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    applied_by TEXT NOT NULL DEFAULT 'system' CHECK (applied_by IN ('system', 'admin')),
    waived BOOLEAN NOT NULL DEFAULT false,
    waived_at TIMESTAMP WITH TIME ZONE,
    waived_by UUID,
    waiver_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Prevent duplicate penalties for same invoice on same day (using applied_date column instead of DATE function)
CREATE UNIQUE INDEX idx_applied_penalties_unique ON public.applied_penalties(invoice_id, applied_date) WHERE NOT waived;

-- Enable RLS
ALTER TABLE public.applied_penalties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institution staff can view applied penalties" ON public.applied_penalties
    FOR SELECT USING (
        institution_id IN (
            SELECT institution_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert applied penalties" ON public.applied_penalties
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Institution staff can update applied penalties" ON public.applied_penalties
    FOR UPDATE USING (
        institution_id IN (
            SELECT institution_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

-- ================================================
-- PENALTY WAIVER REQUESTS
-- ================================================

CREATE TABLE public.penalty_waiver_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    applied_penalty_id UUID NOT NULL REFERENCES public.applied_penalties(id) ON DELETE CASCADE,
    requested_by UUID,
    requester_type TEXT NOT NULL DEFAULT 'parent' CHECK (requester_type IN ('parent', 'staff')),
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.penalty_waiver_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institution staff can manage waiver requests" ON public.penalty_waiver_requests
    FOR ALL USING (
        institution_id IN (
            SELECT institution_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

-- ================================================
-- UPDATE LATE_PAYMENT_PENALTIES TABLE
-- ================================================

ALTER TABLE public.late_payment_penalties 
ADD COLUMN IF NOT EXISTS auto_apply BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_applied_at TIMESTAMP WITH TIME ZONE;

-- ================================================
-- UPDATE TRIGGERS
-- ================================================

CREATE TRIGGER update_mpesa_stk_requests_updated_at
    BEFORE UPDATE ON public.mpesa_stk_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reminder_schedules_updated_at
    BEFORE UPDATE ON public.reminder_schedules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();