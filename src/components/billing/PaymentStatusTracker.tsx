import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Receipt,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSubscriptionPaymentStatus, PaymentStatusData } from '@/hooks/useSubscriptionPaymentStatus';

interface PaymentStatusTrackerProps {
  paymentId: string;
  amount: number;
  phone: string;
  planName: string;
  onComplete: () => void;
  onRetry: () => void;
  onClose: () => void;
}

export function PaymentStatusTracker({
  paymentId,
  amount,
  phone,
  planName,
  onComplete,
  onRetry,
  onClose,
}: PaymentStatusTrackerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  const { payment, isLoading, isTimedOut, getElapsedTime } = useSubscriptionPaymentStatus({
    paymentId,
    onComplete,
    onFailed: () => {},
  });

  // Update elapsed time every second
  useEffect(() => {
    if (payment?.status === 'completed' || payment?.status === 'failed') {
      return;
    }

    const interval = setInterval(() => {
      setElapsedSeconds(getElapsedTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [payment?.status, getElapsedTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusConfig = (status: PaymentStatusData['status'] | undefined) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle2,
          iconClass: 'text-green-500',
          bgClass: 'bg-green-50 dark:bg-green-950/30',
          title: 'Payment Successful!',
          description: 'Your plan has been upgraded successfully.',
          badgeVariant: 'default' as const,
          badgeClass: 'bg-green-500',
        };
      case 'failed':
        return {
          icon: XCircle,
          iconClass: 'text-destructive',
          bgClass: 'bg-destructive/10',
          title: 'Payment Failed',
          description: payment?.resultDesc || 'The payment could not be completed.',
          badgeVariant: 'destructive' as const,
          badgeClass: '',
        };
      case 'processing':
        return {
          icon: Loader2,
          iconClass: 'text-primary animate-spin',
          bgClass: 'bg-primary/10',
          title: 'Processing Payment',
          description: 'Please enter your M-PESA PIN on your phone.',
          badgeVariant: 'secondary' as const,
          badgeClass: 'bg-amber-500 text-white',
        };
      default:
        return {
          icon: Clock,
          iconClass: 'text-muted-foreground',
          bgClass: 'bg-muted',
          title: 'Waiting for Payment',
          description: 'An M-PESA prompt has been sent to your phone.',
          badgeVariant: 'outline' as const,
          badgeClass: '',
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading payment status...</p>
      </div>
    );
  }

  const config = getStatusConfig(payment?.status);
  const StatusIcon = config.icon;
  const isPending = payment?.status === 'pending' || payment?.status === 'processing';

  return (
    <div className="space-y-6">
      {/* Status Display */}
      <div className={cn("rounded-lg p-6 text-center", config.bgClass)}>
        <div className="flex flex-col items-center space-y-4">
          <div className={cn("p-4 rounded-full", config.bgClass)}>
            <StatusIcon className={cn("h-16 w-16", config.iconClass)} />
          </div>
          
          <div className="space-y-2">
            <Badge variant={config.badgeVariant} className={config.badgeClass}>
              {payment?.status === 'completed' ? 'Success' : 
               payment?.status === 'failed' ? 'Failed' : 
               payment?.status === 'processing' ? 'Processing' : 'Pending'}
            </Badge>
            <h3 className="text-xl font-semibold">{config.title}</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {config.description}
            </p>
          </div>

          {isPending && !isTimedOut && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Elapsed: {formatTime(elapsedSeconds)}</span>
            </div>
          )}

          {isTimedOut && isPending && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Request timed out. Payment may still complete.</span>
            </div>
          )}
        </div>
      </div>

      {/* Payment Details */}
      <div className="space-y-3">
        <Separator />
        
        <div className="grid gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Plan</span>
            <span className="font-medium">{planName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-medium">KES {amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-1">
              <Phone className="h-3 w-3" /> Phone
            </span>
            <span className="font-medium">{phone}</span>
          </div>
          {payment?.mpesaReceipt && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1">
                <Receipt className="h-3 w-3" /> Receipt
              </span>
              <span className="font-mono font-medium text-green-600 dark:text-green-400">
                {payment.mpesaReceipt}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {payment?.status === 'failed' || isTimedOut ? (
          <>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button onClick={onRetry} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </>
        ) : payment?.status === 'completed' ? (
          <Button onClick={onClose} className="w-full">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Done
          </Button>
        ) : (
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        )}
      </div>
    </div>
  );
}
