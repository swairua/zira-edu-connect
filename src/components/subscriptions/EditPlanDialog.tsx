import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SubscriptionPlan, useUpdatePlan } from '@/hooks/useSubscriptionPlans';
import { ModuleSelector } from './ModuleSelector';
import { FeatureSelector } from './FeatureSelector';

const planSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullable(),
  price_monthly: z.coerce.number().min(0, 'Price must be 0 or greater'),
  price_termly: z.coerce.number().min(0, 'Price must be 0 or greater'),
  price_yearly: z.coerce.number().min(0, 'Price must be 0 or greater'),
  max_students: z.coerce.number(),
  max_staff: z.coerce.number(),
  is_active: z.boolean(),
});

type PlanFormData = z.infer<typeof planSchema>;

interface EditPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: SubscriptionPlan | null;
}

export function EditPlanDialog({ open, onOpenChange, plan }: EditPlanDialogProps) {
  const [features, setFeatures] = useState<string[]>([]);
  const [modules, setModules] = useState<string[]>([]);

  const updatePlan = useUpdatePlan();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
  });

  useEffect(() => {
    if (plan) {
      reset({
        name: plan.name,
        description: plan.description,
        price_monthly: plan.price_monthly,
        price_termly: (plan as any).price_termly || 0,
        price_yearly: plan.price_yearly,
        max_students: plan.max_students,
        max_staff: plan.max_staff,
        is_active: plan.is_active,
      });
      setFeatures(plan.features || []);
      setModules(plan.modules || []);
    }
  }, [plan, reset]);

  const onSubmit = async (data: PlanFormData) => {
    if (!plan) return;

    await updatePlan.mutateAsync({
      id: plan.id,
      ...data,
      features,
      modules,
    });

    onOpenChange(false);
  };

  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Plan: {plan.name}</DialogTitle>
          <DialogDescription>
            Update the subscription plan details. Changes will affect all institutions on this plan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Plan Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} rows={2} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price_monthly">Monthly (KES)</Label>
              <Input
                id="price_monthly"
                type="number"
                {...register('price_monthly')}
              />
              {errors.price_monthly && (
                <p className="text-sm text-destructive">{errors.price_monthly.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price_termly">Termly (KES)</Label>
              <Input
                id="price_termly"
                type="number"
                {...register('price_termly')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price_yearly">Yearly (KES)</Label>
              <Input
                id="price_yearly"
                type="number"
                {...register('price_yearly')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_students">Max Students (-1 = unlimited)</Label>
              <Input
                id="max_students"
                type="number"
                {...register('max_students')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_staff">Max Staff (-1 = unlimited)</Label>
              <Input
                id="max_staff"
                type="number"
                {...register('max_staff')}
              />
            </div>
          </div>

          <ModuleSelector selected={modules} onChange={setModules} />

          <FeatureSelector selected={features} onChange={setFeatures} />

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="is_active">Active</Label>
              <p className="text-sm text-muted-foreground">
                Inactive plans cannot be assigned to new institutions
              </p>
            </div>
            <Switch 
              id="is_active" 
              checked={watch('is_active')} 
              onCheckedChange={(checked) => setValue('is_active', checked)} 
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updatePlan.isPending}>
              {updatePlan.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
