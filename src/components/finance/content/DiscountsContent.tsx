import { useState } from 'react';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useDiscounts, useCreateDiscount, useDeleteDiscount, useApproveDiscount } from '@/hooks/useDiscounts';
import { useClasses } from '@/hooks/useClasses';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogBody } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Percent, DollarSign, Trash2, Check, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export function DiscountsContent() {
  const { institution } = useInstitution();
  const { data: discounts, isLoading } = useDiscounts(institution?.id || null);
  const { data: classes } = useClasses(institution?.id || null);
  const createDiscount = useCreateDiscount();
  const deleteDiscount = useDeleteDiscount();
  const approveDiscount = useApproveDiscount();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    amount: '',
    start_date: '',
    end_date: '',
    max_usage: '',
    requires_approval: false,
    applicable_classes: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution?.id) return;

    await createDiscount.mutateAsync({
      institution_id: institution.id,
      name: formData.name,
      description: formData.description || undefined,
      discount_type: formData.discount_type,
      amount: parseFloat(formData.amount),
      start_date: formData.start_date || undefined,
      end_date: formData.end_date || undefined,
      max_usage: formData.max_usage ? parseInt(formData.max_usage) : undefined,
      requires_approval: formData.requires_approval,
      applicable_classes: formData.applicable_classes.length > 0 ? formData.applicable_classes : undefined,
    });

    setIsDialogOpen(false);
    setFormData({
      name: '',
      description: '',
      discount_type: 'percentage',
      amount: '',
      start_date: '',
      end_date: '',
      max_usage: '',
      requires_approval: false,
      applicable_classes: [],
    });
  };

  const handleDelete = async (id: string) => {
    if (!institution?.id) return;
    await deleteDiscount.mutateAsync({ id, institutionId: institution.id });
  };

  const handleApprove = async (id: string) => {
    if (!institution?.id) return;
    await approveDiscount.mutateAsync({ id, institutionId: institution.id });
  };

  const formatAmount = (discount: { discount_type: string; amount: number }) => {
    if (discount.discount_type === 'percentage') {
      return `${discount.amount}%`;
    }
    return `KES ${discount.amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Discounts & Bursaries</h1>
          <p className="text-muted-foreground">Manage fee discounts and bursary programs</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Discount
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Discount</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <form id="discount-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Early Bird Discount"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the discount criteria..."
                  />
                </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(value: 'percentage' | 'fixed') => 
                      setFormData({ ...formData, discount_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    {formData.discount_type === 'percentage' ? 'Percentage' : 'Amount (KES)'}
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder={formData.discount_type === 'percentage' ? '10' : '5000'}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_usage">Max Usage (optional)</Label>
                <Input
                  id="max_usage"
                  type="number"
                  value={formData.max_usage}
                  onChange={(e) => setFormData({ ...formData, max_usage: e.target.value })}
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="requires_approval"
                  checked={formData.requires_approval}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, requires_approval: checked })
                  }
                />
                <Label htmlFor="requires_approval">Requires admin approval</Label>
              </div>
              </form>
            </DialogBody>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" form="discount-form" disabled={createDiscount.isPending}>
                {createDiscount.isPending ? 'Creating...' : 'Create Discount'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Discounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{discounts?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {discounts?.filter(d => !d.requires_approval || d.approved_by).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {discounts?.filter(d => d.requires_approval && !d.approved_by).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Discounts</CardTitle>
          <CardDescription>Configure fee discounts and bursary programs</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !discounts?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <Percent className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No discounts configured yet</p>
              <p className="text-sm">Create discounts to apply to student fees</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discounts.map((discount) => (
                  <TableRow key={discount.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{discount.name}</p>
                        {discount.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {discount.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        {discount.discount_type === 'percentage' ? (
                          <Percent className="h-3 w-3" />
                        ) : (
                          <DollarSign className="h-3 w-3" />
                        )}
                        {discount.discount_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatAmount(discount)}
                    </TableCell>
                    <TableCell>
                      {discount.start_date || discount.end_date ? (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {discount.start_date && format(new Date(discount.start_date), 'MMM d')}
                          {discount.start_date && discount.end_date && ' - '}
                          {discount.end_date && format(new Date(discount.end_date), 'MMM d, yyyy')}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No expiry</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {discount.max_usage ? (
                        <span className="text-sm">
                          {discount.current_usage} / {discount.max_usage}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Unlimited</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {discount.requires_approval && !discount.approved_by ? (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Pending Approval
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {discount.requires_approval && !discount.approved_by && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleApprove(discount.id)}
                            disabled={approveDiscount.isPending}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Discount</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{discount.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(discount.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
