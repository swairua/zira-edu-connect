import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Plus, Edit2, Check, X, Gift } from 'lucide-react';
import { useSmsBundles, useUpsertSmsBundle, useToggleSmsBundleActive, SmsBundle, calculateSmsRate } from '@/hooks/useSmsBilling';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface BundleFormData {
  id?: string;
  name: string;
  description: string;
  price: number;
  credits: number;
  bonus_credits: number;
  display_order: number;
}

const defaultFormData: BundleFormData = {
  name: '',
  description: '',
  price: 0,
  credits: 0,
  bonus_credits: 0,
  display_order: 0,
};

export function SmsBundleManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<BundleFormData>(defaultFormData);

  const { data: bundles, isLoading } = useSmsBundles();
  const upsertBundle = useUpsertSmsBundle();
  const toggleActive = useToggleSmsBundleActive();

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const handleEdit = (bundle: SmsBundle) => {
    setFormData({
      id: bundle.id,
      name: bundle.name,
      description: bundle.description ?? '',
      price: bundle.price,
      credits: bundle.credits,
      bonus_credits: bundle.bonus_credits,
      display_order: bundle.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    const maxOrder = bundles?.reduce((max, b) => Math.max(max, b.display_order), 0) ?? 0;
    setFormData({
      ...defaultFormData,
      display_order: maxOrder + 1,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    await upsertBundle.mutateAsync({
      id: formData.id,
      name: formData.name,
      description: formData.description || null,
      price: formData.price,
      credits: formData.credits,
      bonus_credits: formData.bonus_credits,
      display_order: formData.display_order,
    } as any);
    
    setIsDialogOpen(false);
    setFormData(defaultFormData);
  };

  const handleToggle = async (bundle: SmsBundle) => {
    await toggleActive.mutateAsync({
      id: bundle.id,
      is_active: !bundle.is_active,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                SMS Credit Bundles
              </CardTitle>
              <CardDescription>
                Configure prepaid SMS packages that institutions can purchase
              </CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Bundle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bundle Name</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Credits</TableHead>
                <TableHead className="text-right">Bonus</TableHead>
                <TableHead className="text-right">Rate/SMS</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bundles?.map((bundle) => {
                const rate = calculateSmsRate(bundle);
                const totalCredits = bundle.credits + bundle.bonus_credits;

                return (
                  <TableRow key={bundle.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{bundle.name}</p>
                        {bundle.description && (
                          <p className="text-xs text-muted-foreground">{bundle.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(bundle.price)}
                    </TableCell>
                    <TableCell className="text-right">
                      {bundle.credits.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {bundle.bonus_credits > 0 ? (
                        <Badge variant="secondary" className="gap-1">
                          <Gift className="h-3 w-3" />
                          +{bundle.bonus_credits.toLocaleString()}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      KES {rate.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={bundle.is_active}
                        onCheckedChange={() => handleToggle(bundle)}
                        disabled={toggleActive.isPending}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleEdit(bundle)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}

              {bundles?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No SMS bundles configured.
                    <Button variant="link" className="ml-1" onClick={handleCreate}>
                      Create one now
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bundle Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formData.id ? 'Edit SMS Bundle' : 'Create SMS Bundle'}
            </DialogTitle>
            <DialogDescription>
              Configure the bundle details including pricing and credit allocation
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Bundle Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Gold Bundle"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Short description of the bundle"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (KES)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="credits">SMS Credits</Label>
                <Input
                  id="credits"
                  type="number"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bonus">Bonus Credits</Label>
                <Input
                  id="bonus"
                  type="number"
                  value={formData.bonus_credits}
                  onChange={(e) => setFormData({ ...formData, bonus_credits: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* Rate Preview */}
            {formData.credits > 0 && (
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-sm">
                  <span className="text-muted-foreground">Effective rate:</span>{' '}
                  <span className="font-semibold">
                    KES {(formData.price / (formData.credits + formData.bonus_credits)).toFixed(2)} per SMS
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Total credits:</span>{' '}
                  <span className="font-semibold">
                    {(formData.credits + formData.bonus_credits).toLocaleString()}
                  </span>
                </p>
              </div>
            )}
          </DialogBody>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.name || formData.price <= 0 || formData.credits <= 0 || upsertBundle.isPending}
            >
              {upsertBundle.isPending ? 'Saving...' : formData.id ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
