import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useStaffProfile } from '@/hooks/useStaffProfile';
import { useInstitution } from '@/contexts/InstitutionContext';

interface Class {
  id: string;
  name: string;
  level: string;
}

export function useTeacherClasses() {
  const { data: profile } = useStaffProfile();
  const { institutionId } = useInstitution();

  return useQuery({
    queryKey: ['teacher-classes-for-planning', profile?.id, institutionId],
    queryFn: async (): Promise<Class[]> => {
      if (!profile?.id || !institutionId) return [];

      // Get all active classes for the institution
      const { data: allClasses, error: allError } = await supabase
        .from('classes')
        .select('id, name, level')
        .eq('institution_id', institutionId)
        .eq('is_active', true)
        .order('name');

      if (allError) throw allError;
      return (allClasses || []) as Class[];
    },
    enabled: !!profile?.id && !!institutionId,
  });
}
