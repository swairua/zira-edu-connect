import { useState } from 'react';
import { ParentLayout } from '@/components/parent/ParentLayout';
import { useParentUniformOrders } from '@/hooks/useParentUniformOrders';
import { useParent } from '@/contexts/ParentContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Plus, Minus, Package, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CartItem, UniformItem, UniformItemSize } from '@/types/uniforms';
import { uniformCategoryLabels, uniformGenderLabels } from '@/types/uniforms';

export default function ParentUniformStore() {
  const { selectedStudent } = useParent();
  const { items, isLoading } = useParentUniformOrders();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  const addToCart = (item: UniformItem) => {
    const sizeId = selectedSizes[item.id];
    if (!sizeId) return;

    const size = item.sizes?.find(s => s.id === sizeId);
    if (!size) return;

    setCart(prev => {
      const existing = prev.find(ci => ci.item.id === item.id && ci.size.id === sizeId);
      if (existing) {
        return prev.map(ci =>
          ci.item.id === item.id && ci.size.id === sizeId
            ? { ...ci, quantity: ci.quantity + 1 }
            : ci
        );
      }
      return [...prev, { item, size, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, sizeId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(ci =>
          ci.item.id === itemId && ci.size.id === sizeId
            ? { ...ci, quantity: Math.max(0, ci.quantity + delta) }
            : ci
        )
        .filter(ci => ci.quantity > 0)
    );
  };

  const cartTotal = cart.reduce(
    (sum, ci) => sum + (ci.item.base_price + ci.size.price_adjustment) * ci.quantity,
    0
  );

  const cartCount = cart.reduce((sum, ci) => sum + ci.quantity, 0);

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const cat = item.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, UniformItem[]>);

  if (isLoading) {
    return (
      <ParentLayout title="Uniform Store">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout title="Uniform Store">
      {/* Cart Summary Bar */}
      {cartCount > 0 && (
        <div className="sticky top-0 z-10 -mx-4 mb-4 bg-primary px-4 py-3 text-primary-foreground">
          <Link to="/parent/uniforms/cart" state={{ cart }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <span className="font-medium">{cartCount} items</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">KES {cartTotal.toLocaleString()}</span>
                <span className="text-sm">View Cart →</span>
              </div>
            </div>
          </Link>
        </div>
      )}

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No uniforms available at this time</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold mb-3">
                {uniformCategoryLabels[category] || category}
              </h2>
              <div className="grid gap-4">
                {categoryItems.map(item => {
                  const selectedSizeId = selectedSizes[item.id];
                  const selectedSize = item.sizes?.find(s => s.id === selectedSizeId);
                  const price = item.base_price + (selectedSize?.price_adjustment || 0);
                  const cartItem = cart.find(
                    ci => ci.item.id === item.id && ci.size.id === selectedSizeId
                  );

                  return (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="h-20 w-20 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
                              <Package className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-medium">{item.name}</h3>
                                <Badge variant="outline" className="text-xs mt-1">
                                  {uniformGenderLabels[item.gender] || item.gender}
                                </Badge>
                              </div>
                              <p className="font-bold whitespace-nowrap">
                                KES {price.toLocaleString()}
                              </p>
                            </div>

                            <div className="mt-3 flex items-center gap-2">
                              <Select
                                value={selectedSizes[item.id] || ''}
                                onValueChange={val =>
                                  setSelectedSizes(prev => ({ ...prev, [item.id]: val }))
                                }
                              >
                                <SelectTrigger className="w-24 h-9">
                                  <SelectValue placeholder="Size" />
                                </SelectTrigger>
                                <SelectContent>
                                  {item.sizes?.map(size => (
                                    <SelectItem key={size.id} value={size.id}>
                                      {size.size_label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              {cartItem ? (
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-9 w-9"
                                    onClick={() =>
                                      updateQuantity(item.id, selectedSizeId, -1)
                                    }
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-8 text-center font-medium">
                                    {cartItem.quantity}
                                  </span>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-9 w-9"
                                    onClick={() =>
                                      updateQuantity(item.id, selectedSizeId, 1)
                                    }
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => addToCart(item)}
                                  disabled={!selectedSizeId}
                                >
                                  Add
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Orders Link */}
      <div className="mt-6 text-center">
        <Link to="/parent/uniforms/orders">
          <Button variant="outline">View My Orders</Button>
        </Link>
      </div>
    </ParentLayout>
  );
}
