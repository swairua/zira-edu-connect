import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Landmark,
  CreditCard,
  FileSpreadsheet,
  Check,
  ChevronRight,
  Loader2,
  AlertCircle,
  Wallet,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useChartOfAccounts, useBankAccounts, useCreateBankAccount, useFunds, BankAccount } from '@/hooks/useAccounting';
import { CoaTemplateSelector } from './CoaTemplateSelector';
import { COA_TEMPLATES, CoaTemplate } from '@/config/chartOfAccountsTemplates';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FinanceQuickSetupProps {
  onComplete?: () => void;
}

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  isComplete: boolean;
  isOptional?: boolean;
}

const BANK_ACCOUNT_TYPES: { value: BankAccount['account_type']; label: string }[] = [
  { value: 'current', label: 'Current Account' },
  { value: 'savings', label: 'Savings Account' },
  { value: 'mpesa', label: 'M-Pesa / Mobile Money' },
  { value: 'fixed_deposit', label: 'Fixed Deposit' },
  { value: 'other', label: 'Other' },
];

const CURRENCIES = [
  { value: 'KES', label: 'KES - Kenyan Shilling' },
  { value: 'UGX', label: 'UGX - Ugandan Shilling' },
  { value: 'TZS', label: 'TZS - Tanzanian Shilling' },
  { value: 'RWF', label: 'RWF - Rwandan Franc' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'EUR', label: 'EUR - Euro' },
];

export function FinanceQuickSetup({ onComplete }: FinanceQuickSetupProps) {
  const navigate = useNavigate();
  const { institutionId, institution } = useInstitution();
  const { data: accounts = [], refetch: refetchCoa } = useChartOfAccounts(institutionId);
  const { data: bankAccounts = [], refetch: refetchBanks } = useBankAccounts(institutionId);
  const { data: funds = [] } = useFunds(institutionId);
  const createBankAccount = useCreateBankAccount();

  const [coaDialogOpen, setCoaDialogOpen] = useState(false);
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [isApplyingCoa, setIsApplyingCoa] = useState(false);

  const [bankForm, setBankForm] = useState({
    account_name: '',
    account_number: '',
    bank_name: '',
    branch: '',
    account_type: 'current' as BankAccount['account_type'],
    currency: 'KES',
    opening_balance: '0',
    fund_id: '',
  });

  // Calculate setup status
  const hasChartOfAccounts = accounts.length > 0;
  const hasBankAccounts = bankAccounts.length > 0;
  const hasLedgerLinks = bankAccounts.some(b => b.ledger_account_id);
  
  const steps: SetupStep[] = [
    {
      id: 'coa',
      title: 'Chart of Accounts',
      description: hasChartOfAccounts 
        ? `${accounts.length} ledger accounts configured`
        : 'Set up your general ledger structure',
      icon: FileSpreadsheet,
      isComplete: hasChartOfAccounts,
    },
    {
      id: 'bank',
      title: 'Bank Accounts',
      description: hasBankAccounts
        ? `${bankAccounts.length} bank/cash accounts configured`
        : 'Configure your bank and cash accounts',
      icon: Landmark,
      isComplete: hasBankAccounts,
    },
    {
      id: 'ledger_link',
      title: 'Ledger Integration',
      description: hasLedgerLinks
        ? 'Bank accounts linked to ledger'
        : 'Link banks to ledger for double-entry',
      icon: CreditCard,
      isComplete: hasLedgerLinks,
      isOptional: true,
    },
  ];

  const completedCount = steps.filter(s => s.isComplete).length;
  const totalRequired = steps.filter(s => !s.isOptional).length;
  const completionPercentage = Math.round((completedCount / steps.length) * 100);

  // Apply CoA template
  const handleApplyCoaTemplate = async (template: CoaTemplate) => {
    if (!institutionId) return;

    setIsApplyingCoa(true);
    try {
      // Get existing account codes to avoid duplicates
      const existingCodes = accounts.map(a => a.account_code);

      // Create accounts in order (parents first)
      const accountsToCreate = template.accounts
        .filter(acc => !existingCodes.includes(acc.code))
        .sort((a, b) => a.code.localeCompare(b.code));

      for (const acc of accountsToCreate) {
        const parentAccount = acc.parent 
          ? accounts.find(a => a.account_code === acc.parent) 
          : null;

        const { error } = await supabase.from('chart_of_accounts').insert({
          institution_id: institutionId,
          account_code: acc.code,
          account_name: acc.name,
          account_type: acc.type,
          normal_balance: ['asset', 'expense'].includes(acc.type) ? 'debit' : 'credit',
          parent_account_id: parentAccount?.id || null,
          is_active: true,
        });

        if (error) throw error;
      }

      toast.success(`Added ${accountsToCreate.length} accounts from "${template.name}"`);
      refetchCoa();
      setCoaDialogOpen(false);
    } catch (error: any) {
      toast.error('Failed to apply template: ' + error.message);
    } finally {
      setIsApplyingCoa(false);
    }
  };

  // Create bank account
  const handleCreateBankAccount = async () => {
    if (!institutionId || !bankForm.account_name || !bankForm.bank_name) {
      toast.error('Please fill required fields');
      return;
    }

    try {
      await createBankAccount.mutateAsync({
        institution_id: institutionId,
        account_name: bankForm.account_name,
        account_number: bankForm.account_number,
        bank_name: bankForm.bank_name,
        branch: bankForm.branch || null,
        account_type: bankForm.account_type,
        currency: bankForm.currency,
        opening_balance: parseFloat(bankForm.opening_balance) || 0,
        current_balance: parseFloat(bankForm.opening_balance) || 0,
        fund_id: bankForm.fund_id || null,
        ledger_account_id: null,
        is_primary: bankAccounts.length === 0,
        is_active: true,
      });

      toast.success('Bank account created');
      refetchBanks();
      setBankDialogOpen(false);
      setBankForm({
        account_name: '',
        account_number: '',
        bank_name: '',
        branch: '',
        account_type: 'current',
        currency: 'KES',
        opening_balance: '0',
        fund_id: '',
      });
    } catch (error: any) {
      toast.error('Failed to create bank account: ' + error.message);
    }
  };

  const handleStepAction = (stepId: string) => {
    switch (stepId) {
      case 'coa':
        if (hasChartOfAccounts) {
          navigate('/portal/chart-of-accounts');
        } else {
          setCoaDialogOpen(true);
        }
        break;
      case 'bank':
        if (hasBankAccounts) {
          navigate('/portal/bank-accounts');
        } else {
          setBankDialogOpen(true);
        }
        break;
      case 'ledger_link':
        navigate('/portal/bank-accounts');
        break;
    }
  };

  const isSetupComplete = completedCount >= totalRequired;

  return (
    <>
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Finance Quick Setup</CardTitle>
                <CardDescription>
                  Configure your accounting foundation
                </CardDescription>
              </div>
            </div>
            {isSetupComplete && (
              <Badge className="bg-green-100 text-green-800">
                <Check className="h-3 w-3 mr-1" />
                Ready
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Progress value={completionPercentage} className="h-2 flex-1" />
            <span className="text-sm font-medium text-muted-foreground">
              {completedCount}/{steps.length}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                'flex items-center gap-4 p-3 rounded-lg border transition-colors',
                step.isComplete
                  ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900'
                  : 'bg-background hover:bg-muted/50 cursor-pointer'
              )}
              onClick={() => !step.isComplete && handleStepAction(step.id)}
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg',
                  step.isComplete
                    ? 'bg-green-500 text-white'
                    : 'bg-muted'
                )}
              >
                {step.isComplete ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={cn(
                    'font-medium',
                    step.isComplete && 'text-green-800 dark:text-green-400'
                  )}>
                    {step.title}
                  </p>
                  {step.isOptional && !step.isComplete && (
                    <Badge variant="outline" className="text-xs">Optional</Badge>
                  )}
                </div>
                <p className={cn(
                  'text-sm',
                  step.isComplete
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-muted-foreground'
                )}>
                  {step.description}
                </p>
              </div>
              {!step.isComplete && (
                <Button variant="ghost" size="icon" onClick={(e) => {
                  e.stopPropagation();
                  handleStepAction(step.id);
                }}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
              {step.isComplete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStepAction(step.id);
                  }}
                >
                  Manage
                </Button>
              )}
            </div>
          ))}

          {!isSetupComplete && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-400">
                  Complete the required steps above to enable full accounting features like vouchers, receipts, and financial reports.
                </p>
              </div>
            </div>
          )}

          {isSetupComplete && onComplete && (
            <Button className="w-full mt-4" onClick={onComplete}>
              Continue to Fee Structure
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Chart of Accounts Dialog */}
      <Dialog open={coaDialogOpen} onOpenChange={setCoaDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Set Up Chart of Accounts</DialogTitle>
          </DialogHeader>
          <DialogBody className="flex-1 overflow-y-auto">
            <CoaTemplateSelector
              onApplyTemplate={handleApplyCoaTemplate}
              isApplying={isApplyingCoa}
              existingAccountsCount={accounts.length}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Bank Account Dialog */}
      <Dialog open={bankDialogOpen} onOpenChange={setBankDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Bank Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Account Name *</Label>
                <Input
                  value={bankForm.account_name}
                  onChange={(e) => setBankForm(p => ({ ...p, account_name: e.target.value }))}
                  placeholder="e.g., Main Operating Account"
                />
              </div>
              <div className="space-y-2">
                <Label>Bank Name *</Label>
                <Input
                  value={bankForm.bank_name}
                  onChange={(e) => setBankForm(p => ({ ...p, bank_name: e.target.value }))}
                  placeholder="e.g., KCB Bank"
                />
              </div>
              <div className="space-y-2">
                <Label>Account Number</Label>
                <Input
                  value={bankForm.account_number}
                  onChange={(e) => setBankForm(p => ({ ...p, account_number: e.target.value }))}
                  placeholder="e.g., 1234567890"
                />
              </div>
              <div className="space-y-2">
                <Label>Account Type</Label>
                <Select
                  value={bankForm.account_type}
                  onValueChange={(v) => setBankForm(p => ({ ...p, account_type: v as BankAccount['account_type'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BANK_ACCOUNT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={bankForm.currency}
                  onValueChange={(v) => setBankForm(p => ({ ...p, currency: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((curr) => (
                      <SelectItem key={curr.value} value={curr.value}>
                        {curr.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Branch</Label>
                <Input
                  value={bankForm.branch}
                  onChange={(e) => setBankForm(p => ({ ...p, branch: e.target.value }))}
                  placeholder="e.g., Westlands Branch"
                />
              </div>
              <div className="space-y-2">
                <Label>Opening Balance</Label>
                <Input
                  type="number"
                  value={bankForm.opening_balance}
                  onChange={(e) => setBankForm(p => ({ ...p, opening_balance: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              {funds.length > 0 && (
                <div className="space-y-2 col-span-2">
                  <Label>Link to Fund (Optional)</Label>
                  <Select
                    value={bankForm.fund_id}
                    onValueChange={(v) => setBankForm(p => ({ ...p, fund_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select fund..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No fund</SelectItem>
                      {funds.map((fund) => (
                        <SelectItem key={fund.id} value={fund.id}>
                          {fund.fund_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBankDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateBankAccount}
              disabled={createBankAccount.isPending}
            >
              {createBankAccount.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Bank Account'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
