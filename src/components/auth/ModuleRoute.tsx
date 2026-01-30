import { ReactNode } from 'react';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { useMyModuleAccess } from '@/hooks/useStaffModuleAccess';
import { useInstitution } from '@/contexts/InstitutionContext';
import { MODULE_CATALOG, ModuleId } from '@/lib/subscription-catalog';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';
import { Skeleton } from '@/components/ui/skeleton';

interface ModuleRouteProps {
  children: ReactNode;
  requiredModule: ModuleId;
  /** If true, checks staff module access in addition to subscription. Default: true */
  checkStaffAccess?: boolean;
}

export function ModuleRoute({ children, requiredModule, checkStaffAccess = true }: ModuleRouteProps) {
  const { isModuleEnabled, isLoading: subscriptionLoading, planName } = useSubscriptionLimits();
  const { institutionId } = useInstitution();
  const { canAccessModule, isLoading: accessLoading } = useMyModuleAccess(institutionId || undefined);

  const isLoading = subscriptionLoading || (checkStaffAccess && accessLoading);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  const moduleInfo = MODULE_CATALOG[requiredModule];

  // Check if institution has the module enabled (subscription level)
  const institutionHasModule = isModuleEnabled(requiredModule);
  
  // Check if user has access to the module (staff level)
  const userHasAccess = checkStaffAccess ? canAccessModule(requiredModule) : true;

  if (!institutionHasModule) {
    return (
      <UpgradePrompt
        open={true}
        onOpenChange={() => {}}
        reason={`The ${moduleInfo?.label || requiredModule} module is not included in your current plan.`}
        currentPlan={planName}
        featureNeeded={moduleInfo?.label || requiredModule}
      />
    );
  }

  if (!userHasAccess) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-center">
        <div className="rounded-full bg-muted p-4">
          <svg
            className="h-8 w-8 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-semibold">Access Restricted</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          You don't have access to the {moduleInfo?.label || requiredModule} module.
          Contact your administrator to request access.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
