import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Calculator, Building2, Package, RefreshCw, School, MessageSquare, TrendingUp, Layers } from 'lucide-react';
import { useAvailableModules } from '@/hooks/useInstitutionBilling';
import { useActiveSmsBundles, calculateSmsRate } from '@/hooks/useSmsBilling';
import { usePricingCalculator, OwnershipType } from '@/hooks/usePricingFormula';
import { useTiersPricing, formatTierRange, PricingTierConfig } from '@/hooks/usePricingTiersConfig';
import { Skeleton } from '@/components/ui/skeleton';

interface SelectedModule {
  id: string;
  name: string;
  /** Annual price for the module (KES per year) */
  annualPrice: number;
}

export function PricingSimulator() {
  const { data: modules, isLoading: modulesLoading } = useAvailableModules();
  const { data: smsBundles, isLoading: smsBundlesLoading } = useActiveSmsBundles();
  const { rates, calculate, isLoading: ratesLoading } = usePricingCalculator();
  const { data: tiersPricing, tiers, isLoading: tiersLoading } = useTiersPricing();

  // State
  const [ownershipType, setOwnershipType] = useState<OwnershipType>('public');
  const [selectedTierId, setSelectedTierId] = useState<string>('');
  const [useExactCount, setUseExactCount] = useState(false);
  const [exactStudentCount, setExactStudentCount] = useState<number>(0);
  const [selectedModules, setSelectedModules] = useState<SelectedModule[]>([]);
  const [selectedSmsBundleId, setSelectedSmsBundleId] = useState<string>('');

  const isLoading = modulesLoading || smsBundlesLoading || ratesLoading || tiersLoading;

  // Get selected tier
  const selectedTier = useMemo(() => {
    if (!tiers || !selectedTierId) return null;
    return tiers.find(t => t.id === selectedTierId) || null;
  }, [tiers, selectedTierId]);

  // Auto-select the popular tier on first load
  useMemo(() => {
    if (tiers && !selectedTierId) {
      const popularTier = tiers.find(t => t.is_popular);
      if (popularTier) {
        setSelectedTierId(popularTier.id);
      } else if (tiers.length > 0) {
        setSelectedTierId(tiers[0].id);
      }
    }
  }, [tiers, selectedTierId]);

  // Calculate pricing
  const studentCount = useExactCount ? exactStudentCount : (selectedTier?.representative_count || 0);
  
  const pricing = useMemo(() => {
    if (selectedTier?.is_contact_sales) return null;
    return calculate(studentCount, ownershipType);
  }, [calculate, studentCount, ownershipType, selectedTier]);

  // Calculate modules total (annual)
  const modulesTotal = useMemo(() => {
    return selectedModules.reduce((total, mod) => total + mod.annualPrice, 0);
  }, [selectedModules]);

  // SMS Bundle cost
  const selectedSmsBundle = smsBundles?.find(b => b.id === selectedSmsBundleId);
  const smsBundleTotal = selectedSmsBundle?.price ?? 0;

  // Total calculations
  const year1Package = pricing?.year1Package ?? 0;
  const renewalFee = pricing?.renewalFee ?? 0;
  const yearOneTotal = year1Package + modulesTotal + smsBundleTotal;
  const recurringAnnualTotal = renewalFee + modulesTotal;

  const handleModuleToggle = (
    moduleId: string,
    moduleName: string,
    annualPrice: number,
    checked: boolean
  ) => {
    if (checked) {
      setSelectedModules(prev => [...prev, { id: moduleId, name: moduleName, annualPrice }]);
    } else {
      setSelectedModules(prev => prev.filter(m => m.id !== moduleId));
    }
  };

  const handleReset = () => {
    setOwnershipType('public');
    setSelectedTierId(tiers?.find(t => t.is_popular)?.id || tiers?.[0]?.id || '');
    setUseExactCount(false);
    setExactStudentCount(0);
    setSelectedModules([]);
    setSelectedSmsBundleId('');
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[500px]" />
        <Skeleton className="h-[500px]" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Configuration Panel */}
      <div className="space-y-6">
        {/* School Details */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              School Details
            </CardTitle>
            <CardDescription>Select school type and size tier</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Ownership Type Toggle */}
            <div className="space-y-2">
              <Label>School Type</Label>
              <Tabs value={ownershipType} onValueChange={(v) => setOwnershipType(v as OwnershipType)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="public" className="gap-2">
                    <School className="h-4 w-4" />
                    Public School
                  </TabsTrigger>
                  <TabsTrigger value="private" className="gap-2">
                    <Building2 className="h-4 w-4" />
                    Private School
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              {ownershipType === 'private' && (
                <p className="text-xs text-muted-foreground">
                  Private schools have a {((rates.tier_private_multiplier - 1) * 100).toFixed(0)}% premium
                </p>
              )}
            </div>

            {/* Tier Selection */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                School Size Tier
              </Label>
              <RadioGroup value={selectedTierId} onValueChange={setSelectedTierId} className="grid grid-cols-2 gap-2">
                {tiers?.map((tier) => (
                  <div key={tier.id}>
                    <RadioGroupItem value={tier.id} id={tier.id} className="peer sr-only" />
                    <Label
                      htmlFor={tier.id}
                      className={`flex flex-col items-center justify-center rounded-lg border-2 p-3 cursor-pointer transition-colors
                        ${selectedTierId === tier.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:bg-muted/50'
                        }
                        ${tier.is_popular ? 'ring-1 ring-landing-coral/50' : ''}
                      `}
                    >
                      <span className="font-medium text-sm">{tier.name}</span>
                      <span className="text-xs text-muted-foreground">{formatTierRange(tier)}</span>
                      {tier.is_popular && (
                        <Badge className="mt-1 text-xs bg-landing-coral text-white">Popular</Badge>
                      )}
                      {tier.is_contact_sales && (
                        <Badge variant="outline" className="mt-1 text-xs">Contact Sales</Badge>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Exact Student Count Toggle */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="exact-count" className="text-sm font-medium cursor-pointer">
                  Use exact student count
                </Label>
                <p className="text-xs text-muted-foreground">
                  Calculate precise pricing for your school
                </p>
              </div>
              <Switch
                id="exact-count"
                checked={useExactCount}
                onCheckedChange={setUseExactCount}
              />
            </div>

            {useExactCount && (
              <div className="space-y-2">
                <Label htmlFor="students">Exact Student Population</Label>
                <Input
                  id="students"
                  type="number"
                  value={exactStudentCount || ''}
                  onChange={(e) => setExactStudentCount(parseInt(e.target.value) || 0)}
                  min={1}
                  placeholder="Enter exact number of students"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add-on Modules */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-primary" />
              Add-on Modules (Annual)
            </CardTitle>
            <CardDescription>Select additional modules to include</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {modules?.map(module => {
                const isSelected = selectedModules.some(m => m.id === module.module_id);
                // Prefer explicit annual pricing (supports annual discounts). Fall back to monthly*12.
                const annualPrice = (module.base_annual_price ?? (module.base_monthly_price * 12)) || 0;

                return (
                  <div
                    key={module.module_id}
                    className={`flex items-center justify-between gap-2 rounded-lg border p-3 cursor-pointer transition-colors ${
                      isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleModuleToggle(module.module_id, module.display_name, annualPrice, !isSelected)}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox checked={isSelected} />
                      <span className="text-sm font-medium">{module.display_name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      KES {annualPrice.toLocaleString()}/yr
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* SMS Bundle Selection */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-primary" />
              SMS Credits (Optional)
            </CardTitle>
            <CardDescription>Add prepaid SMS credits for the institution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {smsBundles?.map(bundle => {
                const isSelected = selectedSmsBundleId === bundle.id;
                const totalCredits = bundle.credits + bundle.bonus_credits;
                const rate = calculateSmsRate(bundle);

                return (
                  <div
                    key={bundle.id}
                    className={`rounded-lg border p-3 cursor-pointer transition-colors ${
                      isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedSmsBundleId(isSelected ? '' : bundle.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{bundle.name}</span>
                      <Checkbox checked={isSelected} />
                    </div>
                    <p className="text-lg font-bold">KES {bundle.price.toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">
                        {totalCredits.toLocaleString()} SMS
                      </span>
                      {bundle.bonus_credits > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          +{bundle.bonus_credits} bonus
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      KES {rate.toFixed(2)} per SMS
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Panel */}
      <div className="lg:sticky lg:top-6 h-fit">
        <Card className="border-primary/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Pricing Summary
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
            <CardDescription>
              <Badge variant={ownershipType === 'public' ? 'secondary' : 'default'} className="mr-2">
                {ownershipType === 'public' ? 'Public School' : 'Private School'}
              </Badge>
              {selectedTier && (
                <>
                  <Badge variant="outline" className="mr-2">{selectedTier.name}</Badge>
                  {useExactCount ? (
                    <span>{exactStudentCount.toLocaleString()} students</span>
                  ) : (
                    <span>~{selectedTier.representative_count.toLocaleString()} students</span>
                  )}
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedTier?.is_contact_sales ? (
              <div className="text-center py-8">
                <p className="text-lg font-semibold mb-2">Custom Enterprise Pricing</p>
                <p className="text-muted-foreground mb-4">
                  For schools with {formatTierRange(selectedTier)}, we offer customized pricing based on your specific needs.
                </p>
                <Button className="bg-landing-coral hover:bg-landing-coral/90">
                  Contact Sales Team
                </Button>
              </div>
            ) : (
              <>
                {/* Year 1 Package Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary">Year 1</Badge>
                    <span className="text-sm font-medium">Onboarding Package</span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {pricing && (
                      <>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Base Year 1 fee</span>
                          <span>KES {pricing.breakdown.baseYear1.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Per-learner ({studentCount} × KES {rates.tier_per_learner_setup})</span>
                          <span>KES {pricing.breakdown.perLearnerYear1.toLocaleString()}</span>
                        </div>
                        {ownershipType === 'private' && (
                          <div className="flex justify-between text-muted-foreground">
                            <span>Private school premium</span>
                            <span className="text-xs">× {rates.tier_private_multiplier}</span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex justify-between font-medium pt-2 border-t">
                      <span>Year 1 Package</span>
                      <span>KES {year1Package.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Includes setup, training & first year subscription
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Year 2+ Renewal Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Year 2+</Badge>
                    <span className="text-sm font-medium">Annual Renewal</span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {pricing && (
                      <>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Base renewal fee</span>
                          <span>KES {pricing.breakdown.baseRenewal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Per-learner ({studentCount} × KES {rates.tier_per_learner_annual})</span>
                          <span>KES {pricing.breakdown.perLearnerRenewal.toLocaleString()}</span>
                        </div>
                      </>
                    )}
                    
                    {selectedModules.length > 0 && (
                      <div className="pt-2 border-t space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Add-on Modules:</p>
                        {selectedModules.map(mod => (
                          <div key={mod.id} className="flex justify-between">
                            <span className="text-muted-foreground">{mod.name}</span>
                            <span>KES {mod.annualPrice.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex justify-between font-medium pt-2 border-t">
                      <span>Annual Renewal Total</span>
                      <span>KES {recurringAnnualTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* SMS Bundle Section */}
                {selectedSmsBundle && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Optional</Badge>
                        <span className="text-sm font-medium">SMS Credits</span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {selectedSmsBundle.name} ({(selectedSmsBundle.credits + selectedSmsBundle.bonus_credits).toLocaleString()} SMS)
                          </span>
                          <span>KES {selectedSmsBundle.price.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* Totals */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <div>
                      <p className="font-semibold">Year 1 Total</p>
                      <p className="text-xs text-muted-foreground">
                        Onboarding{selectedModules.length > 0 ? ' + Modules' : ''}{selectedSmsBundle ? ' + SMS' : ''}
                      </p>
                    </div>
                    <p className="text-xl font-bold text-primary">
                      KES {yearOneTotal.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">Year 2+ Total</p>
                      <p className="text-xs text-muted-foreground">Annual Renewal{selectedModules.length > 0 ? ' + Modules' : ''}</p>
                    </div>
                    <p className="text-lg font-semibold">
                      KES {recurringAnnualTotal.toLocaleString()}
                    </p>
                  </div>

                  {/* Savings indicator */}
                  {studentCount > 0 && yearOneTotal > recurringAnnualTotal && (
                    <div className="flex items-center gap-2 p-2 rounded bg-green-500/10 text-green-700 dark:text-green-400 text-sm">
                      <TrendingUp className="h-4 w-4" />
                      <span>
                        Year 2+ saves KES {(yearOneTotal - recurringAnnualTotal).toLocaleString()} annually
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}

            <Separator />

            {/* Generate Quote Button */}
            <Button className="w-full" size="lg" disabled>
              Generate Quote (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
