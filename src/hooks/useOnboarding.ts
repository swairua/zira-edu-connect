import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  ONBOARDING_STEP_CONFIGS,
  getVisibleStepsForRoles,
  type OnboardingStep,
} from '@/config/onboardingSteps';

// Re-export type for backward compatibility
export type { OnboardingStep };

export interface OnboardingProgress {
  id: string;
  institution_id: string;
  current_step: OnboardingStep;
  completed_steps: OnboardingStep[];
  step_data: Record<string, any>;
  started_at: string;
  completed_at: string | null;
  completed_by: string | null;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

// Full steps list for backward compatibility
export const ONBOARDING_STEPS: { id: OnboardingStep; title: string; description: string }[] = 
  ONBOARDING_STEP_CONFIGS.map(s => ({
    id: s.id,
    title: s.title,
    description: s.description,
  }));

export function useOnboarding() {
  const { institutionId } = useInstitution();
  const { user, userRoles } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get visible steps based on user roles
  const visibleSteps = useMemo(() => {
    if (!userRoles || userRoles.length === 0) {
      // Default to all steps if no roles (admin fallback)
      return ONBOARDING_STEPS;
    }
    const configs = getVisibleStepsForRoles(userRoles);
    return configs.map(c => ({ id: c.id, title: c.title, description: c.description }));
  }, [userRoles]);

  // Fetch onboarding progress
  const { data: progress, isLoading, refetch } = useQuery({
    queryKey: ['onboarding-progress', institutionId],
    queryFn: async () => {
      if (!institutionId) return null;
      
      const { data, error } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('institution_id', institutionId)
        .maybeSingle();
      
      if (error) throw error;
      return data as OnboardingProgress | null;
    },
    enabled: !!institutionId,
  });

  // Initialize onboarding
  const initializeOnboarding = useMutation({
    mutationFn: async () => {
      if (!institutionId) throw new Error('No institution selected');

      const { data, error } = await supabase
        .from('onboarding_progress')
        .insert({
          institution_id: institutionId,
          current_step: 'institution_profile',
          completed_steps: [],
          step_data: {},
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-progress', institutionId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to initialize onboarding',
        variant: 'destructive',
      });
    },
  });

  // Update current step
  const updateStep = useMutation({
    mutationFn: async ({ step, stepData }: { step: OnboardingStep; stepData?: Record<string, any> }) => {
      if (!institutionId || !progress) throw new Error('No onboarding progress found');

      const updates: any = { current_step: step };
      
      if (stepData) {
        updates.step_data = {
          ...progress.step_data,
          [step]: stepData,
        };
      }

      const { error } = await supabase
        .from('onboarding_progress')
        .update(updates)
        .eq('institution_id', institutionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-progress', institutionId] });
    },
  });

  // Complete a step - uses visible steps for navigation
  const completeStep = useMutation({
    mutationFn: async ({ step, stepData }: { step: OnboardingStep; stepData?: Record<string, any> }) => {
      if (!institutionId || !progress) throw new Error('No onboarding progress found');

      const completedSteps = progress.completed_steps.includes(step)
        ? progress.completed_steps
        : [...progress.completed_steps, step];

      // Find next step within VISIBLE steps for this user's role
      const currentIndex = visibleSteps.findIndex(s => s.id === step);
      const nextStep = visibleSteps[currentIndex + 1]?.id || step;

      const updates: any = {
        completed_steps: completedSteps,
        current_step: nextStep,
      };

      if (stepData) {
        updates.step_data = {
          ...progress.step_data,
          [step]: stepData,
        };
      }

      const { error } = await supabase
        .from('onboarding_progress')
        .update(updates)
        .eq('institution_id', institutionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-progress', institutionId] });
      toast({
        title: 'Step completed',
        description: 'Progress saved successfully',
      });
    },
  });

  // Go live
  const goLive = useMutation({
    mutationFn: async () => {
      if (!institutionId || !user?.id) throw new Error('Missing required data');

      // Lock onboarding
      const { error: progressError } = await supabase
        .from('onboarding_progress')
        .update({
          is_locked: true,
          completed_at: new Date().toISOString(),
          completed_by: user.id,
          current_step: 'go_live',
          completed_steps: [...(progress?.completed_steps || []), 'go_live'],
        })
        .eq('institution_id', institutionId);

      if (progressError) throw progressError;

      // Update institution status
      const { error: instError } = await supabase
        .from('institutions')
        .update({
          onboarding_status: 'completed',
          go_live_at: new Date().toISOString(),
        })
        .eq('id', institutionId);

      if (instError) throw instError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-progress', institutionId] });
      queryClient.invalidateQueries({ queryKey: ['institution', institutionId] });
      toast({
        title: 'Congratulations! 🎉',
        description: 'Your school is now live and ready to use.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to go live',
        variant: 'destructive',
      });
    },
  });

  // Save step data without completing
  const saveStepData = useMutation({
    mutationFn: async ({ step, data }: { step: OnboardingStep; data: Record<string, any> }) => {
      if (!institutionId || !progress) throw new Error('No onboarding progress found');

      const { error } = await supabase
        .from('onboarding_progress')
        .update({
          step_data: {
            ...progress.step_data,
            [step]: data,
          },
        })
        .eq('institution_id', institutionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-progress', institutionId] });
    },
  });

  // Helper functions
  const isStepCompleted = (step: OnboardingStep) => progress?.completed_steps?.includes(step) ?? false;
  
  const getStepIndex = (step: OnboardingStep) => visibleSteps.findIndex(s => s.id === step);
  
  const canNavigateToStep = (step: OnboardingStep) => {
    if (progress?.is_locked) return false;
    // Check if step is visible to this user
    if (!visibleSteps.some(s => s.id === step)) return false;
    const stepIndex = getStepIndex(step);
    const currentIndex = getStepIndex(progress?.current_step || 'institution_profile');
    // Can go to any completed step or the current step or the next one
    return stepIndex <= currentIndex + 1;
  };

  const getCompletionPercentage = () => {
    if (!progress) return 0;
    // Calculate based on visible steps only
    const completedVisible = progress.completed_steps.filter(
      step => visibleSteps.some(s => s.id === step)
    );
    return Math.round((completedVisible.length / visibleSteps.length) * 100);
  };

  return {
    progress,
    isLoading,
    refetch,
    initializeOnboarding,
    updateStep,
    completeStep,
    goLive,
    saveStepData,
    isStepCompleted,
    getStepIndex,
    canNavigateToStep,
    getCompletionPercentage,
    steps: visibleSteps, // Now returns role-filtered steps
    allSteps: ONBOARDING_STEPS, // Full list for reference
    isLocked: progress?.is_locked ?? false,
    userRoles,
  };
}
