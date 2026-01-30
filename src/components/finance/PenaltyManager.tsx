import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { usePenalties, useCreatePenalty, useDeletePenalty } from '@/hooks/usePenalties';
import { AlertTriangle, Loader2, Plus, Trash2 } from 'lucide-react';

interface PenaltyManagerProps {
  feeItemId: string | null;
  feeItemName: string;
  institutionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PenaltyManager({
  feeItemId,
  feeItemName,
  institutionId,
  open,
  onOpenChange,
}: PenaltyManagerProps) {
  const { data: penalties = [], isLoading } = usePenalties(institutionId);
  const createPenalty = useCreatePenalty();
  const deletePenalty = useDeletePenalty();

  // Filter penalties by fee item if provided
  const filteredPenalties = feeItemId 
    ? penalties.filter(p => p.fee_item_id === feeItemId || p.fee_item_id === null)
    : penalties;

  const [formData, setFormData] = useState({
    name: '',
    penalty_type: 'percentage' as 'percentage' | 'fixed',
    penalty_amount: '',
    grace_period_days: '7',
    max_penalty: '',
    is_compounding: false,
    apply_per: 'invoice' as 'day' | 'installment' | 'invoice',
  });

  const handleAddPenalty = async () => {
    if (!formData.name || !formData.penalty_amount) return;

    await createPenalty.mutateAsync({
      institution_id: institutionId,
      fee_item_id: feeItemId || undefined,
      name: formData.name,
      penalty_type: formData.penalty_type,
      penalty_amount: parseFloat(formData.penalty_amount),
      grace_period_days: parseInt(formData.grace_period_days) || 0,
      max_penalty: formData.max_penalty ? parseFloat(formData.max_penalty) : undefined,
      is_compounding: formData.is_compounding,
      apply_per: formData.apply_per,
    });

    setFormData({
      name: '',
      penalty_type: 'percentage',
      penalty_amount: '',
      grace_period_days: '7',
      max_penalty: '',
      is_compounding: false,
      apply_per: 'invoice',
    });
  };

  const handleDeletePenalty = async (id: string) => {
    await deletePenalty.mutateAsync({ id, institutionId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Late Payment Penalties</DialogTitle>
          <DialogDescription>
            Configure penalties for {feeItemName || 'all fee items'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Penalty List */}
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredPenalties.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <AlertTriangle className="mx-auto h-12 w-12 opacity-50" />
              <p className="mt-2">No penalties configured</p>
              <p className="text-sm">Add a penalty rule below</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Grace Period</TableHead>
                  <TableHead>Apply Per</TableHead>
                  <TableHead>Max</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPenalties.map((penalty) => (
                  <TableRow key={penalty.id}>
                    <TableCell className="font-medium">{penalty.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {penalty.penalty_type === 'percentage' ? 'Percentage' : 'Fixed'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {penalty.penalty_type === 'percentage' 
                        ? `${penalty.penalty_amount}%`
                        : `KES ${penalty.penalty_amount.toLocaleString()}`}
                    </TableCell>
                    <TableCell>{penalty.grace_period_days} days</TableCell>
                    <TableCell className="capitalize">{penalty.apply_per || '-'}</TableCell>
                    <TableCell>
                      {penalty.max_penalty 
                        ? `KES ${penalty.max_penalty.toLocaleString()}`
                        : 'No limit'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePenalty(penalty.id)}
                        disabled={deletePenalty.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Add Penalty Form */}
          <div className="rounded-lg border p-4">
            <h4 className="mb-4 font-medium">Add Penalty Rule</h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Late Fee"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="penalty_type">Penalty Type</Label>
                <Select
                  value={formData.penalty_type}
                  onValueChange={(value: 'percentage' | 'fixed') => 
                    setFormData({ ...formData, penalty_type: value })}
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
                <Label htmlFor="penalty_amount">
                  {formData.penalty_type === 'percentage' ? 'Percentage (%)' : 'Amount (KES)'} *
                </Label>
                <Input
                  id="penalty_amount"
                  type="number"
                  placeholder={formData.penalty_type === 'percentage' ? '5' : '500'}
                  value={formData.penalty_amount}
                  onChange={(e) => setFormData({ ...formData, penalty_amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grace_period_days">Grace Period (days)</Label>
                <Input
                  id="grace_period_days"
                  type="number"
                  placeholder="7"
                  value={formData.grace_period_days}
                  onChange={(e) => setFormData({ ...formData, grace_period_days: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apply_per">Apply Per</Label>
                <Select
                  value={formData.apply_per}
                  onValueChange={(value: 'day' | 'installment' | 'invoice') => 
                    setFormData({ ...formData, apply_per: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="installment">Installment</SelectItem>
                    <SelectItem value="invoice">Invoice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_penalty">Max Penalty (KES)</Label>
                <Input
                  id="max_penalty"
                  type="number"
                  placeholder="Optional"
                  value={formData.max_penalty}
                  onChange={(e) => setFormData({ ...formData, max_penalty: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_compounding"
                  checked={formData.is_compounding}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_compounding: checked })}
                />
                <Label htmlFor="is_compounding">Compounding (penalty on penalty)</Label>
              </div>
              <Button
                onClick={handleAddPenalty}
                disabled={createPenalty.isPending || !formData.name || !formData.penalty_amount}
              >
                {createPenalty.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Plus className="mr-2 h-4 w-4" />
                Add Penalty
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
