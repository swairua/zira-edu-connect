import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useUniformSizes } from '@/hooks/useUniformSizes';
import { useInstitution } from '@/contexts/InstitutionContext';
import { Plus, Trash2 } from 'lucide-react';
import type { UniformItem, UniformItemSize } from '@/types/uniforms';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ManageSizesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: UniformItem;
}

export function ManageSizesDialog({ open, onOpenChange, item }: ManageSizesDialogProps) {
  const { institution } = useInstitution();
  const { createSize, updateSize, deleteSize } = useUniformSizes();
  const [newSize, setNewSize] = useState({ size_label: '', price_adjustment: 0, stock_quantity: 0, low_stock_threshold: 5 });
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSize = async () => {
    if (!newSize.size_label || !institution?.id) return;
    setIsAdding(true);
    try {
      await createSize.mutateAsync({
        item_id: item.id,
        institution_id: institution.id,
        size_label: newSize.size_label,
        price_adjustment: newSize.price_adjustment,
        stock_quantity: newSize.stock_quantity,
        low_stock_threshold: newSize.low_stock_threshold,
        sku: null,
        is_active: true,
      });
      setNewSize({ size_label: '', price_adjustment: 0, stock_quantity: 0, low_stock_threshold: 5 });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteSize = async (sizeId: string) => {
    await deleteSize.mutateAsync(sizeId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Sizes - {item.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add new size */}
          <div className="grid grid-cols-5 gap-2 items-end p-3 bg-muted/50 rounded-lg">
            <div>
              <Label className="text-xs">Size</Label>
              <Input
                placeholder="e.g., M, L, XL"
                value={newSize.size_label}
                onChange={(e) => setNewSize({ ...newSize, size_label: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">Price Adj.</Label>
              <Input
                type="number"
                placeholder="0"
                value={newSize.price_adjustment}
                onChange={(e) => setNewSize({ ...newSize, price_adjustment: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label className="text-xs">Initial Stock</Label>
              <Input
                type="number"
                placeholder="0"
                value={newSize.stock_quantity}
                onChange={(e) => setNewSize({ ...newSize, stock_quantity: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label className="text-xs">Min Stock</Label>
              <Input
                type="number"
                placeholder="5"
                value={newSize.low_stock_threshold}
                onChange={(e) => setNewSize({ ...newSize, low_stock_threshold: Number(e.target.value) })}
              />
            </div>
            <Button onClick={handleAddSize} disabled={!newSize.size_label || isAdding}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Existing sizes */}
          {item.sizes && item.sizes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Size</TableHead>
                  <TableHead>Price Adj.</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Min</TableHead>
                  <TableHead>Final Price</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {item.sizes.map((size) => (
                  <TableRow key={size.id}>
                    <TableCell className="font-medium">{size.size_label}</TableCell>
                    <TableCell>
                      {size.price_adjustment > 0 ? '+' : ''}{size.price_adjustment}
                    </TableCell>
                    <TableCell>
                      <Badge variant={size.stock_quantity <= size.low_stock_threshold ? 'destructive' : 'secondary'}>
                        {size.stock_quantity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{size.low_stock_threshold}</TableCell>
                    <TableCell className="font-medium">
                      KES {(item.base_price + size.price_adjustment).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteSize(size.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No sizes added yet. Add sizes above to make this item available for ordering.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
