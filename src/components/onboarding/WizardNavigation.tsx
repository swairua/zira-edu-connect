import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { OnboardingStep } from '@/hooks/useOnboarding';

interface WizardNavigationProps {
  steps: { id: OnboardingStep; title: string; description: string }[];
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  isLocked: boolean;
  isSaving: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSkip?: () => void;
  onComplete: () => void;
  canComplete?: boolean;
  showSkip?: boolean;
}

export function WizardNavigation({
  steps,
  currentStep,
  completedSteps,
  isLocked,
  isSaving,
  onPrevious,
  onNext,
  onSkip,
  onComplete,
  canComplete = true,
  showSkip = false,
}: WizardNavigationProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep);
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === steps.length - 1;
  const isStepCompleted = completedSteps.includes(currentStep);

  if (isLocked) {
    return (
      <div className="flex justify-center py-4">
        <p className="text-sm text-muted-foreground">
          Onboarding is complete. Your school is now live!
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between pt-6 border-t">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstStep || isSaving}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>

      <div className="flex gap-2">
        {showSkip && !isStepCompleted && !isLastStep && (
          <Button
            variant="ghost"
            onClick={onSkip}
            disabled={isSaving}
          >
            Skip for now
          </Button>
        )}

        {isLastStep ? (
          <Button
            onClick={onComplete}
            disabled={!canComplete || isSaving}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Going Live...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Go Live
              </>
            )}
          </Button>
        ) : (
          <Button onClick={onNext} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : isStepCompleted ? (
              <>
                Next Step
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>
                Save & Continue
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
