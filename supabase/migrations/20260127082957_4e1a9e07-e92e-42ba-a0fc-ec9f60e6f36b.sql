-- Add new notification-related tables for comprehensive communication system

-- 1. Communication Events Table - logs all communication events for tracking
CREATE TABLE IF NOT EXISTS public.communication_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'birthday', 'attendance_absent', 'attendance_late', 'payment_received', 'assignment_due', 'activity_reminder', 'library_overdue', etc.
  trigger_source TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'realtime', 'manual'
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.parents(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
  reference_type TEXT, -- 'attendance', 'invoice', 'assignment', 'activity', 'library_loan', etc.
  reference_id UUID,
  channels_used TEXT[] DEFAULT '{}', -- ['sms', 'email', 'in_app']
  message_content TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'partial', 'failed', 'skipped'
  metadata JSONB DEFAULT '{}',
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for efficient queries
CREATE INDEX idx_communication_events_institution ON public.communication_events(institution_id);
CREATE INDEX idx_communication_events_type ON public.communication_events(event_type);
CREATE INDEX idx_communication_events_status ON public.communication_events(status);
CREATE INDEX idx_communication_events_created ON public.communication_events(created_at DESC);
CREATE INDEX idx_communication_events_student ON public.communication_events(student_id) WHERE student_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.communication_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for communication_events
CREATE POLICY "Users can view communication events for their institution"
ON public.communication_events FOR SELECT
TO authenticated
USING (public.has_permission(auth.uid(), 'communication', 'view', institution_id));

CREATE POLICY "Users can create communication events for their institution"
ON public.communication_events FOR INSERT
TO authenticated
WITH CHECK (public.has_permission(auth.uid(), 'communication', 'create', institution_id));

-- 2. Scheduled Notifications Table - for future/queued notifications
CREATE TABLE IF NOT EXISTS public.scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'birthday', 'attendance_summary', 'fee_reminder', 'activity_reminder', etc.
  schedule_type TEXT NOT NULL DEFAULT 'one_time', -- 'one_time', 'recurring_daily', 'recurring_weekly', 'recurring_monthly'
  scheduled_for TIMESTAMPTZ NOT NULL,
  recurrence_config JSONB DEFAULT '{}', -- For recurring: { "days_of_week": [1,2,3,4,5], "time": "08:00" }
  target_type TEXT NOT NULL, -- 'student', 'parent', 'staff', 'class', 'all_parents'
  target_ids UUID[] DEFAULT '{}',
  target_filter JSONB DEFAULT '{}', -- Dynamic filter criteria
  channels TEXT[] NOT NULL DEFAULT ARRAY['sms'], -- ['sms', 'email', 'in_app']
  message_template_id UUID REFERENCES public.message_templates(id),
  custom_message TEXT,
  variables JSONB DEFAULT '{}',
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'critical'
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'processing', 'completed', 'failed', 'cancelled'
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  run_count INTEGER DEFAULT 0,
  max_runs INTEGER, -- NULL for unlimited recurring
  error_message TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for scheduled_notifications
CREATE INDEX idx_scheduled_notifications_institution ON public.scheduled_notifications(institution_id);
CREATE INDEX idx_scheduled_notifications_status ON public.scheduled_notifications(status);
CREATE INDEX idx_scheduled_notifications_scheduled_for ON public.scheduled_notifications(scheduled_for) WHERE status = 'scheduled';
CREATE INDEX idx_scheduled_notifications_type ON public.scheduled_notifications(notification_type);

-- Enable RLS
ALTER TABLE public.scheduled_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for scheduled_notifications
CREATE POLICY "Users can view scheduled notifications for their institution"
ON public.scheduled_notifications FOR SELECT
TO authenticated
USING (public.has_permission(auth.uid(), 'communication', 'view', institution_id));

CREATE POLICY "Users can manage scheduled notifications for their institution"
ON public.scheduled_notifications FOR ALL
TO authenticated
USING (public.has_permission(auth.uid(), 'communication', 'manage', institution_id));

-- 3. Extend reminder_schedules with new notification types by adding to the existing check or creating a more flexible system
-- First, let's add new columns to support broader notification types
ALTER TABLE public.reminder_schedules 
ADD COLUMN IF NOT EXISTS notification_category TEXT DEFAULT 'fee', -- 'fee', 'attendance', 'academic', 'activity', 'library', 'transport', 'celebration'
ADD COLUMN IF NOT EXISTS trigger_event TEXT, -- 'birthday', 'absent_marked', 'late_marked', 'assignment_due', etc.
ADD COLUMN IF NOT EXISTS target_audience TEXT DEFAULT 'parents', -- 'parents', 'students', 'staff', 'all'
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'critical'
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 4. Notification rate limiting table to prevent spam
CREATE TABLE IF NOT EXISTS public.notification_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  recipient_type TEXT NOT NULL, -- 'parent', 'student', 'staff'
  recipient_id UUID NOT NULL,
  channel TEXT NOT NULL, -- 'sms', 'email', 'in_app'
  notification_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 0,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(institution_id, recipient_type, recipient_id, channel, notification_date)
);

-- Index for rate limit checks
CREATE INDEX idx_notification_rate_limits_lookup ON public.notification_rate_limits(institution_id, recipient_type, recipient_id, channel, notification_date);

-- Enable RLS
ALTER TABLE public.notification_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS policy (service role only - managed by edge functions)
CREATE POLICY "Service role can manage rate limits"
ON public.notification_rate_limits FOR ALL
TO service_role
USING (true);

-- 5. Add new template categories to message_templates if check constraint exists
DO $$
BEGIN
  -- Update check constraint on message_templates.category if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'message_templates_category_check'
  ) THEN
    ALTER TABLE public.message_templates DROP CONSTRAINT message_templates_category_check;
  END IF;
  
  -- Add new check constraint with expanded categories
  ALTER TABLE public.message_templates 
  ADD CONSTRAINT message_templates_category_check 
  CHECK (category IN (
    'fee_reminder', 'payment_confirmation', 'general', 'announcement',
    'birthday', 'attendance_absent', 'attendance_late', 'attendance_summary',
    'assignment_due', 'grade_published', 'report_ready',
    'activity_reminder', 'activity_enrollment', 'activity_cancelled',
    'library_due', 'library_overdue', 'library_fine',
    'transport_update', 'transport_subscription',
    'hostel_allocation', 'hostel_fee',
    'leave_approval', 'staff_birthday'
  ));
EXCEPTION
  WHEN others THEN
    -- If constraint manipulation fails, log but continue
    RAISE NOTICE 'Could not update message_templates category constraint: %', SQLERRM;
END $$;

-- 6. Add trigger to update updated_at on scheduled_notifications
CREATE TRIGGER update_scheduled_notifications_updated_at
BEFORE UPDATE ON public.scheduled_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();