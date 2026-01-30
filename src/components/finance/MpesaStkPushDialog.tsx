import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Phone, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useInitiateStkPush, useMpesaStkRequest } from '@/hooks/useMpesaStkPush';
import { cn } from '@/lib/utils';

interface MpesaStkPushDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  institutionId: string;
  invoiceId?: string;
  defaultPhone?: string;
  defaultAmount?: number;
  studentName?: string;
}

export function MpesaStkPushDialog({
  open,
  onOpenChange,
  studentId,
  institutionId,
  invoiceId,
  defaultPhone = '',
  defaultAmount = 0,
  studentName = 'Student',
}: MpesaStkPushDialogProps) {
  const [phone, setPhone] = useState(defaultPhone);
  const [amount, setAmount] = useState(defaultAmount.toString());
  const [requestId, setRequestId] = useState<string | null>(null);

  const initiateStkPush = useInitiateStkPush();
  const { data: stkRequest } = useMpesaStkRequest(requestId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await initiateStkPush.mutateAsync({
      phone,
      amount: Number(amount),
      studentId,
      institutionId,
      invoiceId,
      triggeredBy: 'admin',
    });

    if (result?.requestId) {
      setRequestId(result.requestId);
    }
  };

  const handleClose = () => {
    setRequestId(null);
    setPhone(defaultPhone);
    setAmount(defaultAmount.toString());
    onOpenChange(false);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
      pending: { label: 'Pending', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
      processing: { label: 'Processing', variant: 'default', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
      completed: { label: 'Completed', variant: 'default', icon: <CheckCircle className="h-3 w-3" /> },
      failed: { label: 'Failed', variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
      timeout: { label: 'Timeout', variant: 'destructive', icon: <AlertCircle className="h-3 w-3" /> },
      cancelled: { label: 'Cancelled', variant: 'outline', icon: <XCircle className="h-3 w-3" /> },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-green-600" />
            M-PESA Payment
          </DialogTitle>
          <DialogDescription>
            {stkRequest ? 'Payment request status' : `Send M-PESA payment prompt for ${studentName}`}
          </DialogDescription>
        </DialogHeader>

        {!stkRequest ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0712345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter the M-PESA registered phone number
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (KES)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                placeholder="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={initiateStkPush.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {initiateStkPush.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send STK Push'
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <div className={cn(
              "rounded-lg border p-4 text-center",
              stkRequest.status === 'completed' && "border-green-200 bg-green-50",
              stkRequest.status === 'failed' && "border-red-200 bg-red-50",
              stkRequest.status === 'processing' && "border-blue-200 bg-blue-50",
            )}>
              <div className="mb-3">
                {getStatusBadge(stkRequest.status)}
              </div>

              {stkRequest.status === 'processing' && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Waiting for payment confirmation...</p>
                  <p className="text-xs text-muted-foreground">
                    Please check your phone and enter your M-PESA PIN
                  </p>
                </div>
              )}

              {stkRequest.status === 'completed' && (
                <div className="space-y-2">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                  <p className="text-sm font-medium text-green-700">Payment Successful!</p>
                  {stkRequest.mpesa_receipt && (
                    <p className="text-xs text-muted-foreground">
                      Receipt: {stkRequest.mpesa_receipt}
                    </p>
                  )}
                </div>
              )}

              {(stkRequest.status === 'failed' || stkRequest.status === 'timeout') && (
                <div className="space-y-2">
                  <XCircle className="h-12 w-12 text-red-600 mx-auto" />
                  <p className="text-sm font-medium text-red-700">Payment Failed</p>
                  <p className="text-xs text-muted-foreground">
                    {stkRequest.result_desc || 'Transaction was not completed'}
                  </p>
                </div>
              )}
            </div>

            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium">{stkRequest.phone_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">KES {stkRequest.amount.toLocaleString()}</span>
              </div>
            </div>

            <DialogFooter>
              {(stkRequest.status === 'failed' || stkRequest.status === 'timeout') && (
                <Button 
                  variant="outline" 
                  onClick={() => setRequestId(null)}
                >
                  Try Again
                </Button>
              )}
              <Button onClick={handleClose}>
                {stkRequest.status === 'completed' ? 'Done' : 'Close'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
