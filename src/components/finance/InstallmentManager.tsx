import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useInstallments, useCreateInstallment, useDeleteInstallment } from '@/hooks/useInstallments';
import { Calendar, Loader2, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface InstallmentManagerProps {
  feeItemId: string;
  feeItemName: string;
  feeItemAmount: number;
  institutionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InstallmentManager({
  feeItemId,
  feeItemName,
  feeItemAmount,
  institutionId,
  open,
  onOpenChange,
}: InstallmentManagerProps) {
  const currentFeeItemId = feeItemId;
  const { data: installments = [], isLoading } = useInstallments(feeItemId);
  const createInstallment = useCreateInstallment();
  const deleteInstallment = useDeleteInstallment();

  const [formData, setFormData] = useState({
    installment_number: '',
    amount: '',
    due_date: '',
    description: '',
  });

  const totalInstallmentAmount = installments.reduce((sum, i) => sum + i.amount, 0);
  const remainingAmount = feeItemAmount - totalInstallmentAmount;

  const handleAddInstallment = async () => {
    if (!formData.amount || !formData.due_date) return;

    await createInstallment.mutateAsync({
      institution_id: institutionId,
      fee_item_id: feeItemId,
      installment_number: parseInt(formData.installment_number) || installments.length + 1,
      amount: parseFloat(formData.amount),
      due_date: formData.due_date,
      description: formData.description || undefined,
    });

    setFormData({
      installment_number: '',
      amount: '',
      due_date: '',
      description: '',
    });
  };

  const handleDeleteInstallment = async (id: string, itemFeeId: string) => {
    await deleteInstallment.mutateAsync({ id, feeItemId: itemFeeId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Installments</DialogTitle>
          <DialogDescription>
            Configure payment installments for {feeItemName} (KES {feeItemAmount.toLocaleString()})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="flex gap-4 rounded-lg bg-muted p-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Fee</p>
              <p className="font-semibold">KES {feeItemAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Allocated</p>
              <p className="font-semibold">KES {totalInstallmentAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className={`font-semibold ${remainingAmount < 0 ? 'text-destructive' : remainingAmount > 0 ? 'text-warning' : 'text-success'}`}>
                KES {remainingAmount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Installment List */}
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : installments.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Calendar className="mx-auto h-12 w-12 opacity-50" />
              <p className="mt-2">No installments configured</p>
              <p className="text-sm">Add installments below to create a payment schedule</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {installments.map((installment) => (
                  <TableRow key={installment.id}>
                    <TableCell>
                      <Badge variant="outline">{installment.installment_number}</Badge>
                    </TableCell>
                    <TableCell>{format(new Date(installment.due_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="font-medium">
                      KES {installment.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {installment.description || '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteInstallment(installment.id, currentFeeItemId)}
                        disabled={deleteInstallment.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Add Installment Form */}
          <div className="rounded-lg border p-4">
            <h4 className="mb-4 font-medium">Add Installment</h4>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="installment_number"># Order</Label>
                <Input
                  id="installment_number"
                  type="number"
                  placeholder={String(installments.length + 1)}
                  value={formData.installment_number}
                  onChange={(e) => setFormData({ ...formData, installment_number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date *</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (KES) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder={remainingAmount > 0 ? String(remainingAmount) : '0'}
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="e.g., Term 1"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleAddInstallment}
                disabled={createInstallment.isPending || !formData.amount || !formData.due_date}
              >
                {createInstallment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Plus className="mr-2 h-4 w-4" />
                Add Installment
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
