-- Create sequence for ticket numbers
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START 1;

-- Create support_tickets table
CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text UNIQUE NOT NULL,
  subject text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category text NOT NULL,
  institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  created_by_email text,
  assigned_to uuid,
  resolved_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ticket_responses table
CREATE TABLE public.ticket_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  is_staff_response boolean DEFAULT false,
  created_by uuid NOT NULL,
  created_by_email text,
  created_at timestamptz DEFAULT now()
);

-- Create function to generate ticket number
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.ticket_number := 'TKT-' || LPAD(nextval('ticket_number_seq')::text, 5, '0');
  RETURN NEW;
END;
$$;

-- Create trigger for auto-generating ticket numbers
CREATE TRIGGER set_ticket_number
  BEFORE INSERT ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_ticket_number();

-- Create trigger for updating updated_at
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_tickets
CREATE POLICY "Super admins can view all tickets"
  ON public.support_tickets FOR SELECT
  USING (public.is_super_admin(auth.uid()) OR public.is_support_admin(auth.uid()));

CREATE POLICY "Institution users can view their tickets"
  ON public.support_tickets FOR SELECT
  USING (
    institution_id IN (
      SELECT institution_id FROM public.profiles WHERE user_id = auth.uid()
    )
    OR created_by = auth.uid()
  );

CREATE POLICY "Authenticated users can create tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Super admins can update all tickets"
  ON public.support_tickets FOR UPDATE
  USING (public.is_super_admin(auth.uid()) OR public.is_support_admin(auth.uid()));

CREATE POLICY "Ticket creators can update their own tickets"
  ON public.support_tickets FOR UPDATE
  USING (created_by = auth.uid());

-- RLS Policies for ticket_responses
CREATE POLICY "Super admins can view all responses"
  ON public.ticket_responses FOR SELECT
  USING (public.is_super_admin(auth.uid()) OR public.is_support_admin(auth.uid()));

CREATE POLICY "Users can view responses on their tickets"
  ON public.ticket_responses FOR SELECT
  USING (
    ticket_id IN (
      SELECT id FROM public.support_tickets 
      WHERE created_by = auth.uid() 
        OR institution_id IN (SELECT institution_id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can create responses"
  ON public.ticket_responses FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_responses;