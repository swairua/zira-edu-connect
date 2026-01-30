import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { useCreateAllowanceType, useUpdateAllowanceType, type AllowanceType } from '@/hooks/usePayroll';

interface AllowanceTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allowance: AllowanceType | null;
}

interface FormData {
  name: string;
  code: string;
  description: string;
  calculation_type: 'fixed' | 'percentage';
  default_amount: number;
  is_taxable: boolean;
  is_active: boolean;
}

export function AllowanceTypeDialog({ open, onOpenChange, allowance }: AllowanceTypeDialogProps) {
  const createAllowance = useCreateAllowanceType();
  const updateAllowance = useUpdateAllowanceType();
  
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: '',
      code: '',
      description: '',
      calculation_type: 'fixed',
      default_amount: 0,
      is_taxable: true,
      is_active: true,
    },
  });

  const calculationType = watch('calculation_type');
  const isTaxable = watch('is_taxable');
  const isActive = watch('is_active');

  useEffect(() => {
    if (open) {
      if (allowance) {
        reset({
          name: allowance.name,
          code: allowance.code,
          description: allowance.description || '',
          calculation_type: allowance.calculation_type,
          default_amount: allowance.default_amount,
          is_taxable: allowance.is_taxable,
          is_active: allowance.is_active,
        });
      } else {
        reset({
          name: '',
          code: '',
          description: '',
          calculation_type: 'fixed',
          default_amount: 0,
          is_taxable: true,
          is_active: true,
        });
      }
    }
  }, [open, allowance, reset]);

  const onSubmit = async (data: FormData) => {
    if (allowance) {
      await updateAllowance.mutateAsync({ id: allowance.id, ...data });
    } else {
      await createAllowance.mutateAsync(data);
    }
    onOpenChange(false);
  };

  const isPending = createAllowance.isPending || updateAllowance.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {allowance ? 'Edit Allowance Type' : 'Add Allowance Type'}
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
                  placeholder="e.g., Housing Allowance"
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
                  placeholder="e.g., HOUSE"
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
                <Label htmlFor="is_taxable">Taxable</Label>
                <p className="text-sm text-muted-foreground">
                  Include this allowance in taxable income
                </p>
              </div>
              <Switch
                id="is_taxable"
                checked={isTaxable}
                onCheckedChange={(checked) => setValue('is_taxable', checked)}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Active</Label>
                <p className="text-sm text-muted-foreground">
                  Allow this allowance type to be assigned
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
                {isPending ? 'Saving...' : allowance ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
