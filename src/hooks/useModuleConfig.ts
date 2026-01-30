import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface ModulePricing {
  id: string;
  module_id: string;
  display_name: string;
  description: string | null;
  base_monthly_price: number;
  currency: string;
  tier: "core" | "addon" | "premium";
  requires_modules: string[];
  is_active: boolean;
}

export interface ModuleConfig {
  id: string;
  institution_id: string;
  module_id: string;
  is_enabled: boolean;
  activation_type: "plan_included" | "manual" | "addon" | "trial";
  custom_settings: Record<string, unknown>;
  activated_at: string | null;
  activated_by: string | null;
  expires_at: string | null;
  is_institution_disabled?: boolean;
}

export interface ModuleActivationHistory {
  id: string;
  institution_id: string;
  module_id: string;
  action: string;
  previous_status: boolean | null;
  new_status: boolean | null;
  reason: string | null;
  activated_by: string | null;
  billing_tier: string | null;
  monthly_price: number;
  effective_from: string;
  created_at: string;
}

export function useModulePricing() {
  return useQuery({
    queryKey: ["module-pricing"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("module_pricing")
        .select("*")
        .eq("is_active", true)
        .order("tier", { ascending: true })
        .order("display_name", { ascending: true });

      if (error) throw error;
      return data as ModulePricing[];
    },
  });
}

export function useInstitutionModuleConfig(institutionId: string | undefined) {
  return useQuery({
    queryKey: ["institution-module-config", institutionId],
    queryFn: async () => {
      if (!institutionId) return [];

      const { data, error } = await supabase
        .from("institution_module_config")
        .select("*")
        .eq("institution_id", institutionId);

      if (error) throw error;
      return data as ModuleConfig[];
    },
    enabled: !!institutionId,
  });
}

export function useModuleActivationHistory(institutionId: string | undefined) {
  return useQuery({
    queryKey: ["module-activation-history", institutionId],
    queryFn: async () => {
      if (!institutionId) return [];

      const { data, error } = await supabase
        .from("module_activation_history")
        .select("*")
        .eq("institution_id", institutionId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as ModuleActivationHistory[];
    },
    enabled: !!institutionId,
  });
}

export function useManageModule() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: async ({
      institutionId,
      moduleId,
      action,
      reason,
      activationType,
      expiresAt,
    }: {
      institutionId: string;
      moduleId: string;
      action: "activate" | "deactivate";
      reason?: string;
      activationType?: "plan_included" | "manual" | "addon" | "trial";
      expiresAt?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("manage-modules", {
        body: {
          institution_id: institutionId,
          module_id: moduleId,
          action,
          reason,
          activation_type: activationType,
          expires_at: expiresAt,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["institution-module-config", variables.institutionId] });
      queryClient.invalidateQueries({ queryKey: ["module-activation-history", variables.institutionId] });
      queryClient.invalidateQueries({ queryKey: ["institutions"] });
      queryClient.invalidateQueries({ queryKey: ["institution", variables.institutionId] });
      queryClient.invalidateQueries({ queryKey: ["institution-counts", variables.institutionId] });
      toast.success(`Module ${variables.action}d successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useModuleWithConfig(institutionId: string | undefined) {
  const { data: pricing, isLoading: pricingLoading } = useModulePricing();
  const { data: config, isLoading: configLoading } = useInstitutionModuleConfig(institutionId);

  const modulesWithStatus = pricing?.map((module) => {
    const moduleConfig = config?.find((c) => c.module_id === module.module_id);
    return {
      ...module,
      is_enabled: moduleConfig?.is_enabled ?? false,
      activation_type: moduleConfig?.activation_type ?? null,
      activated_at: moduleConfig?.activated_at ?? null,
      expires_at: moduleConfig?.expires_at ?? null,
      is_institution_disabled: moduleConfig?.is_institution_disabled ?? false,
    };
  });

  return {
    modules: modulesWithStatus ?? [],
    isLoading: pricingLoading || configLoading,
  };
}
