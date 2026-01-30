import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitutionCustomPricing, useModulePricingOverrides } from './useInstitutionCustomPricing';

export interface EffectivePricing {
  // Plan pricing
  yearlyPrice: number;
  monthlyPrice: number;
  
  // Limits
  maxStudents: number;
  maxStaff: number;
  
  // Modules
  includedModules: string[];
  
  // Custom pricing info
  hasCustomPricing: boolean;
  discountPercentage: number;
  negotiationNotes: string | null;
  customPricingValidUntil: string | null;
  
  // Original plan for reference
  basePlanId: string;
  basePlanName: string;
  baseYearlyPrice: number;
  baseMonthlyPrice: number;
}

export interface EffectiveModulePrice {
  moduleId: string;
  moduleName: string;
  basePrice: number;
  effectivePrice: number;
  hasOverride: boolean;
  overrideReason: string | null;
}

export function useEffectivePricing(institutionId: string | undefined) {
  const { data: customPricing } = useInstitutionCustomPricing(institutionId);
  
  return useQuery({
    queryKey: ['effective-pricing', institutionId],
    queryFn: async (): Promise<EffectivePricing | null> => {
      if (!institutionId) return null;
      
      // Get institution with plan
      const { data: institution, error: instError } = await supabase
        .from('institutions')
        .select('subscription_plan')
        .eq('id', institutionId)
        .single();
      
      if (instError) throw instError;
      
      // Get base plan details
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', institution.subscription_plan)
        .single();
      
      if (planError) throw planError;
      
      const hasCustom = !!customPricing;
      
      return {
        // Use custom pricing if available, otherwise base plan
        yearlyPrice: customPricing?.custom_yearly_price ?? plan.price_yearly,
        monthlyPrice: customPricing?.custom_monthly_price ?? plan.price_monthly,
        maxStudents: customPricing?.custom_max_students ?? plan.max_students,
        maxStaff: customPricing?.custom_max_staff ?? plan.max_staff,
        includedModules: customPricing?.included_modules ?? plan.modules ?? [],
        
        // Custom pricing metadata
        hasCustomPricing: hasCustom,
        discountPercentage: customPricing?.discount_percentage ?? 0,
        negotiationNotes: customPricing?.negotiation_notes ?? null,
        customPricingValidUntil: customPricing?.valid_until ?? null,
        
        // Base plan reference
        basePlanId: plan.id,
        basePlanName: plan.name,
        baseYearlyPrice: plan.price_yearly,
        baseMonthlyPrice: plan.price_monthly,
      };
    },
    enabled: !!institutionId,
  });
}

export function useEffectiveModulePricing(institutionId: string | undefined) {
  const { data: overrides } = useModulePricingOverrides(institutionId);
  
  return useQuery({
    queryKey: ['effective-module-pricing', institutionId],
    queryFn: async (): Promise<EffectiveModulePrice[]> => {
      // Get all module pricing
      const { data: modules, error } = await supabase
        .from('module_pricing')
        .select('*')
        .eq('is_active', true)
        .order('tier', { ascending: true })
        .order('display_name', { ascending: true });
      
      if (error) throw error;
      
      const overrideMap = new Map(
        overrides?.map(o => [o.module_id, o]) ?? []
      );
      
      return modules.map(module => {
        const override = overrideMap.get(module.module_id);
        
        return {
          moduleId: module.module_id,
          moduleName: module.display_name,
          basePrice: module.base_monthly_price,
          effectivePrice: override?.custom_price ?? module.base_monthly_price,
          hasOverride: !!override,
          overrideReason: override?.reason ?? null,
        };
      });
    },
    enabled: !!institutionId,
  });
}

// Calculate annual savings percentage
export function calculateAnnualSavings(monthlyPrice: number, yearlyPrice: number): number {
  const monthlyTotal = monthlyPrice * 12;
  if (monthlyTotal === 0) return 0;
  return Math.round(((monthlyTotal - yearlyPrice) / monthlyTotal) * 100);
}
