-- Add invoice sequence tracking to institutions
ALTER TABLE public.institutions 
ADD COLUMN IF NOT EXISTS invoice_sequence INTEGER DEFAULT 0;

-- Create function for atomic invoice number generation
CREATE OR REPLACE FUNCTION public.generate_institution_invoice_number(p_institution_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_year TEXT;
  v_seq INTEGER;
BEGIN
  -- Get institution code and increment sequence atomically
  UPDATE institutions 
  SET invoice_sequence = COALESCE(invoice_sequence, 0) + 1
  WHERE id = p_institution_id
  RETURNING code, invoice_sequence INTO v_code, v_seq;
  
  -- Get current year (2-digit)
  v_year := TO_CHAR(CURRENT_DATE, 'YY');
  
  -- Return formatted number: CODE/YY/NNNNNN (e.g., DHS/26/000001)
  RETURN COALESCE(NULLIF(v_code, ''), 'INV') || '/' || v_year || '/' || LPAD(v_seq::TEXT, 6, '0');
END;
$$;