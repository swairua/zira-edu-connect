import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { AssignmentSettings, InstitutionSettings } from '@/types/institution-settings';
import type { Json } from '@/integrations/supabase/types';
import { toast } from 'sonner';

const DEFAULT_ASSIGNMENT_SETTINGS: AssignmentSettings = {
  enabled: false,
  allow_parent_submission: false,
  default_max_file_size_mb: 10,
  allowed_file_types: ['pdf', 'docx', 'doc', 'jpg', 'png'],
  default_allow_late: false,
  default_allow_resubmission: false,
};

export function useInstitutionSettings(institutionId: string | undefined) {
  return useQuery({
    queryKey: ['institution-settings', institutionId],
    queryFn: async () => {
      if (!institutionId) return null;
      
      const { data, error } = await supabase
        .from('institutions')
        .select('settings')
        .eq('id', institutionId)
        .single();

      if (error) throw error;
      return data?.settings as InstitutionSettings | null;
    },
    enabled: !!institutionId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAssignmentSettings(institutionId: string | undefined) {
  const { data: settings, ...rest } = useInstitutionSettings(institutionId);
  
  const assignmentSettings: AssignmentSettings = {
    ...DEFAULT_ASSIGNMENT_SETTINGS,
    ...(settings?.assignments || {}),
  };

  return {
    data: assignmentSettings,
    ...rest,
  };
}

export function useUpdateAssignmentSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ institutionId, settings }: { 
      institutionId: string; 
      settings: AssignmentSettings;
    }) => {
      // Get current settings
      const { data: current } = await supabase
        .from('institutions')
        .select('settings')
        .eq('id', institutionId)
        .single();

      const currentSettings = (current?.settings || {}) as InstitutionSettings;
      
      // Merge new assignment settings
      const updatedSettings: InstitutionSettings = {
        ...currentSettings,
        assignments: settings,
      };

      const { data, error } = await supabase
        .from('institutions')
        .update({ settings: updatedSettings as unknown as Json })
        .eq('id', institutionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['institution-settings', variables.institutionId] });
      toast.success('Assignment settings updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update settings: ' + error.message);
    },
  });
}
