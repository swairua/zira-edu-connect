import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Loader2, Settings, Calendar, Percent, Clock } from 'lucide-react';
import { useBillingSettings, useUpdateBillingSettings, BillingCycle } from '@/hooks/useBillingSettings';

export function BillingSettingsCard() {
  const { data: settings, isLoading } = useBillingSettings();
  const updateSettings = useUpdateBillingSettings();

  const [monthlyEnabled, setMonthlyEnabled] = useState(false);
  const [termlyEnabled, setTermlyEnabled] = useState(true);
  const [annualEnabled, setAnnualEnabled] = useState(true);
  const [defaultCycle, setDefaultCycle] = useState<BillingCycle>('annual');
  const [monthlyGraceDays, setMonthlyGraceDays] = useState(7);
  const [termlyGraceDays, setTermlyGraceDays] = useState(14);
  const [annualGraceDays, setAnnualGraceDays] = useState(30);
  const [annualDiscount, setAnnualDiscount] = useState(20);
  const [termlyDiscount, setTermlyDiscount] = useState(10);

  useEffect(() => {
    if (settings) {
      setMonthlyEnabled(settings.monthly_enabled);
      setTermlyEnabled(settings.termly_enabled);
      setAnnualEnabled(settings.annual_enabled);
      setDefaultCycle(settings.default_billing_cycle);
      setMonthlyGraceDays(settings.monthly_grace_days);
      setTermlyGraceDays(settings.termly_grace_days);
      setAnnualGraceDays(settings.annual_grace_days);
      setAnnualDiscount(settings.annual_discount_percent);
      setTermlyDiscount(settings.termly_discount_percent);
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings.mutateAsync({
      monthly_enabled: monthlyEnabled,
      termly_enabled: termlyEnabled,
      annual_enabled: annualEnabled,
      default_billing_cycle: defaultCycle,
      monthly_grace_days: monthlyGraceDays,
      termly_grace_days: termlyGraceDays,
      annual_grace_days: annualGraceDays,
      annual_discount_percent: annualDiscount,
      termly_discount_percent: termlyDiscount,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Billing Configuration
        </CardTitle>
        <CardDescription>
          Configure available billing cycles and payment settings for institutions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Available Billing Cycles */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Label className="text-base font-medium">Available Billing Cycles</Label>
          </div>
          
          <div className="grid gap-4 pl-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="monthly">Monthly</Label>
                <p className="text-sm text-muted-foreground">Rarely used for schools</p>
              </div>
              <Switch
                id="monthly"
                checked={monthlyEnabled}
                onCheckedChange={setMonthlyEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="termly">Termly (3 terms per year)</Label>
                <p className="text-sm text-muted-foreground">Standard for most schools</p>
              </div>
              <Switch
                id="termly"
                checked={termlyEnabled}
                onCheckedChange={setTermlyEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="annual">Annual</Label>
                <p className="text-sm text-muted-foreground">Recommended, best savings</p>
              </div>
              <Switch
                id="annual"
                checked={annualEnabled}
                onCheckedChange={setAnnualEnabled}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Default Billing Cycle */}
        <div className="space-y-2">
          <Label>Default Billing Cycle for New Institutions</Label>
          <Select value={defaultCycle} onValueChange={(v) => setDefaultCycle(v as BillingCycle)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {annualEnabled && <SelectItem value="annual">Annual</SelectItem>}
              {termlyEnabled && <SelectItem value="termly">Termly</SelectItem>}
              {monthlyEnabled && <SelectItem value="monthly">Monthly</SelectItem>}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Grace Periods */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Label className="text-base font-medium">Grace Periods (days after due date)</Label>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-3 pl-6">
            <div className="space-y-2">
              <Label htmlFor="monthly-grace">Monthly</Label>
              <Input
                id="monthly-grace"
                type="number"
                value={monthlyGraceDays}
                onChange={(e) => setMonthlyGraceDays(parseInt(e.target.value) || 0)}
                min={0}
                max={30}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="termly-grace">Termly</Label>
              <Input
                id="termly-grace"
                type="number"
                value={termlyGraceDays}
                onChange={(e) => setTermlyGraceDays(parseInt(e.target.value) || 0)}
                min={0}
                max={60}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="annual-grace">Annual</Label>
              <Input
                id="annual-grace"
                type="number"
                value={annualGraceDays}
                onChange={(e) => setAnnualGraceDays(parseInt(e.target.value) || 0)}
                min={0}
                max={90}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Discounts */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-muted-foreground" />
            <Label className="text-base font-medium">Discount Percentages</Label>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 pl-6">
            <div className="space-y-2">
              <Label htmlFor="annual-discount">Annual Discount (%)</Label>
              <Input
                id="annual-discount"
                type="number"
                value={annualDiscount}
                onChange={(e) => setAnnualDiscount(parseFloat(e.target.value) || 0)}
                min={0}
                max={50}
              />
              <p className="text-xs text-muted-foreground">Savings compared to monthly</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="termly-discount">Termly Discount (%)</Label>
              <Input
                id="termly-discount"
                type="number"
                value={termlyDiscount}
                onChange={(e) => setTermlyDiscount(parseFloat(e.target.value) || 0)}
                min={0}
                max={30}
              />
              <p className="text-xs text-muted-foreground">Savings compared to monthly</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={updateSettings.isPending}>
            {updateSettings.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
