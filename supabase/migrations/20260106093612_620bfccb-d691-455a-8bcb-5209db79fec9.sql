-- Fix function search path for generate_invoice_number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.invoice_number := 'INV-' || to_char(now(), 'YYYYMM') || '-' || lpad(nextval('invoice_number_seq')::text, 5, '0');
  RETURN NEW;
END;
$$;