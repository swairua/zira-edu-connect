import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useInstitution } from '@/contexts/InstitutionContext';
import { toast } from 'sonner';
import { format, startOfMonth, startOfDay, endOfDay } from 'date-fns';

export interface SMSLog {
  id: string;
  institution_id: string;
  recipient_phone: string;
  recipient_name: string | null;
  recipient_type: string | null;
  message_type: string | null;
  message: string;
  status: string;
  sent_at: string | null;
  created_at: string;
  error_message: string | null;
  provider_response: Record<string, unknown> | null;
}

export interface MessageTemplate {
  id: string;
  institution_id: string;
  name: string;
  category: string;
  content: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SMSStats {
  sentToday: number;
  sentThisMonth: number;
  failedToday: number;
  successRate: number;
}

export interface SMSFilters {
  search?: string;
  status?: string;
  messageType?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// Hook for fetching SMS logs with filters
export function useSMSLogs(filters: SMSFilters = {}) {
  const { institutionId } = useInstitution();

  return useQuery({
    queryKey: ['sms-logs', institutionId, filters],
    queryFn: async () => {
      if (!institutionId) return [];
      
      let query = supabase
        .from('sms_logs')
        .select('*')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false })
        .limit(500);
      
      if (filters.search) {
        query = query.or(`recipient_phone.ilike.%${filters.search}%,message.ilike.%${filters.search}%,recipient_name.ilike.%${filters.search}%`);
      }
      
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      if (filters.messageType && filters.messageType !== 'all') {
        query = query.eq('message_type', filters.messageType);
      }
      
      if (filters.dateFrom) {
        query = query.gte('created_at', startOfDay(filters.dateFrom).toISOString());
      }
      
      if (filters.dateTo) {
        query = query.lte('created_at', endOfDay(filters.dateTo).toISOString());
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as SMSLog[];
    },
    enabled: !!institutionId,
  });
}

// Hook for SMS statistics
export function useSMSStats() {
  const { institutionId } = useInstitution();

  return useQuery({
    queryKey: ['sms-stats', institutionId],
    queryFn: async () => {
      if (!institutionId) {
        return { sentToday: 0, sentThisMonth: 0, failedToday: 0, successRate: 0 };
      }

      const today = new Date();
      const todayStart = startOfDay(today).toISOString();
      const todayEnd = endOfDay(today).toISOString();
      const monthStart = startOfMonth(today).toISOString();

      // Get today's stats
      const { data: todayData } = await supabase
        .from('sms_logs')
        .select('status')
        .eq('institution_id', institutionId)
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd);

      // Get this month's stats
      const { data: monthData } = await supabase
        .from('sms_logs')
        .select('status')
        .eq('institution_id', institutionId)
        .gte('created_at', monthStart);

      const sentToday = todayData?.filter(s => s.status === 'sent').length || 0;
      const failedToday = todayData?.filter(s => s.status === 'failed').length || 0;
      const sentThisMonth = monthData?.filter(s => s.status === 'sent').length || 0;
      const totalMonth = monthData?.length || 0;
      const successRate = totalMonth > 0 ? Math.round((sentThisMonth / totalMonth) * 100) : 0;

      return { sentToday, sentThisMonth, failedToday, successRate };
    },
    enabled: !!institutionId,
  });
}

// Hook for message templates
export function useMessageTemplates() {
  const { institutionId } = useInstitution();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['message-templates', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as MessageTemplate[];
    },
    enabled: !!institutionId,
  });

  const createTemplate = useMutation({
    mutationFn: async (template: Partial<MessageTemplate>) => {
      if (!institutionId) throw new Error('No institution selected');
      const { data, error } = await supabase
        .from('message_templates')
        .insert({
          institution_id: institutionId,
          name: template.name!,
          category: template.category || 'general',
          content: template.content!,
          variables: template.variables || [],
          is_active: template.is_active ?? true,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
      toast.success('Template created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create template: ${error.message}`);
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MessageTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('message_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
      toast.success('Template updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update template: ${error.message}`);
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
      toast.success('Template deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete template: ${error.message}`);
    },
  });

  return { templates, isLoading, createTemplate, updateTemplate, deleteTemplate };
}

// Hook for sending bulk SMS
export function useSendBulkSMS() {
  const { institutionId } = useInstitution();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      message,
      messageType,
      audienceType,
      classId,
      phoneNumbers,
    }: {
      message: string;
      messageType: string;
      audienceType: 'all_parents' | 'all_staff' | 'class_parents' | 'defaulters' | 'selected';
      classId?: string;
      phoneNumbers?: string[];
    }) => {
      if (!institutionId) throw new Error('No institution selected');
      
      const { data, error } = await supabase.functions.invoke('send-bulk-sms', {
        body: {
          institutionId,
          message,
          messageType,
          audienceType,
          classId,
          phoneNumbers,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to send SMS');
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sms-logs'] });
      queryClient.invalidateQueries({ queryKey: ['sms-stats'] });
      toast.success(`SMS sent to ${data.total_recipients} recipients`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to send SMS: ${error.message}`);
    },
  });
}

// Hook for resending a failed SMS
export function useResendSMS() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (smsLog: SMSLog) => {
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          phones: [smsLog.recipient_phone],
          message: smsLog.message,
          messageType: smsLog.message_type || 'general',
          institutionId: smsLog.institution_id,
          recipientType: smsLog.recipient_type || 'parent',
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-logs'] });
      queryClient.invalidateQueries({ queryKey: ['sms-stats'] });
      toast.success('SMS resent successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to resend SMS: ${error.message}`);
    },
  });
}

// Combined hook for communication dashboard
export function useCommunicationDashboard() {
  const { institutionId } = useInstitution();
  const smsStats = useSMSStats();

  const { data: activeAnnouncements = 0 } = useQuery({
    queryKey: ['active-announcements-count', institutionId],
    queryFn: async () => {
      if (!institutionId) return 0;
      const { count, error } = await supabase
        .from('announcements')
        .select('*', { count: 'exact', head: true })
        .eq('institution_id', institutionId)
        .eq('is_published', true);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!institutionId,
  });

  const { data: recentSMS = [] } = useQuery({
    queryKey: ['recent-sms', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data, error } = await supabase
        .from('sms_logs')
        .select('*')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data as SMSLog[];
    },
    enabled: !!institutionId,
  });

  return {
    smsStats: smsStats.data || { sentToday: 0, sentThisMonth: 0, failedToday: 0, successRate: 0 },
    isLoading: smsStats.isLoading,
    activeAnnouncements,
    recentSMS,
  };
}

// Hook for recipient counts
export function useRecipientCounts() {
  const { institutionId } = useInstitution();

  return useQuery({
    queryKey: ['recipient-counts', institutionId],
    queryFn: async () => {
      if (!institutionId) return { parents: 0, staff: 0 };

      const [parentsResult, staffResult] = await Promise.all([
        supabase
          .from('parents')
          .select('*', { count: 'exact', head: true })
          .eq('institution_id', institutionId),
        supabase
          .from('staff')
          .select('*', { count: 'exact', head: true })
          .eq('institution_id', institutionId)
          .eq('is_active', true),
      ]);

      return {
        parents: parentsResult.count || 0,
        staff: staffResult.count || 0,
      };
    },
    enabled: !!institutionId,
  });
}
