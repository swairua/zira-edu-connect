import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DemoRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  school_name: string;
  location: string | null;
  number_of_learners: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  contacted_at: string | null;
  contacted_by: string | null;
  converted_institution_id: string | null;
}

export interface DemoRequestStats {
  total: number;
  pending: number;
  contacted: number;
  converted: number;
  conversionRate: number;
}

export function useDemoRequests() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: ['demo-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('demo_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DemoRequest[];
    },
  });

  const stats: DemoRequestStats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    contacted: requests.filter(r => r.status === 'contacted').length,
    converted: requests.filter(r => r.status === 'converted').length,
    conversionRate: requests.length > 0 
      ? Math.round((requests.filter(r => r.status === 'converted').length / requests.length) * 100) 
      : 0,
  };

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const updateData: Record<string, unknown> = { status };
      
      if (status === 'contacted' && !requests.find(r => r.id === id)?.contacted_at) {
        updateData.contacted_at = new Date().toISOString();
        updateData.contacted_by = user?.id;
      }
      
      if (notes !== undefined) {
        updateData.notes = notes;
      }

      const { error } = await supabase
        .from('demo_requests')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demo-requests'] });
      toast({ title: 'Status updated', description: 'Demo request status has been updated.' });
    },
    onError: (error) => {
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to update status' 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('demo_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demo-requests'] });
      toast({ title: 'Deleted', description: 'Demo request has been removed.' });
    },
    onError: (error) => {
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to delete request' 
      });
    },
  });

  const markConvertedMutation = useMutation({
    mutationFn: async ({ id, institutionId }: { id: string; institutionId: string }) => {
      const { error } = await supabase
        .from('demo_requests')
        .update({ 
          status: 'converted',
          converted_institution_id: institutionId,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demo-requests'] });
      toast({ title: 'Converted!', description: 'Lead marked as converted to institution.' });
    },
    onError: (error) => {
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to mark as converted' 
      });
    },
  });

  return {
    requests,
    stats,
    isLoading,
    error,
    updateStatus: updateStatusMutation.mutate,
    deleteRequest: deleteMutation.mutate,
    markConverted: markConvertedMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function usePendingDemoRequestsCount() {
  return useQuery({
    queryKey: ['demo-requests-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('demo_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (error) throw error;
      return count || 0;
    },
  });
}
