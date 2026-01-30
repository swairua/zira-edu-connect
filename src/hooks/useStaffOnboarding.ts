import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StaffOnboardingItem {
  id: string;
  employeeNumber: string;
  name: string;
  email: string | null;
  department: string | null;
  designation: string | null;
  hasLogin: boolean;
  hasRoles: boolean;
  profileComplete: boolean;
  overallProgress: number;
  createdAt: string;
}

export interface StaffOnboardingStats {
  totalStaff: number;
  withLogins: number;
  withRoles: number;
  fullyOnboarded: number;
  pendingSetup: number;
}

export function useStaffOnboarding(institutionId: string | null) {
  const staffQuery = useQuery({
    queryKey: ['staff-onboarding', institutionId],
    queryFn: async (): Promise<StaffOnboardingItem[]> => {
      if (!institutionId) return [];

      // Fetch staff with their user linkage
      const { data: staffList, error: staffError } = await supabase
        .from('staff')
        .select('id, employee_number, first_name, last_name, email, phone, department, designation, user_id, created_at')
        .eq('institution_id', institutionId)
        .is('deleted_at', null)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (staffError) throw staffError;

      // Get user IDs that have staff records
      const userIds = (staffList || [])
        .filter(s => s.user_id)
        .map(s => s.user_id as string);

      // Fetch roles for these users
      const userRolesMap: Record<string, string[]> = {};
      if (userIds.length > 0) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', userIds)
          .eq('institution_id', institutionId);

        (roles || []).forEach(r => {
          if (!userRolesMap[r.user_id]) {
            userRolesMap[r.user_id] = [];
          }
          userRolesMap[r.user_id].push(r.role);
        });
      }

      return (staffList || []).map(staff => {
        const hasLogin = !!staff.user_id;
        const hasRoles = hasLogin && (userRolesMap[staff.user_id!]?.length || 0) > 0;
        
        // Profile is complete if they have email, department, and designation
        const profileComplete = !!(staff.email && staff.department && staff.designation);

        // Calculate overall progress (3 items: profile, login, roles)
        const completedItems = [hasLogin, hasRoles, profileComplete].filter(Boolean).length;
        const overallProgress = Math.round((completedItems / 3) * 100);

        return {
          id: staff.id,
          employeeNumber: staff.employee_number,
          name: `${staff.first_name} ${staff.last_name}`,
          email: staff.email,
          department: staff.department,
          designation: staff.designation,
          hasLogin,
          hasRoles,
          profileComplete,
          overallProgress,
          createdAt: staff.created_at || '',
        };
      });
    },
    enabled: !!institutionId,
  });

  // Calculate aggregate stats
  const stats: StaffOnboardingStats = {
    totalStaff: staffQuery.data?.length || 0,
    withLogins: staffQuery.data?.filter(s => s.hasLogin).length || 0,
    withRoles: staffQuery.data?.filter(s => s.hasRoles).length || 0,
    fullyOnboarded: staffQuery.data?.filter(s => s.overallProgress === 100).length || 0,
    pendingSetup: staffQuery.data?.filter(s => s.overallProgress < 100).length || 0,
  };

  return {
    staffList: staffQuery.data || [],
    stats,
    isLoading: staffQuery.isLoading,
    refetch: staffQuery.refetch,
  };
}
