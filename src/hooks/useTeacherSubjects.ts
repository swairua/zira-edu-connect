import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useStaffProfile } from '@/hooks/useStaffProfile';
import { useInstitution } from '@/contexts/InstitutionContext';

interface Subject {
  id: string;
  name: string;
  code: string;
}

export function useTeacherSubjects() {
  const { data: profile } = useStaffProfile();
  const { institutionId } = useInstitution();

  return useQuery({
    queryKey: ['teacher-subjects', profile?.id, institutionId],
    queryFn: async (): Promise<Subject[]> => {
      if (!profile?.id || !institutionId) return [];

      // Get all subjects for the institution (teachers can plan for any subject they're assigned)
      const { data: allSubjects, error: allError } = await supabase
        .from('subjects')
        .select('id, name, code')
        .eq('institution_id', institutionId)
        .eq('is_active', true)
        .order('name');

      if (allError) throw allError;
      return (allSubjects || []) as Subject[];
    },
    enabled: !!profile?.id && !!institutionId,
  });
}
