import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, Json } from '@/integrations/supabase/types';

export type AuditLog = Tables<'audit_logs'>;

export interface AuditLogsFilters {
  search: string;
  action: string;
  entityType: string;
  dateFrom: Date | null;
  dateTo: Date | null;
}

export function useAuditLogs(filters: AuditLogsFilters, page: number = 1, pageSize: number = 20) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['audit-logs', filters, page, pageSize],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' });

      // Apply search filter
      if (filters.search) {
        query = query.or(
          `user_email.ilike.%${filters.search}%,action.ilike.%${filters.search}%,entity_type.ilike.%${filters.search}%`
        );
      }

      // Apply action filter
      if (filters.action && filters.action !== 'all') {
        query = query.eq('action', filters.action);
      }

      // Apply entity type filter
      if (filters.entityType && filters.entityType !== 'all') {
        query = query.eq('entity_type', filters.entityType);
      }

      // Apply date range filter
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom.toISOString());
      }
      if (filters.dateTo) {
        const endOfDay = new Date(filters.dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endOfDay.toISOString());
      }

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        logs: data || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('audit-logs-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_logs',
        },
        () => {
          // Invalidate query to refetch when new logs are added
          queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    logs: data?.logs || [],
    totalCount: data?.totalCount || 0,
    totalPages: data?.totalPages || 0,
    isLoading,
    error,
  };
}

// Helper function to log audit events
export async function logAuditEvent(params: {
  action: string;
  entityType: string;
  entityId?: string;
  institutionId?: string;
  metadata?: Json;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return;

  const { error } = await supabase.from('audit_logs').insert([{
    user_id: user.id,
    user_email: user.email,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId,
    institution_id: params.institutionId,
    metadata: params.metadata ?? {},
  }]);

  if (error) {
    console.error('Failed to log audit event:', error);
  }
}
