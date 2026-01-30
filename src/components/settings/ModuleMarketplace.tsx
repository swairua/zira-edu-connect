import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Check, 
  Plus, 
  Phone,
  Loader2,
  Sparkles,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { useAvailableModules, useInstitutionBilling, useInitiateSubscriptionPayment } from '@/hooks/useInstitutionBilling';
import { useInstitution } from '@/contexts/InstitutionContext';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { MODULE_CATALOG } from '@/lib/subscription-catalog';
import { getBillingCycleShort } from '@/hooks/useBillingSettings';

type BillingCycle = 'monthly' | 'termly' | 'annual';

interface ModuleMarketplaceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModuleMarketplace({ open, onOpenChange }: ModuleMarketplaceProps) {
  const { institutionId } = useInstitution();
  const { data: billing } = useInstitutionBilling(institutionId);
  const { data: modules, isLoading } = useAvailableModules();
  const initiatePayment = useInitiateSubscriptionPayment();

  const [selectedModule, setSelectedModule] = useState<typeof modules extends (infer T)[] ? T : never | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const enabledModules = billing?.enabledModules || [];
  const includedModules = billing?.currentPlan?.modules || [];
  const billingCycle: BillingCycle = (billing?.subscription?.billingCycle as BillingCycle) || 'annual';

  // Get the correct price based on the institution's billing cycle
  const getModulePrice = (module: NonNullable<typeof modules>[number]): number => {
    switch (billingCycle) {
      case 'monthly':
        return module.base_monthly_price;
      case 'termly':
        return (module as any).base_termly_price || module.base_monthly_price * 4 * 0.9;
      case 'annual':
        return (module as any).base_annual_price || module.base_monthly_price * 12 * 0.8;
      default:
        return module.base_monthly_price;
    }
  };

  const getBillingCycleLabel = (): string => {
    return getBillingCycleShort(billingCycle);
  };

  const handlePurchaseModule = async () => {
    if (!selectedModule || !institutionId || !phoneNumber) return;

    const price = getModulePrice(selectedModule);

    await initiatePayment.mutateAsync({
      institutionId,
      paymentType: 'addon_purchase',
      amount: price,
      phoneNumber,
      moduleId: selectedModule.module_id,
    });

    setShowPaymentDialog(false);
    setSelectedModule(null);
    setPhoneNumber('');
    onOpenChange(false);
  };

  const handleSelectModule = (module: NonNullable<typeof modules>[number]) => {
    setSelectedModule(module);
    setShowPaymentDialog(true);
  };

  const coreModules = modules?.filter(m => m.tier === 'core') || [];
  const addonModules = modules?.filter(m => m.tier === 'addon') || [];
  const premiumModules = modules?.filter(m => m.tier === 'premium') || [];

  const renderModuleCard = (module: NonNullable<typeof modules>[number]) => {
    const isEnabled = enabledModules.includes(module.module_id);
    const isIncluded = includedModules.includes(module.module_id);
    const catalogEntry = MODULE_CATALOG[module.module_id as keyof typeof MODULE_CATALOG];
    const Icon = catalogEntry?.icon || Package;

    return (
      <Card 
        key={module.id} 
        className={cn(
          "relative transition-all",
          isEnabled && "border-primary/50 bg-primary/5"
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                isEnabled ? "bg-primary/10" : "bg-muted"
              )}>
                <Icon className={cn(
                  "h-5 w-5",
                  isEnabled ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <CardTitle className="text-base">{module.display_name}</CardTitle>
                <Badge variant="outline" className="mt-1">
                  {module.tier}
                </Badge>
              </div>
            </div>
            {isEnabled ? (
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active
              </Badge>
            ) : isIncluded ? (
              <Badge variant="secondary">
                <Lock className="h-3 w-3 mr-1" />
                Plan Feature
              </Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {module.description || catalogEntry?.description}
          </p>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-semibold">
                KES {getModulePrice(module).toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">/{getBillingCycleLabel()}</span>
            </div>
            
            {!isEnabled && !isIncluded && (
              <Button 
                size="sm" 
                onClick={() => handleSelectModule(module)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Module Marketplace
            </DialogTitle>
            <DialogDescription>
              Extend your institution's capabilities with add-on modules
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <Skeleton className="h-5 w-32 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All Modules</TabsTrigger>
                <TabsTrigger value="core">Core</TabsTrigger>
                <TabsTrigger value="addon">Add-ons</TabsTrigger>
                <TabsTrigger value="premium">Premium</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-6">
                {coreModules.length > 0 && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-3">CORE MODULES</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {coreModules.map(renderModuleCard)}
                    </div>
                  </div>
                )}
                {addonModules.length > 0 && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-3">ADD-ON MODULES</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {addonModules.map(renderModuleCard)}
                    </div>
                  </div>
                )}
                {premiumModules.length > 0 && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-warning" />
                      PREMIUM MODULES
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {premiumModules.map(renderModuleCard)}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="core">
                <div className="grid gap-4 md:grid-cols-2">
                  {coreModules.map(renderModuleCard)}
                </div>
              </TabsContent>

              <TabsContent value="addon">
                <div className="grid gap-4 md:grid-cols-2">
                  {addonModules.map(renderModuleCard)}
                </div>
              </TabsContent>

              <TabsContent value="premium">
                <div className="grid gap-4 md:grid-cols-2">
                  {premiumModules.map(renderModuleCard)}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Module</DialogTitle>
            <DialogDescription>
              Complete payment to activate {selectedModule?.display_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex justify-between">
                <span>{selectedModule?.display_name}</span>
                <span className="font-medium">
                  KES {selectedModule ? getModulePrice(selectedModule).toLocaleString() : 0}/{getBillingCycleLabel()}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="module-phone">M-PESA Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="module-phone"
                  placeholder="254712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePurchaseModule}
              disabled={!phoneNumber || initiatePayment.isPending}
            >
              {initiatePayment.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                `Pay KES ${selectedModule ? getModulePrice(selectedModule).toLocaleString() : 0}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
