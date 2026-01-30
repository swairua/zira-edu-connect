import { useState } from 'react';
import {
  Building,
  Plus,
  Search,
  Edit,
  CreditCard,
  Smartphone,
  Landmark,
  PiggyBank,
  Wallet,
  Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useBankAccounts, useCreateBankAccount, useUpdateBankAccount, useFunds, BankAccount } from '@/hooks/useAccounting';
import { cn } from '@/lib/utils';

const ACCOUNT_TYPE_CONFIG = {
  current: { label: 'Current Account', icon: CreditCard, color: 'bg-blue-100 text-blue-700' },
  savings: { label: 'Savings Account', icon: PiggyBank, color: 'bg-green-100 text-green-700' },
  fixed_deposit: { label: 'Fixed Deposit', icon: Landmark, color: 'bg-purple-100 text-purple-700' },
  mpesa: { label: 'M-Pesa', icon: Smartphone, color: 'bg-emerald-100 text-emerald-700' },
  other: { label: 'Other', icon: Wallet, color: 'bg-gray-100 text-gray-700' },
};

const INITIAL_FORM = {
  account_number: '',
  account_name: '',
  bank_name: '',
  branch: '',
  account_type: 'current' as BankAccount['account_type'],
  currency: 'KES',
  fund_id: null as string | null,
  opening_balance: 0,
  current_balance: 0,
  is_primary: false,
  is_active: true,
};

interface BankAccountsManagerProps {
  institutionId: string | null;
}

export function BankAccountsManager({ institutionId }: BankAccountsManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const { data: bankAccounts = [], isLoading } = useBankAccounts(institutionId);
  const { data: funds = [] } = useFunds(institutionId);
  const createAccount = useCreateBankAccount();
  const updateAccount = useUpdateBankAccount();

  const filteredAccounts = bankAccounts.filter((account) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      account.account_name.toLowerCase().includes(search) ||
      account.bank_name.toLowerCase().includes(search) ||
      account.account_number.includes(search)
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleOpenDialog = (account?: BankAccount) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        account_number: account.account_number,
        account_name: account.account_name,
        bank_name: account.bank_name,
        branch: account.branch || '',
        account_type: account.account_type,
        currency: account.currency,
        fund_id: account.fund_id,
        opening_balance: account.opening_balance,
        current_balance: account.current_balance,
        is_primary: account.is_primary,
        is_active: account.is_active,
      });
    } else {
      setEditingAccount(null);
      setFormData(INITIAL_FORM);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!institutionId) return;

    if (editingAccount) {
      await updateAccount.mutateAsync({ id: editingAccount.id, ...formData });
    } else {
      await createAccount.mutateAsync({
        ...formData,
        institution_id: institutionId,
        ledger_account_id: null,
      });
    }
    setDialogOpen(false);
  };

  // Calculate totals
  const totalBalance = bankAccounts.reduce((sum, a) => sum + a.current_balance, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{bankAccounts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-emerald-600" />
              M-Pesa Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">
              {bankAccounts.filter((a) => a.account_type === 'mpesa').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {bankAccounts.filter((a) => a.is_active).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Accounts List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Bank Accounts
              </CardTitle>
              <CardDescription>
                Configure bank accounts for receipts and payments
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 max-w-md"
            />
          </div>

          {/* Accounts Grid */}
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <Skeleton className="h-6 w-24 mb-2" />
                      <Skeleton className="h-4 w-full mb-4" />
                      <Skeleton className="h-8 w-32" />
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No bank accounts found</p>
              <Button variant="outline" className="mt-4" onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add your first bank account
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAccounts.map((account) => {
                const typeConfig = ACCOUNT_TYPE_CONFIG[account.account_type];
                const TypeIcon = typeConfig.icon;
                return (
                  <Card
                    key={account.id}
                    className={cn(
                      'transition-colors hover:bg-muted/50 relative',
                      !account.is_active && 'opacity-60'
                    )}
                  >
                    {account.is_primary && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-yellow-100 text-yellow-700 gap-1">
                          <Star className="h-3 w-3" />
                          Primary
                        </Badge>
                      </div>
                    )}
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className={cn('p-2 rounded-lg', typeConfig.color)}>
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{account.account_name}</h3>
                          <p className="text-sm text-muted-foreground">{account.bank_name}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => handleOpenDialog(account)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Account No.</span>
                          <code className="font-mono">{account.account_number}</code>
                        </div>
                        {account.branch && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Branch</span>
                            <span>{account.branch}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t">
                        <p className="text-xs text-muted-foreground">Current Balance</p>
                        <p className="text-xl font-bold">{formatCurrency(account.current_balance)}</p>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <Badge className={typeConfig.color}>{typeConfig.label}</Badge>
                        {account.fund && (
                          <Badge variant="outline">{account.fund.fund_code}</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAccount ? 'Edit Bank Account' : 'Add Bank Account'}</DialogTitle>
            <DialogDescription>
              {editingAccount ? 'Update account details' : 'Add a new bank account'}
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account_name">Account Name</Label>
                  <Input
                    id="account_name"
                    value={formData.account_name}
                    onChange={(e) => setFormData((f) => ({ ...f, account_name: e.target.value }))}
                    placeholder="Main Current Account"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account_type">Account Type</Label>
                  <Select
                    value={formData.account_type}
                    onValueChange={(v) => setFormData((f) => ({ ...f, account_type: v as BankAccount['account_type'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ACCOUNT_TYPE_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bank_name">Bank Name</Label>
                  <Input
                    id="bank_name"
                    value={formData.bank_name}
                    onChange={(e) => setFormData((f) => ({ ...f, bank_name: e.target.value }))}
                    placeholder="Kenya Commercial Bank"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Input
                    id="branch"
                    value={formData.branch}
                    onChange={(e) => setFormData((f) => ({ ...f, branch: e.target.value }))}
                    placeholder="Nairobi Branch"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_number">Account Number</Label>
                <Input
                  id="account_number"
                  value={formData.account_number}
                  onChange={(e) => setFormData((f) => ({ ...f, account_number: e.target.value }))}
                  placeholder="1234567890"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="opening_balance">Opening Balance (KES)</Label>
                  <Input
                    id="opening_balance"
                    type="number"
                    value={formData.opening_balance}
                    onChange={(e) => setFormData((f) => ({ ...f, opening_balance: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fund_id">Linked Fund (Optional)</Label>
                  <Select
                    value={formData.fund_id || 'none'}
                    onValueChange={(v) => setFormData((f) => ({ ...f, fund_id: v === 'none' ? null : v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select fund" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No linked fund</SelectItem>
                      {funds.map((fund) => (
                        <SelectItem key={fund.id} value={fund.id}>
                          {fund.fund_code} - {fund.fund_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_primary"
                    checked={formData.is_primary}
                    onCheckedChange={(checked) => setFormData((f) => ({ ...f, is_primary: checked }))}
                  />
                  <Label htmlFor="is_primary">Primary Account</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData((f) => ({ ...f, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !formData.account_name ||
                !formData.bank_name ||
                !formData.account_number ||
                createAccount.isPending ||
                updateAccount.isPending
              }
            >
              {editingAccount ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
