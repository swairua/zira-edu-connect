import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';

interface ModuleConfigRow {
  module_id: string;
  is_institution_disabled: boolean | null;
}

export interface SubscriptionLimits {
  planId: string | null;
  planName: string;
  
  // Limits
  maxStudents: number;
  maxStaff: number;
  currentStudentCount: number;
  currentStaffCount: number;
  
  // Calculated values
  remainingStudentSlots: number;
  remainingStaffSlots: number;
  isUnlimitedStudents: boolean;
  isUnlimitedStaff: boolean;
  
  // Warning thresholds (90%)
  isNearStudentLimit: boolean;
  isNearStaffLimit: boolean;
  
  // Check functions
  canAddStudents: (count?: number) => boolean;
  canAddStaff: (count?: number) => boolean;
  
  // Modules
  enabledModules: string[];
  isModuleEnabled: (module: string) => boolean;
  /** List of module IDs disabled by the institution admin */
  disabledModules: string[];
  /** List of core tier module IDs (always available) */
  coreTierModules: string[];
  
  // Features
  planFeatures: string[];
  
  // Loading state
  isLoading: boolean;
}

const NEAR_LIMIT_THRESHOLD = 0.9;

export function useSubscriptionLimits(): SubscriptionLimits {
  const { institution } = useInstitution();
  const institutionId = institution?.id;
  const subscriptionPlan = institution?.subscription_plan;

  // Fetch core tier modules (always available to all institutions)
  const { data: coreTierModules = [] } = useQuery({
    queryKey: ['core-tier-modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('module_pricing')
        .select('module_id')
        .eq('tier', 'core')
        .eq('is_active', true);
      
      if (error) {
        console.error('Error fetching core tier modules:', error);
        return [];
      }
      
      return data?.map(m => m.module_id) || [];
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  // Fetch plan details
  const { data: planData, isLoading: planLoading } = useQuery({
    queryKey: ['subscription-plan', subscriptionPlan],
    queryFn: async () => {
      if (!subscriptionPlan) return null;
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', subscriptionPlan)
        .single();
      
      if (error) {
        console.error('Error fetching subscription plan:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!subscriptionPlan,
  });

  // Fetch current counts
  const { data: counts, isLoading: countsLoading } = useQuery({
    queryKey: ['institution-counts', institutionId],
    queryFn: async () => {
      if (!institutionId) return { student_count: 0, staff_count: 0 };
      
      const { data, error } = await supabase
        .from('institutions')
        .select('student_count, staff_count')
        .eq('id', institutionId)
        .single();
      
      if (error) {
        console.error('Error fetching institution counts:', error);
        return { student_count: 0, staff_count: 0 };
      }
      
      return data;
    },
    enabled: !!institutionId,
  });

  // Fetch institution-disabled modules
  const { data: moduleConfig } = useQuery({
    queryKey: ['institution-module-config-disabled', institutionId],
    queryFn: async (): Promise<ModuleConfigRow[]> => {
      if (!institutionId) return [];
      
      const { data, error } = await supabase
        .from('institution_module_config')
        .select('module_id, is_institution_disabled')
        .eq('institution_id', institutionId);
      
      if (error) {
        console.error('Error fetching module config:', error);
        return [];
      }
      
      return (data as ModuleConfigRow[]) || [];
    },
    enabled: !!institutionId,
  });

  const isLoading = planLoading || countsLoading;
  
  const maxStudents = planData?.max_students ?? -1;
  const maxStaff = planData?.max_staff ?? -1;
  const currentStudentCount = counts?.student_count ?? 0;
  const currentStaffCount = counts?.staff_count ?? 0;
  
  const isUnlimitedStudents = maxStudents === -1;
  const isUnlimitedStaff = maxStaff === -1;
  
  const remainingStudentSlots = isUnlimitedStudents 
    ? Infinity 
    : Math.max(0, maxStudents - currentStudentCount);
  const remainingStaffSlots = isUnlimitedStaff 
    ? Infinity 
    : Math.max(0, maxStaff - currentStaffCount);
  
  const isNearStudentLimit = !isUnlimitedStudents && 
    currentStudentCount >= maxStudents * NEAR_LIMIT_THRESHOLD;
  const isNearStaffLimit = !isUnlimitedStaff && 
    currentStaffCount >= maxStaff * NEAR_LIMIT_THRESHOLD;

  const canAddStudents = (count = 1): boolean => {
    if (isUnlimitedStudents) return true;
    return currentStudentCount + count <= maxStudents;
  };

  const canAddStaff = (count = 1): boolean => {
    if (isUnlimitedStaff) return true;
    return currentStaffCount + count <= maxStaff;
  };

  const enabledModules: string[] = (institution?.enabled_modules ?? planData?.modules ?? []) as string[];
  
  // Get list of modules disabled by institution admin
  const institutionDisabledModules = moduleConfig
    ?.filter(m => m.is_institution_disabled === true)
    .map(m => m.module_id) || [];
  
  const isModuleEnabled = (module: string): boolean => {
    // Check if disabled by institution admin first
    const isDisabledByInstitution = institutionDisabledModules.includes(module);
    if (isDisabledByInstitution) return false;
    
    // Core tier modules are always available to all institutions
    if (coreTierModules.includes(module)) return true;
    
    // Otherwise check if module is in the institution's plan
    const inPlan = enabledModules.length === 0 || enabledModules.includes(module);
    return inPlan;
  };

  const planFeatures: string[] = (planData?.features ?? []) as string[];

  return {
    planId: subscriptionPlan ?? null,
    planName: planData?.name ?? 'Unknown',
    
    maxStudents,
    maxStaff,
    currentStudentCount,
    currentStaffCount,
    
    remainingStudentSlots,
    remainingStaffSlots,
    isUnlimitedStudents,
    isUnlimitedStaff,
    
    isNearStudentLimit,
    isNearStaffLimit,
    
    canAddStudents,
    canAddStaff,
    
    enabledModules,
    isModuleEnabled,
    disabledModules: institutionDisabledModules,
    coreTierModules,
    
    planFeatures,
    
    isLoading,
  };
}
