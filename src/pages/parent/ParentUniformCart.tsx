import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ParentLayout } from '@/components/parent/ParentLayout';
import { useParentUniformOrders } from '@/hooks/useParentUniformOrders';
import { useParent } from '@/contexts/ParentContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';
import type { CartItem } from '@/types/uniforms';

export default function ParentUniformCart() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedStudent } = useParent();
  const { placeOrder } = useParentUniformOrders();
  const [cart, setCart] = useState<CartItem[]>(location.state?.cart || []);

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

  const removeItem = (itemId: string, sizeId: string) => {
    setCart(prev => prev.filter(ci => !(ci.item.id === itemId && ci.size.id === sizeId)));
  };

  const cartTotal = cart.reduce(
    (sum, ci) => sum + (ci.item.base_price + ci.size.price_adjustment) * ci.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    await placeOrder.mutateAsync(cart);
    navigate('/parent/uniforms/orders');
  };

  if (cart.length === 0) {
    return (
      <ParentLayout title="Your Cart">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Link to="/parent/uniforms">
              <Button>Browse Uniforms</Button>
            </Link>
          </CardContent>
        </Card>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout title="Your Cart">
      <div className="space-y-4">
        {/* Back Link */}
        <Link to="/parent/uniforms" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Link>

        {/* Cart Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.map(ci => {
              const price = ci.item.base_price + ci.size.price_adjustment;
              const lineTotal = price * ci.quantity;

              return (
                <div key={`${ci.item.id}-${ci.size.id}`} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{ci.item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Size: {ci.size.size_label} • KES {price.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(ci.item.id, ci.size.id, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center">{ci.quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(ci.item.id, ci.size.id, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeItem(ci.item.id, ci.size.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="w-20 text-right font-medium">
                    KES {lineTotal.toLocaleString()}
                  </p>
                </div>
              );
            })}
          </CardContent>
          <Separator />
          <CardFooter className="flex flex-col gap-4 pt-4">
            <div className="flex w-full justify-between text-lg font-bold">
              <span>Total</span>
              <span>KES {cartTotal.toLocaleString()}</span>
            </div>
            <Button 
              className="w-full" 
              size="lg"
              onClick={handlePlaceOrder}
              disabled={placeOrder.isPending}
            >
              {placeOrder.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Placing Order...
                </>
              ) : (
                'Place Order'
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              You will be notified when your order is ready for collection
            </p>
          </CardFooter>
        </Card>
      </div>
    </ParentLayout>
  );
}
