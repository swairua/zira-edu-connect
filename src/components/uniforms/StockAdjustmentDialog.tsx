import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUniformSizes } from '@/hooks/useUniformSizes';
import type { UniformItemSize } from '@/types/uniforms';

interface StockAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  size: UniformItemSize;
  itemName: string;
}

export function StockAdjustmentDialog({ open, onOpenChange, size, itemName }: StockAdjustmentDialogProps) {
  const { adjustStock } = useUniformSizes();
  const [movementType, setMovementType] = useState<string>('stock_in');
  const [quantity, setQuantity] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (quantity === 0) return;
    setIsSubmitting(true);
    
    try {
      // For stock_in and return, quantity is positive. For adjustment (decrease), it's negative.
      const adjustedQuantity = movementType === 'adjustment' && quantity > 0 ? -quantity : quantity;
      
      await adjustStock.mutateAsync({
        sizeId: size.id,
        quantity: movementType === 'stock_in' || movementType === 'return' ? Math.abs(quantity) : adjustedQuantity,
        movementType,
        notes: notes || undefined,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const newStock = movementType === 'stock_in' || movementType === 'return'
    ? size.stock_quantity + Math.abs(quantity)
    : size.stock_quantity - Math.abs(quantity);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium">{itemName}</p>
              <p className="text-sm text-muted-foreground">Size: {size.size_label}</p>
              <p className="text-sm">Current Stock: <span className="font-medium">{size.stock_quantity}</span></p>
            </div>

            <div className="space-y-2">
              <Label>Adjustment Type</Label>
              <Select value={movementType} onValueChange={setMovementType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock_in">Stock In (Add)</SelectItem>
                  <SelectItem value="adjustment">Adjustment (Remove)</SelectItem>
                  <SelectItem value="return">Return (Add Back)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Reason for adjustment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {quantity > 0 && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  New Stock Level: <span className="font-bold">{Math.max(0, newStock)}</span>
                </p>
              </div>
            )}
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={quantity === 0 || isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Adjustment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
