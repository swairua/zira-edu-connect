import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Bell, MessageSquare, Mail, Smartphone, Loader2 } from 'lucide-react';
import { useParent } from '@/contexts/ParentContext';
import {
  useParentNotificationPreferences,
  useUpdateNotificationPreference,
  getPreferenceStatus,
} from '@/hooks/useParentNotificationPreferences';

export function ParentNotificationSettings() {
  const { parentProfile } = useParent();
  const parentId = parentProfile?.id;
  const institutionId = parentProfile?.institution_id;

  const { data: preferences = [], isLoading } = useParentNotificationPreferences(
    parentId || null,
    institutionId || null
  );
  const updatePreference = useUpdateNotificationPreference();

  const handleToggle = (channel: 'sms' | 'email' | 'in_app', value: boolean) => {
    if (!parentId || !institutionId) return;

    updatePreference.mutate({
      parentId,
      institutionId,
      channel,
      isOptedIn: value,
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

  if (!parentId || !institutionId) {
    return null;
  }

  const smsEnabled = getPreferenceStatus(preferences, 'sms');
  const emailEnabled = getPreferenceStatus(preferences, 'email');
  const inAppEnabled = getPreferenceStatus(preferences, 'in_app');

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Notification Preferences</CardTitle>
            <CardDescription className="text-sm">
              Choose how you want to receive notifications
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* SMS Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smartphone className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-0.5">
              <Label>SMS Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Receive fee reminders and alerts via SMS
              </p>
            </div>
          </div>
          <Switch
            checked={smsEnabled}
            onCheckedChange={(checked) => handleToggle('sms', checked)}
            disabled={updatePreference.isPending}
            aria-label="Toggle SMS notifications"
          />
        </div>

        <Separator />

        {/* Email Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Receive updates and reports via email
              </p>
            </div>
          </div>
          <Switch
            checked={emailEnabled}
            onCheckedChange={(checked) => handleToggle('email', checked)}
            disabled={updatePreference.isPending}
            aria-label="Toggle email notifications"
          />
        </div>

        <Separator />

        {/* In-App Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-0.5">
              <Label>In-App Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Show notifications in the app
              </p>
            </div>
          </div>
          <Switch
            checked={inAppEnabled}
            onCheckedChange={(checked) => handleToggle('in_app', checked)}
            disabled={updatePreference.isPending}
            aria-label="Toggle in-app notifications"
          />
        </div>
      </CardContent>
    </Card>
  );
}
