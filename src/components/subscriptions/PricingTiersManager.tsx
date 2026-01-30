import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, School, Users, Edit2, Check, X, Plus, Trash2 } from 'lucide-react';
import { usePricingTiers, useUpdatePricingTier, useCreatePricingTier, useDeletePricingTier, PricingTier, OwnershipType, SubscriptionPlanId } from '@/hooks/usePricingTiers';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface EditingTier {
  id: string;
  setup_cost: number;
  annual_subscription: number;
}

export function PricingTiersManager() {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId>('starter');
  const [ownershipTab, setOwnershipTab] = useState<OwnershipType>('public');
  const [editingTier, setEditingTier] = useState<EditingTier | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isAddingTier, setIsAddingTier] = useState(false);
  const [newTier, setNewTier] = useState({
    min_students: 0,
    max_students: 100,
    setup_cost: 0,
    annual_subscription: 0,
  });

  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans();
  const { data: tiers, isLoading: tiersLoading } = usePricingTiers(selectedPlan);
  const updateTier = useUpdatePricingTier();
  const createTier = useCreatePricingTier();
  const deleteTier = useDeletePricingTier();

  const filteredTiers = useMemo(() => {
    return tiers?.filter(t => t.ownership_type === ownershipTab) ?? [];
  }, [tiers, ownershipTab]);

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const formatStudentRange = (min: number, max: number) => {
    if (max === -1) return `${min.toLocaleString()}+`;
    return `${min.toLocaleString()} - ${max.toLocaleString()}`;
  };

  const handleEdit = (tier: PricingTier) => {
    setEditingTier({
      id: tier.id,
      setup_cost: tier.setup_cost,
      annual_subscription: tier.annual_subscription,
    });
  };

  const handleSave = async () => {
    if (!editingTier) return;
    
    await updateTier.mutateAsync({
      id: editingTier.id,
      setup_cost: editingTier.setup_cost,
      annual_subscription: editingTier.annual_subscription,
    });
    
    setEditingTier(null);
  };

  const handleCancel = () => {
    setEditingTier(null);
  };

  const handleAddTier = async () => {
    await createTier.mutateAsync({
      plan_id: selectedPlan as any,
      ownership_type: ownershipTab,
      min_students: newTier.min_students,
      max_students: newTier.max_students,
      setup_cost: newTier.setup_cost,
      annual_subscription: newTier.annual_subscription,
      currency: 'KES',
      is_active: true,
    });
    
    setIsAddingTier(false);
    setNewTier({
      min_students: 0,
      max_students: 100,
      setup_cost: 0,
      annual_subscription: 0,
    });
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await deleteTier.mutateAsync(deleteConfirm);
    setDeleteConfirm(null);
  };

  if (plansLoading || tiersLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Student Population Pricing Tiers
          </CardTitle>
          <CardDescription>
            Configure pricing based on student population. Year 1 includes setup cost, Year 2+ is subscription only.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Subscription Plan</label>
              <Select value={selectedPlan} onValueChange={(value) => setSelectedPlan(value as SubscriptionPlanId)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {plans?.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2 ml-auto">
              <Badge variant="secondary" className="text-xs">
                Year 1 = Setup + Subscription
              </Badge>
              <Badge variant="outline" className="text-xs">
                Year 2+ = Subscription Only
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Tables */}
      <Tabs value={ownershipTab} onValueChange={(v) => setOwnershipTab(v as OwnershipType)}>
        <TabsList className="mb-4">
          <TabsTrigger value="public" className="gap-2">
            <School className="h-4 w-4" />
            Public Schools
          </TabsTrigger>
          <TabsTrigger value="private" className="gap-2">
            <Building2 className="h-4 w-4" />
            Private Schools
          </TabsTrigger>
        </TabsList>

        <TabsContent value={ownershipTab}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {ownershipTab === 'public' ? 'Public' : 'Private'} School Tiers
                </CardTitle>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setIsAddingTier(true)}
                  disabled={isAddingTier}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Tier
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Students</TableHead>
                    <TableHead className="text-right">Setup Cost (Year 1)</TableHead>
                    <TableHead className="text-right">Annual Subscription</TableHead>
                    <TableHead className="text-right">Year 1 Total</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTiers.map((tier) => {
                    const isEditing = editingTier?.id === tier.id;
                    const year1Total = tier.setup_cost + tier.annual_subscription;

                    return (
                      <TableRow key={tier.id}>
                        <TableCell className="font-medium">
                          {formatStudentRange(tier.min_students, tier.max_students)}
                        </TableCell>
                        <TableCell className="text-right">
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editingTier.setup_cost}
                              onChange={(e) => setEditingTier({
                                ...editingTier,
                                setup_cost: parseFloat(e.target.value) || 0,
                              })}
                              className="w-28 h-8 text-right ml-auto"
                            />
                          ) : (
                            formatCurrency(tier.setup_cost)
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editingTier.annual_subscription}
                              onChange={(e) => setEditingTier({
                                ...editingTier,
                                annual_subscription: parseFloat(e.target.value) || 0,
                              })}
                              className="w-28 h-8 text-right ml-auto"
                            />
                          ) : (
                            formatCurrency(tier.annual_subscription)
                          )}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-primary">
                          {isEditing 
                            ? formatCurrency(editingTier.setup_cost + editingTier.annual_subscription)
                            : formatCurrency(year1Total)
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            {isEditing ? (
                              <>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-8 w-8"
                                  onClick={handleSave}
                                  disabled={updateTier.isPending}
                                >
                                  <Check className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-8 w-8"
                                  onClick={handleCancel}
                                >
                                  <X className="h-4 w-4 text-destructive" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-8 w-8"
                                  onClick={() => handleEdit(tier)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-8 w-8"
                                  onClick={() => setDeleteConfirm(tier.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  
                  {/* Add new tier row */}
                  {isAddingTier && (
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={newTier.min_students}
                            onChange={(e) => setNewTier({
                              ...newTier,
                              min_students: parseInt(e.target.value) || 0,
                            })}
                            className="w-20 h-8"
                            placeholder="Min"
                          />
                          <span>-</span>
                          <Input
                            type="number"
                            value={newTier.max_students}
                            onChange={(e) => setNewTier({
                              ...newTier,
                              max_students: parseInt(e.target.value) || -1,
                            })}
                            className="w-20 h-8"
                            placeholder="Max"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          value={newTier.setup_cost}
                          onChange={(e) => setNewTier({
                            ...newTier,
                            setup_cost: parseFloat(e.target.value) || 0,
                          })}
                          className="w-28 h-8 text-right ml-auto"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          value={newTier.annual_subscription}
                          onChange={(e) => setNewTier({
                            ...newTier,
                            annual_subscription: parseFloat(e.target.value) || 0,
                          })}
                          className="w-28 h-8 text-right ml-auto"
                        />
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {formatCurrency(newTier.setup_cost + newTier.annual_subscription)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8"
                            onClick={handleAddTier}
                            disabled={createTier.isPending}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8"
                            onClick={() => setIsAddingTier(false)}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {filteredTiers.length === 0 && !isAddingTier && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No pricing tiers configured for this plan.
                        <Button 
                          variant="link" 
                          className="ml-1"
                          onClick={() => setIsAddingTier(true)}
                        >
                          Add one now
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pricing Tier?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Institutions using this tier will need to be reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
