import { Link } from 'react-router-dom';
import { Rocket, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useOnboarding } from '@/hooks/useOnboarding';

export function OnboardingBanner() {
  const { progress, isLoading, getCompletionPercentage, isLocked } = useOnboarding();

  // Don't show if loading, locked (completed), or no progress
  if (isLoading || isLocked || !progress) return null;

  const percentage = getCompletionPercentage();
  
  // Don't show if 100% complete
  if (percentage === 100) return null;

  return (
    <div className="rounded-lg border bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Rocket className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">Complete Your Setup</h3>
            <p className="text-xs text-muted-foreground">
              {percentage}% complete — finish setup to go live
            </p>
            <Progress value={percentage} className="h-1.5 mt-2" />
          </div>
        </div>
        <Button asChild size="sm" className="shrink-0">
          <Link to="/onboarding" className="gap-2">
            Continue Setup
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
