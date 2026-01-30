import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getTipsForRole, OnboardingStep } from '@/config/onboardingSteps';
import { Lightbulb } from 'lucide-react';

interface RoleAwareTipsProps {
  stepId: OnboardingStep;
  fallbackTips?: string[];
  className?: string;
}

export function RoleAwareTips({ stepId, fallbackTips = [], className }: RoleAwareTipsProps) {
  const { userRoles } = useAuth();

  const tips = useMemo(() => {
    const roleTips = getTipsForRole(stepId, userRoles);
    return roleTips.length > 0 ? roleTips : fallbackTips;
  }, [stepId, userRoles, fallbackTips]);

  if (tips.length === 0) return null;

  return (
    <div className={`mt-6 p-4 bg-muted/50 rounded-lg border ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="h-4 w-4 text-amber-500" />
        <h4 className="font-medium text-sm">Tips</h4>
      </div>
      <ul className="space-y-1 text-sm text-muted-foreground">
        {tips.map((tip, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
