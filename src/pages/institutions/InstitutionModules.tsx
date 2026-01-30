import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Building2, AlertCircle } from "lucide-react";
import { ModuleCard } from "@/components/modules/ModuleCard";
import { ModuleActivationDialog } from "@/components/modules/ModuleActivationDialog";
import { ModuleAuditLog } from "@/components/modules/ModuleAuditLog";
import { useModuleWithConfig, useManageModule, ModulePricing } from "@/hooks/useModuleConfig";
import { useAuth } from "@/hooks/useAuth";

// Dependencies and dependents maps for validation
const DEPENDENT_MODULES: Record<string, string[]> = {
  academics: ["library", "activities", "timetable"],
  finance: ["transport", "hostel", "uniforms"],
};

export default function InstitutionModules() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const { modules, isLoading: modulesLoading } = useModuleWithConfig(id);
  const manageModule = useManageModule();

  const [dialogState, setDialogState] = useState<{
    open: boolean;
    module: (ModulePricing & { is_enabled: boolean }) | null;
    action: "activate" | "deactivate";
  }>({
    open: false,
    module: null,
    action: "activate",
  });

  const [pendingModuleId, setPendingModuleId] = useState<string | null>(null);

  // Fetch institution details
  const { data: institution, isLoading: institutionLoading } = useQuery({
    queryKey: ["institution", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("institutions")
        .select("id, name, enabled_modules")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleToggle = (module: ModulePricing & { is_enabled: boolean }) => {
    const action = module.is_enabled ? "deactivate" : "activate";
    setDialogState({
      open: true,
      module,
      action,
    });
  };

  const handleConfirm = async (reason: string, activationType: "plan_included" | "manual" | "addon" | "trial") => {
    if (!dialogState.module || !id) return;

    setPendingModuleId(dialogState.module.module_id);
    setDialogState({ open: false, module: null, action: "activate" });

    try {
      await manageModule.mutateAsync({
        institutionId: id,
        moduleId: dialogState.module.module_id,
        action: dialogState.action,
        reason,
        activationType,
      });
    } finally {
      setPendingModuleId(null);
    }
  };

  // Check for missing dependencies
  const getMissingDependencies = (module: ModulePricing & { is_enabled: boolean }) => {
    if (!module.requires_modules || module.requires_modules.length === 0) return [];
    
    const enabledModuleIds = modules
      .filter((m) => m.is_enabled)
      .map((m) => m.module_id);

    return module.requires_modules.filter((dep) => !enabledModuleIds.includes(dep));
  };

  // Get dependent modules for deactivation warning
  const getDependentModules = (moduleId: string) => {
    const dependents = DEPENDENT_MODULES[moduleId] || [];
    return dependents.filter((dep) => 
      modules.find((m) => m.module_id === dep && m.is_enabled)
    );
  };

  if (!isSuperAdmin) {
    return (
      <DashboardLayout 
        title="Access Denied" 
        subtitle="Only Super Admins can manage modules"
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to manage modules. Please contact a Super Admin.
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  const isLoading = modulesLoading || institutionLoading;

  // Separate modules by tier
  const coreModules = modules.filter((m) => m.tier === "core");
  const addonModules = modules.filter((m) => m.tier === "addon");
  const premiumModules = modules.filter((m) => m.tier === "premium");

  const pageTitle = `${institution?.name || "Institution"} - Modules`;

  return (
    <DashboardLayout
      title={pageTitle}
      subtitle="Manage module activation and access for this institution"
    >
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/institutions")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Institutions
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Core Modules */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Core Modules</h3>
              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-40" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {coreModules.map((module) => (
                    <ModuleCard
                      key={module.module_id}
                      moduleId={module.module_id}
                      displayName={module.display_name}
                      description={module.description}
                      tier={module.tier}
                      price={module.base_monthly_price}
                      currency={module.currency}
                      requiresModules={module.requires_modules}
                      isEnabled={module.is_enabled}
                      activationType={module.activation_type}
                      expiresAt={module.expires_at}
                      onToggle={() => handleToggle(module)}
                      isLoading={pendingModuleId === module.module_id}
                      missingDependencies={getMissingDependencies(module)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Add-on Modules */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Add-on Modules</h3>
              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-40" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {addonModules.map((module) => (
                    <ModuleCard
                      key={module.module_id}
                      moduleId={module.module_id}
                      displayName={module.display_name}
                      description={module.description}
                      tier={module.tier}
                      price={module.base_monthly_price}
                      currency={module.currency}
                      requiresModules={module.requires_modules}
                      isEnabled={module.is_enabled}
                      activationType={module.activation_type}
                      expiresAt={module.expires_at}
                      onToggle={() => handleToggle(module)}
                      isLoading={pendingModuleId === module.module_id}
                      missingDependencies={getMissingDependencies(module)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Premium Modules */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Premium Modules</h3>
              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <Skeleton className="h-40" />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {premiumModules.map((module) => (
                    <ModuleCard
                      key={module.module_id}
                      moduleId={module.module_id}
                      displayName={module.display_name}
                      description={module.description}
                      tier={module.tier}
                      price={module.base_monthly_price}
                      currency={module.currency}
                      requiresModules={module.requires_modules}
                      isEnabled={module.is_enabled}
                      activationType={module.activation_type}
                      expiresAt={module.expires_at}
                      onToggle={() => handleToggle(module)}
                      isLoading={pendingModuleId === module.module_id}
                      missingDependencies={getMissingDependencies(module)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Audit Log Sidebar */}
          <div>
            {id && <ModuleAuditLog institutionId={id} />}
          </div>
        </div>

        {/* Activation Dialog */}
        {dialogState.module && (
          <ModuleActivationDialog
            open={dialogState.open}
            onOpenChange={(open) => setDialogState((s) => ({ ...s, open }))}
            moduleName={dialogState.module.display_name}
            moduleId={dialogState.module.module_id}
            action={dialogState.action}
            tier={dialogState.module.tier}
            price={dialogState.module.base_monthly_price}
            currency={dialogState.module.currency}
            dependentModules={getDependentModules(dialogState.module.module_id)}
            onConfirm={handleConfirm}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
