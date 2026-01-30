-- Add per-copy status tracking to library_teacher_allocation_copies
ALTER TABLE library_teacher_allocation_copies 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'allocated' NOT NULL,
ADD COLUMN IF NOT EXISTS returned_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS condition_at_return text,
ADD COLUMN IF NOT EXISTS notes text;

-- Add constraint to ensure valid status values
ALTER TABLE library_teacher_allocation_copies 
DROP CONSTRAINT IF EXISTS library_teacher_allocation_copies_status_check;

ALTER TABLE library_teacher_allocation_copies 
ADD CONSTRAINT library_teacher_allocation_copies_status_check 
CHECK (status IN ('allocated', 'returned', 'lost'));

-- Create index for efficient status queries
CREATE INDEX IF NOT EXISTS idx_library_teacher_allocation_copies_status 
ON library_teacher_allocation_copies(status);

-- Create index for allocation lookups
CREATE INDEX IF NOT EXISTS idx_library_teacher_allocation_copies_allocation_id 
ON library_teacher_allocation_copies(allocation_id);