-- Enable realtime for institution_payments table to track payment status changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.institution_payments;