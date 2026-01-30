import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  BillingCycle, 
  useEnabledBillingCycles, 
  useBillingSettings,
  getBillingCycleLabel 
} from '@/hooks/useBillingSettings';

interface BillingCycleSelectorProps {
  value: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
  showPriceComparison?: boolean;
  monthlyPrice?: number;
  termlyPrice?: number;
  annualPrice?: number;
  disabled?: boolean;
}

export function BillingCycleSelector({
  value,
  onChange,
  showPriceComparison = false,
  monthlyPrice = 0,
  termlyPrice = 0,
  annualPrice = 0,
  disabled = false,
}: BillingCycleSelectorProps) {
  const { cycles: enabledCycles, isLoading: cyclesLoading } = useEnabledBillingCycles();
  const { data: settings } = useBillingSettings();

  const getSavingsText = (cycle: BillingCycle): string | null => {
    if (!settings || cycle === 'monthly') return null;
    
    if (cycle === 'annual' && settings.annual_discount_percent > 0) {
      return `Save ${settings.annual_discount_percent}%`;
    }
    if (cycle === 'termly' && settings.termly_discount_percent > 0) {
      return `Save ${settings.termly_discount_percent}%`;
    }
    return null;
  };

  const getPriceForCycle = (cycle: BillingCycle): number => {
    switch (cycle) {
      case 'monthly': return monthlyPrice;
      case 'termly': return termlyPrice;
      case 'annual': return annualPrice;
    }
  };

  return (
    <div className="space-y-2">
      <Label>Billing Cycle</Label>
      <Select value={value} onValueChange={(v) => onChange(v as BillingCycle)} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select billing cycle" />
        </SelectTrigger>
        <SelectContent>
          {enabledCycles.map((cycle) => {
            const savings = getSavingsText(cycle);
            return (
              <SelectItem key={cycle} value={cycle}>
                <div className="flex items-center gap-2">
                  <span>{getBillingCycleLabel(cycle)}</span>
                  {savings && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                      {savings}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {showPriceComparison && (
        <div className="mt-3 space-y-1.5 text-sm">
          {enabledCycles.map((cycle) => {
            const price = getPriceForCycle(cycle);
            const isSelected = cycle === value;
            return (
              <div 
                key={cycle}
                className={`flex justify-between px-2 py-1 rounded ${
                  isSelected ? 'bg-primary/10 font-medium' : 'text-muted-foreground'
                }`}
              >
                <span>{getBillingCycleLabel(cycle)}</span>
                <span>KES {price.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
