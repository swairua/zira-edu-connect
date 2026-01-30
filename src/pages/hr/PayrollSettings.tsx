import { useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SettingsBackHeader } from '@/components/settings/SettingsBackHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings } from 'lucide-react';
import { usePayrollSettings, useUpsertPayrollSettings } from '@/hooks/usePayroll';
import { useForm } from 'react-hook-form';

interface PayrollSettingsForm {
  pay_day: number;
  currency: string;
  auto_generate: boolean;
}

export default function PayrollSettings() {
  const { data: settings, isLoading } = usePayrollSettings();
  const upsertSettings = useUpsertPayrollSettings();
  
  const { register, handleSubmit, setValue, watch, reset } = useForm<PayrollSettingsForm>({
    defaultValues: {
      pay_day: 25,
      currency: 'KES',
      auto_generate: false,
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        pay_day: settings.pay_day,
        currency: settings.currency,
        auto_generate: settings.auto_generate,
      });
    }
  }, [settings, reset]);

  const onSubmit = async (data: PayrollSettingsForm) => {
    await upsertSettings.mutateAsync(data);
  };

  const payDay = watch('pay_day');
  const autoGenerate = watch('auto_generate');

  return (
    <DashboardLayout title="Payroll Settings">
      <div className="space-y-6">
        <SettingsBackHeader 
          title="Payroll Settings" 
          description="Configure payroll processing settings" 
        />

        {isLoading ? (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    General Settings
                  </CardTitle>
                  <CardDescription>
                    Configure the default settings for payroll processing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="pay_day">Pay Day</Label>
                      <Select
                        value={String(payDay)}
                        onValueChange={(value) => setValue('pay_day', Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select pay day" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                            <SelectItem key={day} value={String(day)}>
                              {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of every month
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        The default day when salaries are paid
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={watch('currency')}
                        onValueChange={(value) => setValue('currency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="UGX">UGX - Ugandan Shilling</SelectItem>
                          <SelectItem value="TZS">TZS - Tanzanian Shilling</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        Currency used for salary calculations
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto_generate">Auto-generate Payroll</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically create payroll runs at the start of each month
                      </p>
                    </div>
                    <Switch
                      id="auto_generate"
                      checked={autoGenerate}
                      onCheckedChange={(checked) => setValue('auto_generate', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" disabled={upsertSettings.isPending}>
                  {upsertSettings.isPending ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
