import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useUniformItems } from '@/hooks/useUniformItems';
import { useInstitution } from '@/contexts/InstitutionContext';
import type { UniformItem } from '@/types/uniforms';

interface AddUniformItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: UniformItem | null;
}

interface FormData {
  name: string;
  description: string;
  category: string;
  gender: string;
  base_price: number;
  is_active: boolean;
}

export function AddUniformItemDialog({ open, onOpenChange, editItem }: AddUniformItemDialogProps) {
  const { institution } = useInstitution();
  const { createItem, updateItem } = useUniformItems();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: editItem ? {
      name: editItem.name,
      description: editItem.description || '',
      category: editItem.category,
      gender: editItem.gender,
      base_price: editItem.base_price,
      is_active: editItem.is_active,
    } : {
      name: '',
      description: '',
      category: 'daily',
      gender: 'unisex',
      base_price: 0,
      is_active: true,
    }
  });

  const onSubmit = async (data: FormData) => {
    if (!institution?.id) return;
    setIsSubmitting(true);
    
    try {
      if (editItem) {
        await updateItem.mutateAsync({
          id: editItem.id,
          ...data,
        });
      } else {
        await createItem.mutateAsync({
          ...data,
          institution_id: institution.id,
          currency: 'KES',
          image_url: null,
        });
      }
      reset();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editItem ? 'Edit Uniform Item' : 'Add Uniform Item'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <DialogBody>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., School Shirt"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Optional description..."
                  {...register('description')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={watch('category')} onValueChange={(v) => setValue('category', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily Wear</SelectItem>
                      <SelectItem value="pe">PE / Sports</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Gender *</Label>
                  <Select value={watch('gender')} onValueChange={(v) => setValue('gender', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unisex">Unisex</SelectItem>
                      <SelectItem value="male">Boys</SelectItem>
                      <SelectItem value="female">Girls</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="base_price">Base Price (KES) *</Label>
                <Input
                  id="base_price"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('base_price', { required: true, valueAsNumber: true, min: 0 })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active</Label>
                <Switch
                  id="is_active"
                  checked={watch('is_active')}
                  onCheckedChange={(checked) => setValue('is_active', checked)}
                />
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editItem ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
