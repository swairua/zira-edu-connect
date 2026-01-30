import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Check, 
  ArrowRight, 
  Loader2,
  Phone,
  Crown,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { useAvailablePlans, useInstitutionBilling, useInitiateSubscriptionPayment, InitiatePaymentResult } from '@/hooks/useInstitutionBilling';
import { useInstitution } from '@/contexts/InstitutionContext';
import { cn } from '@/lib/utils';
import { 
  BillingCycle, 
  useEnabledBillingCycles, 
  useBillingSettings,
  getBillingCycleShort 
} from '@/hooks/useBillingSettings';
import { PaymentStatusTracker } from '@/components/billing/PaymentStatusTracker';

interface PlanComparisonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlanComparisonDialog({ open, onOpenChange }: PlanComparisonDialogProps) {
  const { institutionId } = useInstitution();
  const { data: billing } = useInstitutionBilling(institutionId);
  const { data: plans, isLoading: plansLoading, isError: plansError } = useAvailablePlans();
  const initiatePayment = useInitiateSubscriptionPayment();
  const { cycles: enabledCycles, isLoading: cyclesLoading, isError: cyclesError } = useEnabledBillingCycles();
  const { data: billingSettings } = useBillingSettings();

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState<'select' | 'payment' | 'tracking'>('select');
  const [paymentResult, setPaymentResult] = useState<InitiatePaymentResult | null>(null);

  const currentPlanId = billing?.currentPlan?.id;

  const handleSelectPlan = (planId: string) => {
    if (planId === currentPlanId) return;
    setSelectedPlan(planId);
  };

  const handleProceedToPayment = () => {
    if (!selectedPlan) return;
    setStep('payment');
  };

  const getPriceForCycle = (plan: any, cycle: BillingCycle): number => {
    switch (cycle) {
      case 'monthly': return plan.price_monthly || 0;
      case 'termly': return plan.price_termly || 0;
      case 'annual': return plan.price_yearly || 0;
    }
  };

  const handleInitiatePayment = async () => {
    if (!selectedPlan || !institutionId || !phoneNumber) return;

    const plan = plans?.find(p => p.id === selectedPlan);
    if (!plan) return;

    const amount = getPriceForCycle(plan, billingCycle);

    try {
      const result = await initiatePayment.mutateAsync({
        institutionId,
        paymentType: 'plan_upgrade',
        amount,
        phoneNumber,
        planId: selectedPlan,
        billingCycle,
      });

      setPaymentResult(result);
      setStep('tracking');
    } catch (error) {
      // Error handled by mutation's onError
    }
  };

  const handleRetry = () => {
    setPaymentResult(null);
    setStep('payment');
  };

  const handleComplete = () => {
    // Payment completed successfully - close dialog
    handleClose();
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after a delay to prevent flash
    setTimeout(() => {
      setStep('select');
      setSelectedPlan(null);
      setPhoneNumber('');
      setPaymentResult(null);
    }, 300);
  };

  const selectedPlanDetails = plans?.find(p => p.id === selectedPlan);
  const upgradeAmount = selectedPlanDetails
    ? getPriceForCycle(selectedPlanDetails, billingCycle)
    : 0;

  const getDialogTitle = () => {
    switch (step) {
      case 'select': return 'Upgrade Your Plan';
      case 'payment': return 'Complete Payment';
      case 'tracking': return 'Payment Status';
    }
  };

  const getDialogDescription = () => {
    switch (step) {
      case 'select': return "Choose a plan that fits your institution's needs";
      case 'payment': return 'Enter your M-PESA phone number to complete the upgrade';
      case 'tracking': return 'Track your payment status in real-time';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-2xl sm:max-w-4xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            {getDialogTitle()}
          </DialogTitle>
          <DialogDescription>
            {getDialogDescription()}
          </DialogDescription>
        </DialogHeader>

        {step === 'select' && (
          <div className="space-y-6">
            {/* Billing Cycle Toggle - Dynamic based on settings */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              {enabledCycles.includes('annual') && (
                <Button
                  variant={billingCycle === 'annual' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBillingCycle('annual')}
                  className="gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  Annual
                  {billingSettings?.annual_discount_percent && billingSettings.annual_discount_percent > 0 && (
                    <Badge variant="secondary" className="ml-1 bg-green-100 text-green-800">
                      Save {billingSettings.annual_discount_percent}%
                    </Badge>
                  )}
                </Button>
              )}
              {enabledCycles.includes('termly') && (
                <Button
                  variant={billingCycle === 'termly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBillingCycle('termly')}
                  className="gap-1"
                >
                  <Calendar className="h-3 w-3" />
                  Termly
                  {billingSettings?.termly_discount_percent && billingSettings.termly_discount_percent > 0 && (
                    <Badge variant="secondary" className="ml-1 bg-green-100 text-green-800">
                      Save {billingSettings.termly_discount_percent}%
                    </Badge>
                  )}
                </Button>
              )}
              {enabledCycles.includes('monthly') && (
                <Button
                  variant={billingCycle === 'monthly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBillingCycle('monthly')}
                >
                  Monthly
                </Button>
              )}
            </div>

            {/* Plans Grid */}
            {plansLoading || cyclesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : plans?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No plans available. Please contact support.
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {plans?.filter(p => p.id !== 'custom').map((plan) => {
                  const isCurrent = plan.id === currentPlanId;
                  const isSelected = plan.id === selectedPlan;
                  const price = getPriceForCycle(plan, billingCycle);

                  return (
                    <div
                      key={plan.id}
                      onClick={() => handleSelectPlan(plan.id)}
                      className={cn(
                        "relative rounded-lg border p-4 cursor-pointer transition-all",
                        isCurrent && "border-primary/50 bg-primary/5 cursor-not-allowed",
                        isSelected && "border-primary ring-2 ring-primary",
                        !isCurrent && !isSelected && "hover:border-muted-foreground/50"
                      )}
                    >
                      {isCurrent && (
                        <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                          Current Plan
                        </Badge>
                      )}
                      {plan.id === 'professional' && !isCurrent && (
                        <Badge variant="secondary" className="absolute -top-2 left-1/2 -translate-x-1/2">
                          Most Popular
                        </Badge>
                      )}

                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-lg">{plan.name}</h3>
                          <p className="text-sm text-muted-foreground">{plan.description}</p>
                        </div>

                        <div>
                          <span className="text-2xl font-bold">
                            KES {price.toLocaleString()}
                          </span>
                          <span className="text-muted-foreground">
                            {getBillingCycleShort(billingCycle)}
                          </span>
                        </div>

                        <Separator />

                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            {plan.max_students === -1 ? 'Unlimited' : plan.max_students} students
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            {plan.max_staff === -1 ? 'Unlimited' : plan.max_staff} staff
                          </li>
                          {(Array.isArray(plan.features) ? plan.features as string[] : []).slice(0, 3).map((feature: string, i: number) => (
                            <li key={i} className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-primary" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button
                onClick={handleProceedToPayment}
                disabled={!selectedPlan}
                className="w-full sm:w-auto"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-1 hidden sm:block" />
              </Button>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <h3 className="font-medium mb-2">Order Summary</h3>
              <div className="flex justify-between text-sm">
                <span>{selectedPlanDetails?.name} ({billingCycle})</span>
                <span className="font-medium">KES {upgradeAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* M-PESA Payment */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">M-PESA Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="254712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter the phone number registered with M-PESA
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
              <Button variant="outline" onClick={() => setStep('select')} className="w-full sm:w-auto">
                Back
              </Button>
              <Button
                onClick={handleInitiatePayment}
                disabled={!phoneNumber || initiatePayment.isPending}
                className="w-full sm:w-auto"
              >
                {initiatePayment.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    Pay KES {upgradeAmount.toLocaleString()}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'tracking' && paymentResult && (
          <PaymentStatusTracker
            paymentId={paymentResult.paymentId}
            amount={upgradeAmount}
            phone={phoneNumber}
            planName={selectedPlanDetails?.name || 'Selected Plan'}
            onComplete={handleComplete}
            onRetry={handleRetry}
            onClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
