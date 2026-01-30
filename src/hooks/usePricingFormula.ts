import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type OwnershipType = 'public' | 'private';

export interface PricingFormulaRates {
  tier_base_setup_fee: number;      // Base Year 1 Fee (includes setup + first year)
  tier_per_learner_setup: number;   // Per-Learner Year 1
  tier_base_annual_fee: number;     // Base Renewal Fee
  tier_per_learner_annual: number;  // Per-Learner Renewal
  tier_private_multiplier: number;
}

export interface PricingCalculation {
  year1Package: number;      // Bundled Year 1 (setup + first year subscription)
  renewalFee: number;        // Year 2+ annual renewal
  breakdown: {
    baseYear1: number;
    perLearnerYear1: number;
    baseRenewal: number;
    perLearnerRenewal: number;
    multiplierApplied: number;
  };
}

const DEFAULT_RATES: PricingFormulaRates = {
  tier_base_setup_fee: 25000,       // Year 1 base (includes setup + first year)
  tier_per_learner_setup: 120,      // Year 1 per-learner
  tier_base_annual_fee: 12000,      // Renewal base
  tier_per_learner_annual: 50,      // Renewal per-learner
  tier_private_multiplier: 1.25,
};

export function usePricingFormulaRates() {
  return useQuery({
    queryKey: ['pricing-formula-rates'],
    queryFn: async (): Promise<PricingFormulaRates> => {
      const { data, error } = await supabase
        .from('billing_settings')
        .select('tier_base_setup_fee, tier_per_learner_setup, tier_base_annual_fee, tier_per_learner_annual, tier_private_multiplier')
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching pricing rates:', error);
        return DEFAULT_RATES;
      }

      return {
        tier_base_setup_fee: data.tier_base_setup_fee ?? DEFAULT_RATES.tier_base_setup_fee,
        tier_per_learner_setup: data.tier_per_learner_setup ?? DEFAULT_RATES.tier_per_learner_setup,
        tier_base_annual_fee: data.tier_base_annual_fee ?? DEFAULT_RATES.tier_base_annual_fee,
        tier_per_learner_annual: data.tier_per_learner_annual ?? DEFAULT_RATES.tier_per_learner_annual,
        tier_private_multiplier: data.tier_private_multiplier ?? DEFAULT_RATES.tier_private_multiplier,
      };
    },
  });
}

export function useUpdatePricingFormulaRates() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (rates: Partial<PricingFormulaRates>) => {
      const { data: existing } = await supabase
        .from('billing_settings')
        .select('id')
        .limit(1)
        .single();

      if (!existing) {
        throw new Error('Billing settings not found');
      }

      const { error } = await supabase
        .from('billing_settings')
        .update({
          ...rates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-formula-rates'] });
      queryClient.invalidateQueries({ queryKey: ['billing-settings'] });
      toast({
        title: 'Pricing rates updated',
        description: 'Formula-based pricing rates have been saved.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Calculate pricing based on Zeraki-style bundled formula:
 * Year 1 Package = (Base Year 1 + Per-Learner Year 1 × Students) × Multiplier
 * Year 2+ Renewal = (Base Renewal + Per-Learner Renewal × Students) × Multiplier
 */
export function calculatePricing(
  studentCount: number,
  ownershipType: OwnershipType,
  rates: PricingFormulaRates
): PricingCalculation {
  const multiplier = ownershipType === 'private' ? rates.tier_private_multiplier : 1;

  // Year 1 Package (bundled: setup + first year subscription)
  const baseYear1 = rates.tier_base_setup_fee;
  const perLearnerYear1 = rates.tier_per_learner_setup * studentCount;
  const rawYear1 = baseYear1 + perLearnerYear1;
  const year1Package = Math.round(rawYear1 * multiplier);

  // Year 2+ Renewal
  const baseRenewal = rates.tier_base_annual_fee;
  const perLearnerRenewal = rates.tier_per_learner_annual * studentCount;
  const rawRenewal = baseRenewal + perLearnerRenewal;
  const renewalFee = Math.round(rawRenewal * multiplier);

  return {
    year1Package,
    renewalFee,
    breakdown: {
      baseYear1,
      perLearnerYear1,
      baseRenewal,
      perLearnerRenewal,
      multiplierApplied: multiplier,
    },
  };
}

/**
 * Hook that provides pricing calculation with current rates
 */
export function usePricingCalculator() {
  const { data: rates, isLoading, isError } = usePricingFormulaRates();

  const calculate = (studentCount: number, ownershipType: OwnershipType): PricingCalculation | null => {
    if (!rates) return null;
    return calculatePricing(studentCount, ownershipType, rates);
  };

  return {
    rates: rates ?? DEFAULT_RATES,
    calculate,
    isLoading,
    isError,
  };
}

/**
 * Get tier label based on student count
 */
export function getTierLabel(studentCount: number): string {
  if (studentCount <= 200) return 'Small School';
  if (studentCount <= 500) return 'Medium School';
  if (studentCount <= 1000) return 'Large School';
  return 'Extra Large School';
}

/**
 * Get tier range description
 */
export function getTierRange(studentCount: number): string {
  if (studentCount <= 200) return '1-200 students';
  if (studentCount <= 500) return '201-500 students';
  if (studentCount <= 1000) return '501-1,000 students';
  return '1,001+ students';
}

export { DEFAULT_RATES };
