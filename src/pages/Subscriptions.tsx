import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Package, Settings, Calculator, MessageSquare, DollarSign } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  useSubscriptionPlans, 
  usePlanRevenueStats,
} from '@/hooks/useSubscriptionPlans';
import { PlanRevenueChart } from '@/components/subscriptions/PlanRevenueChart';
import { ModulePricingTable } from '@/components/modules/ModulePricingTable';
import { BillingSettingsCard } from '@/components/platform/BillingSettingsCard';
import { PricingSimulator } from '@/components/subscriptions/PricingSimulator';
import { SmsBundleManager } from '@/components/subscriptions/SmsBundleManager';
import { PackagesPricingManager } from '@/components/subscriptions/PackagesPricingManager';

export default function Subscriptions() {
  const [activeTab, setActiveTab] = useState('pricing');

  const { data: plans, isLoading: plansLoading, error: plansError } = useSubscriptionPlans();
  const { data: revenueStats, isLoading: statsLoading } = usePlanRevenueStats();

  return (
    <DashboardLayout
      title="Packages & Pricing"
      subtitle="Configure pricing formula, add-on modules, SMS bundles, and billing settings"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="pricing" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Packages & Pricing
          </TabsTrigger>
          <TabsTrigger value="modules" className="gap-2">
            <Package className="h-4 w-4" />
            Add-on Modules
          </TabsTrigger>
          <TabsTrigger value="sms" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            SMS Bundles
          </TabsTrigger>
          <TabsTrigger value="simulator" className="gap-2">
            <Calculator className="h-4 w-4" />
            Simulator
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Billing Settings
          </TabsTrigger>
        </TabsList>

        {/* Packages & Pricing - Formula-based pricing configuration */}
        <TabsContent value="pricing" className="space-y-6">
          {plansError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load pricing configuration. Please refresh the page.
              </AlertDescription>
            </Alert>
          )}
          <PackagesPricingManager />
          
          {/* Revenue by Plan */}
          <PlanRevenueChart stats={revenueStats} isLoading={statsLoading} />
        </TabsContent>

        {/* Add-on Modules */}
        <TabsContent value="modules" className="space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">Add-on Module Pricing</h2>
              <p className="text-sm text-muted-foreground">
                Configure prices for optional modules that schools can add to their subscription. 
                These are charged annually on top of the base subscription.
              </p>
            </div>
            <ModulePricingTable />
          </div>
        </TabsContent>

        {/* SMS Bundles */}
        <TabsContent value="sms" className="space-y-6">
          <SmsBundleManager />
        </TabsContent>

        {/* Pricing Simulator */}
        <TabsContent value="simulator" className="space-y-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Pricing Simulator</h2>
            <p className="text-sm text-muted-foreground">
              Calculate total costs for any school using the formula-based pricing model. 
              Enter school details to see Year 1 and recurring costs.
            </p>
          </div>
          <PricingSimulator />
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="settings" className="space-y-6">
          <BillingSettingsCard />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
