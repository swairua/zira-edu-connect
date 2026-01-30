import { Check, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OnboardingStep } from '@/hooks/useOnboarding';

interface WizardStepperProps {
  steps: { id: OnboardingStep; title: string; description: string }[];
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  isLocked: boolean;
  onStepClick: (step: OnboardingStep) => void;
  canNavigateToStep: (step: OnboardingStep) => boolean;
}

export function WizardStepper({
  steps,
  currentStep,
  completedSteps,
  isLocked,
  onStepClick,
  canNavigateToStep,
}: WizardStepperProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full">
      {/* Desktop stepper */}
      <div className="hidden md:flex items-center justify-between gap-2">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const canNavigate = canNavigateToStep(step.id);

          return (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => canNavigate && onStepClick(step.id)}
                disabled={!canNavigate || isLocked}
                className={cn(
                  'flex flex-col items-center gap-2 group',
                  canNavigate && !isLocked ? 'cursor-pointer' : 'cursor-not-allowed'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                    isCompleted
                      ? 'bg-primary border-primary text-primary-foreground'
                      : isCurrent
                      ? 'border-primary text-primary bg-primary/10'
                      : 'border-muted-foreground/30 text-muted-foreground'
                  )}
                >
                  {isLocked ? (
                    <Lock className="h-4 w-4" />
                  ) : isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="text-center">
                  <p
                    className={cn(
                      'text-xs font-medium',
                      isCurrent ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </p>
                </div>
              </button>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2',
                    completedSteps.includes(step.id)
                      ? 'bg-primary'
                      : 'bg-muted-foreground/20'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile stepper */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            Step {currentIndex + 1} of {steps.length}
          </span>
          <span className="text-sm font-medium">
            {Math.round((completedSteps.filter(s => steps.some(step => step.id === s)).length / steps.length) * 100)}% Complete
          </span>
        </div>
        <div className="flex gap-1">
          {steps.map((step) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = step.id === currentStep;
            return (
              <div
                key={step.id}
                className={cn(
                  'flex-1 h-2 rounded-full',
                  isCompleted
                    ? 'bg-primary'
                    : isCurrent
                    ? 'bg-primary/50'
                    : 'bg-muted'
                )}
              />
            );
          })}
        </div>
        <p className="mt-2 text-center font-medium">
          {steps[currentIndex]?.title}
        </p>
      </div>
    </div>
  );
}
