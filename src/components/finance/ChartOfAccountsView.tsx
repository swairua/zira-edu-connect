import { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  ChevronRight,
  ChevronDown,
  Folder,
  FileText,
  Lock,
  Loader2,
  LayoutTemplate,
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useChartOfAccounts, useCreateAccount, useUpdateAccount, useFunds } from '@/hooks/useAccounting';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CoaTemplate } from '@/config/chartOfAccountsTemplates';
import { CoaTemplateSelector } from '@/components/onboarding/CoaTemplateSelector';

// Roles that can create/edit chart of accounts
const COA_EDIT_ROLES = ['bursar', 'institution_admin', 'institution_owner'];

const ACCOUNT_TYPES = [
  { value: 'asset', label: 'Asset', color: 'bg-blue-100 text-blue-700' },
  { value: 'liability', label: 'Liability', color: 'bg-red-100 text-red-700' },
  { value: 'equity', label: 'Equity', color: 'bg-purple-100 text-purple-700' },
  { value: 'income', label: 'Income', color: 'bg-green-100 text-green-700' },
  { value: 'expense', label: 'Expense', color: 'bg-orange-100 text-orange-700' },
];

const INITIAL_FORM = {
  account_code: '',
  account_name: '',
  account_type: 'asset' as 'asset' | 'liability' | 'equity' | 'income' | 'expense',
  description: '',
  parent_account_id: null as string | null,
  fund_id: null as string | null,
  normal_balance: 'debit' as 'debit' | 'credit',
  is_bank_account: false,
  is_control_account: false,
  is_active: true,
};

interface ChartAccount {
  id: string;
  account_code: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  description: string | null;
  parent_account_id: string | null;
  fund_id: string | null;
  normal_balance: 'debit' | 'credit';
  is_bank_account: boolean;
  is_control_account: boolean;
  is_system_account: boolean;
  is_active: boolean;
  fund?: { fund_code: string } | null;
}

interface ChartOfAccountsViewProps {
  institutionId: string | null;
}

export function ChartOfAccountsView({ institutionId }: ChartOfAccountsViewProps) {
  const { userRoles, isSuperAdmin } = useAuth();

  // Check if user can edit accounts (bursar, institution_admin, institution_owner, or super_admin)
  const canEditAccounts = isSuperAdmin || userRoles.some(r => COA_EDIT_ROLES.includes(r.role));

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ChartAccount | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);

  const { data: accounts = [], isLoading, refetch } = useChartOfAccounts(institutionId);
  const { data: funds = [] } = useFunds(institutionId);
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();

  // Load chart of accounts from selected template
  const handleApplyTemplate = async (template: CoaTemplate) => {
    if (!institutionId) return;
    
    setIsLoadingTemplate(true);
    try {
      const codeToId = new Map<string, string>();
      const sortedAccounts = [...template.accounts].sort((a, b) => a.code.localeCompare(b.code));
      let created = 0;
      let skipped = 0;
      
      for (const account of sortedAccounts) {
        const existing = accounts.find(a => a.account_code === account.code);
        if (existing) {
          codeToId.set(account.code, existing.id);
          skipped++;
          continue;
        }
        
        const parentId = account.parent ? codeToId.get(account.parent) : null;
        const normalBalance = ['asset', 'expense'].includes(account.type) ? 'debit' : 'credit';
        
        const { data, error } = await supabase
          .from('chart_of_accounts')
          .insert({
            institution_id: institutionId,
            account_code: account.code,
            account_name: account.name,
            account_type: account.type,
            description: account.description || null,
            parent_account_id: parentId,
            normal_balance: normalBalance,
            is_bank_account: account.isBank || false,
            is_control_account: account.isControl || false,
            is_system_account: false,
            is_active: true,
          })
          .select('id')
          .single();
        
        if (!error && data) {
          codeToId.set(account.code, data.id);
          created++;
        }
      }
      
      await refetch();
      toast.success(`${template.name} template applied`, {
        description: `Created ${created} accounts${skipped > 0 ? `, ${skipped} existing accounts preserved` : ''}`,
      });
      setTemplateSelectorOpen(false);
    } catch (error) {
      console.error('Error applying template:', error);
      toast.error('Failed to apply template');
    } finally {
      setIsLoadingTemplate(false);
    }
  };

  // Build tree structure
  const buildAccountTree = (accounts: ChartAccount[]) => {
    const map = new Map<string, ChartAccount & { children: ChartAccount[] }>();
    const roots: (ChartAccount & { children: ChartAccount[] })[] = [];

    accounts.forEach((account) => {
      map.set(account.id, { ...account, children: [] });
    });

    accounts.forEach((account) => {
      const node = map.get(account.id)!;
      if (account.parent_account_id && map.has(account.parent_account_id)) {
        map.get(account.parent_account_id)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const filteredAccounts = accounts.filter((account) => {
    if (typeFilter !== 'all' && account.account_type !== typeFilter) return false;
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      account.account_name.toLowerCase().includes(search) ||
      account.account_code.toLowerCase().includes(search)
    );
  });

  const accountTree = buildAccountTree(filteredAccounts);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedAccounts);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedAccounts(newExpanded);
  };

  const handleOpenDialog = (account?: ChartAccount) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        account_code: account.account_code,
        account_name: account.account_name,
        account_type: account.account_type,
        description: account.description || '',
        parent_account_id: account.parent_account_id,
        fund_id: account.fund_id,
        normal_balance: account.normal_balance,
        is_bank_account: account.is_bank_account,
        is_control_account: account.is_control_account,
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
        is_system_account: false,
      });
    }
    setDialogOpen(false);
  };

  const renderAccountRow = (
    account: ChartAccount & { children: ChartAccount[] },
    level = 0
  ): React.ReactNode => {
    const hasChildren = account.children.length > 0;
    const isExpanded = expandedAccounts.has(account.id);
    const typeConfig = ACCOUNT_TYPES.find((t) => t.value === account.account_type);

    return (
      <div key={account.id}>
        <div
          className={cn(
            'flex items-center gap-2 py-2 px-4 hover:bg-muted/50 border-b',
            !account.is_active && 'opacity-50'
          )}
          style={{ paddingLeft: `${level * 24 + 16}px` }}
        >
          {hasChildren ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => toggleExpand(account.id)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="w-6" />
          )}

          {hasChildren ? (
            <Folder className="h-4 w-4 text-muted-foreground" />
          ) : (
            <FileText className="h-4 w-4 text-muted-foreground" />
          )}

          <code className="font-mono text-sm text-muted-foreground w-20">
            {account.account_code}
          </code>

          <span className="flex-1 font-medium">{account.account_name}</span>

          <Badge className={cn('text-xs', typeConfig?.color)}>{typeConfig?.label}</Badge>

          {account.is_bank_account && (
            <Badge variant="outline" className="text-xs">
              Bank
            </Badge>
          )}

          {account.fund && (
            <Badge variant="secondary" className="text-xs">
              {account.fund.fund_code}
            </Badge>
          )}

          {canEditAccounts ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleOpenDialog(account)}
              disabled={account.is_system_account}
            >
              <Edit className="h-4 w-4" />
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex h-8 w-8 items-center justify-center">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </span>
              </TooltipTrigger>
              <TooltipContent>Only Bursar or Admin can edit</TooltipContent>
            </Tooltip>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div>
            {account.children
              .sort((a, b) => a.account_code.localeCompare(b.account_code))
              .map((child) =>
                renderAccountRow(child as ChartAccount & { children: ChartAccount[] }, level + 1)
              )}
          </div>
        )}
      </div>
    );
  };

  // Summary stats
  const accountsByType = ACCOUNT_TYPES.map((type) => ({
    ...type,
    count: accounts.filter((a) => a.account_type === type.value).length,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        {accountsByType.map((type) => (
          <Card
            key={type.value}
            className={cn(
              'cursor-pointer transition-colors',
              typeFilter === type.value && 'ring-2 ring-primary'
            )}
            onClick={() => setTypeFilter(typeFilter === type.value ? 'all' : type.value)}
          >
            <CardContent className="pt-4">
              <Badge className={type.color}>{type.label}</Badge>
              <p className="text-2xl font-bold mt-2">{type.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Accounts List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Chart of Accounts
              </CardTitle>
              <CardDescription>Hierarchical ledger account structure</CardDescription>
            </div>
            {canEditAccounts ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setTemplateSelectorOpen(true)}>
                  <LayoutTemplate className="h-4 w-4 mr-2" />
                  {accounts.length === 0 ? 'Load Template' : 'Add from Template'}
                </Button>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              </div>
            ) : (
              <Badge variant="outline" className="gap-1">
                <Lock className="h-3 w-3" />
                View Only
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search accounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {ACCOUNT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Accounts Tree */}
          {isLoading ? (
            <div className="space-y-2">
              {Array(8)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
            </div>
          ) : accountTree.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No accounts found</p>
              <Button variant="outline" className="mt-4" onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Create your first account
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted/50 py-2 px-4 text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="w-6" />
                <div className="w-6" />
                <div className="w-20">Code</div>
                <div className="flex-1">Account Name</div>
                <div className="w-20">Type</div>
                <div className="w-16">Tags</div>
                <div className="w-8" />
              </div>
              {accountTree
                .sort((a, b) => a.account_code.localeCompare(b.account_code))
                .map((account) => renderAccountRow(account))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAccount ? 'Edit Account' : 'Add Account'}</DialogTitle>
            <DialogDescription>
              {editingAccount ? 'Update account details' : 'Create a new ledger account'}
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account_code">Account Code</Label>
                  <Input
                    id="account_code"
                    value={formData.account_code}
                    onChange={(e) => setFormData((f) => ({ ...f, account_code: e.target.value }))}
                    placeholder="1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account_type">Account Type</Label>
                  <Select
                    value={formData.account_type}
                    onValueChange={(v) => {
                      const newType = v as typeof formData.account_type;
                      const normalBalance = ['asset', 'expense'].includes(newType) ? 'debit' : 'credit';
                      setFormData((f) => ({ ...f, account_type: newType, normal_balance: normalBalance }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCOUNT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_name">Account Name</Label>
                <Input
                  id="account_name"
                  value={formData.account_name}
                  onChange={(e) => setFormData((f) => ({ ...f, account_name: e.target.value }))}
                  placeholder="Cash in Hand"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parent_account">Parent Account</Label>
                  <Select
                    value={formData.parent_account_id || 'none'}
                    onValueChange={(v) =>
                      setFormData((f) => ({ ...f, parent_account_id: v === 'none' ? null : v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Root Account)</SelectItem>
                      {accounts
                        .filter((a) => a.id !== editingAccount?.id)
                        .map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.account_code} - {account.account_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fund">Fund (Optional)</Label>
                  <Select
                    value={formData.fund_id || 'none'}
                    onValueChange={(v) =>
                      setFormData((f) => ({ ...f, fund_id: v === 'none' ? null : v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Fund" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Fund</SelectItem>
                      {funds.map((fund) => (
                        <SelectItem key={fund.id} value={fund.id}>
                          {fund.fund_code} - {fund.fund_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Account description..."
                />
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_bank"
                    checked={formData.is_bank_account}
                    onCheckedChange={(checked) =>
                      setFormData((f) => ({ ...f, is_bank_account: checked }))
                    }
                  />
                  <Label htmlFor="is_bank">Bank Account</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_control"
                    checked={formData.is_control_account}
                    onCheckedChange={(checked) =>
                      setFormData((f) => ({ ...f, is_control_account: checked }))
                    }
                  />
                  <Label htmlFor="is_control">Control Account</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData((f) => ({ ...f, is_active: checked }))
                    }
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
                !formData.account_code ||
                !formData.account_name ||
                createAccount.isPending ||
                updateAccount.isPending
              }
            >
              {createAccount.isPending || updateAccount.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {editingAccount ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Selector Dialog */}
      <Dialog open={templateSelectorOpen} onOpenChange={setTemplateSelectorOpen}>
        <DialogContent className="max-w-4xl flex flex-col max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Load Chart of Accounts Template</DialogTitle>
            <DialogDescription>
              Select a pre-configured template to quickly set up your chart of accounts.
              {accounts.length > 0 && ' Existing accounts will be preserved.'}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="flex-1 overflow-y-auto">
            <CoaTemplateSelector
              onApplyTemplate={handleApplyTemplate}
              isApplying={isLoadingTemplate}
              existingAccountsCount={accounts.length}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
