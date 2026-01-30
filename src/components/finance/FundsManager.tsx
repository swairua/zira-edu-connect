import { useState, useMemo } from 'react';
import {
  Wallet,
  Plus,
  Search,
  Edit,
  Building,
  Users,
  DollarSign,
  Briefcase,
  Gift,
  Landmark,
  Sparkles,
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useFunds, useCreateFund, useUpdateFund, Fund } from '@/hooks/useAccounting';
import { useOwnershipType, PUBLIC_SCHOOL_FUND_TEMPLATES, PRIVATE_SCHOOL_FUND_TEMPLATES } from '@/hooks/useOwnershipType';
import { cn } from '@/lib/utils';

const FUND_TYPE_CONFIG = {
  capitation: { label: 'Capitation', icon: Building, color: 'bg-blue-100 text-blue-700', publicOnly: true },
  fees: { label: 'Fees', icon: Users, color: 'bg-green-100 text-green-700', publicOnly: false },
  donation: { label: 'Donation', icon: Gift, color: 'bg-purple-100 text-purple-700', publicOnly: false },
  project: { label: 'Project', icon: Briefcase, color: 'bg-orange-100 text-orange-700', publicOnly: false },
  operations: { label: 'Operations', icon: DollarSign, color: 'bg-yellow-100 text-yellow-700', publicOnly: false },
  reserve: { label: 'Reserve', icon: Landmark, color: 'bg-gray-100 text-gray-700', publicOnly: false },
};

const SOURCE_CONFIG = {
  government: { label: 'Government', publicOnly: true },
  parents: { label: 'Parents', publicOnly: false },
  donors: { label: 'Donors', publicOnly: false },
  internal: { label: 'Internal', publicOnly: false },
  other: { label: 'Other', publicOnly: false },
};

const INITIAL_FORM = {
  fund_code: '',
  fund_name: '',
  fund_type: 'fees' as Fund['fund_type'],
  source: 'parents' as Fund['source'],
  description: '',
  budget_amount: 0,
  is_active: true,
};

interface FundsManagerProps {
  institutionId: string | null;
}

export function FundsManager({ institutionId }: FundsManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFund, setEditingFund] = useState<Fund | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const { data: funds = [], isLoading } = useFunds(institutionId);
  const createFund = useCreateFund();
  const updateFund = useUpdateFund();
  const { isPublicSchool, isPrivateSchool } = useOwnershipType();

  // Get templates based on ownership type
  const fundTemplates = useMemo(() => {
    if (isPublicSchool) return PUBLIC_SCHOOL_FUND_TEMPLATES;
    if (isPrivateSchool) return PRIVATE_SCHOOL_FUND_TEMPLATES;
    // Default to showing both for undefined ownership
    return [...PUBLIC_SCHOOL_FUND_TEMPLATES, ...PRIVATE_SCHOOL_FUND_TEMPLATES];
  }, [isPublicSchool, isPrivateSchool]);

  // Filter fund types based on ownership
  const availableFundTypes = useMemo(() => {
    return Object.entries(FUND_TYPE_CONFIG).filter(([_, config]) => {
      if (isPrivateSchool && config.publicOnly) return false;
      return true;
    });
  }, [isPrivateSchool]);

  // Filter sources based on ownership
  const availableSources = useMemo(() => {
    return Object.entries(SOURCE_CONFIG).filter(([_, config]) => {
      if (isPrivateSchool && config.publicOnly) return false;
      return true;
    });
  }, [isPrivateSchool]);

  const filteredFunds = funds.filter((fund) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      fund.fund_code.toLowerCase().includes(search) ||
      fund.fund_name.toLowerCase().includes(search)
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleOpenDialog = (fund?: Fund) => {
    if (fund) {
      setEditingFund(fund);
      setFormData({
        fund_code: fund.fund_code,
        fund_name: fund.fund_name,
        fund_type: fund.fund_type,
        source: fund.source,
        description: fund.description || '',
        budget_amount: fund.budget_amount,
        is_active: fund.is_active,
      });
    } else {
      setEditingFund(null);
      setFormData(INITIAL_FORM);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!institutionId) return;

    if (editingFund) {
      await updateFund.mutateAsync({ id: editingFund.id, ...formData });
    } else {
      await createFund.mutateAsync({ ...formData, institution_id: institutionId });
    }
    setDialogOpen(false);
  };

  // Calculate totals
  const totalBudget = funds.reduce((sum, f) => sum + f.budget_amount, 0);
  const activeFunds = funds.filter((f) => f.is_active).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Funds</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{funds.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Funds</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{activeFunds}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Government Funds</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {funds.filter((f) => f.source === 'government').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Funds List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Funds
              </CardTitle>
              <CardDescription>
                Configure funds for fee collection, capitation, and operations
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Fund
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search funds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 max-w-md"
            />
          </div>

          {/* Funds Grid */}
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
          ) : filteredFunds.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No funds found</p>
              <Button variant="outline" className="mt-4" onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Create your first fund
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredFunds.map((fund) => {
                const typeConfig = FUND_TYPE_CONFIG[fund.fund_type];
                const TypeIcon = typeConfig.icon;
                return (
                  <Card
                    key={fund.id}
                    className={cn(
                      'transition-colors hover:bg-muted/50',
                      !fund.is_active && 'opacity-60'
                    )}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn('p-2 rounded-lg', typeConfig.color)}>
                            <TypeIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                              {fund.fund_code}
                            </code>
                            <h3 className="font-semibold mt-1">{fund.fund_name}</h3>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenDialog(fund)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>

                      {fund.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {fund.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Budget</p>
                          <p className="text-lg font-bold">{formatCurrency(fund.budget_amount)}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge className={typeConfig.color}>{typeConfig.label}</Badge>
                          <p className="text-xs text-muted-foreground">
                            Source: {SOURCE_CONFIG[fund.source]?.label}
                          </p>
                        </div>
                      </div>

                      {!fund.is_active && (
                        <Badge variant="secondary" className="mt-4">
                          Inactive
                        </Badge>
                      )}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingFund ? 'Edit Fund' : 'Add New Fund'}</DialogTitle>
            <DialogDescription>
              {editingFund ? 'Update fund details' : 'Create a new fund for your institution'}
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
            <div className="grid gap-4">
              {/* Quick Setup Templates */}
              {!editingFund && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Sparkles className="h-4 w-4" />
                    Quick Setup
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {fundTemplates.map((template) => {
                      const exists = funds.some((f) => f.fund_code === template.code);
                      return (
                        <Button
                          key={template.code}
                          variant={exists ? 'secondary' : 'outline'}
                          size="sm"
                          disabled={exists}
                          onClick={() => {
                            setFormData({
                              fund_code: template.code,
                              fund_name: template.name,
                              fund_type: template.type as Fund['fund_type'],
                              source: template.source as Fund['source'],
                              description: template.description,
                              budget_amount: 0,
                              is_active: true,
                            });
                          }}
                        >
                          {exists ? '✓' : '+'} {template.code}
                        </Button>
                      );
                    })}
                  </div>
                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">or customize</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fund_code">Fund Code</Label>
                  <Input
                    id="fund_code"
                    value={formData.fund_code}
                    onChange={(e) => setFormData((f) => ({ ...f, fund_code: e.target.value.toUpperCase() }))}
                    placeholder="FPE"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fund_type">Fund Type</Label>
                  <Select
                    value={formData.fund_type}
                    onValueChange={(v) => {
                      const newType = v as Fund['fund_type'];
                      // Smart defaults: auto-select source based on type
                      let newSource = formData.source;
                      if (newType === 'capitation') newSource = 'government';
                      else if (newType === 'fees' || newType === 'operations') newSource = 'parents';
                      else if (newType === 'donation') newSource = 'donors';
                      setFormData((f) => ({ ...f, fund_type: newType, source: newSource }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFundTypes.map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fund_name">Fund Name</Label>
                <Input
                  id="fund_name"
                  value={formData.fund_name}
                  onChange={(e) => setFormData((f) => ({ ...f, fund_name: e.target.value }))}
                  placeholder="Free Primary Education"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Select
                    value={formData.source}
                    onValueChange={(v) => setFormData((f) => ({ ...f, source: v as Fund['source'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSources.map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (KES)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget_amount}
                    onChange={(e) => setFormData((f) => ({ ...f, budget_amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Describe this fund..."
                  rows={3}
                />
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
          </DialogBody>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.fund_code || !formData.fund_name || createFund.isPending || updateFund.isPending}
            >
              {editingFund ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
