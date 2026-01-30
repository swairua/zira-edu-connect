import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinanceSettings, useUpdateFinanceSettings } from '@/hooks/useFinanceSettings';
import { Loader2, Smartphone, Bell, Gavel, CreditCard, Settings, ShieldCheck } from 'lucide-react';
import type { FinanceModuleSettings } from '@/types/institution-settings';

interface FinanceSettingsCardProps {
  institutionId: string;
}

export function FinanceSettingsCard({ institutionId }: FinanceSettingsCardProps) {
  const { data: settings, isLoading } = useFinanceSettings(institutionId);
  const updateSettings = useUpdateFinanceSettings();
  
  const [localSettings, setLocalSettings] = useState<Partial<FinanceModuleSettings>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Merge local changes with fetched settings
  const currentSettings: FinanceModuleSettings = {
    ...settings!,
    ...localSettings,
  };

  const handleToggle = (key: keyof FinanceModuleSettings, value: boolean) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleChannelToggle = (channel: 'sms' | 'email' | 'in_app', checked: boolean) => {
    const currentChannels = currentSettings.reminder_channels || [];
    const newChannels = checked
      ? [...currentChannels, channel]
      : currentChannels.filter(c => c !== channel);
    setLocalSettings(prev => ({ ...prev, reminder_channels: newChannels }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateSettings.mutate(
      { institutionId, settings: localSettings },
      {
        onSuccess: () => {
          setLocalSettings({});
          setHasChanges(false);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Finance Module Settings</CardTitle>
              <CardDescription>Configure payment collection and automation features</CardDescription>
            </div>
          </div>
          {hasChanges && (
            <Button onClick={handleSave} disabled={updateSettings.isPending}>
              {updateSettings.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* M-PESA Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-success" />
            <h3 className="font-semibold">M-PESA Integration</h3>
            <Badge variant={currentSettings.mpesa_enabled ? 'default' : 'secondary'}>
              {currentSettings.mpesa_enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
          <div className="ml-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable M-PESA Payments</Label>
                <p className="text-sm text-muted-foreground">
                  Allow parents to pay via M-PESA STK Push
                </p>
              </div>
              <Switch
                checked={currentSettings.mpesa_enabled}
                onCheckedChange={(checked) => handleToggle('mpesa_enabled', checked)}
              />
            </div>
            {currentSettings.mpesa_enabled && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Paybill Number</Label>
                  <Input 
                    placeholder="e.g., 123456" 
                    value={currentSettings.mpesa_paybill_number || ''} 
                    onChange={(e) => {
                      setLocalSettings(prev => ({ ...prev, mpesa_paybill_number: e.target.value }));
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Till Number (optional)</Label>
                  <Input 
                    placeholder="e.g., 987654" 
                    value={currentSettings.mpesa_till_number || ''}
                    onChange={(e) => {
                      setLocalSettings(prev => ({ ...prev, mpesa_till_number: e.target.value }));
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Reminder Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Payment Reminders</h3>
            <Badge variant={currentSettings.reminders_enabled ? 'default' : 'secondary'}>
              {currentSettings.reminders_enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
          <div className="ml-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Send payment reminders to parents
                </p>
              </div>
              <Switch
                checked={currentSettings.reminders_enabled}
                onCheckedChange={(checked) => handleToggle('reminders_enabled', checked)}
              />
            </div>
            {currentSettings.reminders_enabled && (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Automatic Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Send reminders automatically based on schedules
                    </p>
                  </div>
                  <Switch
                    checked={currentSettings.auto_reminders}
                    onCheckedChange={(checked) => handleToggle('auto_reminders', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reminder Channels</Label>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="channel-sms"
                        checked={currentSettings.reminder_channels?.includes('sms')}
                        onCheckedChange={(checked) => handleChannelToggle('sms', checked === true)}
                      />
                      <label htmlFor="channel-sms" className="text-sm">SMS</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="channel-email"
                        checked={currentSettings.reminder_channels?.includes('email')}
                        onCheckedChange={(checked) => handleChannelToggle('email', checked === true)}
                      />
                      <label htmlFor="channel-email" className="text-sm">Email</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="channel-inapp"
                        checked={currentSettings.reminder_channels?.includes('in_app')}
                        onCheckedChange={(checked) => handleChannelToggle('in_app', checked === true)}
                      />
                      <label htmlFor="channel-inapp" className="text-sm">In-App</label>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <Separator />

        {/* Penalty Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Gavel className="h-5 w-5 text-warning" />
            <h3 className="font-semibold">Late Payment Penalties</h3>
            <Badge variant={currentSettings.penalties_enabled ? 'default' : 'secondary'}>
              {currentSettings.penalties_enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
          <div className="ml-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Penalties</Label>
                <p className="text-sm text-muted-foreground">
                  Apply penalties for overdue payments
                </p>
              </div>
              <Switch
                checked={currentSettings.penalties_enabled}
                onCheckedChange={(checked) => handleToggle('penalties_enabled', checked)}
              />
            </div>
            {currentSettings.penalties_enabled && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Apply Penalties</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically apply penalties based on rules
                  </p>
                </div>
                <Switch
                  checked={currentSettings.auto_apply_penalties}
                  onCheckedChange={(checked) => handleToggle('auto_apply_penalties', checked)}
                />
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Installment Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Payment Plans</h3>
          </div>
          <div className="ml-7">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Installments</Label>
                <p className="text-sm text-muted-foreground">
                  Allow fee items to be paid in installments
                </p>
              </div>
              <Switch
                checked={currentSettings.installments_enabled}
                onCheckedChange={(checked) => handleToggle('installments_enabled', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Multi-Level Approval Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Approval Workflows</h3>
          </div>
          <div className="ml-7 space-y-4">
            {/* Voucher Approval Levels */}
            <div className="space-y-2">
              <Label>Voucher Approval Levels</Label>
              <p className="text-sm text-muted-foreground">
                Number of approval levels for payment vouchers
              </p>
              <Select
                value={String(currentSettings.voucher_approval_levels || 2)}
                onValueChange={(value) => {
                  setLocalSettings(prev => ({ ...prev, voucher_approval_levels: parseInt(value) as 1 | 2 | 3 }));
                  setHasChanges(true);
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Level (Direct Approval)</SelectItem>
                  <SelectItem value="2">2 Levels (Check → Approve)</SelectItem>
                  <SelectItem value="3">3 Levels (Check → Approve → Final)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Adjustment Secondary Approval Threshold */}
            <div className="space-y-2">
              <Label>Adjustment Secondary Approval Threshold</Label>
              <p className="text-sm text-muted-foreground">
                Adjustments above this amount require secondary approval
              </p>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">KES</span>
                <Input
                  type="number"
                  className="w-[150px]"
                  value={currentSettings.adjustment_secondary_threshold || 50000}
                  onChange={(e) => {
                    setLocalSettings(prev => ({ ...prev, adjustment_secondary_threshold: parseFloat(e.target.value) || 0 }));
                    setHasChanges(true);
                  }}
                />
              </div>
            </div>

            {/* Secondary Approver Role */}
            <div className="space-y-2">
              <Label>Secondary Approver Role</Label>
              <p className="text-sm text-muted-foreground">
                Role required to provide secondary/final approval
              </p>
              <Select
                value={currentSettings.adjustment_secondary_approver_role || 'institution_admin'}
                onValueChange={(value) => {
                  setLocalSettings(prev => ({ ...prev, adjustment_secondary_approver_role: value }));
                  setHasChanges(true);
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bursar">Bursar</SelectItem>
                  <SelectItem value="institution_admin">Institution Admin</SelectItem>
                  <SelectItem value="institution_owner">Institution Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
