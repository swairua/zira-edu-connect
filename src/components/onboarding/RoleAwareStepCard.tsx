import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RoleAwareTips } from './RoleAwareTips';
import { OnboardingStep } from '@/config/onboardingSteps';
import { cn } from '@/lib/utils';

interface RoleAwareStepCardProps {
  stepId: OnboardingStep;
  title: string;
  description: string;
  children: React.ReactNode;
  isCompleted?: boolean;
  hasErrors?: boolean;
  className?: string;
}

export function RoleAwareStepCard({
  stepId,
  title,
  description,
  children,
  isCompleted = false,
  hasErrors = false,
  className,
}: RoleAwareStepCardProps) {
  return (
    <Card className={cn('relative', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{title}</CardTitle>
          {isCompleted && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Complete
            </Badge>
          )}
          {hasErrors && !isCompleted && (
            <Badge variant="destructive">Needs Attention</Badge>
          )}
        </div>
        <p className="text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        {children}
        <RoleAwareTips stepId={stepId} />
      </CardContent>
    </Card>
  );
}
