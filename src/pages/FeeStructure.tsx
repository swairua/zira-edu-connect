import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useFeeItems, useCreateFeeItem, useFeeCategories, FeeItem } from '@/hooks/useFeeItems';
import { useAcademicYears, useCurrentAcademicYear } from '@/hooks/useAcademicYears';
import { InstallmentManager } from '@/components/finance/InstallmentManager';
import { PenaltyManager } from '@/components/finance/PenaltyManager';
import { EditFeeItemDialog } from '@/components/finance/EditFeeItemDialog';
import {
  Wallet,
  Plus,
  Search,
  Filter,
  Loader2,
  DollarSign,
  Tag,
  MoreHorizontal,
  Calendar,
  AlertTriangle,
  Pencil,
} from 'lucide-react';

export default function FeeStructure() {
  const { institutionId, institution } = useInstitution();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Selected fee item for management dialogs
  const [selectedFeeItem, setSelectedFeeItem] = useState<FeeItem | null>(null);
  const [isInstallmentDialogOpen, setIsInstallmentDialogOpen] = useState(false);
  const [isPenaltyDialogOpen, setIsPenaltyDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: feeItems = [], isLoading } = useFeeItems(institutionId);
  const { data: currentYear } = useCurrentAcademicYear(institutionId);
  const categories = useFeeCategories();
  const createFeeItem = useCreateFeeItem();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    category: '',
    is_mandatory: true,
  });

  const filteredItems = feeItems.filter((item) => {
    const matchesSearch =
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalFees = filteredItems.reduce((sum, item) => sum + item.amount, 0);
  const mandatoryFees = filteredItems
    .filter((item) => item.is_mandatory)
    .reduce((sum, item) => sum + item.amount, 0);

  const handleAddFeeItem = async () => {
    if (!institutionId || !formData.name || !formData.amount) return;

    await createFeeItem.mutateAsync({
      institution_id: institutionId,
      name: formData.name,
      description: formData.description || undefined,
      amount: parseInt(formData.amount, 10),
      category: formData.category || undefined,
      is_mandatory: formData.is_mandatory,
      academic_year_id: currentYear?.id,
    });

    setFormData({
      name: '',
      description: '',
      amount: '',
      category: '',
      is_mandatory: true,
    });
    setIsAddDialogOpen(false);
  };

  const getCategoryBadge = (category: string | null | undefined) => {
    const cat = categories.find((c) => c.value === category);
    return <Badge variant="outline">{cat?.label || category || 'Other'}</Badge>;
  };

  return (
    <DashboardLayout title="Fee Structure" subtitle="Configure fee items">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Fee Structure</h1>
            <p className="text-muted-foreground">
              Configure fee items for {institution?.name || 'your institution'}
            </p>
          </div>
          <PermissionGate domain="finance" action="create">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Fee Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Fee Item</DialogTitle>
                  <DialogDescription>
                    Create a new fee item for the current academic year
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Tuition Fee"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (KES) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Optional description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddFeeItem}
                    disabled={createFeeItem.isPending || !formData.name || !formData.amount}
                  >
                    {createFeeItem.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Fee Item
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </PermissionGate>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Fee Items</p>
                  <p className="text-2xl font-bold">{filteredItems.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                  <DollarSign className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Fees</p>
                  <p className="text-2xl font-bold">KES {totalFees.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                  <Tag className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mandatory Fees</p>
                  <p className="text-2xl font-bold">KES {mandatoryFees.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Fee Items</CardTitle>
                <CardDescription>
                  {currentYear ? `Academic Year: ${currentYear.name}` : 'All fee items'}
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search fee items..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 sm:w-64"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Wallet className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No fee items found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {search || categoryFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Get started by adding your first fee item'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.description && (
                              <p className="text-sm text-muted-foreground">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getCategoryBadge(item.category)}</TableCell>
                        <TableCell className="font-medium">
                          KES {item.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.is_mandatory ? 'default' : 'secondary'}>
                            {item.is_mandatory ? 'Mandatory' : 'Optional'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <PermissionGate domain="finance" action="edit">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setSelectedFeeItem(item);
                                  setIsEditDialogOpen(true);
                                }}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedFeeItem(item);
                                  setIsInstallmentDialogOpen(true);
                                }}>
                                  <Calendar className="mr-2 h-4 w-4" />
                                  Manage Installments
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedFeeItem(item);
                                  setIsPenaltyDialogOpen(true);
                                }}>
                                  <AlertTriangle className="mr-2 h-4 w-4" />
                                  Configure Penalties
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </PermissionGate>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Installment Manager Dialog */}
        {selectedFeeItem && institutionId && (
          <InstallmentManager
            feeItemId={selectedFeeItem.id}
            feeItemName={selectedFeeItem.name}
            feeItemAmount={selectedFeeItem.amount}
            institutionId={institutionId}
            open={isInstallmentDialogOpen}
            onOpenChange={setIsInstallmentDialogOpen}
          />
        )}

        {/* Penalty Manager Dialog */}
        {institutionId && (
          <PenaltyManager
            feeItemId={selectedFeeItem?.id || null}
            feeItemName={selectedFeeItem?.name || 'All Fee Items'}
            institutionId={institutionId}
            open={isPenaltyDialogOpen}
            onOpenChange={setIsPenaltyDialogOpen}
          />
        )}

        {/* Edit Fee Item Dialog */}
        <EditFeeItemDialog
          feeItem={selectedFeeItem}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      </div>
    </DashboardLayout>
  );
}
