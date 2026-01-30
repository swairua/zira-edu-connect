-- Phase 1: Add book_code to library_books
ALTER TABLE library_books 
ADD COLUMN IF NOT EXISTS book_code TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_library_books_book_code ON library_books(institution_id, book_code);

-- Phase 2: Create teacher book allocations table
CREATE TABLE IF NOT EXISTS library_teacher_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES library_books(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  allocated_by UUID NOT NULL,
  allocated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  returned_at TIMESTAMPTZ,
  quantity_allocated INTEGER NOT NULL DEFAULT 1,
  quantity_distributed INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'returned', 'partial')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add teacher_allocation_id to library_loans for tracking distribution chain
ALTER TABLE library_loans 
ADD COLUMN IF NOT EXISTS teacher_allocation_id UUID REFERENCES library_teacher_allocations(id) ON DELETE SET NULL;

-- Enable RLS on teacher allocations
ALTER TABLE library_teacher_allocations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teacher allocations
CREATE POLICY "Staff can view allocations in their institution" 
ON library_teacher_allocations FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE staff.user_id = auth.uid() 
    AND staff.institution_id = library_teacher_allocations.institution_id
  )
);

CREATE POLICY "Staff can insert allocations in their institution" 
ON library_teacher_allocations FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE staff.user_id = auth.uid() 
    AND staff.institution_id = library_teacher_allocations.institution_id
  )
);

CREATE POLICY "Staff can update allocations in their institution" 
ON library_teacher_allocations FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE staff.user_id = auth.uid() 
    AND staff.institution_id = library_teacher_allocations.institution_id
  )
);

CREATE POLICY "Staff can delete allocations in their institution" 
ON library_teacher_allocations FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE staff.user_id = auth.uid() 
    AND staff.institution_id = library_teacher_allocations.institution_id
  )
);

-- Create updated_at trigger for teacher allocations
CREATE TRIGGER update_library_teacher_allocations_updated_at
  BEFORE UPDATE ON library_teacher_allocations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();