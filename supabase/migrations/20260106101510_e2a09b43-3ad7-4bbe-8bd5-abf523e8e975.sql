-- Enable realtime for fee_payments table
ALTER TABLE public.fee_payments REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.fee_payments;