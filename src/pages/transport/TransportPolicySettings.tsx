import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SettingsBackHeader } from '@/components/settings/SettingsBackHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useTransportPolicies, useUpdateTransportPolicies } from '@/hooks/useTransportPolicies';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings, Save, Loader2 } from 'lucide-react';

export default function TransportPolicySettings() {
  const { institution } = useInstitution();
  const { data: policies, isLoading } = useTransportPolicies(institution?.id);
  const updatePolicies = useUpdateTransportPolicies();

  const [formData, setFormData] = useState({
    enable_auto_suspension: policies?.enable_auto_suspension ?? false,
    suspension_days_overdue: policies?.suspension_days_overdue ?? 30,
    suspension_grace_period_days: policies?.suspension_grace_period_days ?? 7,
    require_approval_for_subscription: policies?.require_approval_for_subscription ?? true,
    allow_parent_self_service: policies?.allow_parent_self_service ?? true,
    send_suspension_notice: policies?.send_suspension_notice ?? true,
    notice_days_before_suspension: policies?.notice_days_before_suspension ?? 3,
  });

  // Update form when data loads
  useState(() => {
    if (policies) {
      setFormData({
        enable_auto_suspension: policies.enable_auto_suspension,
        suspension_days_overdue: policies.suspension_days_overdue,
        suspension_grace_period_days: policies.suspension_grace_period_days,
        require_approval_for_subscription: policies.require_approval_for_subscription,
        allow_parent_self_service: policies.allow_parent_self_service,
        send_suspension_notice: policies.send_suspension_notice,
        notice_days_before_suspension: policies.notice_days_before_suspension,
      });
    }
  });

  const handleSave = async () => {
    if (!institution?.id) return;
    await updatePolicies.mutateAsync({
      institutionId: institution.id,
      updates: formData,
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Transport Settings" subtitle="Configure transport policies">
        <Skeleton className="h-96" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Transport Settings">
      <div className="max-w-2xl space-y-6">
        <SettingsBackHeader 
          title="Transport Settings" 
          description="Configure transport policies" 
        />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Subscription Policies
            </CardTitle>
            <CardDescription>Configure how transport subscriptions are handled</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Approval for New Subscriptions</Label>
                <p className="text-sm text-muted-foreground">
                  Staff-created subscriptions will require admin approval
                </p>
              </div>
              <Switch
                checked={formData.require_approval_for_subscription}
                onCheckedChange={v => setFormData(p => ({ ...p, require_approval_for_subscription: v }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Parent Self-Service</Label>
                <p className="text-sm text-muted-foreground">
                  Parents can request transport subscriptions from their portal
                </p>
              </div>
              <Switch
                checked={formData.allow_parent_self_service}
                onCheckedChange={v => setFormData(p => ({ ...p, allow_parent_self_service: v }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment & Suspension Policies</CardTitle>
            <CardDescription>Configure automatic suspension for non-payment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Auto-Suspension</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically suspend transport for overdue fees
                </p>
              </div>
              <Switch
                checked={formData.enable_auto_suspension}
                onCheckedChange={v => setFormData(p => ({ ...p, enable_auto_suspension: v }))}
              />
            </div>

            {formData.enable_auto_suspension && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Days Overdue Before Suspension</Label>
                    <Input
                      type="number"
                      value={formData.suspension_days_overdue}
                      onChange={e => setFormData(p => ({ ...p, suspension_days_overdue: parseInt(e.target.value) || 30 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Grace Period (Days)</Label>
                    <Input
                      type="number"
                      value={formData.suspension_grace_period_days}
                      onChange={e => setFormData(p => ({ ...p, suspension_grace_period_days: parseInt(e.target.value) || 7 }))}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Send Suspension Notice</Label>
                    <p className="text-sm text-muted-foreground">
                      Send SMS/email before suspending transport
                    </p>
                  </div>
                  <Switch
                    checked={formData.send_suspension_notice}
                    onCheckedChange={v => setFormData(p => ({ ...p, send_suspension_notice: v }))}
                  />
                </div>

                {formData.send_suspension_notice && (
                  <div className="space-y-2">
                    <Label>Days Before Suspension to Send Notice</Label>
                    <Input
                      type="number"
                      value={formData.notice_days_before_suspension}
                      onChange={e => setFormData(p => ({ ...p, notice_days_before_suspension: parseInt(e.target.value) || 3 }))}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={updatePolicies.isPending} className="w-full">
          {updatePolicies.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Settings
        </Button>
      </div>
    </DashboardLayout>
  );
}
