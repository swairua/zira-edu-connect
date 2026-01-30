import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { useCreateDeductionType, useUpdateDeductionType, type DeductionType } from '@/hooks/usePayroll';

interface DeductionTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deduction: DeductionType | null;
}

interface FormData {
  name: string;
  code: string;
  description: string;
  calculation_type: 'fixed' | 'percentage';
  default_amount: number;
  is_statutory: boolean;
  is_active: boolean;
}

export function DeductionTypeDialog({ open, onOpenChange, deduction }: DeductionTypeDialogProps) {
  const createDeduction = useCreateDeductionType();
  const updateDeduction = useUpdateDeductionType();
  
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: '',
      code: '',
      description: '',
      calculation_type: 'fixed',
      default_amount: 0,
      is_statutory: false,
      is_active: true,
    },
  });

  const calculationType = watch('calculation_type');
  const isStatutory = watch('is_statutory');
  const isActive = watch('is_active');

  useEffect(() => {
    if (open) {
      if (deduction) {
        reset({
          name: deduction.name,
          code: deduction.code,
          description: deduction.description || '',
          calculation_type: deduction.calculation_type,
          default_amount: deduction.default_amount,
          is_statutory: deduction.is_statutory,
          is_active: deduction.is_active,
        });
      } else {
        reset({
          name: '',
          code: '',
          description: '',
          calculation_type: 'fixed',
          default_amount: 0,
          is_statutory: false,
          is_active: true,
        });
      }
    }
  }, [open, deduction, reset]);

  const onSubmit = async (data: FormData) => {
    if (deduction) {
      await updateDeduction.mutateAsync({ id: deduction.id, ...data });
    } else {
      await createDeduction.mutateAsync(data);
    }
    onOpenChange(false);
  };

  const isPending = createDeduction.isPending || updateDeduction.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {deduction ? 'Edit Deduction Type' : 'Add Deduction Type'}
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  {...register('name', { required: 'Name is required' })}
                  placeholder="e.g., PAYE Tax"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  {...register('code', { required: 'Code is required' })}
                  placeholder="e.g., PAYE"
                  className="uppercase"
                />
                {errors.code && (
                  <p className="text-sm text-destructive">{errors.code.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Optional description..."
                rows={2}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="calculation_type">Calculation Type</Label>
                <Select
                  value={calculationType}
                  onValueChange={(value: 'fixed' | 'percentage') => setValue('calculation_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="percentage">Percentage of Basic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default_amount">
                  Default {calculationType === 'percentage' ? 'Percentage (%)' : 'Amount (KES)'}
                </Label>
                <Input
                  id="default_amount"
                  type="number"
                  min={0}
                  step={calculationType === 'percentage' ? 0.1 : 100}
                  {...register('default_amount', {
                    required: 'Amount is required',
                    min: { value: 0, message: 'Must be positive' },
                    valueAsNumber: true,
                  })}
                />
                {errors.default_amount && (
                  <p className="text-sm text-destructive">{errors.default_amount.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="is_statutory">Statutory Deduction</Label>
                <p className="text-sm text-muted-foreground">
                  Mark as government-mandated deduction (e.g., PAYE, NHIF)
                </p>
              </div>
              <Switch
                id="is_statutory"
                checked={isStatutory}
                onCheckedChange={(checked) => setValue('is_statutory', checked)}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Active</Label>
                <p className="text-sm text-muted-foreground">
                  Allow this deduction type to be applied
                </p>
              </div>
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={(checked) => setValue('is_active', checked)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : deduction ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
