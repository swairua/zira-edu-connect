import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, ArrowRight, Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface Announcement {
  id: string;
  content: string;
  sent_at: string | null;
  created_at: string | null;
  recipient_type: string;
}

interface AnnouncementCardProps {
  announcements: Announcement[];
  isLoading: boolean;
  limit?: number;
  showViewAll?: boolean;
}

export function AnnouncementCard({
  announcements,
  isLoading,
  limit = 3,
  showViewAll = true,
}: AnnouncementCardProps) {
  const displayAnnouncements = announcements.slice(0, limit);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Announcements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (displayAnnouncements.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Megaphone className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">No announcements</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Announcements
        </CardTitle>
        {showViewAll && announcements.length > limit && (
          <Link 
            to="/parent/notices" 
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {displayAnnouncements.map((announcement) => (
          <div key={announcement.id} className="border-l-2 border-primary/30 pl-3">
            <p className="text-sm text-foreground line-clamp-2">
              {announcement.content}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {announcement.sent_at 
                ? formatDistanceToNow(new Date(announcement.sent_at), { addSuffix: true })
                : announcement.created_at
                  ? formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })
                  : 'Recently'
              }
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
