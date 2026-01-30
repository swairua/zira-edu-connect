import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function useDemoMode() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if current institution is a demo institution
  const { data: isDemoInstitution, isLoading } = useQuery({
    queryKey: ['demo-mode', user?.id],
    queryFn: async () => {
      if (!user) return false;

      // Get user's institution
      const { data: profile } = await supabase
        .from('profiles')
        .select('institution_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.institution_id) return false;

      // Check if institution is demo
      const { data: institution } = await supabase
        .from('institutions')
        .select('is_demo')
        .eq('id', profile.institution_id)
        .single();

      return institution?.is_demo === true;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation to start demo session
  const startDemoSession = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('seed-demo-institution', {
        body: { action: 'create', resetExisting: false },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to create demo');

      return data;
    },
    onSuccess: (data) => {
      // Force refresh all institution-related queries
      queryClient.invalidateQueries({ queryKey: ['demo-mode'] });
      queryClient.invalidateQueries({ queryKey: ['user-institution-id'] });
      queryClient.invalidateQueries({ queryKey: ['institution'] });
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast.success('Demo environment ready!');
      return data;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to start demo');
    },
  });

  // Mutation to reset demo data
  const resetDemoData = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('seed-demo-institution', {
        body: { action: 'reset', resetExisting: true },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to reset demo');

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('Demo data has been reset!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reset demo data');
    },
  });

  return {
    isDemoMode: isDemoInstitution ?? false,
    isLoading,
    startDemoSession,
    resetDemoData,
  };
}
