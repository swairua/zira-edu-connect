import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Announcement {
  id: string;
  institution_id: string;
  title: string;
  content: string;
  audience: string[];
  priority: 'normal' | 'important' | 'urgent';
  publish_at: string | null;
  expires_at: string | null;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useAnnouncements() {
  const { userRoles, user } = useAuth();
  const queryClient = useQueryClient();
  const institutionId = userRoles.find(r => r.institution_id)?.institution_id || null;

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['announcements', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Announcement[];
    },
    enabled: !!institutionId,
  });

  const createAnnouncement = useMutation({
    mutationFn: async (announcement: Partial<Announcement>) => {
      if (!institutionId) throw new Error('No institution selected');
      const { data, error } = await supabase
        .from('announcements')
        .insert({ 
          title: announcement.title!,
          content: announcement.content!,
          audience: announcement.audience || [],
          priority: announcement.priority || 'normal',
          is_published: announcement.is_published || false,
          publish_at: announcement.publish_at,
          expires_at: announcement.expires_at,
          institution_id: institutionId,
          created_by: user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create announcement: ${error.message}`);
    },
  });

  const updateAnnouncement = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Announcement> & { id: string }) => {
      const { data, error } = await supabase
        .from('announcements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update announcement: ${error.message}`);
    },
  });

  const deleteAnnouncement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete announcement: ${error.message}`);
    },
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      const { data, error } = await supabase
        .from('announcements')
        .update({ is_published: isPublished })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success(data.is_published ? 'Announcement published' : 'Announcement unpublished');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update announcement: ${error.message}`);
    },
  });

  return {
    announcements,
    isLoading,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    togglePublish,
  };
}
