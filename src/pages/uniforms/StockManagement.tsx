import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useUniformItems } from '@/hooks/useUniformItems';
import { useUniformSizes } from '@/hooks/useUniformSizes';
import { StockAdjustmentDialog } from '@/components/uniforms/StockAdjustmentDialog';
import { Search, Package, Plus, Minus, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { UniformItemSize, UniformItem } from '@/types/uniforms';

export default function StockManagement() {
  const { items, isLoading } = useUniformItems();
  const [search, setSearch] = useState('');
  const [adjustmentData, setAdjustmentData] = useState<{ size: UniformItemSize; item: UniformItem } | null>(null);

  // Flatten items with sizes for table display
  const stockItems = items.flatMap(item => 
    (item.sizes || []).map(size => ({ item, size }))
  ).filter(({ item, size }) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    size.size_label.toLowerCase().includes(search.toLowerCase()) ||
    size.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockItems = stockItems.filter(({ size }) => size.stock_quantity <= size.low_stock_threshold);

  return (
    <DashboardLayout title="Stock Management" subtitle="Track and adjust inventory levels">
      <div className="space-y-6">

        {lowStockItems.length > 0 && (
          <Card className="border-yellow-500/50 bg-yellow-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-yellow-700">
                <AlertTriangle className="h-4 w-4" />
                {lowStockItems.length} items below minimum stock level
              </CardTitle>
            </CardHeader>
          </Card>
        )}

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 mb-2" />
              ))}
            </CardContent>
          </Card>
        ) : stockItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No stock items</h3>
              <p className="text-muted-foreground">Add uniform items and sizes to track stock</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-center">Threshold</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockItems.map(({ item, size }) => {
                    const isLowStock = size.stock_quantity <= size.low_stock_threshold;
                    const isOutOfStock = size.stock_quantity === 0;
                    
                    return (
                      <TableRow key={size.id} className={isLowStock ? 'bg-yellow-50/50' : ''}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{size.size_label}</TableCell>
                        <TableCell className="text-muted-foreground">{size.sku || '-'}</TableCell>
                        <TableCell className="text-center font-medium">{size.stock_quantity}</TableCell>
                        <TableCell className="text-center text-muted-foreground">{size.low_stock_threshold}</TableCell>
                        <TableCell>
                          {isOutOfStock ? (
                            <Badge variant="destructive">Out of Stock</Badge>
                          ) : isLowStock ? (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Low Stock</Badge>
                          ) : (
                            <Badge variant="outline" className="text-green-600">In Stock</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setAdjustmentData({ size, item })}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Adjust
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {adjustmentData && (
        <StockAdjustmentDialog
          open={!!adjustmentData}
          onOpenChange={(open) => !open && setAdjustmentData(null)}
          size={adjustmentData.size}
          itemName={adjustmentData.item.name}
        />
      )}
    </DashboardLayout>
  );
}
