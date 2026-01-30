import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useInstitution } from '@/contexts/InstitutionContext';
import { 
  useInstitutionSmsCredits, 
  useActiveSmsBundles, 
  useSmsCreditTransactions,
  calculateSmsRate,
  getSmsBalanceStatus,
} from '@/hooks/useSmsBilling';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  MessageSquare,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  Plus,
  History,
  CheckCircle,
} from 'lucide-react';

export function InstitutionSmsCreditsCard() {
  const { institutionId, institution } = useInstitution();
  const { data: credits, isLoading: creditsLoading } = useInstitutionSmsCredits(institutionId);
  const { data: bundles, isLoading: bundlesLoading } = useActiveSmsBundles();
  const { data: transactions } = useSmsCreditTransactions(institutionId, 5);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const queryClient = useQueryClient();

  const status = getSmsBalanceStatus(credits || null);

  const purchaseCredits = useMutation({
    mutationFn: async () => {
      if (!selectedBundle || !phoneNumber || !institutionId) {
        throw new Error('Please select a bundle and enter phone number');
      }

      const bundle = bundles?.find(b => b.id === selectedBundle);
      if (!bundle) throw new Error('Bundle not found');

      const { data, error } = await supabase.functions.invoke('purchase-sms-credits', {
        body: {
          institution_id: institutionId,
          bundle_id: selectedBundle,
          phone_number: phoneNumber,
        },
      });

      if (error) throw error;
      if (data && !data.success) {
        throw new Error(data.error || 'Payment failed');
      }
      return data;
    },
    onSuccess: () => {
      toast.success('Payment initiated', { description: 'Check your phone for M-PESA prompt' });
      setShowPurchaseDialog(false);
      setSelectedBundle(null);
      setPhoneNumber('');
      // Invalidate to refresh credits when callback is received
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['institution-sms-credits'] });
        queryClient.invalidateQueries({ queryKey: ['sms-credit-transactions'] });
      }, 5000);
    },
    onError: (error: Error) => {
      toast.error('Payment failed', { description: error.message });
    },
  });

  const getStatusBadge = () => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'low':
        return <Badge className="bg-yellow-100 text-yellow-800">Low Balance</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'empty':
        return <Badge variant="outline" className="text-muted-foreground">No Credits</Badge>;
    }
  };

  const usagePercentage = credits 
    ? Math.min(100, (credits.used_credits / (credits.remaining_credits + credits.used_credits)) * 100) || 0
    : 0;

  if (creditsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SMS Credits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>SMS Credits</CardTitle>
                <CardDescription>
                  Manage SMS credits for notifications and communications
                </CardDescription>
              </div>
            </div>
            <Button onClick={() => setShowPurchaseDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Buy Credits
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Balance Section */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Available</p>
                {getStatusBadge()}
              </div>
              <p className="mt-2 text-3xl font-bold">
                {credits?.remaining_credits?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-muted-foreground">SMS credits</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Used</p>
              <p className="mt-2 text-3xl font-bold">
                {credits?.used_credits?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-muted-foreground">Total sent</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Low Balance Threshold</p>
              <p className="mt-2 text-3xl font-bold">
                {credits?.low_balance_threshold?.toLocaleString() || 100}
              </p>
              <p className="text-xs text-muted-foreground">Alert when below</p>
            </div>
          </div>

          {/* Usage Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Usage</span>
              <span>{usagePercentage.toFixed(0)}% used</span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
          </div>

          {/* Low Balance Warning */}
          {(status === 'low' || status === 'critical') && (
            <div className="flex items-center gap-2 rounded-lg bg-yellow-50 p-3 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
              <AlertTriangle className="h-5 w-5" />
              <p className="text-sm">
                Your SMS balance is {status === 'critical' ? 'critically low' : 'running low'}. 
                Purchase more credits to continue sending notifications.
              </p>
            </div>
          )}

          {/* Recent Transactions */}
          {transactions && transactions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-medium">Recent Activity</h4>
              </div>
              <div className="space-y-2">
                {transactions.slice(0, 3).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      {tx.transaction_type === 'purchase' ? (
                        <CreditCard className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      )}
                      <div>
                        <p className="text-sm font-medium capitalize">{tx.transaction_type}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(tx.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <p className={`font-medium ${tx.credits > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.credits > 0 ? '+' : ''}{tx.credits.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Purchase Dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Purchase SMS Credits</DialogTitle>
            <DialogDescription>
              Select a bundle and complete payment via M-PESA
            </DialogDescription>
          </DialogHeader>

          <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
            {bundlesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
              </div>
            ) : (
              <RadioGroup value={selectedBundle || ''} onValueChange={setSelectedBundle} className="space-y-2">
                {bundles?.map((bundle) => {
                  const rate = calculateSmsRate(bundle);
                  const totalCredits = bundle.credits + bundle.bonus_credits;
                  
                  return (
                    <div key={bundle.id} className="relative">
                      <RadioGroupItem
                        value={bundle.id}
                        id={bundle.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={bundle.id}
                        className="flex cursor-pointer items-center justify-between rounded-lg border-2 p-4 transition-colors peer-data-[state=checked]:border-primary"
                      >
                        <div>
                          <p className="font-medium">{bundle.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {totalCredits.toLocaleString()} SMS credits
                            {bundle.bonus_credits > 0 && (
                              <span className="text-green-600"> (+{bundle.bonus_credits} bonus)</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            KES {rate.toFixed(2)}/SMS
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">
                            KES {bundle.price.toLocaleString()}
                          </p>
                        </div>
                      </Label>
                      {selectedBundle === bundle.id && (
                        <CheckCircle className="absolute right-2 top-2 h-5 w-5 text-primary" />
                      )}
                    </div>
                  );
                })}
              </RadioGroup>
            )}

            <div className="space-y-2 pt-2">
              <Label htmlFor="phone">M-PESA Phone Number</Label>
              <Input
                id="phone"
                placeholder="e.g. 0712345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                You will receive an M-PESA prompt on this number
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPurchaseDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => purchaseCredits.mutate()}
              disabled={!selectedBundle || !phoneNumber || purchaseCredits.isPending}
            >
              {purchaseCredits.isPending ? 'Processing...' : 'Pay with M-PESA'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
