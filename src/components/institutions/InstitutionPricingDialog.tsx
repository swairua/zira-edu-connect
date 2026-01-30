import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  useInstitutionCustomPricing, 
  useSaveCustomPricing, 
  useRemoveCustomPricing 
} from '@/hooks/useInstitutionCustomPricing';
import { useEffectivePricing, calculateAnnualSavings } from '@/hooks/useEffectivePricing';
import { useAvailableModules } from '@/hooks/useInstitutionBilling';
import { Loader2, Percent, Trash2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InstitutionPricingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  institutionId: string;
  institutionName: string;
  currentPlanId: string;
}

export function InstitutionPricingDialog({
  open,
  onOpenChange,
  institutionId,
  institutionName,
  currentPlanId,
}: InstitutionPricingDialogProps) {
  const { data: customPricing, isLoading: loadingCustom } = useInstitutionCustomPricing(institutionId);
  const { data: effectivePricing } = useEffectivePricing(institutionId);
  const { data: allModules } = useAvailableModules();
  const saveCustomPricing = useSaveCustomPricing();
  const removeCustomPricing = useRemoveCustomPricing();

  const [enableCustomPricing, setEnableCustomPricing] = useState(false);
  const [yearlyPrice, setYearlyPrice] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [maxStudents, setMaxStudents] = useState('');
  const [maxStaff, setMaxStaff] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('0');
  const [negotiationNotes, setNegotiationNotes] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [validUntil, setValidUntil] = useState('');

  // Initialize form with existing data
  useEffect(() => {
    if (customPricing) {
      setEnableCustomPricing(true);
      setYearlyPrice(customPricing.custom_yearly_price?.toString() || '');
      setMonthlyPrice(customPricing.custom_monthly_price?.toString() || '');
      setMaxStudents(customPricing.custom_max_students?.toString() || '');
      setMaxStaff(customPricing.custom_max_staff?.toString() || '');
      setDiscountPercentage(customPricing.discount_percentage?.toString() || '0');
      setNegotiationNotes(customPricing.negotiation_notes || '');
      setSelectedModules(customPricing.included_modules || []);
      setValidUntil(customPricing.valid_until || '');
    } else if (effectivePricing) {
      setYearlyPrice(effectivePricing.baseYearlyPrice.toString());
      setMonthlyPrice(effectivePricing.baseMonthlyPrice.toString());
      setMaxStudents(effectivePricing.maxStudents === -1 ? '' : effectivePricing.maxStudents.toString());
      setMaxStaff(effectivePricing.maxStaff === -1 ? '' : effectivePricing.maxStaff.toString());
      setSelectedModules(effectivePricing.includedModules);
    }
  }, [customPricing, effectivePricing]);

  const handleSave = async () => {
    await saveCustomPricing.mutateAsync({
      institution_id: institutionId,
      custom_yearly_price: yearlyPrice ? parseFloat(yearlyPrice) : null,
      custom_monthly_price: monthlyPrice ? parseFloat(monthlyPrice) : null,
      custom_max_students: maxStudents ? parseInt(maxStudents) : null,
      custom_max_staff: maxStaff ? parseInt(maxStaff) : null,
      included_modules: selectedModules.length > 0 ? selectedModules : null,
      discount_percentage: parseFloat(discountPercentage) || 0,
      negotiation_notes: negotiationNotes || null,
      valid_until: validUntil || null,
    });
    onOpenChange(false);
  };

  const handleRemoveCustomPricing = async () => {
    if (customPricing) {
      await removeCustomPricing.mutateAsync({
        id: customPricing.id,
        institutionId,
      });
      setEnableCustomPricing(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setSelectedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(m => m !== moduleId)
        : [...prev, moduleId]
    );
  };

  const savings = yearlyPrice && monthlyPrice
    ? calculateAnnualSavings(parseFloat(monthlyPrice), parseFloat(yearlyPrice))
    : 0;

  if (loadingCustom) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Custom Pricing for {institutionName}</DialogTitle>
          <DialogDescription>
            Set custom pricing, limits, and modules for this institution. 
            Leave fields empty to use the standard plan values.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Enable Custom Pricing Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
            <div>
              <Label className="text-base">Enable Custom Pricing</Label>
              <p className="text-sm text-muted-foreground">
                Override standard plan pricing for this institution
              </p>
            </div>
            <Switch
              checked={enableCustomPricing}
              onCheckedChange={setEnableCustomPricing}
            />
          </div>

          {enableCustomPricing && (
            <>
              {/* Pricing Section */}
              <div className="space-y-4">
                <h4 className="font-medium">Custom Pricing</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="yearlyPrice">Annual Price (KES)</Label>
                    <Input
                      id="yearlyPrice"
                      type="number"
                      value={yearlyPrice}
                      onChange={(e) => setYearlyPrice(e.target.value)}
                      placeholder={effectivePricing?.baseYearlyPrice.toString()}
                    />
                    {effectivePricing && (
                      <p className="text-xs text-muted-foreground">
                        Standard: KES {effectivePricing.baseYearlyPrice.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyPrice">Monthly Price (KES)</Label>
                    <Input
                      id="monthlyPrice"
                      type="number"
                      value={monthlyPrice}
                      onChange={(e) => setMonthlyPrice(e.target.value)}
                      placeholder={effectivePricing?.baseMonthlyPrice.toString()}
                    />
                    {savings > 0 && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Percent className="h-3 w-3 mr-1" />
                        {savings}% annual savings
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Limits Section */}
              <div className="space-y-4">
                <h4 className="font-medium">Custom Limits</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxStudents">Max Students</Label>
                    <Input
                      id="maxStudents"
                      type="number"
                      value={maxStudents}
                      onChange={(e) => setMaxStudents(e.target.value)}
                      placeholder="Unlimited if empty"
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty for unlimited
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxStaff">Max Staff</Label>
                    <Input
                      id="maxStaff"
                      type="number"
                      value={maxStaff}
                      onChange={(e) => setMaxStaff(e.target.value)}
                      placeholder="Unlimited if empty"
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty for unlimited
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Modules Section */}
              <div className="space-y-4">
                <h4 className="font-medium">Included Modules</h4>
                <div className="grid grid-cols-2 gap-2">
                  {allModules?.map((module) => (
                    <div
                      key={module.module_id}
                      onClick={() => toggleModule(module.module_id)}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors',
                        selectedModules.includes(module.module_id)
                          ? 'border-primary bg-primary/5'
                          : 'border-transparent bg-muted/50 hover:bg-muted'
                      )}
                    >
                      <Switch
                        checked={selectedModules.includes(module.module_id)}
                        onCheckedChange={() => toggleModule(module.module_id)}
                      />
                      <span className="text-sm">{module.display_name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Negotiation Details */}
              <div className="space-y-4">
                <h4 className="font-medium">Negotiation Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discount">Discount Percentage</Label>
                    <Input
                      id="discount"
                      type="number"
                      value={discountPercentage}
                      onChange={(e) => setDiscountPercentage(e.target.value)}
                      min={0}
                      max={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validUntil">Valid Until</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty for no expiry
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Negotiation Notes</Label>
                  <Textarea
                    id="notes"
                    value={negotiationNotes}
                    onChange={(e) => setNegotiationNotes(e.target.value)}
                    placeholder="Record any negotiation details, special conditions, or approvals..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Remove Custom Pricing */}
              {customPricing && (
                <div className="flex items-center gap-4 p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Remove Custom Pricing</p>
                    <p className="text-xs text-muted-foreground">
                      This will revert to standard plan pricing
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveCustomPricing}
                    disabled={removeCustomPricing.isPending}
                  >
                    {removeCustomPricing.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {enableCustomPricing && (
            <Button
              onClick={handleSave}
              disabled={saveCustomPricing.isPending}
            >
              {saveCustomPricing.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Custom Pricing'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
