import { useState } from 'react';
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
import { useCreatePlan } from '@/hooks/useSubscriptionPlans';
import { ModuleSelector } from './ModuleSelector';
import { FeatureSelector } from './FeatureSelector';

const createPlanSchema = z.object({
  id: z.string().min(1, 'ID is required').regex(/^[a-z0-9_-]+$/, 'ID must be lowercase alphanumeric with dashes or underscores'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullable(),
  price_monthly: z.coerce.number().min(0, 'Price must be 0 or greater'),
  price_yearly: z.coerce.number().min(0, 'Price must be 0 or greater'),
  currency: z.string().default('KES'),
  max_students: z.coerce.number(),
  max_staff: z.coerce.number(),
  is_active: z.boolean().default(true),
});

type CreatePlanFormData = z.infer<typeof createPlanSchema>;

interface CreatePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePlanDialog({ open, onOpenChange }: CreatePlanDialogProps) {
  const [features, setFeatures] = useState<string[]>(['basic_reports', 'email_notifications']);
  const [modules, setModules] = useState<string[]>(['academics', 'finance']);

  const createPlan = useCreatePlan();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePlanFormData>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      currency: 'KES',
      max_students: 500,
      max_staff: 50,
      is_active: true,
    },
  });

  const onSubmit = async (data: CreatePlanFormData) => {
    await createPlan.mutateAsync({
      id: data.id,
      name: data.name,
      description: data.description ?? null,
      price_monthly: data.price_monthly,
      price_yearly: data.price_yearly,
      currency: data.currency,
      max_students: data.max_students,
      max_staff: data.max_staff,
      is_active: data.is_active,
      features,
      modules,
    });

    reset();
    setFeatures(['basic_reports', 'email_notifications']);
    setModules(['academics', 'finance']);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Plan</DialogTitle>
          <DialogDescription>
            Add a new subscription plan tier for institutions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="id">Plan ID (unique slug)</Label>
            <Input id="id" placeholder="e.g., premium, basic-plus" {...register('id')} />
            {errors.id && (
              <p className="text-sm text-destructive">{errors.id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Plan Name</Label>
            <Input id="name" placeholder="e.g., Premium" {...register('name')} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Brief description of the plan..."
              {...register('description')} 
              rows={2} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price_monthly">Monthly Price (KES)</Label>
              <Input
                id="price_monthly"
                type="number"
                placeholder="0"
                {...register('price_monthly')}
              />
              {errors.price_monthly && (
                <p className="text-sm text-destructive">{errors.price_monthly.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price_yearly">Yearly Price (KES)</Label>
              <Input
                id="price_yearly"
                type="number"
                placeholder="0"
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
                Make this plan available for assignment immediately
              </p>
            </div>
            <Switch id="is_active" {...register('is_active')} defaultChecked />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createPlan.isPending}>
              {createPlan.isPending ? 'Creating...' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
