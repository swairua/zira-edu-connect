import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useUniformItems } from '@/hooks/useUniformItems';
import { AddUniformItemDialog } from '@/components/uniforms/AddUniformItemDialog';
import { ManageSizesDialog } from '@/components/uniforms/ManageSizesDialog';
import { Plus, Search, Package, Edit, Trash2, Ruler } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { uniformCategoryLabels, uniformGenderLabels, type UniformItem } from '@/types/uniforms';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function UniformCatalog() {
  const { items, isLoading, deleteItem } = useUniformItems();
  const [search, setSearch] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<UniformItem | null>(null);
  const [sizesItem, setSizesItem] = useState<UniformItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteItem.mutateAsync(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  return (
    <DashboardLayout 
      title="Uniform Catalog" 
      subtitle="Manage uniform items and sizes"
      actions={
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      }
    >
        <div className="flex items-center gap-4">

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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No uniform items</h3>
              <p className="text-muted-foreground mb-4">Get started by adding your first uniform item</p>
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <Card key={item.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{uniformCategoryLabels[item.category] || item.category}</Badge>
                        <Badge variant="secondary">{uniformGenderLabels[item.gender] || item.gender}</Badge>
                      </div>
                    </div>
                    <Badge variant={item.is_active ? 'default' : 'secondary'}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">
                      {item.currency} {item.base_price.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {item.sizes?.length || 0} sizes
                    </span>
                  </div>
                  
                  {item.sizes && item.sizes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.sizes.slice(0, 5).map((size) => (
                        <Badge key={size.id} variant="outline" className="text-xs">
                          {size.size_label} ({size.stock_quantity})
                        </Badge>
                      ))}
                      {item.sizes.length > 5 && (
                        <Badge variant="outline" className="text-xs">+{item.sizes.length - 5}</Badge>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSizesItem(item)}>
                      <Ruler className="mr-1 h-3 w-3" />
                      Sizes
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setEditItem(item)}>
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(item.id)}>
                      <Trash2 className="mr-1 h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AddUniformItemDialog
        open={addDialogOpen || !!editItem}
        onOpenChange={(open) => {
          setAddDialogOpen(open);
          if (!open) setEditItem(null);
        }}
        editItem={editItem}
      />

      {sizesItem && (
        <ManageSizesDialog
          open={!!sizesItem}
          onOpenChange={(open) => !open && setSizesItem(null)}
          item={sizesItem}
        />
      )}

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this uniform item and all its sizes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
