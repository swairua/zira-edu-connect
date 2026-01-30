import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Settings, Save, Wrench, Database, Link2, GraduationCap, Code } from 'lucide-react';
import { useSetupFeeSettings, useUpdateSetupFeeSettings, useSetupFeeCatalog, SERVICE_TYPE_LABELS } from '@/hooks/useSetupFees';

export function SetupFeeSettings() {
  const { data: settings, isLoading } = useSetupFeeSettings();
  const { data: catalog, isLoading: catalogLoading } = useSetupFeeCatalog();
  const updateSettings = useUpdateSetupFeeSettings();

  const [baseSetupFee, setBaseSetupFee] = useState(25000);
  const [migrationPerRecord, setMigrationPerRecord] = useState(10);
  const [migrationFlatFee, setMigrationFlatFee] = useState(15000);
  const [integrationFee, setIntegrationFee] = useState(20000);
  const [trainingFee, setTrainingFee] = useState(10000);
  const [customizationRate, setCustomizationRate] = useState(5000);

  useEffect(() => {
    if (settings) {
      setBaseSetupFee(settings.base_setup_fee ?? 25000);
      setMigrationPerRecord(settings.data_migration_fee_per_record ?? 10);
      setMigrationFlatFee(settings.data_migration_flat_fee ?? 15000);
      setIntegrationFee(settings.integration_fee_per_system ?? 20000);
      setTrainingFee(settings.training_fee_per_day ?? 10000);
      setCustomizationRate(settings.customization_hourly_rate ?? 5000);
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate({
      base_setup_fee: baseSetupFee,
      data_migration_fee_per_record: migrationPerRecord,
      data_migration_flat_fee: migrationFlatFee,
      integration_fee_per_system: integrationFee,
      training_fee_per_day: trainingFee,
      customization_hourly_rate: customizationRate,
    });
  };

  if (isLoading || catalogLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[200px]" />
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Default Rates Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Default Setup Fee Rates
          </CardTitle>
          <CardDescription>
            Configure default pricing for one-time setup services. These rates are used as defaults when creating quotes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Base Setup Fee */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="baseSetupFee">Base Platform Setup</Label>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">KES</span>
                <Input
                  id="baseSetupFee"
                  type="number"
                  value={baseSetupFee}
                  onChange={(e) => setBaseSetupFee(parseFloat(e.target.value) || 0)}
                  className="pl-12"
                />
              </div>
              <p className="text-xs text-muted-foreground">One-time fee for initial platform setup</p>
            </div>

            {/* Migration Flat Fee */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="migrationFlatFee">Data Migration (Flat)</Label>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">KES</span>
                <Input
                  id="migrationFlatFee"
                  type="number"
                  value={migrationFlatFee}
                  onChange={(e) => setMigrationFlatFee(parseFloat(e.target.value) || 0)}
                  className="pl-12"
                />
              </div>
              <p className="text-xs text-muted-foreground">Standard migration for small institutions</p>
            </div>

            {/* Migration Per Record */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="migrationPerRecord">Data Migration (Per Record)</Label>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">KES</span>
                <Input
                  id="migrationPerRecord"
                  type="number"
                  value={migrationPerRecord}
                  onChange={(e) => setMigrationPerRecord(parseFloat(e.target.value) || 0)}
                  className="pl-12"
                />
              </div>
              <p className="text-xs text-muted-foreground">Per student/staff record for large migrations</p>
            </div>

            {/* Integration Fee */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="integrationFee">Integration (Per System)</Label>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">KES</span>
                <Input
                  id="integrationFee"
                  type="number"
                  value={integrationFee}
                  onChange={(e) => setIntegrationFee(parseFloat(e.target.value) || 0)}
                  className="pl-12"
                />
              </div>
              <p className="text-xs text-muted-foreground">Per external system integration</p>
            </div>

            {/* Training Fee */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="trainingFee">Training (Per Day)</Label>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">KES</span>
                <Input
                  id="trainingFee"
                  type="number"
                  value={trainingFee}
                  onChange={(e) => setTrainingFee(parseFloat(e.target.value) || 0)}
                  className="pl-12"
                />
              </div>
              <p className="text-xs text-muted-foreground">On-site training per day</p>
            </div>

            {/* Customization Rate */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="customizationRate">Customization (Per Hour)</Label>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">KES</span>
                <Input
                  id="customizationRate"
                  type="number"
                  value={customizationRate}
                  onChange={(e) => setCustomizationRate(parseFloat(e.target.value) || 0)}
                  className="pl-12"
                />
              </div>
              <p className="text-xs text-muted-foreground">Custom development hourly rate</p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={updateSettings.isPending} className="gap-2">
              <Save className="h-4 w-4" />
              {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Service Catalog Card */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Service Catalog</CardTitle>
          <CardDescription>
            Pre-configured setup services available for quotes. These are managed in the database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {catalog?.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4 rounded-lg border p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{item.name}</p>
                    {item.is_required && (
                      <Badge variant="secondary" className="text-xs">Required</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{SERVICE_TYPE_LABELS[item.service_type]}</Badge>
                    <Badge variant="outline" className="capitalize">{item.price_type.replace('_', ' ')}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">KES {item.base_price.toLocaleString()}</p>
                  {item.unit_label && (
                    <p className="text-sm text-muted-foreground">{item.unit_label}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
