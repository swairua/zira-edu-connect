import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calculator, Save, Info, TrendingUp } from 'lucide-react';
import { usePricingFormulaRates, useUpdatePricingFormulaRates, DEFAULT_RATES } from '@/hooks/usePricingFormula';
import { useTiersPricing } from '@/hooks/usePricingTiersConfig';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TiersManager } from './TiersManager';

export function PackagesPricingManager() {
  const { data: rates, isLoading: ratesLoading } = usePricingFormulaRates();
  const { data: tiersPricing, isLoading: tiersLoading } = useTiersPricing();
  const updateRates = useUpdatePricingFormulaRates();

  const [baseSetupFee, setBaseSetupFee] = useState('');
  const [perLearnerSetup, setPerLearnerSetup] = useState('');
  const [baseAnnualFee, setBaseAnnualFee] = useState('');
  const [perLearnerAnnual, setPerLearnerAnnual] = useState('');
  const [privateMultiplier, setPrivateMultiplier] = useState('');

  useEffect(() => {
    if (rates) {
      setBaseSetupFee(rates.tier_base_setup_fee.toString());
      setPerLearnerSetup(rates.tier_per_learner_setup.toString());
      setBaseAnnualFee(rates.tier_base_annual_fee.toString());
      setPerLearnerAnnual(rates.tier_per_learner_annual.toString());
      setPrivateMultiplier(rates.tier_private_multiplier.toString());
    }
  }, [rates]);

  const handleSave = () => {
    updateRates.mutate({
      tier_base_setup_fee: parseFloat(baseSetupFee) || DEFAULT_RATES.tier_base_setup_fee,
      tier_per_learner_setup: parseFloat(perLearnerSetup) || DEFAULT_RATES.tier_per_learner_setup,
      tier_base_annual_fee: parseFloat(baseAnnualFee) || DEFAULT_RATES.tier_base_annual_fee,
      tier_per_learner_annual: parseFloat(perLearnerAnnual) || DEFAULT_RATES.tier_per_learner_annual,
      tier_private_multiplier: parseFloat(privateMultiplier) || DEFAULT_RATES.tier_private_multiplier,
    });
  };

  const isLoading = ratesLoading || tiersLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Formula Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Pricing Formula
              </CardTitle>
              <CardDescription>
                Configure base rates and per-learner fees. These rates apply to all tiers.
              </CardDescription>
            </div>
            <Button onClick={handleSave} disabled={updateRates.isPending}>
              <Save className="h-4 w-4 mr-2" />
              Save Rates
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Year 1 Onboarding Package */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              Year 1 Onboarding Package
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Bundled fee including setup + first year subscription</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="baseSetup">Base Year 1 Fee (KES)</Label>
                <Input
                  id="baseSetup"
                  type="number"
                  value={baseSetupFee}
                  onChange={(e) => setBaseSetupFee(e.target.value)}
                  placeholder="25000"
                />
                <p className="text-xs text-muted-foreground">Platform setup, training, first year access</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="perLearnerSetup">Per-Learner Year 1 (KES)</Label>
                <Input
                  id="perLearnerSetup"
                  type="number"
                  value={perLearnerSetup}
                  onChange={(e) => setPerLearnerSetup(e.target.value)}
                  placeholder="120"
                />
                <p className="text-xs text-muted-foreground">Per-student onboarding + first year license</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Year 2+ Renewal */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              Year 2+ Annual Renewal
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Annual renewal fee for Year 2 onwards</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="baseAnnual">Base Renewal Fee (KES)</Label>
                <Input
                  id="baseAnnual"
                  type="number"
                  value={baseAnnualFee}
                  onChange={(e) => setBaseAnnualFee(e.target.value)}
                  placeholder="12000"
                />
                <p className="text-xs text-muted-foreground">Platform access, support</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="perLearnerAnnual">Per-Learner Renewal (KES)</Label>
                <Input
                  id="perLearnerAnnual"
                  type="number"
                  value={perLearnerAnnual}
                  onChange={(e) => setPerLearnerAnnual(e.target.value)}
                  placeholder="50"
                />
                <p className="text-xs text-muted-foreground">Per-student annual license</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Private School Multiplier */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              Private School Premium
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Multiplier applied to private school pricing (e.g., 1.25 = 25% premium)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h4>
            <div className="max-w-xs space-y-2">
              <Label htmlFor="multiplier">Multiplier</Label>
              <Input
                id="multiplier"
                type="number"
                step="0.05"
                value={privateMultiplier}
                onChange={(e) => setPrivateMultiplier(e.target.value)}
                placeholder="1.25"
              />
              <p className="text-xs text-muted-foreground">
                {parseFloat(privateMultiplier) > 1 
                  ? `${((parseFloat(privateMultiplier) - 1) * 100).toFixed(0)}% premium for private schools`
                  : 'No premium for private schools'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tiers Manager */}
      <TiersManager />

      {/* Live Preview by Tier */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tier Pricing Preview
          </CardTitle>
          <CardDescription>
            Live preview of pricing for each tier based on current formula rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Tier</th>
                  <th className="text-center py-2 font-medium">Students</th>
                  <th className="text-center py-2 font-medium text-green-600" colSpan={2}>Public Schools</th>
                  <th className="text-center py-2 font-medium text-blue-600" colSpan={2}>Private Schools</th>
                </tr>
                <tr className="border-b bg-muted/30">
                  <th></th>
                  <th></th>
                  <th className="text-right py-1 text-xs text-muted-foreground">Year 1</th>
                  <th className="text-right py-1 text-xs text-muted-foreground">Renewal</th>
                  <th className="text-right py-1 text-xs text-muted-foreground">Year 1</th>
                  <th className="text-right py-1 text-xs text-muted-foreground">Renewal</th>
                </tr>
              </thead>
              <tbody>
                {tiersPricing?.map((tierPricing) => {
                  const { tier, isCustom, publicYear1, publicRenewal, privateYear1, privateRenewal } = tierPricing;
                  return (
                    <tr key={tier.id} className="border-b">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{tier.name}</Badge>
                          {tier.is_popular && (
                            <Badge className="bg-landing-coral text-white text-xs">Popular</Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <Badge variant="outline" className="text-xs">
                          {tier.representative_count.toLocaleString()}
                        </Badge>
                      </td>
                      <td className="py-3 text-right font-mono font-medium text-green-600">
                        {isCustom ? 'Custom' : `KES ${publicYear1.toLocaleString()}`}
                      </td>
                      <td className="py-3 text-right font-mono text-muted-foreground">
                        {isCustom ? 'Custom' : `KES ${publicRenewal.toLocaleString()}`}
                      </td>
                      <td className="py-3 text-right font-mono font-medium text-blue-600">
                        {isCustom ? 'Custom' : `KES ${privateYear1.toLocaleString()}`}
                      </td>
                      <td className="py-3 text-right font-mono text-muted-foreground">
                        {isCustom ? 'Custom' : `KES ${privateRenewal.toLocaleString()}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Formula Explanation */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h5 className="font-medium mb-2">Formula Applied:</h5>
            <div className="text-sm text-muted-foreground space-y-1 font-mono">
              <p>Year 1 = (KES {parseFloat(baseSetupFee).toLocaleString()} + KES {parseFloat(perLearnerSetup)} × students) × multiplier</p>
              <p>Renewal = (KES {parseFloat(baseAnnualFee).toLocaleString()} + KES {parseFloat(perLearnerAnnual)} × students) × multiplier</p>
              <p>Private school multiplier: {parseFloat(privateMultiplier)}x ({((parseFloat(privateMultiplier) - 1) * 100).toFixed(0)}% premium)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
