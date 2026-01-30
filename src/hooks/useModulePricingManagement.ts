import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface ModulePricingData {
  id: string;
  module_id: string;
  display_name: string;
  description: string | null;
  base_monthly_price: number;
  base_termly_price: number;
  base_annual_price: number;
  currency: string;
  tier: string;
  requires_modules: string[] | null;
  max_usage_limit: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // For bulk tier toggle
  original_tier?: string | null;
  original_monthly_price?: number | null;
  original_termly_price?: number | null;
  original_annual_price?: number | null;
}

export interface ModuleUsageStats {
  module_id: string;
  enabled_count: number;
}

export function useModulePricingManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch all module pricing data
  const { data: modules, isLoading, error } = useQuery({
    queryKey: ['module-pricing-management'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('module_pricing')
        .select('*')
        .order('tier', { ascending: true })
        .order('display_name', { ascending: true });

      if (error) throw error;
      return data as ModulePricingData[];
    },
  });

  // Fetch usage stats (how many institutions have each module enabled)
  const { data: usageStats } = useQuery({
    queryKey: ['module-usage-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('institution_module_config')
        .select('module_id')
        .eq('is_enabled', true);

      if (error) throw error;

      // Count by module_id
      const counts: Record<string, number> = {};
      data.forEach((row) => {
        counts[row.module_id] = (counts[row.module_id] || 0) + 1;
      });

      return counts;
    },
  });

  // Update module pricing
  const updateModule = useMutation({
    mutationFn: async (updates: Partial<ModulePricingData> & { id: string }) => {
      const { id, ...data } = updates;
      
      const { error } = await supabase
        .from('module_pricing')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      // Log to audit
      await supabase.from('audit_logs').insert({
        action: 'module_pricing.updated',
        entity_type: 'module_pricing',
        entity_id: id,
        user_id: user?.id,
        user_email: user?.email,
        new_values: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module-pricing-management'] });
      queryClient.invalidateQueries({ queryKey: ['module-pricing'] });
      toast({ title: 'Module updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update module', description: error.message, variant: 'destructive' });
    },
  });

  // Create new module
  const createModule = useMutation({
    mutationFn: async (data: Omit<ModulePricingData, 'id' | 'created_at' | 'updated_at'>) => {
      const { error, data: created } = await supabase
        .from('module_pricing')
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      // Log to audit
      await supabase.from('audit_logs').insert({
        action: 'module_pricing.created',
        entity_type: 'module_pricing',
        entity_id: created.id,
        user_id: user?.id,
        user_email: user?.email,
        new_values: data,
      });

      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module-pricing-management'] });
      queryClient.invalidateQueries({ queryKey: ['module-pricing'] });
      toast({ title: 'Module created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create module', description: error.message, variant: 'destructive' });
    },
  });

  // Deactivate module (soft delete)
  const deactivateModule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('module_pricing')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      // Log to audit
      await supabase.from('audit_logs').insert({
        action: 'module_pricing.deactivated',
        entity_type: 'module_pricing',
        entity_id: id,
        user_id: user?.id,
        user_email: user?.email,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module-pricing-management'] });
      queryClient.invalidateQueries({ queryKey: ['module-pricing'] });
      toast({ title: 'Module deactivated' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to deactivate module', description: error.message, variant: 'destructive' });
    },
  });

  // Calculate tier summaries
  const tierSummary = modules?.reduce(
    (acc, mod) => {
      if (!mod.is_active) return acc;
      
      if (mod.tier === 'core') {
        acc.core.count++;
      } else if (mod.tier === 'addon') {
        acc.addon.count++;
        acc.addon.totalPrice += mod.base_monthly_price;
      } else if (mod.tier === 'premium') {
        acc.premium.count++;
        acc.premium.totalPrice += mod.base_monthly_price;
      }
      return acc;
    },
    {
      core: { count: 0, totalPrice: 0 },
      addon: { count: 0, totalPrice: 0 },
      premium: { count: 0, totalPrice: 0 },
    }
  );

  // Check if all modules are core (competitive mode active)
  const allAreCore = modules?.every(m => m.tier === 'core') ?? false;
  const anyHasOriginalTier = modules?.some(m => m.original_tier) ?? false;

  // Set all modules to core tier (competitive mode)
  const setAllCore = useMutation({
    mutationFn: async () => {
      // Refetch modules to ensure we have latest data
      const { data: currentModules, error: fetchError } = await supabase
        .from('module_pricing')
        .select('*')
        .eq('is_active', true);
      
      if (fetchError) throw fetchError;
      
      const modulesToUpdate = currentModules?.filter(m => m.tier !== 'core') || [];
      
      if (modulesToUpdate.length === 0) {
        throw new Error('No modules to update - all are already core tier');
      }
      
      // Update each module
      for (const mod of modulesToUpdate) {
        const { error: updateError } = await supabase
          .from('module_pricing')
          .update({
            original_tier: mod.tier,
            original_monthly_price: mod.base_monthly_price,
            original_termly_price: mod.base_termly_price,
            original_annual_price: mod.base_annual_price,
            tier: 'core',
            base_monthly_price: 0,
            base_termly_price: 0,
            base_annual_price: 0,
            updated_at: new Date().toISOString(),
          })
          .eq('id', mod.id);
        
        if (updateError) throw updateError;
      }

      // Log to audit
      await supabase.from('audit_logs').insert({
        action: 'module_pricing.bulk_set_core',
        entity_type: 'module_pricing',
        user_id: user?.id,
        user_email: user?.email,
        metadata: { modules_affected: modulesToUpdate.length },
      });
      
      return { updated: modulesToUpdate.length };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['module-pricing-management'] });
      queryClient.invalidateQueries({ queryKey: ['module-pricing'] });
      toast({ 
        title: 'All modules set to Core', 
        description: `${result?.updated || 0} modules are now free - competitive mode activated` 
      });
    },
    onError: (error: Error) => {
      console.error('Set all core error:', error);
      toast({ title: 'Failed to update modules', description: error.message, variant: 'destructive' });
    },
  });

  // Restore original tiers
  const restoreOriginalTiers = useMutation({
    mutationFn: async () => {
      // Refetch modules to ensure we have latest data
      const { data: currentModules, error: fetchError } = await supabase
        .from('module_pricing')
        .select('*')
        .not('original_tier', 'is', null);
      
      if (fetchError) throw fetchError;
      
      if (!currentModules || currentModules.length === 0) {
        throw new Error('No modules to restore - no original tiers saved');
      }
      
      for (const mod of currentModules) {
        const { error: updateError } = await supabase
          .from('module_pricing')
          .update({
            tier: mod.original_tier,
            base_monthly_price: mod.original_monthly_price || 0,
            base_termly_price: mod.original_termly_price || 0,
            base_annual_price: mod.original_annual_price || 0,
            original_tier: null,
            original_monthly_price: null,
            original_termly_price: null,
            original_annual_price: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', mod.id);
        
        if (updateError) throw updateError;
      }

      // Log to audit
      await supabase.from('audit_logs').insert({
        action: 'module_pricing.bulk_restore_tiers',
        entity_type: 'module_pricing',
        user_id: user?.id,
        user_email: user?.email,
        metadata: { modules_affected: currentModules.length },
      });
      
      return { restored: currentModules.length };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['module-pricing-management'] });
      queryClient.invalidateQueries({ queryKey: ['module-pricing'] });
      toast({ 
        title: 'Original tiers restored', 
        description: `${result?.restored || 0} modules restored to previous pricing` 
      });
    },
    onError: (error: Error) => {
      console.error('Restore tiers error:', error);
      toast({ title: 'Failed to restore tiers', description: error.message, variant: 'destructive' });
    },
  });

  return {
    modules,
    isLoading,
    error,
    usageStats,
    tierSummary,
    allAreCore,
    anyHasOriginalTier,
    updateModule,
    createModule,
    deactivateModule,
    setAllCore,
    restoreOriginalTiers,
  };
}
