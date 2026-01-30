import { format } from 'date-fns';
import { User, Headphones } from 'lucide-react';
import { TicketResponse } from '@/hooks/useSupportTickets';
import { cn } from '@/lib/utils';

interface TicketResponseListProps {
  responses: TicketResponse[];
  isLoading?: boolean;
}

export function TicketResponseList({ responses, isLoading }: TicketResponseListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse flex gap-3">
            <div className="h-10 w-10 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-16 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (responses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No responses yet. Be the first to reply.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {responses.map((response) => (
        <div
          key={response.id}
          className={cn(
            'flex gap-3',
            response.is_staff_response && 'flex-row-reverse'
          )}
        >
          <div
            className={cn(
              'h-10 w-10 rounded-full flex items-center justify-center shrink-0',
              response.is_staff_response
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            )}
          >
            {response.is_staff_response ? (
              <Headphones className="h-5 w-5" />
            ) : (
              <User className="h-5 w-5" />
            )}
          </div>
          <div
            className={cn(
              'flex-1 max-w-[80%]',
              response.is_staff_response && 'text-right'
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">
                {response.is_staff_response ? 'Support Team' : response.created_by_email || 'User'}
              </span>
              <span className="text-xs text-muted-foreground">
                {format(new Date(response.created_at), 'MMM d, yyyy h:mm a')}
              </span>
            </div>
            <div
              className={cn(
                'p-3 rounded-lg',
                response.is_staff_response
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{response.message}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
