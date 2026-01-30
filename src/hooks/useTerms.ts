import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';

export interface Term {
  id: string;
  academic_year_id: string;
  institution_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current?: boolean | null;
  sequence_order: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export function useTerms(academicYearId?: string) {
  const { institutionId } = useInstitution();

  return useQuery({
    queryKey: ['terms', institutionId, academicYearId],
    queryFn: async () => {
      if (!institutionId) return [];

      let query = supabase
        .from('terms')
        .select('*')
        .eq('institution_id', institutionId)
        .order('sequence_order', { ascending: true });

      if (academicYearId) {
        query = query.eq('academic_year_id', academicYearId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Term[];
    },
    enabled: !!institutionId,
  });
}

export function useCurrentTerm() {
  const { institutionId } = useInstitution();

  return useQuery({
    queryKey: ['current-term', institutionId],
    queryFn: async () => {
      if (!institutionId) return null;

      const { data, error } = await supabase
        .from('terms')
        .select('*')
        .eq('institution_id', institutionId)
        .eq('is_current', true)
        .maybeSingle();

      if (error) throw error;
      return data as Term | null;
    },
    enabled: !!institutionId,
  });
}
