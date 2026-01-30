import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface BackupHistory {
  id: string;
  institution_id: string;
  backup_type: string;
  status: string;
  include_modules: string[];
  file_name: string | null;
  file_path: string | null;
  file_size_bytes: number | null;
  download_url: string | null;
  download_expires_at: string | null;
  error_message: string | null;
  created_by: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScheduledBackup {
  id: string;
  institution_id: string;
  frequency: string;
  include_modules: string[];
  day_of_week: number | null;
  day_of_month: number | null;
  time_of_day: string;
  notify_emails: string[];
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useBackupHistory(institutionId: string | undefined) {
  return useQuery({
    queryKey: ['backup-history', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      
      const { data, error } = await supabase
        .from('backup_history')
        .select('*')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as BackupHistory[];
    },
    enabled: !!institutionId,
  });
}

export function useScheduledBackups(institutionId: string | undefined) {
  return useQuery({
    queryKey: ['scheduled-backups', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      
      const { data, error } = await supabase
        .from('scheduled_backups')
        .select('*')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ScheduledBackup[];
    },
    enabled: !!institutionId,
  });
}

export function useCreateBackup() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      institutionId, 
      includeModules 
    }: { 
      institutionId: string; 
      includeModules: string[];
    }) => {
      const { data, error } = await supabase.functions.invoke('generate-backup', {
        body: {
          institution_id: institutionId,
          include_modules: includeModules,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['backup-history', variables.institutionId] });
      toast.success('Backup created successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create backup: ${error.message}`);
    },
  });
}

export function useDeleteBackup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      backupId, 
      filePath,
      institutionId 
    }: { 
      backupId: string; 
      filePath: string | null;
      institutionId: string;
    }) => {
      // Delete from storage if file exists
      if (filePath) {
        await supabase.storage
          .from('institution-backups')
          .remove([filePath]);
      }

      // Delete record
      const { error } = await supabase
        .from('backup_history')
        .delete()
        .eq('id', backupId);

      if (error) throw error;
      
      return { institutionId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['backup-history', data.institutionId] });
      toast.success('Backup deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete backup: ${error.message}`);
    },
  });
}

export function useRefreshDownloadUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      backupId,
      filePath,
      institutionId 
    }: { 
      backupId: string;
      filePath: string;
      institutionId: string;
    }) => {
      // Generate new signed URL
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('institution-backups')
        .createSignedUrl(filePath, 86400); // 24 hours

      if (signedUrlError) throw signedUrlError;

      // Update backup record
      const { error } = await supabase
        .from('backup_history')
        .update({
          download_url: signedUrlData.signedUrl,
          download_expires_at: new Date(Date.now() + 86400000).toISOString(),
        })
        .eq('id', backupId);

      if (error) throw error;
      
      return { institutionId, url: signedUrlData.signedUrl };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['backup-history', data.institutionId] });
      // Auto-download
      window.open(data.url, '_blank');
    },
    onError: (error: Error) => {
      toast.error(`Failed to refresh download link: ${error.message}`);
    },
  });
}

export function useCreateScheduledBackup() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      institutionId: string;
      frequency: string;
      includeModules: string[];
      dayOfWeek?: number;
      dayOfMonth?: number;
      timeOfDay: string;
      notifyEmails: string[];
    }) => {
      const { error } = await supabase
        .from('scheduled_backups')
        .insert({
          institution_id: data.institutionId,
          frequency: data.frequency,
          include_modules: data.includeModules,
          day_of_week: data.dayOfWeek,
          day_of_month: data.dayOfMonth,
          time_of_day: data.timeOfDay,
          notify_emails: data.notifyEmails,
          created_by: user?.id,
          is_active: true,
        });

      if (error) throw error;
      return data.institutionId;
    },
    onSuccess: (institutionId) => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-backups', institutionId] });
      toast.success('Scheduled backup created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create schedule: ${error.message}`);
    },
  });
}

export function useToggleScheduledBackup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      scheduleId, 
      isActive,
      institutionId 
    }: { 
      scheduleId: string; 
      isActive: boolean;
      institutionId: string;
    }) => {
      const { error } = await supabase
        .from('scheduled_backups')
        .update({ is_active: isActive })
        .eq('id', scheduleId);

      if (error) throw error;
      return institutionId;
    },
    onSuccess: (institutionId) => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-backups', institutionId] });
      toast.success('Schedule updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update schedule: ${error.message}`);
    },
  });
}

export function useDeleteScheduledBackup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      scheduleId,
      institutionId 
    }: { 
      scheduleId: string;
      institutionId: string;
    }) => {
      const { error } = await supabase
        .from('scheduled_backups')
        .delete()
        .eq('id', scheduleId);

      if (error) throw error;
      return institutionId;
    },
    onSuccess: (institutionId) => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-backups', institutionId] });
      toast.success('Schedule deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete schedule: ${error.message}`);
    },
  });
}