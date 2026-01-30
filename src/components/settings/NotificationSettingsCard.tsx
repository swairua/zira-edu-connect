import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Bell, Loader2 } from 'lucide-react';
import { useUserNotificationSettings, useUpdateNotificationSettings, type NotificationSettings } from '@/hooks/useUserNotificationSettings';

export function NotificationSettingsCard() {
  const { data: settings, isLoading } = useUserNotificationSettings();
  const updateSettings = useUpdateNotificationSettings();
  const [localSettings, setLocalSettings] = useState<NotificationSettings | null>(null);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleToggle = (key: keyof NotificationSettings, value: boolean) => {
    if (!localSettings) return;
    
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    updateSettings.mutate(updated);
  };

  if (isLoading || !localSettings) {
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
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Manage how you receive notifications</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Email Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive updates via email</p>
          </div>
          <Switch
            checked={localSettings.email_notifications}
            onCheckedChange={(checked) => handleToggle('email_notifications', checked)}
            disabled={updateSettings.isPending}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>SMS Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive SMS alerts</p>
          </div>
          <Switch
            checked={localSettings.sms_notifications}
            onCheckedChange={(checked) => handleToggle('sms_notifications', checked)}
            disabled={updateSettings.isPending}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Payment Alerts</Label>
            <p className="text-sm text-muted-foreground">Get notified about fee payments</p>
          </div>
          <Switch
            checked={localSettings.payment_alerts}
            onCheckedChange={(checked) => handleToggle('payment_alerts', checked)}
            disabled={updateSettings.isPending}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>System Updates</Label>
            <p className="text-sm text-muted-foreground">Receive system maintenance updates</p>
          </div>
          <Switch
            checked={localSettings.system_updates}
            onCheckedChange={(checked) => handleToggle('system_updates', checked)}
            disabled={updateSettings.isPending}
          />
        </div>
      </CardContent>
    </Card>
  );
}
