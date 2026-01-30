import { ParentLayout } from '@/components/parent/ParentLayout';
import { ErrorCard } from '@/components/parent/ErrorCard';
import { useParent } from '@/contexts/ParentContext';
import { useParentAnnouncements } from '@/hooks/useParentData';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, Megaphone } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import type { Announcement } from '@/types/parent';

export default function ParentNotices() {
  const { parentProfile } = useParent();
  
  const { 
    data: announcements = [], 
    isLoading,
    error,
    refetch,
  } = useParentAnnouncements(parentProfile?.institution_id || null);

  // Show error state
  if (error) {
    return (
      <ParentLayout title="Notices">
        <div className="p-4">
          <ErrorCard 
            title="Couldn't load notices"
            message="We couldn't load school announcements. Please try again."
            onRetry={() => refetch()}
          />
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout 
      title="Notices"
      onRefresh={() => refetch()}
      isRefreshing={isLoading}
    >
      <div className="space-y-4 p-4">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))
        ) : announcements.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Megaphone className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No Notices</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  School announcements will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div role="feed" aria-label="School announcements">
            {(announcements as Announcement[]).map((announcement) => (
              <Card key={announcement.id} className="mb-4">
                <CardContent className="p-4">
                  <article className="flex gap-3">
                    <div 
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10"
                      aria-hidden="true"
                    >
                      <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        {announcement.content}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <time dateTime={announcement.sent_at || undefined}>
                          {announcement.sent_at 
                            ? format(new Date(announcement.sent_at), 'MMM d, yyyy • h:mm a')
                            : 'Recently'
                          }
                        </time>
                        <span aria-hidden="true">•</span>
                        <span>
                          {announcement.sent_at 
                            ? formatDistanceToNow(new Date(announcement.sent_at), { addSuffix: true })
                            : ''
                          }
                        </span>
                      </div>
                    </div>
                  </article>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ParentLayout>
  );
}
