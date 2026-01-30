import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { 
  Activity, 
  UserPlus, 
  Building2, 
  CreditCard, 
  Settings, 
  RefreshCw,
  FileText
} from 'lucide-react';
import type { RecentActivity } from '@/hooks/useSystemHealth';

interface RecentActivityFeedProps {
  activities: RecentActivity[];
  isLoading: boolean;
}

const actionIcons: Record<string, typeof Activity> = {
  create: UserPlus,
  update: RefreshCw,
  delete: Settings,
  status_change: RefreshCw,
  login: Activity,
  payment: CreditCard,
  invoice: FileText,
};

const entityColors: Record<string, string> = {
  institution: 'bg-primary/10 text-primary',
  user: 'bg-info/10 text-info',
  invoice: 'bg-success/10 text-success',
  payment: 'bg-secondary/10 text-secondary',
  profile: 'bg-warning/10 text-warning',
};

export function RecentActivityFeed({ activities, isLoading }: RecentActivityFeedProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <Badge variant="outline" className="text-xs">
            Live
            <span className="ml-1.5 h-2 w-2 animate-pulse rounded-full bg-success" />
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No recent activity
              </p>
            ) : (
              activities.map((activity) => {
                const Icon = actionIcons[activity.action] || Activity;
                const entityColor = entityColors[activity.entity_type] || 'bg-muted text-muted-foreground';

                return (
                  <div key={activity.id} className="flex gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${entityColor}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium capitalize">{activity.action.replace('_', ' ')}</span>
                        {' '}
                        <span className="text-muted-foreground">on</span>
                        {' '}
                        <span className="font-medium capitalize">{activity.entity_type}</span>
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="truncate">{activity.user_email || 'System'}</span>
                        <span>•</span>
                        <span className="shrink-0">
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
