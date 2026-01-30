import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useModuleWithConfig } from '@/hooks/useModuleConfig';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Package,
  Zap,
  Crown,
  GraduationCap,
  Wallet,
  Library,
  Bus,
  Home,
  Trophy,
  Shirt,
  CalendarDays,
  MessageSquare,
  Users,
  BarChart3,
  AlertCircle,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const MODULE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  academics: GraduationCap,
  finance: Wallet,
  library: Library,
  transport: Bus,
  hostel: Home,
  activities: Trophy,
  uniforms: Shirt,
  timetable: CalendarDays,
  communication: MessageSquare,
  hr: Users,
  reports: BarChart3,
};

const TIER_CONFIG = {
  core: { label: 'Core', variant: 'default' as const, icon: Package },
  addon: { label: 'Add-on', variant: 'secondary' as const, icon: Zap },
  premium: { label: 'Premium', variant: 'outline' as const, icon: Crown },
};

export function InstitutionModuleSettings() {
  const { institution, institutionId } = useInstitution();
  const { modules, isLoading: modulesLoading } = useModuleWithConfig(institutionId);
  const queryClient = useQueryClient();
  const [togglingModule, setTogglingModule] = useState<string | null>(null);

  // Toggle module for institution
  const toggleModule = useMutation({
    mutationFn: async ({ moduleId, disabled }: { moduleId: string; disabled: boolean }) => {
      setTogglingModule(moduleId);
      
      // Check if config exists
      const { data: existing } = await supabase
        .from('institution_module_config')
        .select('id')
        .eq('institution_id', institutionId!)
        .eq('module_id', moduleId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('institution_module_config')
          .update({ 
            is_institution_disabled: disabled,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('institution_module_config')
          .insert({
            institution_id: institutionId!,
            module_id: moduleId,
            is_enabled: true,
            is_institution_disabled: disabled,
          });
        if (error) throw error;
      }

      // Log to audit
      await supabase.from('audit_logs').insert({
        action: disabled ? 'module.institution_disabled' : 'module.institution_enabled',
        entity_type: 'institution_module_config',
        entity_id: moduleId,
        institution_id: institutionId,
        metadata: { module_id: moduleId },
      });
    },
    onSuccess: (_, { disabled }) => {
      queryClient.invalidateQueries({ queryKey: ['institution-module-config'] });
      queryClient.invalidateQueries({ queryKey: ['institution-module-config-disabled'] });
      queryClient.invalidateQueries({ queryKey: ['modules-with-config'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-limits'] });
      toast.success(disabled ? 'Module hidden from your institution' : 'Module enabled for your institution');
      setTogglingModule(null);
    },
    onError: (error: Error) => {
      console.error('Module toggle error:', error);
      if (error.message.includes('violates row-level security')) {
        toast.error('Permission denied', { 
          description: 'You do not have permission to change module settings. Contact your institution owner.' 
        });
      } else {
        toast.error('Failed to update module', { description: error.message });
      }
      setTogglingModule(null);
    },
  });

  // Get enabled modules from institution's legacy plan array
  const enabledModules = institution?.enabled_modules || [];

  // Show modules that are:
  // 1. Core tier (always available to all institutions regardless of plan)
  // 2. Included in the institution's plan (enabled_modules array)
  // 3. Already enabled in config (is_enabled = true)
  const availableModules = modules?.filter(m => {
    // Core tier modules are always available to all institutions
    if (m.tier === 'core') return true;
    // Check if module is in institution's enabled_modules or already activated
    return enabledModules.includes(m.module_id) || m.is_enabled;
  }) || [];

  if (modulesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Module Settings</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Module Settings</CardTitle>
            <CardDescription>
              Toggle modules on or off for your institution. Disabled modules will be hidden from the sidebar.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Disabling a module only hides it from your institution. It does not affect your subscription or billing.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          {availableModules.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No modules available in your current plan.
            </p>
          ) : (
            availableModules.map((module) => {
              const Icon = MODULE_ICONS[module.module_id] || Package;
              const tierConfig = TIER_CONFIG[module.tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.addon;
              const isDisabled = module.is_institution_disabled ?? false;
              const isToggling = togglingModule === module.module_id;

              return (
                <div
                  key={module.module_id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{module.display_name}</p>
                        <Badge variant={tierConfig.variant} className="text-xs">
                          {tierConfig.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {module.description || 'No description available'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {isDisabled ? 'Hidden' : 'Visible'}
                    </span>
                    <Switch
                      checked={!isDisabled}
                      onCheckedChange={(checked) => 
                        toggleModule.mutate({ moduleId: module.module_id, disabled: !checked })
                      }
                      disabled={isToggling}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
