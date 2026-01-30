import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePricingFormulaRates, calculatePricing, PricingFormulaRates, OwnershipType } from '@/hooks/usePricingFormula';

export interface PricingTierConfig {
  id: string;
  tier_number: number;
  name: string;
  min_students: number;
  max_students: number;
  representative_count: number;
  description: string | null;
  is_popular: boolean;
  is_contact_sales: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface TierPricing {
  tier: PricingTierConfig;
  publicYear1: number;
  publicRenewal: number;
  privateYear1: number;
  privateRenewal: number;
  isCustom: boolean;
}

// Fetch all active pricing tiers
export function usePricingTiersConfig() {
  return useQuery({
    queryKey: ['pricing-tiers-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_tiers')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data as PricingTierConfig[];
    },
  });
}

// Calculate pricing for all tiers
export function useTiersPricing() {
  const { data: tiers, isLoading: tiersLoading } = usePricingTiersConfig();
  const { data: rates, isLoading: ratesLoading } = usePricingFormulaRates();

  const tiersPricing: TierPricing[] = [];

  if (tiers && rates) {
    for (const tier of tiers) {
      if (tier.is_contact_sales) {
        tiersPricing.push({
          tier,
          publicYear1: 0,
          publicRenewal: 0,
          privateYear1: 0,
          privateRenewal: 0,
          isCustom: true,
        });
      } else {
        const publicPricing = calculatePricing(tier.representative_count, 'public', rates);
        const privatePricing = calculatePricing(tier.representative_count, 'private', rates);
        
        tiersPricing.push({
          tier,
          publicYear1: publicPricing.year1Package,
          publicRenewal: publicPricing.renewalFee,
          privateYear1: privatePricing.year1Package,
          privateRenewal: privatePricing.renewalFee,
          isCustom: false,
        });
      }
    }
  }

  return {
    data: tiersPricing,
    tiers,
    rates,
    isLoading: tiersLoading || ratesLoading,
  };
}

// Find tier for a given student count
export function useTierForStudentCount(studentCount: number) {
  const { data: tiers } = usePricingTiersConfig();
  
  if (!tiers || studentCount <= 0) return null;
  
  for (const tier of tiers) {
    const withinMin = studentCount >= tier.min_students;
    const withinMax = tier.max_students === -1 || studentCount <= tier.max_students;
    
    if (withinMin && withinMax) {
      return tier;
    }
  }
  
  return null;
}

// Calculate pricing for a specific tier and ownership type
export function calculateTierPricing(
  tier: PricingTierConfig,
  ownershipType: OwnershipType,
  rates: PricingFormulaRates
) {
  if (tier.is_contact_sales) {
    return { year1: 0, renewal: 0, isCustom: true };
  }
  
  const pricing = calculatePricing(tier.representative_count, ownershipType, rates);
  return {
    year1: pricing.year1Package,
    renewal: pricing.renewalFee,
    isCustom: false,
  };
}

// Format student range for display
export function formatTierRange(tier: PricingTierConfig): string {
  if (tier.max_students === -1) {
    return `${tier.min_students.toLocaleString()}+ students`;
  }
  return `${tier.min_students.toLocaleString()}-${tier.max_students.toLocaleString()} students`;
}

// Update a pricing tier
export function useUpdatePricingTierConfig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (tier: Partial<PricingTierConfig> & { id: string }) => {
      const { id, ...updates } = tier;
      const { data, error } = await supabase
        .from('pricing_tiers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-tiers-config'] });
      toast({
        title: 'Success',
        description: 'Pricing tier updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update pricing tier',
        variant: 'destructive',
      });
      console.error('Update tier error:', error);
    },
  });
}
