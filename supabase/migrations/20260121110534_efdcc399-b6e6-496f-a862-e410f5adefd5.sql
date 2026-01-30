-- Create junction table for tracking specific copies in teacher allocations
CREATE TABLE public.library_teacher_allocation_copies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  allocation_id UUID NOT NULL REFERENCES public.library_teacher_allocations(id) ON DELETE CASCADE,
  copy_id UUID NOT NULL REFERENCES public.library_book_copies(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(allocation_id, copy_id)
);

-- Enable RLS
ALTER TABLE public.library_teacher_allocation_copies ENABLE ROW LEVEL SECURITY;

-- RLS policy for viewing
CREATE POLICY "Users can view allocation copies for their institution"
  ON public.library_teacher_allocation_copies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.library_teacher_allocations a
      JOIN public.profiles p ON p.institution_id = a.institution_id
      WHERE a.id = allocation_id AND p.user_id = auth.uid()
    )
  );

-- RLS policy for insert
CREATE POLICY "Staff can insert allocation copies"
  ON public.library_teacher_allocation_copies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.library_teacher_allocations a
      JOIN public.profiles p ON p.institution_id = a.institution_id
      WHERE a.id = allocation_id AND p.user_id = auth.uid()
    )
  );

-- RLS policy for delete
CREATE POLICY "Staff can delete allocation copies"
  ON public.library_teacher_allocation_copies FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.library_teacher_allocations a
      JOIN public.profiles p ON p.institution_id = a.institution_id
      WHERE a.id = allocation_id AND p.user_id = auth.uid()
    )
  );