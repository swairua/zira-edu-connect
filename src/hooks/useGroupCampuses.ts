import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { GroupCampus } from '@/types/group';
import { toast } from 'sonner';

export function useGroupCampuses(groupId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch campuses for a group
  const { data: campuses, isLoading } = useQuery({
    queryKey: ['group-campuses', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      
      const { data, error } = await supabase
        .from('institutions')
        .select('id, name, code, campus_code, is_headquarters, status, student_count, staff_count, country')
        .eq('group_id', groupId)
        .order('is_headquarters', { ascending: false })
        .order('name');
      
      if (error) throw error;
      return data as GroupCampus[];
    },
    enabled: !!groupId && !!user,
  });

  // Add campus to group
  const addCampusToGroup = useMutation({
    mutationFn: async (input: {
      institution_id: string;
      campus_code?: string;
      is_headquarters?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('institutions')
        .update({
          group_id: groupId,
          campus_code: input.campus_code,
          is_headquarters: input.is_headquarters ?? false,
        })
        .eq('id', input.institution_id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-campuses', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-campuses-context', groupId] });
      queryClient.invalidateQueries({ queryKey: ['available-institutions-for-group'] });
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
      toast.success('Campus added to group');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add campus: ${error.message}`);
    },
  });

  // Remove campus from group
  const removeCampusFromGroup = useMutation({
    mutationFn: async (institutionId: string) => {
      const { error } = await supabase
        .from('institutions')
        .update({
          group_id: null,
          campus_code: null,
          is_headquarters: false,
        })
        .eq('id', institutionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-campuses', groupId] });
      toast.success('Campus removed from group');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove campus: ${error.message}`);
    },
  });

  // Update campus settings
  const updateCampus = useMutation({
    mutationFn: async (input: {
      institution_id: string;
      campus_code?: string;
      is_headquarters?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('institutions')
        .update({
          campus_code: input.campus_code,
          is_headquarters: input.is_headquarters,
        })
        .eq('id', input.institution_id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-campuses', groupId] });
      toast.success('Campus updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update campus: ${error.message}`);
    },
  });

  // Get headquarters
  const headquarters = campuses?.find(c => c.is_headquarters) ?? null;

  // Get total stats across all campuses
  const groupStats = campuses?.reduce(
    (acc, campus) => ({
      totalStudents: acc.totalStudents + campus.student_count,
      totalStaff: acc.totalStaff + campus.staff_count,
      campusCount: acc.campusCount + 1,
    }),
    { totalStudents: 0, totalStaff: 0, campusCount: 0 }
  ) ?? { totalStudents: 0, totalStaff: 0, campusCount: 0 };

  return {
    campuses: campuses ?? [],
    isLoading,
    headquarters,
    groupStats,
    addCampusToGroup,
    removeCampusFromGroup,
    updateCampus,
  };
}
