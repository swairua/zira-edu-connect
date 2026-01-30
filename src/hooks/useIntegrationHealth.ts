import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface IntegrationHealthLog {
  id: string;
  integration_id: string;
  check_type: 'api' | 'callback' | 'auth' | 'connectivity';
  status: 'success' | 'failure' | 'timeout' | 'error';
  response_time_ms: number | null;
  error_message: string | null;
  error_code: string | null;
  request_details: Record<string, unknown> | null;
  response_details: Record<string, unknown> | null;
  checked_at: string;
  platform_bank_integrations?: {
    bank_code: string;
    bank_name: string;
  };
}

export interface IntegrationAlert {
  id: string;
  integration_id: string;
  alert_type: 'callback_failure' | 'high_latency' | 'auth_failure' | 'rate_limit' | 'service_down' | 'queue_backlog';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  metadata: Record<string, unknown>;
  is_acknowledged: boolean;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  resolved_at: string | null;
  created_at: string;
  platform_bank_integrations?: {
    bank_code: string;
    bank_name: string;
  };
}

// Fetch health logs
export function useIntegrationHealthLogs(integrationId?: string, limit = 100) {
  return useQuery({
    queryKey: ['integration-health-logs', integrationId, limit],
    queryFn: async () => {
      let query = supabase
        .from('integration_health_logs')
        .select('*, platform_bank_integrations(bank_code, bank_name)')
        .order('checked_at', { ascending: false })
        .limit(limit);

      if (integrationId) {
        query = query.eq('integration_id', integrationId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as IntegrationHealthLog[];
    },
  });
}

// Fetch active alerts
export function useIntegrationAlerts(options?: { unacknowledgedOnly?: boolean; unresolvedOnly?: boolean }) {
  const { unacknowledgedOnly, unresolvedOnly = true } = options || {};

  return useQuery({
    queryKey: ['integration-alerts', options],
    queryFn: async () => {
      let query = supabase
        .from('integration_alerts')
        .select('*, platform_bank_integrations(bank_code, bank_name)')
        .order('created_at', { ascending: false });

      if (unresolvedOnly) {
        query = query.is('resolved_at', null);
      }
      if (unacknowledgedOnly) {
        query = query.eq('is_acknowledged', false);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as IntegrationAlert[];
    },
  });
}

// Acknowledge alert
export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { data, error } = await supabase
        .from('integration_alerts')
        .update({
          is_acknowledged: true,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', alertId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration-alerts'] });
      toast.success('Alert acknowledged');
    },
    onError: (error: Error) => {
      toast.error(`Failed to acknowledge alert: ${error.message}`);
    },
  });
}

// Resolve alert
export function useResolveAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { data, error } = await supabase
        .from('integration_alerts')
        .update({
          resolved_at: new Date().toISOString(),
        })
        .eq('id', alertId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration-alerts'] });
      toast.success('Alert resolved');
    },
    onError: (error: Error) => {
      toast.error(`Failed to resolve alert: ${error.message}`);
    },
  });
}

// Health summary per integration
export function useIntegrationHealthSummary() {
  return useQuery({
    queryKey: ['integration-health-summary'],
    queryFn: async () => {
      // Get all integrations with their status
      const { data: integrations, error: intError } = await supabase
        .from('platform_bank_integrations')
        .select('id, bank_code, bank_name, health_status, last_health_check, is_active');

      if (intError) throw intError;

      // Get recent health logs (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data: logs, error: logsError } = await supabase
        .from('integration_health_logs')
        .select('integration_id, status, response_time_ms, checked_at')
        .gte('checked_at', yesterday.toISOString());

      if (logsError) throw logsError;

      // Get active alerts count
      const { data: alerts, error: alertsError } = await supabase
        .from('integration_alerts')
        .select('integration_id, severity')
        .is('resolved_at', null);

      if (alertsError) throw alertsError;

      // Build summary
      return integrations.map(integration => {
        const integrationLogs = logs.filter(l => l.integration_id === integration.id);
        const integrationAlerts = alerts.filter(a => a.integration_id === integration.id);

        const totalChecks = integrationLogs.length;
        const successfulChecks = integrationLogs.filter(l => l.status === 'success').length;
        const avgResponseTime = integrationLogs.length > 0
          ? integrationLogs.reduce((sum, l) => sum + (l.response_time_ms || 0), 0) / integrationLogs.length
          : null;

        return {
          ...integration,
          uptime24h: totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : null,
          avgResponseTime24h: avgResponseTime,
          totalChecks24h: totalChecks,
          activeAlerts: integrationAlerts.length,
          criticalAlerts: integrationAlerts.filter(a => a.severity === 'critical').length,
        };
      });
    },
  });
}
