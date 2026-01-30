import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { useModulePricingManagement, ModulePricingData } from '@/hooks/useModulePricingManagement';
import { EditModulePricingDialog } from '@/components/modules/EditModulePricingDialog';
import { CreateModuleDialog } from '@/components/modules/CreateModuleDialog';
import {
  Package,
  Crown,
  Zap,
  Plus,
  Pencil,
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
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  addon: { label: 'Addon', variant: 'secondary' as const, icon: Zap },
  premium: { label: 'Premium', variant: 'outline' as const, icon: Crown },
};

export default function ModuleCatalog() {
  const { isSuperAdmin } = useAuth();
  const {
    modules,
    isLoading,
    usageStats,
    tierSummary,
    allAreCore,
    anyHasOriginalTier,
    updateModule,
    createModule,
    setAllCore,
    restoreOriginalTiers,
  } = useModulePricingManagement();

  const [editingModule, setEditingModule] = useState<ModulePricingData | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSetCoreDialog, setShowSetCoreDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);

  if (!isSuperAdmin) {
    return (
      <DashboardLayout title="Access Denied">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Only Super Admins can access Module Catalog.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const handleSaveModule = (updates: Partial<ModulePricingData> & { id: string }) => {
    updateModule.mutate(updates, {
      onSuccess: () => setEditingModule(null),
    });
  };

  const handleCreateModule = (data: Omit<ModulePricingData, 'id' | 'created_at' | 'updated_at'>) => {
    createModule.mutate(data, {
      onSuccess: () => setShowCreateDialog(false),
    });
  };

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free';
    return `${currency} ${price.toLocaleString()}`;
  };

  const handleSetAllCore = () => {
    setAllCore.mutate(undefined, {
      onSuccess: () => setShowSetCoreDialog(false),
    });
  };

  const handleRestoreTiers = () => {
    restoreOriginalTiers.mutate(undefined, {
      onSuccess: () => setShowRestoreDialog(false),
    });
  };

  return (
    <DashboardLayout
      title="Module Catalog"
      subtitle="Manage module definitions, pricing, and dependencies"
    >
      <div className="space-y-6">
        {/* Competitive Mode Banner */}
        {allAreCore && anyHasOriginalTier && (
          <div className="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    Competitive Mode Active
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    All modules are currently free for all institutions
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRestoreDialog(true)}
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Restore Pricing
              </Button>
            </div>
          </div>
        )}
        {/* Tier Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Core Modules</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{tierSummary?.core.count || 0}</div>
                  <p className="text-xs text-muted-foreground">Always included in plans</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Addon Modules</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{tierSummary?.addon.count || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Total value: KES {tierSummary?.addon.totalPrice.toLocaleString() || 0}/mo
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Premium Modules</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{tierSummary?.premium.count || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Total value: KES {tierSummary?.premium.totalPrice.toLocaleString() || 0}/mo
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Module Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Modules</CardTitle>
            <div className="flex gap-2">
              {!allAreCore && (
                <Button
                  variant="outline"
                  onClick={() => setShowSetCoreDialog(true)}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Set All Core
                </Button>
              )}
              {anyHasOriginalTier && !allAreCore && (
                <Button
                  variant="outline"
                  onClick={() => setShowRestoreDialog(true)}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restore Tiers
                </Button>
              )}
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Module
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Dependencies</TableHead>
                    <TableHead className="text-center">Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules?.map((mod) => {
                    const Icon = MODULE_ICONS[mod.module_id] || Package;
                    const tierConfig = TIER_CONFIG[mod.tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.addon;
                    const usage = usageStats?.[mod.module_id] || 0;

                    return (
                      <TableRow key={mod.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">{mod.display_name}</p>
                              <p className="text-xs text-muted-foreground">{mod.module_id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={tierConfig.variant}>{tierConfig.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {formatPrice(mod.base_monthly_price, mod.currency)}
                          </span>
                          {mod.base_monthly_price > 0 && (
                            <span className="text-xs text-muted-foreground">/mo</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {mod.requires_modules && mod.requires_modules.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {mod.requires_modules.map((dep) => (
                                <Badge key={dep} variant="outline" className="text-xs">
                                  {dep}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{usage}</Badge>
                        </TableCell>
                        <TableCell>
                          {mod.is_active ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge variant="destructive">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingModule(mod)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <EditModulePricingDialog
        open={!!editingModule}
        onOpenChange={(open) => !open && setEditingModule(null)}
        module={editingModule}
        allModules={modules || []}
        onSave={handleSaveModule}
        isLoading={updateModule.isPending}
      />

      {/* Create Dialog */}
      <CreateModuleDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        allModules={modules || []}
        onCreate={handleCreateModule}
        isLoading={createModule.isPending}
      />

      {/* Set All Core Confirmation */}
      <AlertDialog open={showSetCoreDialog} onOpenChange={setShowSetCoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enable Competitive Mode?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                This will set <strong>all modules to Core tier</strong> with zero pricing.
                All institutions will immediately gain access to all modules for free.
              </p>
              <p className="text-amber-600 dark:text-amber-400">
                Original pricing will be saved and can be restored later.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSetAllCore}
              disabled={setAllCore.isPending}
            >
              {setAllCore.isPending ? 'Processing...' : 'Set All Core'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Tiers Confirmation */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Original Pricing?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                This will restore all modules to their <strong>original tiers and pricing</strong>.
              </p>
              <p className="text-amber-600 dark:text-amber-400">
                Institutions may lose access to modules not included in their subscription plan.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestoreTiers}
              disabled={restoreOriginalTiers.isPending}
            >
              {restoreOriginalTiers.isPending ? 'Processing...' : 'Restore Pricing'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
