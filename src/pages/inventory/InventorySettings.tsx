import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SettingsBackHeader } from "@/components/settings/SettingsBackHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface InventorySettingsData {
  low_stock_threshold: number;
  enable_auto_reorder: boolean;
  reorder_point: number;
  default_depreciation_method: string;
  depreciation_rate: number;
  require_approval_above: number;
}

export default function InventorySettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<InventorySettingsData>({
    low_stock_threshold: 10,
    enable_auto_reorder: false,
    reorder_point: 5,
    default_depreciation_method: 'straight_line',
    depreciation_rate: 10,
    require_approval_above: 50000,
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast({
        title: "Settings saved",
        description: "Inventory settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Inventory Settings" subtitle="Configure stock management and procurement rules">
        <SettingsBackHeader title="Inventory Settings" description="Configure stock management and procurement rules" />
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Inventory Settings" subtitle="Configure stock management and procurement rules">
      <SettingsBackHeader title="Inventory Settings" description="Configure stock management and procurement rules" />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Stock Alerts</CardTitle>
            <CardDescription>Configure low stock thresholds and auto-reorder settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="low_stock">Low Stock Threshold</Label>
              <Input
                id="low_stock"
                type="number"
                min={1}
                value={settings.low_stock_threshold}
                onChange={(e) => setSettings({ ...settings, low_stock_threshold: parseInt(e.target.value) || 1 })}
              />
              <p className="text-sm text-muted-foreground">Alert when stock falls below this quantity</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Auto-Reorder</Label>
                <p className="text-sm text-muted-foreground">Automatically create purchase orders</p>
              </div>
              <Switch
                checked={settings.enable_auto_reorder}
                onCheckedChange={(checked) => setSettings({ ...settings, enable_auto_reorder: checked })}
              />
            </div>
            {settings.enable_auto_reorder && (
              <div className="space-y-2">
                <Label htmlFor="reorder_point">Reorder Point</Label>
                <Input
                  id="reorder_point"
                  type="number"
                  min={1}
                  value={settings.reorder_point}
                  onChange={(e) => setSettings({ ...settings, reorder_point: parseInt(e.target.value) || 1 })}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Depreciation</CardTitle>
            <CardDescription>Configure how assets are depreciated over time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="depreciation_method">Depreciation Method</Label>
                <Select
                  value={settings.default_depreciation_method}
                  onValueChange={(value) => setSettings({ ...settings, default_depreciation_method: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="straight_line">Straight Line</SelectItem>
                    <SelectItem value="declining_balance">Declining Balance</SelectItem>
                    <SelectItem value="sum_of_years">Sum of Years' Digits</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="depreciation_rate">Annual Depreciation Rate (%)</Label>
                <Input
                  id="depreciation_rate"
                  type="number"
                  min={0}
                  max={100}
                  value={settings.depreciation_rate}
                  onChange={(e) => setSettings({ ...settings, depreciation_rate: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Procurement Rules</CardTitle>
            <CardDescription>Set approval thresholds for purchases</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="approval_threshold">Require Approval Above (KES)</Label>
              <Input
                id="approval_threshold"
                type="number"
                min={0}
                value={settings.require_approval_above}
                onChange={(e) => setSettings({ ...settings, require_approval_above: parseInt(e.target.value) || 0 })}
              />
              <p className="text-sm text-muted-foreground">Purchases above this amount require manager approval</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
