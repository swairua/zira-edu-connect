import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface IPNEvent {
  id: string;
  integration_id: string;
  raw_payload: Record<string, unknown>;
  normalized_payload: Record<string, unknown> | null;
  event_type: 'payment' | 'reversal' | 'timeout' | 'validation_failure';
  external_reference: string | null;
  amount: number | null;
  currency: string;
  sender_phone: string | null;
  sender_name: string | null;
  sender_account: string | null;
  bank_reference: string | null;
  status: 'received' | 'validated' | 'queued' | 'processed' | 'failed' | 'duplicate';
  validation_errors: string[] | null;
  source_ip: string | null;
  processing_started_at: string | null;
  processing_completed_at: string | null;
  created_at: string;
  platform_bank_integrations?: {
    bank_code: string;
    bank_name: string;
  };
}

export interface IPNProcessingQueueItem {
  id: string;
  ipn_event_id: string;
  institution_id: string | null;
  institution_bank_account_id: string | null;
  student_id: string | null;
  invoice_id: string | null;
  match_status: 'pending' | 'matched' | 'partial_match' | 'unmatched' | 'exception' | 'manual_review';
  match_confidence: number;
  match_details: Record<string, unknown>;
  retry_count: number;
  max_retries: number;
  next_retry_at: string | null;
  processed_at: string | null;
  processing_notes: string | null;
  action_taken: string | null;
  action_by: string | null;
  action_at: string | null;
  created_at: string;
  updated_at: string;
  ipn_events?: IPNEvent;
  institutions?: {
    name: string;
  };
  students?: {
    first_name: string;
    last_name: string;
  };
}

export interface IPNEventsFilters {
  status?: string;
  integrationId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

// Fetch IPN events with filters
export function useIPNEvents(filters: IPNEventsFilters = {}) {
  const { status, integrationId, dateFrom, dateTo, limit = 100 } = filters;

  return useQuery({
    queryKey: ['ipn-events', filters],
    queryFn: async () => {
      let query = supabase
        .from('ipn_events')
        .select('*, platform_bank_integrations(bank_code, bank_name)')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (status) {
        query = query.eq('status', status);
      }
      if (integrationId) {
        query = query.eq('integration_id', integrationId);
      }
      if (dateFrom) {
        query = query.gte('created_at', dateFrom);
      }
      if (dateTo) {
        query = query.lte('created_at', dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as IPNEvent[];
    },
  });
}

// Fetch IPN processing queue
export function useIPNProcessingQueue(filters: {
  matchStatus?: string;
  institutionId?: string;
  limit?: number;
} = {}) {
  const { matchStatus, institutionId, limit = 100 } = filters;

  return useQuery({
    queryKey: ['ipn-processing-queue', filters],
    queryFn: async () => {
      let query = supabase
        .from('ipn_processing_queue')
        .select(`
          *,
          ipn_events(*, platform_bank_integrations(bank_code, bank_name)),
          institutions(name),
          students(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (matchStatus) {
        query = query.eq('match_status', matchStatus);
      }
      if (institutionId) {
        query = query.eq('institution_id', institutionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as IPNProcessingQueueItem[];
    },
  });
}

// IPN event stats
export function useIPNEventStats() {
  return useQuery({
    queryKey: ['ipn-event-stats'],
    queryFn: async () => {
      // Get counts by status
      const { data: events, error } = await supabase
        .from('ipn_events')
        .select('status, created_at');

      if (error) throw error;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const stats = {
        total: events.length,
        today: events.filter(e => new Date(e.created_at) >= today).length,
        byStatus: {
          received: 0,
          validated: 0,
          queued: 0,
          processed: 0,
          failed: 0,
          duplicate: 0,
        } as Record<string, number>,
      };

      events.forEach(e => {
        if (stats.byStatus[e.status] !== undefined) {
          stats.byStatus[e.status]++;
        }
      });

      return stats;
    },
  });
}

// Queue stats
export function useQueueStats() {
  return useQuery({
    queryKey: ['queue-stats'],
    queryFn: async () => {
      const { data: items, error } = await supabase
        .from('ipn_processing_queue')
        .select('match_status, created_at');

      if (error) throw error;

      const stats = {
        total: items.length,
        pending: items.filter(i => i.match_status === 'pending').length,
        matched: items.filter(i => i.match_status === 'matched').length,
        unmatched: items.filter(i => i.match_status === 'unmatched').length,
        manualReview: items.filter(i => i.match_status === 'manual_review').length,
        exceptions: items.filter(i => i.match_status === 'exception').length,
      };

      return stats;
    },
  });
}

// Realtime subscription for IPN events
export function useRealtimeIPNEvents(onNewEvent: (event: IPNEvent) => void) {
  useEffect(() => {
    const channel = supabase
      .channel('ipn-events-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ipn_events',
        },
        (payload) => {
          onNewEvent(payload.new as IPNEvent);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onNewEvent]);
}
