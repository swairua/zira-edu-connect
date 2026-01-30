import { useState } from 'react';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/hooks/useAuth';
import { hasAnyRole, FINANCE_ROLES } from '@/lib/roles';
import { useFeeItems, useCreateFeeItem, useDeleteFeeItem } from '@/hooks/useFeeItems';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { RoleAwareStepCard } from '@/components/onboarding/RoleAwareStepCard';
import { FinanceQuickSetup } from '@/components/onboarding/FinanceQuickSetup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Banknote, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FeeTemplateSelector } from '@/components/onboarding/FeeTemplateSelector';
import { FeeTemplate } from '@/config/onboardingTemplates';
import { formatCurrency } from '@/lib/utils';

const FEE_CATEGORIES = [
  { value: 'tuition', label: 'Tuition' },
  { value: 'boarding', label: 'Boarding' },
  { value: 'transport', label: 'Transport' },
  { value: 'uniform', label: 'Uniform' },
  { value: 'books', label: 'Books & Materials' },
  { value: 'examination', label: 'Examination' },
  { value: 'activity', label: 'Activities & Sports' },
  { value: 'other', label: 'Other' },
];

export function FeeStructureStep() {
  const { institution, institutionId } = useInstitution();
  const { isStepCompleted } = useOnboarding();
  const { userRoles } = useAuth();
  const { data: feeItems } = useFeeItems(institutionId);
  const createFeeItem = useCreateFeeItem();
  const deleteFeeItem = useDeleteFeeItem();
  const { data: academicYears } = useAcademicYears(institutionId);
  const { toast } = useToast();

  // Check if user is a finance-specific role (not admin)
  const isFinanceRole = hasAnyRole(userRoles, FINANCE_ROLES);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);
  
  const [feeForm, setFeeForm] = useState({
    name: '',
    amount: '',
    category: 'tuition',
    term_id: '',
    is_mandatory: true,
    description: '',
  });

  const currentYear = academicYears?.find(y => y.is_current);
  const yearTerms = currentYear?.terms || [];
  const currency = institution?.country === 'KE' ? 'KES' : 'USD';

  const handleApplyTemplate = async (template: FeeTemplate) => {
    if (!institutionId) return;

    setIsApplyingTemplate(true);
    try {
      // Create all fee items from template
      for (const item of template.items) {
        await createFeeItem.mutateAsync({
          institution_id: institutionId,
          name: item.name,
          amount: item.amount,
          category: item.category,
          is_mandatory: item.is_mandatory,
          applicable_to: item.applicable_to,
          academic_year_id: currentYear?.id,
        });
      }

      toast({ 
        title: 'Fee template applied!', 
        description: `Added ${template.items.length} fee items from "${template.name}"` 
      });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsApplyingTemplate(false);
    }
  };

  const handleCreateFee = async () => {
    if (!feeForm.name || !feeForm.amount || !institutionId) {
      toast({ title: 'Please fill required fields', variant: 'destructive' });
      return;
    }

    try {
      await createFeeItem.mutateAsync({
        institution_id: institutionId,
        name: feeForm.name,
        amount: parseInt(feeForm.amount),
        category: feeForm.category,
        term_id: feeForm.term_id || undefined,
        is_mandatory: feeForm.is_mandatory,
        description: feeForm.description || undefined,
        academic_year_id: currentYear?.id,
      });
      setFeeForm({
        name: '',
        amount: '',
        category: 'tuition',
        term_id: '',
        is_mandatory: true,
        description: '',
      });
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const getTotalFees = () => {
    return feeItems?.reduce((sum, item) => sum + item.amount, 0) || 0;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tuition': return 'bg-blue-100 text-blue-800';
      case 'boarding': return 'bg-purple-100 text-purple-800';
      case 'transport': return 'bg-green-100 text-green-800';
      case 'examination': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <RoleAwareStepCard
      stepId="fee_structure"
      title="Fee Structure"
      description="Configure fee items for your school. These are used to generate student invoices."
      isCompleted={isStepCompleted('fee_structure')}
    >
      <div className="space-y-6">
        {/* Finance Quick Setup - Only show for finance roles */}
        {isFinanceRole && (
          <FinanceQuickSetup />
        )}

        {/* Quick Setup Template - Only show if no fees exist */}
        {(!feeItems || feeItems.length === 0) && (
          <FeeTemplateSelector 
            onApplyTemplate={handleApplyTemplate}
            isApplying={isApplyingTemplate}
            currency={currency}
          />
        )}

        {/* Summary Card */}
        {feeItems && feeItems.length > 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Annual Fees</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(getTotalFees(), currency)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{feeItems.length} fee items</p>
                  <p className="text-sm">{feeItems.filter(f => f.is_mandatory).length} mandatory</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="text-lg font-medium">Fee Items</h3>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Fee Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Fee Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Fee Name *</Label>
                  <Input
                    value={feeForm.name}
                    onChange={(e) => setFeeForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g., Tuition Fee - Term 1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount *</Label>
                    <Input
                      type="number"
                      value={feeForm.amount}
                      onChange={(e) => setFeeForm(p => ({ ...p, amount: e.target.value }))}
                      placeholder="e.g., 15000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={feeForm.category}
                      onValueChange={(v) => setFeeForm(p => ({ ...p, category: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FEE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Term (optional)</Label>
                  <Select
                    value={feeForm.term_id}
                    onValueChange={(v) => setFeeForm(p => ({ ...p, term_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Terms</SelectItem>
                      {yearTerms.map((term) => (
                        <SelectItem key={term.id} value={term.id}>
                          {term.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Input
                    value={feeForm.description}
                    onChange={(e) => setFeeForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Brief description"
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <p className="font-medium">Mandatory Fee</p>
                    <p className="text-sm text-muted-foreground">
                      Applied to all students by default
                    </p>
                  </div>
                  <Switch
                    checked={feeForm.is_mandatory}
                    onCheckedChange={(v) => setFeeForm(p => ({ ...p, is_mandatory: v }))}
                  />
                </div>
                <Button onClick={handleCreateFee} disabled={createFeeItem.isPending} className="w-full">
                  Create Fee Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {feeItems && feeItems.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fee Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center">Mandatory</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeItems.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell className="font-medium">{fee.name}</TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(fee.category || 'other')}>
                        {fee.category || 'Other'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(fee.amount, currency)}
                    </TableCell>
                    <TableCell className="text-center">
                      {fee.is_mandatory ? (
                        <Badge variant="secondary">Yes</Badge>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteFeeItem.mutate(fee.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Banknote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">No fee items configured</p>
              <p className="text-sm text-muted-foreground mb-4">
                Use Quick Setup above or add items manually
              </p>
              <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Manually
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Show template option if fees exist */}
        {feeItems && feeItems.length > 0 && (
          <FeeTemplateSelector 
            onApplyTemplate={handleApplyTemplate}
            isApplying={isApplyingTemplate}
            currency={currency}
          />
        )}
      </div>
    </RoleAwareStepCard>
  );
}
