import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface SupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  institution_id: string | null;
  created_by: string;
  created_by_email: string | null;
  assigned_to: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  institution?: { name: string } | null;
  assigned_profile?: { first_name: string | null; last_name: string | null; email: string | null } | null;
}

export interface TicketResponse {
  id: string;
  ticket_id: string;
  message: string;
  is_staff_response: boolean;
  created_by: string;
  created_by_email: string | null;
  created_at: string;
}

interface TicketFilters {
  status?: string;
  priority?: string;
  search?: string;
  institutionId?: string;
}

interface CreateTicketData {
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
}

export function useSupportTickets(filters: TicketFilters = {}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['support-tickets', filters],
    queryFn: async () => {
      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          institution:institutions(name)
        `)
        .order('created_at', { ascending: false });

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }

      if (filters.search) {
        query = query.or(`subject.ilike.%${filters.search}%,ticket_number.ilike.%${filters.search}%`);
      }

      if (filters.institutionId) {
        query = query.eq('institution_id', filters.institutionId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Fetch assigned profiles separately
      const tickets = data || [];
      const assignedUserIds = [...new Set(tickets.filter(t => t.assigned_to).map(t => t.assigned_to))];
      
      let profilesMap: Record<string, { first_name: string | null; last_name: string | null; email: string | null }> = {};
      if (assignedUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, email')
          .in('user_id', assignedUserIds);
        
        profiles?.forEach(p => {
          profilesMap[p.user_id] = { first_name: p.first_name, last_name: p.last_name, email: p.email };
        });
      }
      
      return tickets.map(t => ({
        ...t,
        assigned_profile: t.assigned_to ? profilesMap[t.assigned_to] || null : null,
      })) as SupportTicket[];
    },
    enabled: !!user,
  });
}

export function useTicketDetail(ticketId: string | undefined) {
  return useQuery({
    queryKey: ['support-ticket', ticketId],
    queryFn: async () => {
      if (!ticketId) return null;

      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          institution:institutions(name)
        `)
        .eq('id', ticketId)
        .single();

      if (error) throw error;
      
      // Fetch assigned profile separately if assigned
      let assigned_profile = null;
      if (data.assigned_to) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('user_id', data.assigned_to)
          .single();
        assigned_profile = profile;
      }
      
      return { ...data, assigned_profile } as SupportTicket;
    },
    enabled: !!ticketId,
  });
}

export function useTicketResponses(ticketId: string | undefined) {
  return useQuery({
    queryKey: ['ticket-responses', ticketId],
    queryFn: async () => {
      if (!ticketId) return [];

      const { data, error } = await supabase
        .from('ticket_responses')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as TicketResponse[];
    },
    enabled: !!ticketId,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (ticketData: CreateTicketData) => {
      // Get user's institution
      const { data: profile } = await supabase
        .from('profiles')
        .select('institution_id')
        .eq('user_id', user?.id)
        .single();

      const insertData: {
        subject: string;
        description: string;
        priority: string;
        category: string;
        created_by: string;
        created_by_email?: string;
        institution_id?: string | null;
      } = {
        subject: ticketData.subject,
        description: ticketData.description,
        priority: ticketData.priority,
        category: ticketData.category,
        created_by: user?.id!,
        created_by_email: user?.email,
        institution_id: profile?.institution_id || null,
      };

      const { data: ticket, error } = await supabase
        .from('support_tickets')
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;
      return ticket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['pending-tickets-count'] });
      toast.success('Ticket created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create ticket: ${error.message}`);
    },
  });
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      const updates: Record<string, unknown> = { status };

      if (status === 'resolved') {
        updates.resolved_at = new Date().toISOString();
      } else if (status === 'closed') {
        updates.closed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('support_tickets')
        .update(updates)
        .eq('id', ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['support-ticket'] });
      queryClient.invalidateQueries({ queryKey: ['pending-tickets-count'] });
      toast.success('Ticket status updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });
}

export function useAssignTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, userId }: { ticketId: string; userId: string | null }) => {
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          assigned_to: userId,
          status: userId ? 'in_progress' : 'open'
        })
        .eq('id', ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['support-ticket'] });
      toast.success('Ticket assigned successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to assign ticket: ${error.message}`);
    },
  });
}

export function useAddTicketResponse() {
  const queryClient = useQueryClient();
  const { user, isSuperAdmin, isSupportAdmin } = useAuth();

  return useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      const { error } = await supabase
        .from('ticket_responses')
        .insert({
          ticket_id: ticketId,
          message,
          created_by: user?.id,
          created_by_email: user?.email,
          is_staff_response: isSuperAdmin || isSupportAdmin,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-responses'] });
      toast.success('Response added');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add response: ${error.message}`);
    },
  });
}

export function usePendingTicketsCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['pending-tickets-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .in('status', ['open', 'in_progress']);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });
}
