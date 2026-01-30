-- =============================================
-- Part 1: Message Threads for Two-Way Chat
-- =============================================

-- Create message_threads table for parent-teacher conversations
CREATE TABLE public.message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES public.parents(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  subject TEXT,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_message_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(parent_id, staff_id, subject)
);

-- Create thread_messages table for individual messages in a thread
CREATE TABLE public.thread_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('parent', 'staff')),
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_message_threads_parent ON public.message_threads(parent_id);
CREATE INDEX idx_message_threads_staff ON public.message_threads(staff_id);
CREATE INDEX idx_message_threads_institution ON public.message_threads(institution_id);
CREATE INDEX idx_message_threads_last_message ON public.message_threads(last_message_at DESC);
CREATE INDEX idx_thread_messages_thread ON public.thread_messages(thread_id);
CREATE INDEX idx_thread_messages_created ON public.thread_messages(created_at DESC);
CREATE INDEX idx_thread_messages_unread ON public.thread_messages(thread_id, is_read) WHERE is_read = false;

-- Enable RLS
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thread_messages ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Part 2: RLS Policies for Message Threads
-- =============================================

-- Staff can view threads they're part of
CREATE POLICY "Staff can view own threads"
  ON public.message_threads FOR SELECT
  USING (
    staff_id IN (SELECT id FROM public.staff WHERE user_id = auth.uid())
    OR public.is_super_admin(auth.uid())
  );

-- Staff can create threads
CREATE POLICY "Staff can create threads"
  ON public.message_threads FOR INSERT
  WITH CHECK (
    staff_id IN (SELECT id FROM public.staff WHERE user_id = auth.uid())
  );

-- Staff can update their threads
CREATE POLICY "Staff can update own threads"
  ON public.message_threads FOR UPDATE
  USING (
    staff_id IN (SELECT id FROM public.staff WHERE user_id = auth.uid())
  );

-- Thread messages: Staff can view messages in their threads
CREATE POLICY "Staff can view thread messages"
  ON public.thread_messages FOR SELECT
  USING (
    thread_id IN (
      SELECT id FROM public.message_threads 
      WHERE staff_id IN (SELECT id FROM public.staff WHERE user_id = auth.uid())
    )
    OR public.is_super_admin(auth.uid())
  );

-- Staff can send messages
CREATE POLICY "Staff can send thread messages"
  ON public.thread_messages FOR INSERT
  WITH CHECK (
    sender_type = 'staff'
    AND thread_id IN (
      SELECT id FROM public.message_threads 
      WHERE staff_id IN (SELECT id FROM public.staff WHERE user_id = auth.uid())
    )
  );

-- Staff can mark messages as read
CREATE POLICY "Staff can update thread messages"
  ON public.thread_messages FOR UPDATE
  USING (
    thread_id IN (
      SELECT id FROM public.message_threads 
      WHERE staff_id IN (SELECT id FROM public.staff WHERE user_id = auth.uid())
    )
  );

-- =============================================
-- Part 3: Fix in_app_notifications RLS for Parents
-- =============================================

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can view own notifications" ON public.in_app_notifications;

-- Create new policy that checks user_id OR parent has Supabase auth account
CREATE POLICY "Users and parents can view own notifications"
  ON public.in_app_notifications FOR SELECT
  USING (
    user_id = auth.uid() 
    OR parent_id IN (
      SELECT id FROM public.parents WHERE user_id = auth.uid()
    )
    OR public.is_super_admin(auth.uid())
  );

-- =============================================
-- Part 4: Triggers for updated_at
-- =============================================

CREATE TRIGGER update_message_threads_updated_at
  BEFORE UPDATE ON public.message_threads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update last_message_at when new message added
CREATE OR REPLACE FUNCTION public.update_thread_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.message_threads
  SET last_message_at = NEW.created_at, updated_at = now()
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_thread_last_message_trigger
  AFTER INSERT ON public.thread_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_thread_last_message();

-- =============================================
-- Part 5: Enable Realtime for messaging
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.message_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.thread_messages;