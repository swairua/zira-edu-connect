import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface StaffProfile {
  id: string;
  institution_id: string;
  employee_number: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  department?: string | null;
  designation?: string | null;
  employment_type?: string | null;
  date_joined?: string | null;
  is_active?: boolean | null;
  institution?: {
    id: string;
    name: string;
    logo_url?: string | null;
  };
}

export interface TeacherClass {
  id: string;
  class_id: string;
  subject_id?: string | null;
  is_class_teacher: boolean;
  class?: {
    id: string;
    name: string;
    level: string;
    stream?: string | null;
  };
  subject?: {
    id: string;
    name: string;
    code?: string | null;
  };
}

export function useStaffProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['staff-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // First try to find by user_id
      const { data: byUserId, error: userIdError } = await supabase
        .from('staff')
        .select(`
          *,
          institution:institutions(id, name, logo_url)
        `)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (userIdError) {
        console.error('Error fetching staff profile by user_id:', userIdError);
      }

      if (byUserId) {
        return byUserId as StaffProfile;
      }

      // Fallback: try to find by email match (for admins whose staff record isn't linked)
      if (user.email) {
        const { data: byEmail, error: emailError } = await supabase
          .from('staff')
          .select(`
            *,
            institution:institutions(id, name, logo_url)
          `)
          .ilike('email', user.email)
          .is('deleted_at', null)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (emailError) {
          console.error('Error fetching staff profile by email:', emailError);
        }

        if (byEmail) {
          // Optionally link the user_id to this staff record for future queries
          await supabase
            .from('staff')
            .update({ user_id: user.id })
            .eq('id', byEmail.id)
            .is('user_id', null);
          
          return byEmail as StaffProfile;
        }
      }

      return null;
    },
    enabled: !!user,
  });
}

export function useTeacherClasses() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['teacher-classes', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // First get the staff ID
      const { data: staff } = await supabase
        .from('staff')
        .select('id')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .single();

      if (!staff) return [];

      // Then get assigned classes
      const { data, error } = await supabase
        .from('class_teachers')
        .select(`
          id,
          class_id,
          subject_id,
          is_class_teacher,
          class:classes(id, name, level, stream),
          subject:subjects(id, name, code)
        `)
        .eq('staff_id', staff.id);

      if (error) {
        console.error('Error fetching teacher classes:', error);
        return [];
      }

      return data as TeacherClass[];
    },
    enabled: !!user,
  });
}
