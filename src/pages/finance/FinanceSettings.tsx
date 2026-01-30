import { useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SettingsBackHeader } from '@/components/settings/SettingsBackHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  DollarSign, 
  Calendar, 
  FileText, 
  Receipt, 
  ShieldCheck,
  Clock
} from 'lucide-react';
import { useFinanceSettings, useUpdateFinanceSettings } from '@/hooks/useFinanceSettings';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useFunds } from '@/hooks/useAccounting';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { FinanceModuleSettings } from '@/types/institution-settings';

const CURRENCIES = [
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KES' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'UGX' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TZS' },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'RWF' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵' },
];

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

// Finance settings page for institution configuration
export default function FinanceSettings() {
  const { institution } = useInstitution();
  const { data: settings, isLoading } = useFinanceSettings(institution?.id);
  const updateSettings = useUpdateFinanceSettings();
  const { data: funds = [] } = useFunds(institution?.id || null);
  
  const { register, handleSubmit, setValue, watch, reset, formState: { isDirty } } = useForm<FinanceModuleSettings>({
    defaultValues: settings,
  });

  useEffect(() => {
    if (settings) {
      reset(settings);
    }
  }, [settings, reset]);

  const onSubmit = async (data: FinanceModuleSettings) => {
    if (!institution?.id) {
      toast.error('No institution selected');
      return;
    }
    await updateSettings.mutateAsync({ 
      institutionId: institution.id, 
      settings: data 
    });
  };

  // Watch values for controlled components
  const defaultCurrency = watch('default_currency');
  const fiscalYearStartMonth = watch('fiscal_year_start_month');
  const fiscalYearNaming = watch('fiscal_year_naming');
  const periodNaming = watch('period_naming');
  const requireVoucherApproval = watch('require_voucher_approval');
  const voucherApprovalLevels = watch('voucher_approval_levels');
  const autoGenerateJournalEntries = watch('auto_generate_journal_entries');
  const enforceBudgetLimits = watch('enforce_budget_limits');
  const allowBackdatedEntries = watch('allow_backdated_entries');
  const backdatedDaysLimit = watch('backdated_days_limit');
  const defaultFundId = watch('default_fund_id');
  const showBalanceOnReceipt = watch('show_balance_on_receipt');
  const showItemizedFees = watch('show_itemized_fees');
  const decimalPlaces = watch('decimal_places');
  const thousandSeparator = watch('thousand_separator');
  const decimalSeparator = watch('decimal_separator');

  // Update currency symbol when currency changes
  useEffect(() => {
    const currency = CURRENCIES.find(c => c.code === defaultCurrency);
    if (currency) {
      setValue('currency_symbol', currency.symbol);
    }
  }, [defaultCurrency, setValue]);

  return (
    <DashboardLayout title="Finance Settings">
      <div className="space-y-6">
        <SettingsBackHeader 
          title="Finance Settings" 
          description="Configure currency, fiscal year, and accounting preferences" 
        />

        {isLoading ? (
          <div className="space-y-6">
            {Array(3).fill(0).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6 space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              
              {/* Currency Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Currency Settings
                  </CardTitle>
                  <CardDescription>
                    Configure how currency amounts are displayed and formatted
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Default Currency</Label>
                      <Select
                        value={defaultCurrency}
                        onValueChange={(value) => setValue('default_currency', value, { shouldDirty: true })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.code} - {currency.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        Primary currency for all financial transactions
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Decimal Places</Label>
                      <Select
                        value={String(decimalPlaces)}
                        onValueChange={(value) => setValue('decimal_places', Number(value), { shouldDirty: true })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0 (1,000)</SelectItem>
                          <SelectItem value="2">2 (1,000.00)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Thousand Separator</Label>
                      <Select
                        value={thousandSeparator}
                        onValueChange={(value: ',' | '.' | ' ') => setValue('thousand_separator', value, { shouldDirty: true })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=",">Comma (1,000,000)</SelectItem>
                          <SelectItem value=".">Period (1.000.000)</SelectItem>
                          <SelectItem value=" ">Space (1 000 000)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Decimal Separator</Label>
                      <Select
                        value={decimalSeparator}
                        onValueChange={(value: '.' | ',') => setValue('decimal_separator', value, { shouldDirty: true })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=".">Period (1,000.00)</SelectItem>
                          <SelectItem value=",">Comma (1.000,00)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fiscal Year Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Fiscal Year Settings
                  </CardTitle>
                  <CardDescription>
                    Configure your accounting periods and fiscal year structure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Fiscal Year Start Month</Label>
                      <Select
                        value={String(fiscalYearStartMonth)}
                        onValueChange={(value) => setValue('fiscal_year_start_month', Number(value), { shouldDirty: true })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTHS.map((month) => (
                            <SelectItem key={month.value} value={String(month.value)}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        Month when your fiscal year begins
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Year Naming Convention</Label>
                      <Select
                        value={fiscalYearNaming}
                        onValueChange={(value: 'calendar' | 'academic' | 'custom') => 
                          setValue('fiscal_year_naming', value, { shouldDirty: true })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="calendar">Calendar Year (2024)</SelectItem>
                          <SelectItem value="academic">Academic Year (2024/2025)</SelectItem>
                          <SelectItem value="custom">Fiscal Year (FY2024)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Accounting Period</Label>
                    <Select
                      value={periodNaming}
                      onValueChange={(value: 'month' | 'quarter' | 'term') => 
                        setValue('period_naming', value, { shouldDirty: true })
                      }
                    >
                      <SelectTrigger className="w-full md:w-1/2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="month">Monthly (12 periods)</SelectItem>
                        <SelectItem value="quarter">Quarterly (4 periods)</SelectItem>
                        <SelectItem value="term">Term-based (3 periods)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      How accounting periods are structured in reports
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Accounting Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" />
                    Accounting Preferences
                  </CardTitle>
                  <CardDescription>
                    Configure controls and automation for accounting operations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Default Fund</Label>
                    <Select
                      value={defaultFundId || 'none'}
                      onValueChange={(value) => 
                        setValue('default_fund_id', value === 'none' ? undefined : value, { shouldDirty: true })
                      }
                    >
                      <SelectTrigger className="w-full md:w-1/2">
                        <SelectValue placeholder="Select default fund" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No default</SelectItem>
                        {funds.map((fund) => (
                          <SelectItem key={fund.id} value={fund.id}>
                            {fund.fund_code} - {fund.fund_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Default fund for new transactions if not specified
                    </p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label>Require Voucher Approval</Label>
                      <p className="text-sm text-muted-foreground">
                        Payment vouchers must be approved before processing
                      </p>
                    </div>
                    <Switch
                      checked={requireVoucherApproval}
                      onCheckedChange={(checked) => setValue('require_voucher_approval', checked, { shouldDirty: true })}
                    />
                  </div>

                  {requireVoucherApproval && (
                    <div className="space-y-2 ml-4 pl-4 border-l-2 border-muted">
                      <Label>Approval Levels</Label>
                      <Select
                        value={String(voucherApprovalLevels)}
                        onValueChange={(value) => setValue('voucher_approval_levels', Number(value) as 1 | 2 | 3, { shouldDirty: true })}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Single approval</SelectItem>
                          <SelectItem value="2">Two-level approval</SelectItem>
                          <SelectItem value="3">Three-level approval</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label>Auto-generate Journal Entries</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically create journal entries from payments and vouchers
                      </p>
                    </div>
                    <Switch
                      checked={autoGenerateJournalEntries}
                      onCheckedChange={(checked) => setValue('auto_generate_journal_entries', checked, { shouldDirty: true })}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label>Enforce Budget Limits</Label>
                      <p className="text-sm text-muted-foreground">
                        Block transactions that exceed budget allocations
                      </p>
                    </div>
                    <Switch
                      checked={enforceBudgetLimits}
                      onCheckedChange={(checked) => setValue('enforce_budget_limits', checked, { shouldDirty: true })}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Allow Backdated Entries
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Allow journal entries with dates in the past
                      </p>
                    </div>
                    <Switch
                      checked={allowBackdatedEntries}
                      onCheckedChange={(checked) => setValue('allow_backdated_entries', checked, { shouldDirty: true })}
                    />
                  </div>

                  {allowBackdatedEntries && (
                    <div className="space-y-2 ml-4 pl-4 border-l-2 border-muted">
                      <Label>Maximum Days Back</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          max={365}
                          className="w-24"
                          value={backdatedDaysLimit}
                          onChange={(e) => setValue('backdated_days_limit', Number(e.target.value), { shouldDirty: true })}
                        />
                        <span className="text-sm text-muted-foreground">days</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Receipt & Invoice Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Receipt & Invoice Settings
                  </CardTitle>
                  <CardDescription>
                    Configure receipt and invoice numbering and display options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Receipt Prefix</Label>
                      <Input
                        {...register('receipt_prefix')}
                        placeholder="RCP"
                        maxLength={10}
                      />
                      <p className="text-sm text-muted-foreground">
                        Prefix for receipt numbers (e.g., RCP-0001)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Invoice Prefix</Label>
                      <Input
                        {...register('invoice_prefix')}
                        placeholder="INV"
                        maxLength={10}
                      />
                      <p className="text-sm text-muted-foreground">
                        Prefix for invoice numbers (e.g., INV-0001)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Invoice Due Days</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        max={365}
                        className="w-24"
                        {...register('invoice_due_days', { valueAsNumber: true })}
                      />
                      <span className="text-sm text-muted-foreground">days after invoice date</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label>Show Balance on Receipt</Label>
                      <p className="text-sm text-muted-foreground">
                        Display remaining balance after payment on receipts
                      </p>
                    </div>
                    <Switch
                      checked={showBalanceOnReceipt}
                      onCheckedChange={(checked) => setValue('show_balance_on_receipt', checked, { shouldDirty: true })}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label>Show Itemized Fees</Label>
                      <p className="text-sm text-muted-foreground">
                        Display fee breakdown on invoices and statements
                      </p>
                    </div>
                    <Switch
                      checked={showItemizedFees}
                      onCheckedChange={(checked) => setValue('show_itemized_fees', checked, { shouldDirty: true })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => reset(settings)}
                  disabled={!isDirty}
                >
                  Reset
                </Button>
                <Button type="submit" disabled={updateSettings.isPending || !isDirty}>
                  {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
