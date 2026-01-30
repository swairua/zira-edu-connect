import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, UserCheck, Shield, Key } from 'lucide-react';
import { useStaffOnboarding } from '@/hooks/useStaffOnboarding';
import { Link } from 'react-router-dom';

interface StaffOnboardingWidgetProps {
  institutionId: string;
}

export function StaffOnboardingWidget({ institutionId }: StaffOnboardingWidgetProps) {
  const { stats, isLoading } = useStaffOnboarding(institutionId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  const overallProgress = stats.totalStaff > 0 
    ? Math.round((stats.fullyOnboarded / stats.totalStaff) * 100) 
    : 0;

  const items = [
    { 
      label: 'With Logins', 
      value: stats.withLogins, 
      total: stats.totalStaff,
      icon: Key,
      color: 'text-info' 
    },
    { 
      label: 'Roles Assigned', 
      value: stats.withRoles, 
      total: stats.totalStaff,
      icon: Shield,
      color: 'text-warning' 
    },
    { 
      label: 'Fully Setup', 
      value: stats.fullyOnboarded, 
      total: stats.totalStaff,
      icon: UserCheck,
      color: 'text-success' 
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Staff Setup
            </CardTitle>
            <CardDescription className="text-xs">
              {stats.pendingSetup} pending setup
            </CardDescription>
          </div>
          <Link 
            to="/staff?tab=permissions" 
            className="text-xs text-primary hover:underline"
          >
            Manage →
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Progress value={overallProgress} className="h-2 flex-1" />
          <span className="text-xs font-medium">{overallProgress}%</span>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {items.map((item) => {
            const Icon = item.icon;
            const percent = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0;
            return (
              <div key={item.label} className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Icon className={`h-3 w-3 ${item.color}`} />
                  <span className="text-lg font-bold">{item.value}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{item.label}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
