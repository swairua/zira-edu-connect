import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUpdateFeeItem, useFeeCategories, FeeItem } from '@/hooks/useFeeItems';
import { Loader2 } from 'lucide-react';

interface EditFeeItemDialogProps {
  feeItem: FeeItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditFeeItemDialog({ feeItem, open, onOpenChange }: EditFeeItemDialogProps) {
  const categories = useFeeCategories();
  const updateFeeItem = useUpdateFeeItem();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    category: '',
    is_mandatory: true,
  });

  useEffect(() => {
    if (feeItem) {
      setFormData({
        name: feeItem.name,
        description: feeItem.description || '',
        amount: String(feeItem.amount),
        category: feeItem.category || '',
        is_mandatory: feeItem.is_mandatory ?? true,
      });
    }
  }, [feeItem]);

  const handleUpdate = async () => {
    if (!feeItem || !formData.name || !formData.amount) return;

    await updateFeeItem.mutateAsync({
      id: feeItem.id,
      name: formData.name,
      description: formData.description || null,
      amount: parseInt(formData.amount, 10),
      category: formData.category || null,
      is_mandatory: formData.is_mandatory,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Edit Fee Item</DialogTitle>
          <DialogDescription>
            Update the fee item details
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto pr-4">
          <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-amount">Amount (KES) *</Label>
            <Input
              id="edit-amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-category">Category</Label>
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
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="edit-mandatory"
              checked={formData.is_mandatory}
              onCheckedChange={(checked) => setFormData({ ...formData, is_mandatory: checked })}
            />
            <Label htmlFor="edit-mandatory">Mandatory Fee</Label>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={updateFeeItem.isPending || !formData.name || !formData.amount}
          >
            {updateFeeItem.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
