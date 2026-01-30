import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface InstitutionCustomPricing {
  id: string;
  institution_id: string;
  custom_yearly_price: number | null;
  custom_monthly_price: number | null;
  custom_max_students: number | null;
  custom_max_staff: number | null;
  included_modules: string[] | null;
  discount_percentage: number;
  negotiation_notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ModulePricingOverride {
  id: string;
  institution_id: string;
  module_id: string;
  custom_price: number;
  reason: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

// Fetch custom pricing for an institution
export function useInstitutionCustomPricing(institutionId: string | undefined) {
  return useQuery({
    queryKey: ['institution-custom-pricing', institutionId],
    queryFn: async () => {
      if (!institutionId) return null;
      
      const { data, error } = await supabase
        .from('institution_custom_pricing')
        .select('*')
        .eq('institution_id', institutionId)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      return data as InstitutionCustomPricing | null;
    },
    enabled: !!institutionId,
  });
}

// Fetch all custom pricing (super admin)
export function useAllCustomPricing() {
  return useQuery({
    queryKey: ['all-custom-pricing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('institution_custom_pricing')
        .select(`
          *,
          institutions:institution_id (
            id,
            name,
            subscription_plan
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

// Fetch module pricing overrides for an institution
export function useModulePricingOverrides(institutionId: string | undefined) {
  return useQuery({
    queryKey: ['module-pricing-overrides', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      
      const { data, error } = await supabase
        .from('module_pricing_overrides')
        .select('*')
        .eq('institution_id', institutionId);
      
      if (error) throw error;
      return data as ModulePricingOverride[];
    },
    enabled: !!institutionId,
  });
}

// Create or update custom pricing
export function useSaveCustomPricing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (pricing: Partial<InstitutionCustomPricing> & { institution_id: string }) => {
      // First, deactivate any existing active pricing
      await supabase
        .from('institution_custom_pricing')
        .update({ is_active: false })
        .eq('institution_id', pricing.institution_id)
        .eq('is_active', true);
      
      // Create new pricing record
      const { data, error } = await supabase
        .from('institution_custom_pricing')
        .insert({
          institution_id: pricing.institution_id,
          custom_yearly_price: pricing.custom_yearly_price,
          custom_monthly_price: pricing.custom_monthly_price,
          custom_max_students: pricing.custom_max_students,
          custom_max_staff: pricing.custom_max_staff,
          included_modules: pricing.included_modules,
          discount_percentage: pricing.discount_percentage || 0,
          negotiation_notes: pricing.negotiation_notes,
          valid_from: pricing.valid_from || new Date().toISOString().split('T')[0],
          valid_until: pricing.valid_until,
          is_active: true,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Log audit
      await supabase.from('audit_logs').insert({
        action: 'CREATE',
        entity_type: 'institution_custom_pricing',
        entity_id: data.id,
        institution_id: pricing.institution_id,
        new_values: data,
      });
      
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['institution-custom-pricing', variables.institution_id] });
      queryClient.invalidateQueries({ queryKey: ['all-custom-pricing'] });
      toast.success('Custom pricing saved successfully');
    },
    onError: (error) => {
      toast.error('Failed to save custom pricing');
      console.error(error);
    },
  });
}

// Remove custom pricing
export function useRemoveCustomPricing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, institutionId }: { id: string; institutionId: string }) => {
      const { error } = await supabase
        .from('institution_custom_pricing')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
      
      // Log audit
      await supabase.from('audit_logs').insert({
        action: 'DELETE',
        entity_type: 'institution_custom_pricing',
        entity_id: id,
        institution_id: institutionId,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['institution-custom-pricing', variables.institutionId] });
      queryClient.invalidateQueries({ queryKey: ['all-custom-pricing'] });
      toast.success('Custom pricing removed');
    },
    onError: (error) => {
      toast.error('Failed to remove custom pricing');
      console.error(error);
    },
  });
}

// Save module pricing override
export function useSaveModulePricingOverride() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (override: { 
      institution_id: string; 
      module_id: string; 
      custom_price: number; 
      reason?: string 
    }) => {
      const { data, error } = await supabase
        .from('module_pricing_overrides')
        .upsert({
          institution_id: override.institution_id,
          module_id: override.module_id,
          custom_price: override.custom_price,
          reason: override.reason,
        }, {
          onConflict: 'institution_id,module_id',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['module-pricing-overrides', variables.institution_id] });
      toast.success('Module pricing override saved');
    },
    onError: (error) => {
      toast.error('Failed to save module pricing override');
      console.error(error);
    },
  });
}

// Remove module pricing override
export function useRemoveModulePricingOverride() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, institutionId }: { id: string; institutionId: string }) => {
      const { error } = await supabase
        .from('module_pricing_overrides')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['module-pricing-overrides', variables.institutionId] });
      toast.success('Module pricing override removed');
    },
    onError: (error) => {
      toast.error('Failed to remove override');
      console.error(error);
    },
  });
}
