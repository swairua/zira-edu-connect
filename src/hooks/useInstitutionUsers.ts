import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables, Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface InstitutionUser {
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: AppRole;
  grantedAt: string;
  isActive: boolean;
}

interface CreateUserParams {
  email: string;
  firstName: string;
  lastName: string;
  role: AppRole;
  institutionId: string;
  sendWelcomeEmail: boolean;
}

export function useInstitutionUsers(institutionId: string | null) {
  const queryClient = useQueryClient();

  // Fetch users for an institution
  const { data: users = [], isLoading, error, refetch } = useQuery({
    queryKey: ['institution-users', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];

      // Get user roles for this institution
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role, granted_at')
        .eq('institution_id', institutionId);

      if (rolesError) throw rolesError;
      if (!roles || roles.length === 0) return [];

      // Get profiles for these users
      const userIds = roles.map(r => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, first_name, last_name, is_active')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      return roles.map(role => {
        const profile = profileMap.get(role.user_id);
        return {
          userId: role.user_id,
          email: profile?.email || 'Unknown',
          firstName: profile?.first_name,
          lastName: profile?.last_name,
          role: role.role,
          grantedAt: role.granted_at,
          isActive: profile?.is_active ?? true,
        } as InstitutionUser;
      });
    },
    enabled: !!institutionId,
  });

  // Create a new institution user
  const createUserMutation = useMutation({
    mutationFn: async (params: CreateUserParams) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('create-institution-user', {
        body: params,
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to create user');
      }

      // Check if the response contains an error
      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institution-users', institutionId] });
      toast.success('User created successfully');
    },
    onError: (error: Error) => {
      console.error('Create user error:', error);
      toast.error(error.message || 'Failed to create user');
    },
  });

  // Remove user from institution (removes role, doesn't delete user)
  const removeUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!institutionId) throw new Error('No institution selected');

      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('institution_id', institutionId);

      if (error) throw error;

      // Also update profile to remove institution_id
      await supabase
        .from('profiles')
        .update({ institution_id: null })
        .eq('user_id', userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institution-users', institutionId] });
      toast.success('User removed from institution');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove user');
    },
  });

  // Update user role
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      if (!institutionId) throw new Error('No institution selected');

      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId)
        .eq('institution_id', institutionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institution-users', institutionId] });
      toast.success('User role updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update role');
    },
  });

  return {
    users,
    isLoading,
    error,
    refetch,
    createUser: createUserMutation.mutate,
    isCreating: createUserMutation.isPending,
    removeUser: removeUserMutation.mutate,
    isRemoving: removeUserMutation.isPending,
    updateRole: updateRoleMutation.mutate,
    isUpdatingRole: updateRoleMutation.isPending,
  };
}
