import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';
import { toast } from 'sonner';

export interface AdmissionNumberConfig {
  auto_generate: boolean;
  prefix: string;
  format: 'prefix_year_seq' | 'year_prefix_seq' | 'prefix_seq';
  separator: '/' | '-' | 'none';
  sequence_padding: number;
  include_year: boolean;
  year_format: 'full' | 'short';
  next_sequence: number;
}

const DEFAULT_CONFIG: AdmissionNumberConfig = {
  auto_generate: true,
  prefix: '',
  format: 'prefix_year_seq',
  separator: '/',
  sequence_padding: 3,
  include_year: true,
  year_format: 'full',
  next_sequence: 1,
};

export function useAdmissionNumberConfig() {
  const { institutionId } = useInstitution();

  return useQuery({
    queryKey: ['admission-number-config', institutionId],
    queryFn: async () => {
      if (!institutionId) return DEFAULT_CONFIG;

      const { data, error } = await supabase
        .from('institutions')
        .select('code, settings')
        .eq('id', institutionId)
        .single();

      if (error) throw error;

      const settings = data?.settings as Record<string, unknown> | null;
      const rawConfig = settings?.admission_number_config as Record<string, unknown> | undefined;

      // Map old empty string separator to 'none' for backwards compatibility
      const rawSeparator = rawConfig?.separator as string | undefined;
      const separator: AdmissionNumberConfig['separator'] = 
        rawSeparator === '' || rawSeparator === 'none' ? 'none' : 
        rawSeparator === '-' ? '-' : '/';

      return {
        ...DEFAULT_CONFIG,
        prefix: (rawConfig?.prefix as string) || data?.code || 'STU',
        auto_generate: rawConfig?.auto_generate as boolean ?? DEFAULT_CONFIG.auto_generate,
        format: (rawConfig?.format as AdmissionNumberConfig['format']) || DEFAULT_CONFIG.format,
        separator,
        sequence_padding: (rawConfig?.sequence_padding as number) || DEFAULT_CONFIG.sequence_padding,
        include_year: rawConfig?.include_year as boolean ?? DEFAULT_CONFIG.include_year,
        year_format: (rawConfig?.year_format as AdmissionNumberConfig['year_format']) || DEFAULT_CONFIG.year_format,
        next_sequence: (rawConfig?.next_sequence as number) || DEFAULT_CONFIG.next_sequence,
      };
    },
    enabled: !!institutionId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdmissionNumberPreview() {
  const { institutionId } = useInstitution();

  return useQuery({
    queryKey: ['admission-number-preview', institutionId],
    queryFn: async () => {
      if (!institutionId) return null;

      const { data, error } = await supabase
        .rpc('preview_admission_number', { _institution_id: institutionId });

      if (error) throw error;
      return data as string;
    },
    enabled: !!institutionId,
    staleTime: 30 * 1000, // Refresh more often since it might change
  });
}

export function useGenerateAdmissionNumber() {
  const { institutionId } = useInstitution();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!institutionId) throw new Error('No institution selected');

      const { data, error } = await supabase
        .rpc('generate_admission_number', { _institution_id: institutionId });

      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      // Invalidate preview since sequence changed
      queryClient.invalidateQueries({ queryKey: ['admission-number-preview', institutionId] });
      queryClient.invalidateQueries({ queryKey: ['admission-number-config', institutionId] });
    },
    onError: (error) => {
      toast.error('Failed to generate admission number: ' + error.message);
    },
  });
}

export function useUpdateAdmissionNumberConfig() {
  const { institutionId } = useInstitution();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: Partial<AdmissionNumberConfig>) => {
      if (!institutionId) throw new Error('No institution selected');

      // Get current settings
      const { data: current } = await supabase
        .from('institutions')
        .select('settings')
        .eq('id', institutionId)
        .single();

      const currentSettings = (current?.settings || {}) as Record<string, unknown>;
      const currentConfig = (currentSettings.admission_number_config || {}) as Record<string, unknown>;

      // Convert 'none' separator back to empty string for database storage
      const dbConfig = {
        ...currentConfig,
        ...config,
        separator: config.separator === 'none' ? '' : config.separator,
      };

      // Merge new config
      const updatedSettings = {
        ...currentSettings,
        admission_number_config: dbConfig,
      };

      const { error } = await supabase
        .from('institutions')
        .update({ settings: updatedSettings })
        .eq('id', institutionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admission-number-config', institutionId] });
      queryClient.invalidateQueries({ queryKey: ['admission-number-preview', institutionId] });
      toast.success('Admission number settings updated');
    },
    onError: (error) => {
      toast.error('Failed to update settings: ' + error.message);
    },
  });
}
