import { ParentLayout } from '@/components/parent/ParentLayout';
import { useParentUniformOrders } from '@/hooks/useParentUniformOrders';
import { useParent } from '@/contexts/ParentContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Loader2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { uniformOrderStatusLabels, type UniformOrderStatus } from '@/types/uniforms';

const statusColors: Record<UniformOrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  ready: 'bg-green-100 text-green-800',
  collected: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
  partially_fulfilled: 'bg-orange-100 text-orange-800',
};

export default function ParentUniformOrders() {
  const { selectedStudent } = useParent();
  const { orders, isLoading } = useParentUniformOrders();

  if (isLoading) {
    return (
      <ParentLayout title="My Orders">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout title="My Orders">
      <div className="space-y-4">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No orders yet</p>
              <Link to="/parent/uniforms">
                <Button>Shop Uniforms</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          orders.map(order => (
            <Card key={order.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">
                    {order.order_number}
                  </CardTitle>
                  <Badge className={statusColors[order.status as UniformOrderStatus]}>
                    {uniformOrderStatusLabels[order.status as UniformOrderStatus] || order.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.order_lines?.map(line => (
                  <div key={line.id} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {line.item?.name || 'Item'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Size: {line.size?.size_label} × {line.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      KES {line.total_price.toLocaleString()}
                    </p>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-medium">Total</span>
                  <span className="font-bold">
                    KES {order.total_amount.toLocaleString()}
                  </span>
                </div>
                {order.status === 'ready' && order.collection_date && (
                  <div className="bg-green-50 text-green-800 rounded-lg p-3 text-sm">
                    Ready for collection on {format(new Date(order.collection_date), 'MMM d, yyyy')}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}

        {/* Shop More Link */}
        <div className="text-center pt-4">
          <Link to="/parent/uniforms">
            <Button variant="outline">Shop More Uniforms</Button>
          </Link>
        </div>
      </div>
    </ParentLayout>
  );
}
