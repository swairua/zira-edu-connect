import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Activity, 
  Building2, 
  Users, 
  UserCog, 
  AlertTriangle, 
  CheckCircle2 
} from 'lucide-react';
import type { SystemStats } from '@/hooks/useSystemHealth';

interface SystemStatsCardsProps {
  stats: SystemStats | undefined;
  isLoading: boolean;
}

export function SystemStatsCards({ stats, isLoading }: SystemStatsCardsProps) {
  const cards = [
    {
      title: 'Active Sessions (24h)',
      value: stats?.activeUsers24h || 0,
      icon: Activity,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Total Institutions',
      value: stats?.totalInstitutions || 0,
      subtitle: `${stats?.activeInstitutions || 0} active`,
      icon: Building2,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      title: 'Total Students',
      value: stats?.totalStudents?.toLocaleString() || '0',
      icon: Users,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Total Staff',
      value: stats?.totalStaff?.toLocaleString() || '0',
      icon: UserCog,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'Errors (24h)',
      value: stats?.recentErrors || 0,
      icon: AlertTriangle,
      color: stats?.recentErrors ? 'text-destructive' : 'text-success',
      bgColor: stats?.recentErrors ? 'bg-destructive/10' : 'bg-success/10',
    },
    {
      title: 'System Uptime',
      value: `${stats?.uptime || 99.9}%`,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="p-3 sm:p-4">
              <Skeleton className="h-4 w-20 sm:w-24 mb-2" />
              <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="relative overflow-hidden">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg flex-shrink-0 ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${card.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{card.title}</p>
                  <p className="text-lg sm:text-xl font-bold truncate">{card.value}</p>
                  {card.subtitle && (
                    <p className="text-xs text-muted-foreground truncate">{card.subtitle}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
