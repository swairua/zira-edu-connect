import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

export type OwnershipType = 'public' | 'private';
export type SubscriptionPlanId = Database['public']['Enums']['subscription_plan'];

export interface PricingTier {
  id: string;
  plan_id: SubscriptionPlanId;
  ownership_type: OwnershipType;
  min_students: number;
  max_students: number;
  setup_cost: number;
  annual_subscription: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function usePricingTiers(planId?: SubscriptionPlanId) {
  return useQuery({
    queryKey: ['pricing-tiers', planId],
    queryFn: async () => {
      let query = supabase
        .from('subscription_tier_pricing')
        .select('*')
        .order('ownership_type')
        .order('min_students');
      
      if (planId) {
        query = query.eq('plan_id', planId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as PricingTier[];
    },
  });
}

export function usePricingTierForStudent(
  planId: SubscriptionPlanId | undefined, 
  ownershipType: OwnershipType | undefined, 
  studentCount: number
) {
  return useQuery({
    queryKey: ['pricing-tier', planId, ownershipType, studentCount],
    queryFn: async () => {
      if (!planId || !ownershipType) return null;
      
      const { data, error } = await supabase
        .from('subscription_tier_pricing')
        .select('*')
        .eq('plan_id', planId)
        .eq('ownership_type', ownershipType)
        .eq('is_active', true)
        .lte('min_students', studentCount)
        .or(`max_students.gte.${studentCount},max_students.eq.-1`)
        .order('min_students', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as PricingTier | null;
    },
    enabled: !!planId && !!ownershipType && studentCount > 0,
  });
}

export function useUpdatePricingTier() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (tier: Partial<PricingTier> & { id: string }) => {
      const { id, ...updates } = tier;
      const { data, error } = await supabase
        .from('subscription_tier_pricing')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-tiers'] });
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

export function useCreatePricingTier() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (tier: Omit<PricingTier, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await (supabase
        .from('subscription_tier_pricing')
        .insert(tier as any)
        .select()
        .single());
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-tiers'] });
      toast({
        title: 'Success',
        description: 'Pricing tier created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create pricing tier',
        variant: 'destructive',
      });
      console.error('Create tier error:', error);
    },
  });
}

export function useDeletePricingTier() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subscription_tier_pricing')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-tiers'] });
      toast({
        title: 'Success',
        description: 'Pricing tier deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete pricing tier',
        variant: 'destructive',
      });
      console.error('Delete tier error:', error);
    },
  });
}
