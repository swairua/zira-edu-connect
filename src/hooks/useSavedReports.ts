import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface SavedReport {
  id: string;
  institution_id: string;
  name: string;
  report_type: 'financial' | 'academic' | 'enrollment' | 'attendance' | 'custom';
  config: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportExport {
  id: string;
  institution_id: string;
  report_type: string;
  format: 'csv' | 'excel' | 'pdf';
  file_url: string | null;
  file_name: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_by: string | null;
  created_at: string;
}

export function useSavedReports() {
  const { userRoles, user } = useAuth();
  const queryClient = useQueryClient();
  const institutionId = userRoles.find(r => r.institution_id)?.institution_id || null;

  const { data: savedReports = [], isLoading } = useQuery({
    queryKey: ['saved-reports', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data, error } = await supabase
        .from('saved_reports')
        .select('*')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as SavedReport[];
    },
    enabled: !!institutionId,
  });

  const { data: recentExports = [] } = useQuery({
    queryKey: ['report-exports', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data, error } = await supabase
        .from('report_exports')
        .select('*')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as ReportExport[];
    },
    enabled: !!institutionId,
  });

  const saveReport = useMutation({
    mutationFn: async (report: { name: string; report_type: string; config?: Record<string, unknown> }) => {
      if (!institutionId) throw new Error('No institution selected');
      const insertData = { 
        name: report.name,
        report_type: report.report_type,
        config: report.config || {},
        institution_id: institutionId,
        created_by: user?.id,
      };
      const { data, error } = await supabase
        .from('saved_reports')
        .insert(insertData as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-reports'] });
      toast.success('Report saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save report: ${error.message}`);
    },
  });

  const deleteReport = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('saved_reports')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-reports'] });
      toast.success('Report deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete report: ${error.message}`);
    },
  });

  const createExport = useMutation({
    mutationFn: async (exportData: Partial<ReportExport>) => {
      if (!institutionId) throw new Error('No institution selected');
      const { data, error } = await supabase
        .from('report_exports')
        .insert({ 
          report_type: exportData.report_type!,
          format: exportData.format!,
          file_url: exportData.file_url,
          file_name: exportData.file_name,
          institution_id: institutionId,
          created_by: user?.id,
          status: 'completed',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-exports'] });
      toast.success('Export created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create export: ${error.message}`);
    },
  });

  return {
    savedReports,
    recentExports,
    isLoading,
    saveReport,
    deleteReport,
    createExport,
  };
}
