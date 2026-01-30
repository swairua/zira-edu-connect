-- Add timeline configuration columns to exams table
ALTER TABLE public.exams 
ADD COLUMN IF NOT EXISTS draft_deadline timestamptz,
ADD COLUMN IF NOT EXISTS correction_deadline timestamptz,
ADD COLUMN IF NOT EXISTS final_deadline timestamptz,
ADD COLUMN IF NOT EXISTS allow_late_submission boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS late_submission_penalty_percent integer DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN public.exams.draft_deadline IS 'Deadline for teachers to save draft scores';
COMMENT ON COLUMN public.exams.correction_deadline IS 'Deadline for corrections after draft phase';
COMMENT ON COLUMN public.exams.final_deadline IS 'Final deadline for submitting scores for approval';
COMMENT ON COLUMN public.exams.allow_late_submission IS 'Whether to accept submissions after deadline';
COMMENT ON COLUMN public.exams.late_submission_penalty_percent IS 'Penalty percentage for late submissions';