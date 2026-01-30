import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';
import { toast } from 'sonner';

export interface LibrarySettings {
  id: string;
  institution_id: string;
  max_books_per_student: number;
  loan_period_days: number;
  overdue_penalty_per_day: number;
  lost_book_penalty: number;
  damaged_book_penalty: number;
  renewal_allowed: boolean;
  max_renewals: number;
  grace_period_days: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

const DEFAULT_SETTINGS: Omit<LibrarySettings, 'id' | 'institution_id' | 'created_at' | 'updated_at'> = {
  max_books_per_student: 3,
  loan_period_days: 14,
  overdue_penalty_per_day: 10,
  lost_book_penalty: 500,
  damaged_book_penalty: 200,
  renewal_allowed: true,
  max_renewals: 1,
  grace_period_days: 0,
  currency: 'KES',
};

export function useLibrarySettings() {
  const { institutionId } = useInstitution();
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ['library-settings', institutionId],
    queryFn: async () => {
      if (!institutionId) return null;
      const { data, error } = await supabase
        .from('library_settings')
        .select('*')
        .eq('institution_id', institutionId)
        .maybeSingle();
      if (error) throw error;
      return data as LibrarySettings | null;
    },
    enabled: !!institutionId,
  });

  const saveSettings = useMutation({
    mutationFn: async (settings: Partial<LibrarySettings>) => {
      if (!institutionId) throw new Error('No institution selected');

      const { data: existing } = await supabase
        .from('library_settings')
        .select('id')
        .eq('institution_id', institutionId)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('library_settings')
          .update(settings)
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('library_settings')
          .insert({ ...DEFAULT_SETTINGS, ...settings, institution_id: institutionId })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-settings', institutionId] });
      toast.success('Library settings saved');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save settings: ${error.message}`);
    },
  });

  // Merge defaults with saved settings
  const settings: LibrarySettings | null = settingsQuery.data
    ? settingsQuery.data
    : institutionId
    ? { ...DEFAULT_SETTINGS, id: '', institution_id: institutionId, created_at: '', updated_at: '' }
    : null;

  return {
    settings,
    isLoading: settingsQuery.isLoading,
    error: settingsQuery.error,
    saveSettings,
  };
}
