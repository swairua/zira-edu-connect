-- Add notification_settings column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{"email_notifications": true, "payment_alerts": true, "system_updates": false, "sms_notifications": false}'::jsonb;