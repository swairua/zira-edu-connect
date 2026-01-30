import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useUniformOrders } from '@/hooks/useUniformOrders';
import { format } from 'date-fns';
import { uniformOrderStatusLabels, type UniformOrder, type UniformOrderStatus } from '@/types/uniforms';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ProcessOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: UniformOrder;
}

const statusFlow: UniformOrderStatus[] = ['pending', 'confirmed', 'processing', 'ready', 'collected'];

export function ProcessOrderDialog({ open, onOpenChange, order }: ProcessOrderDialogProps) {
  const { updateOrderStatus } = useUniformOrders();
  const [newStatus, setNewStatus] = useState<UniformOrderStatus>(order.status);
  const [collectionDate, setCollectionDate] = useState(order.collection_date || '');
  const [collectedBy, setCollectedBy] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const currentIndex = statusFlow.indexOf(order.status);
  const availableStatuses = order.status === 'cancelled' 
    ? ['cancelled'] 
    : statusFlow.slice(currentIndex).concat(['cancelled']);

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    try {
      await updateOrderStatus.mutateAsync({
        orderId: order.id,
        status: newStatus,
        collectionDate: collectionDate || undefined,
        collectedBy: newStatus === 'collected' ? collectedBy : undefined,
      });
      onOpenChange(false);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Order {order.order_number}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Student Info */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{order.student?.first_name} {order.student?.last_name}</p>
              <p className="text-sm text-muted-foreground">{order.student?.admission_number}</p>
            </div>
            <Badge>{uniformOrderStatusLabels[order.status]}</Badge>
          </div>

          <Separator />

          {/* Order Items */}
          <div>
            <h4 className="font-medium mb-2">Order Items</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.order_lines?.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>{line.item?.name}</TableCell>
                    <TableCell>{line.size?.size_label}</TableCell>
                    <TableCell className="text-center">{line.quantity}</TableCell>
                    <TableCell className="text-right">
                      KES {line.total_price.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-end mt-2">
              <p className="font-bold">Total: {order.currency} {order.total_amount.toLocaleString()}</p>
            </div>
          </div>

          <Separator />

          {/* Status Update */}
          <div className="space-y-4">
            <h4 className="font-medium">Update Status</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New Status</Label>
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as UniformOrderStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {uniformOrderStatusLabels[status as UniformOrderStatus]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(newStatus === 'ready' || newStatus === 'collected') && (
                <div className="space-y-2">
                  <Label>Collection Date</Label>
                  <Input
                    type="date"
                    value={collectionDate}
                    onChange={(e) => setCollectionDate(e.target.value)}
                  />
                </div>
              )}
            </div>

            {newStatus === 'collected' && (
              <div className="space-y-2">
                <Label>Collected By</Label>
                <Input
                  placeholder="Name of person collecting"
                  value={collectedBy}
                  onChange={(e) => setCollectedBy(e.target.value)}
                />
              </div>
            )}
          </div>

          {order.notes && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-1">Notes</h4>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {newStatus !== order.status && (
            <Button onClick={handleUpdateStatus} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Status'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
