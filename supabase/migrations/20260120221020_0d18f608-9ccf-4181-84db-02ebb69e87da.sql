-- Add historical tracking fields to student_scores
ALTER TABLE public.student_scores 
ADD COLUMN IF NOT EXISTS is_historical boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS imported_at timestamptz,
ADD COLUMN IF NOT EXISTS source_system text;

-- Add historical tracking to student_payments
ALTER TABLE public.student_payments
ADD COLUMN IF NOT EXISTS is_historical boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS source_receipt_number text;

-- Add historical tracking to attendance
ALTER TABLE public.attendance
ADD COLUMN IF NOT EXISTS is_historical boolean DEFAULT false;