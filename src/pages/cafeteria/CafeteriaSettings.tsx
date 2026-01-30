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

interface CafeteriaSettingsData {
  breakfast_time: string;
  lunch_time: string;
  dinner_time: string;
  allow_meal_booking: boolean;
  booking_deadline_hours: number;
  show_dietary_options: boolean;
  enable_meal_credits: boolean;
  credit_expiry_days: number;
}

export default function CafeteriaSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<CafeteriaSettingsData>({
    breakfast_time: "07:00",
    lunch_time: "12:30",
    dinner_time: "18:30",
    allow_meal_booking: true,
    booking_deadline_hours: 24,
    show_dietary_options: true,
    enable_meal_credits: false,
    credit_expiry_days: 30,
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
        description: "Cafeteria settings have been updated successfully.",
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
      <DashboardLayout title="Cafeteria Settings" subtitle="Configure meal schedules and pricing">
        <SettingsBackHeader title="Cafeteria Settings" description="Configure meal schedules and pricing" />
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Cafeteria Settings" subtitle="Configure meal schedules and pricing">
      <SettingsBackHeader title="Cafeteria Settings" description="Configure meal schedules and pricing" />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Meal Schedule</CardTitle>
            <CardDescription>Set serving times for each meal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="breakfast">Breakfast Time</Label>
                <Input
                  id="breakfast"
                  type="time"
                  value={settings.breakfast_time}
                  onChange={(e) => setSettings({ ...settings, breakfast_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lunch">Lunch Time</Label>
                <Input
                  id="lunch"
                  type="time"
                  value={settings.lunch_time}
                  onChange={(e) => setSettings({ ...settings, lunch_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dinner">Dinner Time</Label>
                <Input
                  id="dinner"
                  type="time"
                  value={settings.dinner_time}
                  onChange={(e) => setSettings({ ...settings, dinner_time: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meal Booking</CardTitle>
            <CardDescription>Configure meal reservation settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Meal Booking</Label>
                <p className="text-sm text-muted-foreground">Students can book meals in advance</p>
              </div>
              <Switch
                checked={settings.allow_meal_booking}
                onCheckedChange={(checked) => setSettings({ ...settings, allow_meal_booking: checked })}
              />
            </div>
            {settings.allow_meal_booking && (
              <div className="space-y-2">
                <Label htmlFor="deadline">Booking Deadline (hours before meal)</Label>
                <Input
                  id="deadline"
                  type="number"
                  min={1}
                  max={72}
                  value={settings.booking_deadline_hours}
                  onChange={(e) => setSettings({ ...settings, booking_deadline_hours: parseInt(e.target.value) || 1 })}
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Dietary Options</Label>
                <p className="text-sm text-muted-foreground">Display vegetarian, halal, and other dietary tags</p>
              </div>
              <Switch
                checked={settings.show_dietary_options}
                onCheckedChange={(checked) => setSettings({ ...settings, show_dietary_options: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meal Credits</CardTitle>
            <CardDescription>Configure prepaid meal credit system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Meal Credits</Label>
                <p className="text-sm text-muted-foreground">Allow prepaid meal credit purchases</p>
              </div>
              <Switch
                checked={settings.enable_meal_credits}
                onCheckedChange={(checked) => setSettings({ ...settings, enable_meal_credits: checked })}
              />
            </div>
            {settings.enable_meal_credits && (
              <div className="space-y-2">
                <Label htmlFor="expiry">Credit Expiry (days)</Label>
                <Input
                  id="expiry"
                  type="number"
                  min={1}
                  value={settings.credit_expiry_days}
                  onChange={(e) => setSettings({ ...settings, credit_expiry_days: parseInt(e.target.value) || 1 })}
                />
                <p className="text-sm text-muted-foreground">Unused credits expire after this many days</p>
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
