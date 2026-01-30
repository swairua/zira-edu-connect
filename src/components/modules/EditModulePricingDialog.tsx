import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import type { ModulePricingData } from '@/hooks/useModulePricingManagement';

interface EditModulePricingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: ModulePricingData | null;
  allModules: ModulePricingData[];
  onSave: (updates: Partial<ModulePricingData> & { id: string }) => void;
  isLoading?: boolean;
}

export function EditModulePricingDialog({
  open,
  onOpenChange,
  module,
  allModules,
  onSave,
  isLoading,
}: EditModulePricingDialogProps) {
  const [formData, setFormData] = useState({
    display_name: '',
    description: '',
    tier: 'addon',
    base_monthly_price: 0,
    currency: 'KES',
    requires_modules: [] as string[],
    max_usage_limit: null as number | null,
    is_active: true,
  });

  useEffect(() => {
    if (module) {
      setFormData({
        display_name: module.display_name,
        description: module.description || '',
        tier: module.tier,
        base_monthly_price: module.base_monthly_price,
        currency: module.currency,
        requires_modules: module.requires_modules || [],
        max_usage_limit: module.max_usage_limit,
        is_active: module.is_active,
      });
    }
  }, [module]);

  const handleSave = () => {
    if (!module) return;
    onSave({
      id: module.id,
      ...formData,
      requires_modules: formData.requires_modules.length > 0 ? formData.requires_modules : null,
    });
  };

  const addDependency = (moduleId: string) => {
    if (!formData.requires_modules.includes(moduleId)) {
      setFormData((prev) => ({
        ...prev,
        requires_modules: [...prev.requires_modules, moduleId],
      }));
    }
  };

  const removeDependency = (moduleId: string) => {
    setFormData((prev) => ({
      ...prev,
      requires_modules: prev.requires_modules.filter((m) => m !== moduleId),
    }));
  };

  const availableDependencies = allModules.filter(
    (m) => m.module_id !== module?.module_id && !formData.requires_modules.includes(m.module_id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Module: {module?.module_id}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, display_name: e.target.value }))}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="tier">Tier</Label>
              <Select
                value={formData.tier}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, tier: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="core">Core (Included)</SelectItem>
                  <SelectItem value="addon">Addon</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KES">KES</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="UGX">UGX</SelectItem>
                  <SelectItem value="TZS">TZS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price">Base Monthly Price</Label>
              <Input
                id="price"
                type="number"
                value={formData.base_monthly_price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, base_monthly_price: parseInt(e.target.value) || 0 }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="limit">Usage Limit (optional)</Label>
              <Input
                id="limit"
                type="number"
                placeholder="No limit"
                value={formData.max_usage_limit ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    max_usage_limit: e.target.value ? parseInt(e.target.value) : null,
                  }))
                }
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Required Modules (Dependencies)</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.requires_modules.map((modId) => (
                <Badge key={modId} variant="secondary" className="gap-1">
                  {modId}
                  <button onClick={() => removeDependency(modId)} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {formData.requires_modules.length === 0 && (
                <span className="text-sm text-muted-foreground">No dependencies</span>
              )}
            </div>
            {availableDependencies.length > 0 && (
              <Select onValueChange={addDependency}>
                <SelectTrigger>
                  <SelectValue placeholder="Add dependency..." />
                </SelectTrigger>
                <SelectContent>
                  {availableDependencies.map((m) => (
                    <SelectItem key={m.module_id} value={m.module_id}>
                      {m.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">Active</Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
