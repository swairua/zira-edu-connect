import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { InstitutionGroup, GroupRole, GroupUserRole } from '@/types/group';
import { toast } from 'sonner';

export function useInstitutionGroup(groupId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch single group
  const { data: group, isLoading: isLoadingGroup } = useQuery({
    queryKey: ['institution-group', groupId],
    queryFn: async () => {
      if (!groupId) return null;
      const { data, error } = await supabase
        .from('institution_groups')
        .select('*')
        .eq('id', groupId)
        .single();
      
      if (error) throw error;
      return data as InstitutionGroup;
    },
    enabled: !!groupId && !!user,
  });

  // Fetch user's groups
  const { data: userGroups, isLoading: isLoadingUserGroups } = useQuery({
    queryKey: ['user-groups', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_user_roles')
        .select(`
          *,
          institution_groups (*)
        `)
        .eq('user_id', user!.id);
      
      if (error) throw error;
      return data as (GroupUserRole & { institution_groups: InstitutionGroup })[];
    },
    enabled: !!user,
  });

  // Fetch user's role in a specific group
  const { data: userGroupRole } = useQuery({
    queryKey: ['user-group-role', user?.id, groupId],
    queryFn: async () => {
      if (!groupId) return null;
      const { data, error } = await supabase
        .from('group_user_roles')
        .select('*')
        .eq('user_id', user!.id)
        .eq('group_id', groupId)
        .maybeSingle();
      
      if (error) throw error;
      return data as GroupUserRole | null;
    },
    enabled: !!user && !!groupId,
  });

  // Create group mutation
  const createGroup = useMutation({
    mutationFn: async (input: {
      name: string;
      code: string;
      logo_url?: string;
      primary_country?: 'KE' | 'UG' | 'TZ' | 'RW' | 'NG' | 'GH' | 'ZA';
      subscription_plan?: 'starter' | 'professional' | 'enterprise' | 'custom';
    }) => {
      // Create the group
      const { data: groupData, error: groupError } = await supabase
        .from('institution_groups')
        .insert([input])
        .select()
        .single();
      
      if (groupError) throw groupError;
      
      // Add creator as group_owner
      const { error: roleError } = await supabase
        .from('group_user_roles')
        .insert({
          user_id: user!.id,
          group_id: groupData.id,
          role: 'group_owner',
          granted_by: user!.id,
        });
      
      if (roleError) {
        console.error('Failed to assign group owner role:', roleError);
        // Don't throw - group is created, just log the role assignment failure
      }
      
      return groupData as InstitutionGroup;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
      queryClient.invalidateQueries({ queryKey: ['institution-groups'] });
      queryClient.invalidateQueries({ queryKey: ['user-group-roles', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['active-group', data.id] });
      queryClient.invalidateQueries({ queryKey: ['group-campuses-context', data.id] });
      toast.success('Group created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create group: ${error.message}`);
    },
  });

  // Update group mutation
  const updateGroup = useMutation({
    mutationFn: async (input: {
      id: string;
      name?: string;
      code?: string;
      logo_url?: string;
      primary_country?: 'KE' | 'UG' | 'TZ' | 'RW' | 'NG' | 'GH' | 'ZA';
      subscription_plan?: 'starter' | 'professional' | 'enterprise' | 'custom';
    }) => {
      const { id, ...updates } = input;
      const { data, error } = await supabase
        .from('institution_groups')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as InstitutionGroup;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['institution-group', data.id] });
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
      toast.success('Group updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update group: ${error.message}`);
    },
  });

  // Add user to group
  const addUserToGroup = useMutation({
    mutationFn: async (input: {
      user_id: string;
      group_id: string;
      role: GroupRole;
      campus_access?: string[];
    }) => {
      const { data, error } = await supabase
        .from('group_user_roles')
        .insert({
          ...input,
          granted_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as GroupUserRole;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-users'] });
      toast.success('User added to group');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add user: ${error.message}`);
    },
  });

  // Remove user from group
  const removeUserFromGroup = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from('group_user_roles')
        .delete()
        .eq('id', roleId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-users'] });
      toast.success('User removed from group');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove user: ${error.message}`);
    },
  });

  return {
    group,
    isLoadingGroup,
    userGroups,
    isLoadingUserGroups,
    userGroupRole,
    isGroupUser: (userGroups?.length ?? 0) > 0,
    createGroup,
    updateGroup,
    addUserToGroup,
    removeUserFromGroup,
  };
}
