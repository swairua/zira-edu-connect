import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding, OnboardingStep } from '@/hooks/useOnboarding';
import { useInstitution } from '@/contexts/InstitutionContext';
import { WizardStepper } from '@/components/onboarding/WizardStepper';
import { WizardNavigation } from '@/components/onboarding/WizardNavigation';
import { InstitutionProfileStep } from './onboarding/InstitutionProfileStep';
import { AcademicCalendarStep } from './onboarding/AcademicCalendarStep';
import { ClassSetupStep } from './onboarding/ClassSetupStep';
import { SubjectSetupStep } from './onboarding/SubjectSetupStep';
import { FeeStructureStep } from './onboarding/FeeStructureStep';
import { DataImportStep } from './onboarding/DataImportStep';
import { GoLiveStep } from './onboarding/GoLiveStep';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Rocket } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function Onboarding() {
  const navigate = useNavigate();
  const { institution, institutionId, isLoading: institutionLoading } = useInstitution();
  const {
    progress,
    isLoading,
    initializeOnboarding,
    updateStep,
    completeStep,
    goLive,
    canNavigateToStep,
    isLocked,
    steps,
  } = useOnboarding();

  // Initialize onboarding if not started
  useEffect(() => {
    if (!isLoading && !institutionLoading && institutionId && !progress) {
      initializeOnboarding.mutate();
    }
  }, [isLoading, institutionLoading, institutionId, progress]);

  // Auto-correct step if user lands on a step they don't have access to
  useEffect(() => {
    if (!progress || isLoading || steps.length === 0) return;
    
    const currentStepId = progress.current_step as OnboardingStep;
    const hasAccessToCurrentStep = steps.some(s => s.id === currentStepId);
    
    if (!hasAccessToCurrentStep) {
      // Find first visible step that isn't completed, or fall back to first visible step
      const firstIncompleteStep = steps.find(s => !progress.completed_steps.includes(s.id));
      const targetStep = firstIncompleteStep?.id || steps[0]?.id;
      
      if (targetStep) {
        updateStep.mutate({ step: targetStep });
      }
    }
  }, [progress, steps, isLoading]);

  // Redirect if no institution
  if (!institutionLoading && !institutionId) {
    return (
      <DashboardLayout title="Setup Wizard">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Please select an institution to continue with onboarding.
            </p>
            <Button onClick={() => navigate('/institutions')}>
              Go to Institutions
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (isLoading || institutionLoading || !progress) {
    return (
      <DashboardLayout title="Setup Wizard">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const currentStep = progress.current_step as OnboardingStep;

  const handleStepClick = (step: OnboardingStep) => {
    if (canNavigateToStep(step)) {
      updateStep.mutate({ step });
    }
  };

  const handlePrevious = () => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      updateStep.mutate({ step: steps[currentIndex - 1].id });
    }
  };

  const handleNext = () => {
    completeStep.mutate({ step: currentStep });
  };

  const handleSkip = () => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex < steps.length - 1) {
      updateStep.mutate({ step: steps[currentIndex + 1].id });
    }
  };

  const handleGoLive = () => {
    goLive.mutate();
  };

  const renderStepContent = () => {
    // Guard: If current step isn't in user's visible steps, show nothing (will be redirected)
    if (!steps.some(s => s.id === currentStep)) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Redirecting to your available steps...</p>
          </CardContent>
        </Card>
      );
    }

    switch (currentStep) {
      case 'institution_profile':
        return <InstitutionProfileStep />;
      case 'academic_calendar':
        return <AcademicCalendarStep />;
      case 'class_setup':
        return <ClassSetupStep />;
      case 'subject_setup':
        return <SubjectSetupStep />;
      case 'fee_structure':
        return <FeeStructureStep />;
      case 'data_import':
        return <DataImportStep />;
      case 'go_live':
        return <GoLiveStep onGoLive={handleGoLive} isGoingLive={goLive.isPending} />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout title="Setup Wizard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Rocket className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Setup Wizard</h1>
            <p className="text-muted-foreground">
              {institution?.name} - Complete the setup to go live
            </p>
          </div>
        </div>

        {/* Stepper */}
        <Card>
          <CardContent className="py-6">
            <WizardStepper
              steps={steps}
              currentStep={currentStep}
              completedSteps={progress.completed_steps as OnboardingStep[]}
              isLocked={isLocked}
              onStepClick={handleStepClick}
              canNavigateToStep={canNavigateToStep}
            />
          </CardContent>
        </Card>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <Card>
          <CardContent className="py-4">
            <WizardNavigation
              steps={steps}
              currentStep={currentStep}
              completedSteps={progress.completed_steps as OnboardingStep[]}
              isLocked={isLocked}
              isSaving={completeStep.isPending || updateStep.isPending || goLive.isPending}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onSkip={handleSkip}
              onComplete={handleGoLive}
              showSkip={currentStep !== 'go_live'}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
