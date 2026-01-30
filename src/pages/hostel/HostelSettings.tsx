import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SettingsBackHeader } from "@/components/settings/SettingsBackHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface HostelSettingsData {
  max_students_per_room: number;
  allow_room_change_requests: boolean;
  require_deposit: boolean;
  deposit_amount: number;
  check_in_time: string;
  check_out_time: string;
  late_fee_enabled: boolean;
  late_fee_amount: number;
}

export default function HostelSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<HostelSettingsData>({
    max_students_per_room: 4,
    allow_room_change_requests: true,
    require_deposit: true,
    deposit_amount: 5000,
    check_in_time: "08:00",
    check_out_time: "18:00",
    late_fee_enabled: false,
    late_fee_amount: 500,
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
        description: "Hostel settings have been updated successfully.",
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
      <DashboardLayout title="Hostel Settings" subtitle="Configure room allocation and boarding policies">
        <SettingsBackHeader title="Hostel Settings" description="Configure room allocation and boarding policies" />
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Hostel Settings" subtitle="Configure room allocation and boarding policies">
      <SettingsBackHeader title="Hostel Settings" description="Configure room allocation and boarding policies" />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Room Allocation</CardTitle>
            <CardDescription>Configure room capacity and allocation rules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="max_students">Maximum Students per Room</Label>
              <Input
                id="max_students"
                type="number"
                min={1}
                max={10}
                value={settings.max_students_per_room}
                onChange={(e) => setSettings({ ...settings, max_students_per_room: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Room Change Requests</Label>
                <p className="text-sm text-muted-foreground">Students can request room changes</p>
              </div>
              <Switch
                checked={settings.allow_room_change_requests}
                onCheckedChange={(checked) => setSettings({ ...settings, allow_room_change_requests: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fees & Deposits</CardTitle>
            <CardDescription>Configure boarding fees and deposit requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Deposit</Label>
                <p className="text-sm text-muted-foreground">Require upfront deposit for boarding</p>
              </div>
              <Switch
                checked={settings.require_deposit}
                onCheckedChange={(checked) => setSettings({ ...settings, require_deposit: checked })}
              />
            </div>
            {settings.require_deposit && (
              <div className="space-y-2">
                <Label htmlFor="deposit">Deposit Amount (KES)</Label>
                <Input
                  id="deposit"
                  type="number"
                  min={0}
                  value={settings.deposit_amount}
                  onChange={(e) => setSettings({ ...settings, deposit_amount: parseInt(e.target.value) || 0 })}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Check-in/Check-out</CardTitle>
            <CardDescription>Set hostel access times and late fees</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="check_in">Check-in Time</Label>
                <Input
                  id="check_in"
                  type="time"
                  value={settings.check_in_time}
                  onChange={(e) => setSettings({ ...settings, check_in_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="check_out">Check-out Time</Label>
                <Input
                  id="check_out"
                  type="time"
                  value={settings.check_out_time}
                  onChange={(e) => setSettings({ ...settings, check_out_time: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Late Fee Enabled</Label>
                <p className="text-sm text-muted-foreground">Charge fee for late returns</p>
              </div>
              <Switch
                checked={settings.late_fee_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, late_fee_enabled: checked })}
              />
            </div>
            {settings.late_fee_enabled && (
              <div className="space-y-2">
                <Label htmlFor="late_fee">Late Fee Amount (KES)</Label>
                <Input
                  id="late_fee"
                  type="number"
                  min={0}
                  value={settings.late_fee_amount}
                  onChange={(e) => setSettings({ ...settings, late_fee_amount: parseInt(e.target.value) || 0 })}
                />
              </div>
            )}
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
