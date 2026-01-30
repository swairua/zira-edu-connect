import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { GroupSharedService, SharedServiceType } from '@/types/group';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

const SERVICE_LABELS: Record<SharedServiceType, string> = {
  finance: 'Finance & Billing',
  messaging: 'Messaging & Notifications',
  reporting: 'Reporting & Analytics',
  fee_structure: 'Fee Structure Templates',
  academic_calendar: 'Academic Calendar',
  staff_management: 'Staff Management',
};

const SERVICE_DESCRIPTIONS: Record<SharedServiceType, { centralized: string; independent: string }> = {
  finance: {
    centralized: 'Single chart of accounts with consolidated billing across all campuses',
    independent: 'Each campus manages their own financial accounts and billing',
  },
  messaging: {
    centralized: 'Shared message templates and unified branding for all campuses',
    independent: 'Each campus has their own templates and messaging preferences',
  },
  reporting: {
    centralized: 'Consolidated reports with campus drill-down capabilities',
    independent: 'Campus-level reports only, no cross-campus visibility',
  },
  fee_structure: {
    centralized: 'Group fee templates that campuses can inherit and customize',
    independent: 'Each campus defines their own fee structure independently',
  },
  academic_calendar: {
    centralized: 'Synchronized terms, holidays, and academic events across campuses',
    independent: 'Each campus maintains their own academic calendar',
  },
  staff_management: {
    centralized: 'Shared staff pool allowing transfers between campuses',
    independent: 'Each campus manages staff independently',
  },
};

export function useSharedServices(groupId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch shared services for a group
  const { data: services, isLoading } = useQuery({
    queryKey: ['group-shared-services', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      
      const { data, error } = await supabase
        .from('group_shared_services')
        .select('*')
        .eq('group_id', groupId);
      
      if (error) throw error;
      return data as GroupSharedService[];
    },
    enabled: !!groupId && !!user,
  });

  // Get service status for a specific service type
  const getServiceStatus = (serviceType: SharedServiceType) => {
    const service = services?.find(s => s.service_type === serviceType);
    return {
      configured: !!service,
      isCentralized: service?.is_centralized ?? false,
      config: service?.config ?? {},
    };
  };

  // Update or create shared service
  const updateService = useMutation({
    mutationFn: async (input: {
      service_type: SharedServiceType;
      is_centralized: boolean;
      config?: Record<string, unknown>;
    }) => {
      if (!groupId) throw new Error('Group ID required');
      
      const existing = services?.find(s => s.service_type === input.service_type);
      
      if (existing) {
        const updateData = {
          is_centralized: input.is_centralized,
          config: (input.config ?? existing.config) as Json,
        };
        const { data, error } = await supabase
          .from('group_shared_services')
          .update(updateData)
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return data as GroupSharedService;
      } else {
        const insertData = {
          group_id: groupId,
          service_type: input.service_type,
          is_centralized: input.is_centralized,
          config: (input.config ?? {}) as Json,
        };
        const { data, error } = await supabase
          .from('group_shared_services')
          .insert([insertData])
          .select()
          .single();
        
        if (error) throw error;
        return data as GroupSharedService;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-shared-services', groupId] });
      toast.success('Service configuration updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update service: ${error.message}`);
    },
  });

  // Helper to check if a service is centralized
  const isServiceCentralized = (serviceType: SharedServiceType) => {
    return getServiceStatus(serviceType).isCentralized;
  };

  return {
    services: services ?? [],
    isLoading,
    getServiceStatus,
    isServiceCentralized,
    updateService,
    SERVICE_LABELS,
    SERVICE_DESCRIPTIONS,
  };
}
