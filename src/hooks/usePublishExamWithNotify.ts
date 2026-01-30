import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PublishOptions {
  examId: string;
  institutionId: string;
  notifyViaSms: boolean;
  notifyInApp: boolean;
}

export function usePublishExamWithNotify() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ examId, institutionId, notifyViaSms, notifyInApp }: PublishOptions) => {
      // First, update exam status to published
      const { error: updateError } = await supabase
        .from('exams')
        .update({ status: 'published' })
        .eq('id', examId);

      if (updateError) throw updateError;

      // If notifications requested, call the edge function
      if (notifyViaSms || notifyInApp) {
        const { data: { session } } = await supabase.auth.getSession();
        
        const response = await supabase.functions.invoke('notify-results-published', {
          body: {
            examId,
            institutionId,
            notifyViaSms,
            notifyInApp,
          },
        });

        if (response.error) {
          console.error('Notification error:', response.error);
          // Don't throw - exam is already published
          toast.warning('Results published but some notifications may have failed');
          return { published: true, notificationError: true };
        }

        return { published: true, stats: response.data?.stats };
      }

      return { published: true };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      
      if (data.stats) {
        toast.success(
          `Results published! ${data.stats.inAppSent} in-app and ${data.stats.smsSent} SMS notifications sent.`
        );
      } else if (!data.notificationError) {
        toast.success('Results published successfully');
      }
    },
    onError: (error) => {
      console.error('Publish error:', error);
      toast.error('Failed to publish results');
    },
  });
}
