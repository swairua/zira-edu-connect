import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Crown, 
  Users, 
  UserCog, 
  Calendar, 
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Settings2,
} from 'lucide-react';
import { useInstitutionBilling } from '@/hooks/useInstitutionBilling';
import { useInstitution } from '@/contexts/InstitutionContext';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { EnabledModuleBadge } from './EnabledModuleBadge';
import { ModuleDiscoveryTip } from './ModuleDiscoveryTip';

interface SubscriptionSettingsCardProps {
  onUpgrade?: () => void;
  onViewModules?: () => void;
}

export function SubscriptionSettingsCard({ onUpgrade, onViewModules }: SubscriptionSettingsCardProps) {
  const { institutionId } = useInstitution();
  const { data: billing, isLoading } = useInstitutionBilling(institutionId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!billing) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Unable to load subscription details
        </CardContent>
      </Card>
    );
  }

  const { currentPlan, usage, subscription, enabledModules } = billing;

  const isNearStudentLimit = usage.studentPercentage >= 80;
  const isNearStaffLimit = usage.staffPercentage >= 80;
  const isExpiringSoon = subscription.expiresAt && 
    new Date(subscription.expiresAt).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Your current plan and usage</CardDescription>
            </div>
          </div>
          <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
            {subscription.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Plan */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{currentPlan?.name || 'No Plan'}</h3>
              <p className="text-sm text-muted-foreground">
                {currentPlan 
                  ? (() => {
                      const cycle = subscription.billingCycle || 'monthly';
                      switch (cycle) {
                        case 'annual':
                          return `KES ${currentPlan.annualPrice.toLocaleString()}/year`;
                        case 'termly':
                          return `KES ${currentPlan.termlyPrice.toLocaleString()}/term`;
                        default:
                          return `KES ${currentPlan.monthlyPrice.toLocaleString()}/month`;
                      }
                    })()
                  : 'Contact support to set up your plan'
                }
              </p>
            </div>
            {currentPlan && onUpgrade && (
              <Button onClick={onUpgrade} size="sm">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                Upgrade
              </Button>
            )}
          </div>
        </div>

        {/* Usage Stats */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">USAGE</h4>
          
          {/* Students */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Students</span>
              </div>
              <span className={cn(
                "font-medium",
                isNearStudentLimit && "text-warning"
              )}>
                {usage.studentCount} / {usage.studentLimit === -1 ? '∞' : usage.studentLimit}
              </span>
            </div>
            {usage.studentLimit !== -1 && (
              <Progress 
                value={usage.studentPercentage} 
                className={cn(
                  "h-2",
                  isNearStudentLimit && "[&>div]:bg-warning"
                )}
              />
            )}
            {isNearStudentLimit && usage.studentLimit !== -1 && (
              <p className="text-xs text-warning flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Approaching student limit
              </p>
            )}
          </div>

          {/* Staff */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <UserCog className="h-4 w-4 text-muted-foreground" />
                <span>Staff</span>
              </div>
              <span className={cn(
                "font-medium",
                isNearStaffLimit && "text-warning"
              )}>
                {usage.staffCount} / {usage.staffLimit === -1 ? '∞' : usage.staffLimit}
              </span>
            </div>
            {usage.staffLimit !== -1 && (
              <Progress 
                value={usage.staffPercentage} 
                className={cn(
                  "h-2",
                  isNearStaffLimit && "[&>div]:bg-warning"
                )}
              />
            )}
            {isNearStaffLimit && usage.staffLimit !== -1 && (
              <p className="text-xs text-warning flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Approaching staff limit
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Enabled Modules */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm text-muted-foreground">ENABLED MODULES</h4>
            {onViewModules && (
              <Button variant="ghost" size="sm" onClick={onViewModules} className="gap-1.5">
                <Settings2 className="h-3.5 w-3.5" />
                Manage
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {enabledModules.length > 0 ? (
              enabledModules.map((module) => (
                <EnabledModuleBadge 
                  key={module} 
                  moduleId={module}
                  tier="core" // TODO: Get actual tier from billing data
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No modules enabled</p>
            )}
          </div>
          
          {/* Module Discovery Tip */}
          {onViewModules && (
            <ModuleDiscoveryTip 
              enabledModules={enabledModules} 
              onBrowse={onViewModules} 
            />
          )}
        </div>

        <Separator />

        {/* Subscription Dates */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Started</p>
            <p className="font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {subscription.startedAt 
                ? format(new Date(subscription.startedAt), 'MMM d, yyyy')
                : 'Not set'
              }
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Expires</p>
            <p className={cn(
              "font-medium flex items-center gap-1",
              isExpiringSoon && "text-warning"
            )}>
              <Clock className="h-3 w-3" />
              {subscription.expiresAt 
                ? format(new Date(subscription.expiresAt), 'MMM d, yyyy')
                : 'Never'
              }
            </p>
            {isExpiringSoon && (
              <p className="text-xs text-warning mt-1">Renew soon</p>
            )}
          </div>
        </div>

        {/* Last Payment */}
        {subscription.lastPaymentAt && (
          <p className="text-xs text-muted-foreground">
            Last payment: {format(new Date(subscription.lastPaymentAt), 'MMM d, yyyy')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
