import { useState } from 'react';
import { useModulePricingManagement } from '@/hooks/useModulePricingManagement';
import { useBillingSettings } from '@/hooks/useBillingSettings';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Pencil, 
  Check, 
  X, 
  Package, 
  Puzzle, 
  Crown,
  Users 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const tierConfig = {
  core: { label: 'Core', icon: Package, color: 'bg-blue-100 text-blue-800' },
  addon: { label: 'Add-on', icon: Puzzle, color: 'bg-amber-100 text-amber-800' },
  premium: { label: 'Premium', icon: Crown, color: 'bg-purple-100 text-purple-800' },
};

interface EditingPrices {
  monthly: string;
  termly: string;
  annual: string;
}

export function ModulePricingTable() {
  const { modules, isLoading, usageStats, updateModule } = useModulePricingManagement();
  const { data: billingSettings } = useBillingSettings();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrices, setEditPrices] = useState<EditingPrices>({ monthly: '', termly: '', annual: '' });

  const startEditing = (
    moduleId: string, 
    monthlyPrice: number, 
    termlyPrice: number, 
    annualPrice: number
  ) => {
    setEditingId(moduleId);
    setEditPrices({
      monthly: String(monthlyPrice),
      termly: String(termlyPrice),
      annual: String(annualPrice),
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditPrices({ monthly: '', termly: '', annual: '' });
  };

  const savePrice = (moduleId: string) => {
    const monthly = parseFloat(editPrices.monthly);
    const termly = parseFloat(editPrices.termly);
    const annual = parseFloat(editPrices.annual);
    
    if (!isNaN(monthly) && monthly >= 0 && !isNaN(termly) && termly >= 0 && !isNaN(annual) && annual >= 0) {
      updateModule.mutate({
        id: moduleId,
        base_monthly_price: monthly,
        base_termly_price: termly,
        base_annual_price: annual,
      });
    }
    cancelEditing();
  };

  const toggleActive = (moduleId: string, currentActive: boolean) => {
    updateModule.mutate({
      id: moduleId,
      is_active: !currentActive,
    });
  };

  // Determine which price columns to show based on enabled billing cycles
  const showMonthly = billingSettings?.monthly_enabled ?? false;
  const showTermly = billingSettings?.termly_enabled ?? true;
  const showAnnual = billingSettings?.annual_enabled ?? true;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  // Group by tier
  const groupedModules = modules?.reduce((acc, module) => {
    const tier = module.tier as keyof typeof tierConfig;
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(module);
    return acc;
  }, {} as Record<string, typeof modules>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedModules || {}).map(([tier, tierModules]) => {
        const config = tierConfig[tier as keyof typeof tierConfig];
        const TierIcon = config?.icon || Package;
        
        return (
          <div key={tier} className="space-y-2">
            <div className="flex items-center gap-2">
              <TierIcon className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold capitalize">{config?.label || tier} Modules</h3>
              <Badge variant="secondary" className={cn('ml-2', config?.color)}>
                {tierModules?.length} modules
              </Badge>
            </div>
            
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module</TableHead>
                    <TableHead className="max-w-[200px]">Description</TableHead>
                    {showMonthly && <TableHead className="text-right">Monthly</TableHead>}
                    {showTermly && <TableHead className="text-right">Termly</TableHead>}
                    {showAnnual && <TableHead className="text-right">Annual</TableHead>}
                    <TableHead className="text-center">Usage</TableHead>
                    <TableHead className="text-center">Active</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tierModules?.map((module) => {
                    const usage = usageStats?.[module.module_id] || 0;
                    const isEditing = editingId === module.module_id;
                    
                    return (
                      <TableRow key={module.module_id}>
                        <TableCell className="font-medium">
                          {module.display_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-[200px] truncate">
                          {module.description || '-'}
                        </TableCell>
                        
                        {/* Monthly Price */}
                        {showMonthly && (
                          <TableCell className="text-right">
                            {isEditing ? (
                              <Input
                                type="number"
                                value={editPrices.monthly}
                                onChange={(e) => setEditPrices({ ...editPrices, monthly: e.target.value })}
                                className="w-20 h-8 text-right"
                                min={0}
                                step={100}
                              />
                            ) : (
                              <span className="font-medium">
                                {module.currency} {Number(module.base_monthly_price).toLocaleString()}
                              </span>
                            )}
                          </TableCell>
                        )}
                        
                        {/* Termly Price */}
                        {showTermly && (
                          <TableCell className="text-right">
                            {isEditing ? (
                              <Input
                                type="number"
                                value={editPrices.termly}
                                onChange={(e) => setEditPrices({ ...editPrices, termly: e.target.value })}
                                className="w-20 h-8 text-right"
                                min={0}
                                step={100}
                              />
                            ) : (
                              <span className="font-medium">
                                {module.currency} {Number(module.base_termly_price).toLocaleString()}
                              </span>
                            )}
                          </TableCell>
                        )}
                        
                        {/* Annual Price */}
                        {showAnnual && (
                          <TableCell className="text-right">
                            {isEditing ? (
                              <Input
                                type="number"
                                value={editPrices.annual}
                                onChange={(e) => setEditPrices({ ...editPrices, annual: e.target.value })}
                                className="w-20 h-8 text-right"
                                min={0}
                                step={100}
                              />
                            ) : (
                              <span className="font-medium">
                                {module.currency} {Number(module.base_annual_price).toLocaleString()}
                              </span>
                            )}
                          </TableCell>
                        )}
                        
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{usage}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={module.is_active}
                            onCheckedChange={() => toggleActive(module.module_id, module.is_active)}
                          />
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => savePrice(module.module_id)}
                              >
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={cancelEditing}
                              >
                                <X className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => startEditing(
                                module.module_id, 
                                Number(module.base_monthly_price),
                                Number(module.base_termly_price),
                                Number(module.base_annual_price)
                              )}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
