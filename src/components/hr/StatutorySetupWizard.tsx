import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogBody } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ShieldCheck, Building2, AlertTriangle, Loader2 } from 'lucide-react';
import { useInstitution } from '@/contexts/InstitutionContext';
import { getPayrollCountryConfig, isPayrollCountrySupported } from '@/lib/payroll-country-config';
import { useCreateDeductionType, useDeductionTypes } from '@/hooks/usePayroll';
import { toast } from 'sonner';

interface StatutorySetupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StatutorySetupWizard({ open, onOpenChange }: StatutorySetupWizardProps) {
  const { institution } = useInstitution();
  const { data: existingDeductions } = useDeductionTypes();
  const createDeduction = useCreateDeductionType();
  const [selectedDeductions, setSelectedDeductions] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const countryCode = institution?.country || 'KE';
  const config = getPayrollCountryConfig(countryCode);
  const isSupported = isPayrollCountrySupported(countryCode);

  // Check which deductions already exist
  const existingCodes = existingDeductions?.map(d => d.code) || [];

  const toggleDeduction = (code: string) => {
    setSelectedDeductions(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const selectAll = () => {
    if (!config) return;
    const newCodes = config.statutoryDeductions
      .filter(d => !existingCodes.includes(d.code))
      .map(d => d.code);
    setSelectedDeductions(newCodes);
  };

  const handleSetup = async () => {
    if (!config || selectedDeductions.length === 0) return;
    
    setIsCreating(true);
    let successCount = 0;
    
    try {
      for (const code of selectedDeductions) {
        const template = config.statutoryDeductions.find(d => d.code === code);
        if (!template) continue;

        await createDeduction.mutateAsync({
          code: template.code,
          name: template.name,
          description: template.description,
          calculation_type: template.calculationType === 'tiered' ? 'percentage' : 
                           template.calculationType === 'capped_percentage' ? 'percentage' : 
                           template.calculationType,
          default_amount: (template.rate || 0) * 100, // Store as percentage
          is_statutory: true,
          is_active: true,
        });
        successCount++;
      }

      toast.success(`Created ${successCount} statutory deduction${successCount > 1 ? 's' : ''}`);
      onOpenChange(false);
      setSelectedDeductions([]);
    } catch (error) {
      toast.error('Failed to create some deductions');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isSupported || !config) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Statutory Deductions Setup</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Statutory deductions are not yet configured for {institution?.country || 'your country'}. 
              Please create deductions manually or contact support.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const availableDeductions = config.statutoryDeductions.filter(
    d => !existingCodes.includes(d.code)
  );
  const alreadySetup = config.statutoryDeductions.filter(
    d => existingCodes.includes(d.code)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl flex flex-col max-h-[85vh]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Setup {config.name} Statutory Deductions
          </DialogTitle>
          <DialogDescription>
            Configure mandatory payroll deductions as per {config.taxAuthority} regulations.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-4">
            {/* Country Info */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">{config.name}</p>
                <p className="text-sm text-muted-foreground">
                  Currency: {config.currency} • Remittance: {config.payrollRemittanceDeadline}
                </p>
              </div>
              <Badge variant="secondary">{countryCode}</Badge>
            </div>

            {alreadySetup.length > 0 && (
              <Alert>
                <ShieldCheck className="h-4 w-4" />
                <AlertDescription>
                  Already configured: {alreadySetup.map(d => d.code).join(', ')}
                </AlertDescription>
              </Alert>
            )}

            {availableDeductions.length === 0 ? (
              <Alert>
                <ShieldCheck className="h-4 w-4" />
                <AlertDescription>
                  All statutory deductions are already configured!
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Select deductions to add:</span>
                  <Button variant="ghost" size="sm" onClick={selectAll}>
                    Select All
                  </Button>
                </div>

                <div className="space-y-3">
                  {availableDeductions.map((deduction) => (
                    <div 
                      key={deduction.code}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedDeductions.includes(deduction.code) 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => toggleDeduction(deduction.code)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          checked={selectedDeductions.includes(deduction.code)}
                          onCheckedChange={() => toggleDeduction(deduction.code)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{deduction.name}</span>
                            <Badge variant="outline" className="text-xs">{deduction.code}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {deduction.description}
                          </p>
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            {deduction.rate && (
                              <span>Employee: {(deduction.rate * 100).toFixed(2)}%</span>
                            )}
                            {deduction.employerContributionRate > 0 && (
                              <span>Employer: {(deduction.employerContributionRate * 100).toFixed(2)}%</span>
                            )}
                            {deduction.reducesTaxableIncome && (
                              <Badge variant="secondary" className="text-xs">Tax Deductible</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {config.notes.length > 0 && (
              <>
                <Separator />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="font-medium">Notes:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {config.notes.slice(0, 3).map((note, i) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </DialogBody>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSetup} 
            disabled={selectedDeductions.length === 0 || isCreating}
          >
            {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Setup {selectedDeductions.length} Deduction{selectedDeductions.length !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
