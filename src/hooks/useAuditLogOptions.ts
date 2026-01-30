import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAuditLogOptions() {
  const { data: actionOptions = [] } = useQuery({
    queryKey: ['audit-log-actions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('action')
        .limit(1000);

      if (error) throw error;

      const uniqueActions = [...new Set(data?.map(d => d.action) || [])].sort();
      return [
        { value: 'all', label: 'All Actions' },
        ...uniqueActions.map(action => ({
          value: action,
          label: formatLabel(action),
        })),
      ];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const { data: entityTypeOptions = [] } = useQuery({
    queryKey: ['audit-log-entity-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('entity_type')
        .limit(1000);

      if (error) throw error;

      const uniqueTypes = [...new Set(data?.map(d => d.entity_type) || [])].sort();
      return [
        { value: 'all', label: 'All Entity Types' },
        ...uniqueTypes.map(type => ({
          value: type,
          label: formatLabel(type),
        })),
      ];
    },
    staleTime: 5 * 60 * 1000,
  });

  return { actionOptions, entityTypeOptions };
}

// Helper to format snake_case or lowercase to Title Case
export function formatLabel(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}
