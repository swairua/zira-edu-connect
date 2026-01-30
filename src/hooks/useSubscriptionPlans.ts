import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logAuditEvent } from '@/hooks/useAuditLogs';
import type { Database } from '@/integrations/supabase/types';

type SubscriptionPlanRow = Database['public']['Tables']['subscription_plans']['Row'];
type SubscriptionPlanInsert = Database['public']['Tables']['subscription_plans']['Insert'];
type SubscriptionPlanUpdate = Database['public']['Tables']['subscription_plans']['Update'];

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  max_students: number;
  max_staff: number;
  features: string[];
  modules: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlanRevenueStats {
  plan_id: string;
  plan_name: string;
  institution_count: number;
  monthly_revenue: number;
  color: string;
}

const PLAN_COLORS: Record<string, string> = {
  starter: 'bg-muted',
  professional: 'bg-primary',
  enterprise: 'bg-secondary',
  custom: 'bg-info',
};

function transformPlan(row: SubscriptionPlanRow): SubscriptionPlan {
  return {
    ...row,
    features: Array.isArray(row.features) ? row.features as string[] : [],
    modules: Array.isArray(row.modules) ? row.modules as string[] : [],
  };
}

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_monthly', { ascending: true });

      if (error) throw error;
      return (data || []).map(transformPlan);
    },
  });
}

export function useSubscriptionPlan(id: string) {
  return useQuery({
    queryKey: ['subscription-plan', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', id as any)
        .single();

      if (error) throw error;
      return transformPlan(data);
    },
    enabled: !!id,
  });
}

export function usePlanRevenueStats() {
  return useQuery({
    queryKey: ['plan-revenue-stats'],
    queryFn: async () => {
      // Get all plans
      const { data: plans, error: plansError } = await supabase
        .from('subscription_plans')
        .select('id, name, price_monthly')
        .eq('is_active', true);

      if (plansError) throw plansError;

      // Get institution counts per plan
      const { data: institutionCounts, error: countError } = await supabase
        .from('institutions')
        .select('subscription_plan')
        .eq('status', 'active');

      if (countError) throw countError;

      // Calculate stats
      const stats: PlanRevenueStats[] = (plans || []).map((plan) => {
        const count = (institutionCounts || []).filter(
          (i) => i.subscription_plan === plan.id
        ).length;
        
        return {
          plan_id: plan.id,
          plan_name: plan.name,
          institution_count: count,
          monthly_revenue: count * plan.price_monthly,
          color: PLAN_COLORS[plan.id] || 'bg-muted',
        };
      });

      return stats.sort((a, b) => b.monthly_revenue - a.monthly_revenue);
    },
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (plan: { 
      id: string; 
      name: string; 
      description: string | null;
      price_monthly: number;
      price_yearly: number;
      currency: string;
      max_students: number;
      max_staff: number;
      features: string[];
      modules: string[];
      is_active: boolean;
    }) => {
      const insertData: SubscriptionPlanInsert = {
        id: plan.id as any,
        name: plan.name,
        description: plan.description,
        price_monthly: plan.price_monthly,
        price_yearly: plan.price_yearly,
        currency: plan.currency,
        max_students: plan.max_students,
        max_staff: plan.max_staff,
        features: plan.features,
        modules: plan.modules,
        is_active: plan.is_active,
      };

      const { data, error } = await supabase
        .from('subscription_plans')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      
      await logAuditEvent({
        action: 'subscription_plan.created',
        entityType: 'subscription_plan',
        entityId: data.id,
        metadata: { planName: plan.name, priceMonthly: plan.price_monthly },
      });

      return transformPlan(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast({
        title: 'Plan created',
        description: 'The subscription plan has been created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating plan',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SubscriptionPlan> & { id: string }) => {
      const { data: oldData } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', id as any)
        .single();

      const updateData: SubscriptionPlanUpdate = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('subscription_plans')
        .update(updateData)
        .eq('id', id as any)
        .select()
        .single();

      if (error) throw error;

      await logAuditEvent({
        action: 'subscription_plan.updated',
        entityType: 'subscription_plan',
        entityId: id,
        metadata: { 
          planName: data.name,
          changes: Object.keys(updates),
          oldValues: oldData,
          newValues: data,
        },
      });

      return transformPlan(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      queryClient.invalidateQueries({ queryKey: ['plan-revenue-stats'] });
      toast({
        title: 'Plan updated',
        description: 'The subscription plan has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating plan',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useTogglePlanActive() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      // Check if any institutions are using this plan before deactivating
      if (!is_active) {
        const { count } = await supabase
          .from('institutions')
          .select('*', { count: 'exact', head: true })
          .eq('subscription_plan', id as any)
          .eq('status', 'active');

        if (count && count > 0) {
          throw new Error(`Cannot deactivate plan: ${count} active institution(s) are using it`);
        }
      }

      const { data, error } = await supabase
        .from('subscription_plans')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id as any)
        .select()
        .single();

      if (error) throw error;

      await logAuditEvent({
        action: is_active ? 'subscription_plan.activated' : 'subscription_plan.deactivated',
        entityType: 'subscription_plan',
        entityId: id,
        metadata: { planName: data.name },
      });

      return transformPlan(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast({
        title: variables.is_active ? 'Plan activated' : 'Plan deactivated',
        description: `The subscription plan has been ${variables.is_active ? 'activated' : 'deactivated'}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useInstitutionCountByPlan(planId: string) {
  return useQuery({
    queryKey: ['institution-count', planId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('institutions')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_plan', planId as any);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!planId,
  });
}
