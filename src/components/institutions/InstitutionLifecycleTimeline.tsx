import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { CheckCircle2, Clock, XCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface InstitutionLifecycleTimelineProps {
  institutionId: string;
}

interface AuditLog {
  id: string;
  action: string;
  created_at: string;
  user_email: string | null;
  metadata: {
    from_status?: string;
    to_status?: string;
    reason?: string;
  } | null;
}

const statusIcons: Record<string, typeof CheckCircle2> = {
  pending: Clock,
  trial: Clock,
  active: CheckCircle2,
  suspended: XCircle,
  expired: AlertCircle,
  churned: XCircle,
};

const statusColors: Record<string, string> = {
  pending: 'text-warning bg-warning/10',
  trial: 'text-info bg-info/10',
  active: 'text-success bg-success/10',
  suspended: 'text-destructive bg-destructive/10',
  expired: 'text-destructive bg-destructive/10',
  churned: 'text-muted-foreground bg-muted',
};

export function InstitutionLifecycleTimeline({ institutionId }: InstitutionLifecycleTimelineProps) {
  const { data: events, isLoading } = useQuery({
    queryKey: ['institution-lifecycle', institutionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('id, action, created_at, user_email, metadata')
        .eq('entity_type', 'institution')
        .eq('entity_id', institutionId)
        .eq('action', 'status_change')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as AuditLog[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!events?.length) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
        <Clock className="mx-auto mb-2 h-8 w-8" />
        <p>No lifecycle events recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => {
        const fromStatus = event.metadata?.from_status || 'unknown';
        const toStatus = event.metadata?.to_status || 'unknown';
        const ToIcon = statusIcons[toStatus] || Clock;
        const toColor = statusColors[toStatus] || 'text-muted-foreground bg-muted';

        return (
          <div key={event.id} className="flex gap-4">
            {/* Timeline connector */}
            <div className="flex flex-col items-center">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${toColor}`}>
                <ToIcon className="h-5 w-5" />
              </div>
              {index < events.length - 1 && (
                <div className="mt-2 h-full w-px bg-border" />
              )}
            </div>

            {/* Event content */}
            <div className="flex-1 pb-6">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="capitalize">{fromStatus}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="capitalize">{toStatus}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(event.created_at), 'MMM d, yyyy • h:mm a')}
                {event.user_email && ` by ${event.user_email}`}
              </p>
              {event.metadata?.reason && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Reason: {event.metadata.reason}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
