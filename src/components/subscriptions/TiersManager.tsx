import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit2, Save, X, Star, Phone, Layers } from 'lucide-react';
import { useTiersPricing, useUpdatePricingTierConfig, formatTierRange, PricingTierConfig } from '@/hooks/usePricingTiersConfig';

export function TiersManager() {
  const { data: tiersPricing, tiers, isLoading } = useTiersPricing();
  const updateTier = useUpdatePricingTierConfig();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PricingTierConfig>>({});

  const handleEdit = (tier: PricingTierConfig) => {
    setEditingId(tier.id);
    setEditForm({
      name: tier.name,
      min_students: tier.min_students,
      max_students: tier.max_students,
      representative_count: tier.representative_count,
      description: tier.description,
      is_popular: tier.is_popular,
      is_contact_sales: tier.is_contact_sales,
    });
  };

  const handleSave = () => {
    if (!editingId) return;
    updateTier.mutate({ id: editingId, ...editForm });
    setEditingId(null);
    setEditForm({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handlePopularToggle = (tier: PricingTierConfig) => {
    // First, remove popular from all other tiers
    if (!tier.is_popular && tiers) {
      const currentPopular = tiers.find(t => t.is_popular);
      if (currentPopular) {
        updateTier.mutate({ id: currentPopular.id, is_popular: false });
      }
    }
    updateTier.mutate({ id: tier.id, is_popular: !tier.is_popular });
  };

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Pricing Tiers
        </CardTitle>
        <CardDescription>
          Manage the 6 pricing tiers shown on the landing page. Prices are calculated using the formula rates.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">#</TableHead>
                <TableHead>Tier Name</TableHead>
                <TableHead>Student Range</TableHead>
                <TableHead className="text-center">Rep. Count</TableHead>
                <TableHead className="text-right">Public Year 1</TableHead>
                <TableHead className="text-right">Public Renewal</TableHead>
                <TableHead className="text-center">Flags</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiersPricing?.map((tierPricing) => {
                const { tier, isCustom, publicYear1, publicRenewal } = tierPricing;
                const isEditing = editingId === tier.id;

                return (
                  <TableRow key={tier.id}>
                    <TableCell>
                      <Badge variant="outline">{tier.tier_number}</Badge>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-32"
                        />
                      ) : (
                        <span className="font-medium">{tier.name}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={editForm.min_students || 0}
                            onChange={(e) => setEditForm({ ...editForm, min_students: parseInt(e.target.value) })}
                            className="w-20"
                          />
                          <span>-</span>
                          <Input
                            type="number"
                            value={editForm.max_students === -1 ? '' : editForm.max_students || 0}
                            onChange={(e) => setEditForm({ ...editForm, max_students: e.target.value === '' ? -1 : parseInt(e.target.value) })}
                            placeholder="∞"
                            className="w-20"
                          />
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">{formatTierRange(tier)}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editForm.representative_count || 0}
                          onChange={(e) => setEditForm({ ...editForm, representative_count: parseInt(e.target.value) })}
                          className="w-20 mx-auto"
                        />
                      ) : (
                        <Badge variant="secondary">{tier.representative_count}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {isCustom ? (
                        <span className="text-muted-foreground">Custom</span>
                      ) : (
                        <span className="text-green-600">KES {publicYear1.toLocaleString()}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {isCustom ? (
                        <span className="text-muted-foreground">Custom</span>
                      ) : (
                        <span>KES {publicRenewal.toLocaleString()}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        {tier.is_popular && (
                          <Badge className="bg-landing-coral text-white text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                        {tier.is_contact_sales && (
                          <Badge variant="outline" className="text-xs">
                            <Phone className="w-3 h-3 mr-1" />
                            Sales
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" onClick={handleSave}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={handleCancel}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(tier)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-3">Quick Actions</h4>
          <div className="flex flex-wrap gap-4">
            {tiers?.map((tier) => (
              <div key={tier.id} className="flex items-center gap-2">
                <Switch
                  checked={tier.is_popular}
                  onCheckedChange={() => handlePopularToggle(tier)}
                  disabled={updateTier.isPending}
                />
                <Label className="text-sm cursor-pointer">
                  {tier.name} as "Popular"
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-4 p-4 bg-blue-500/10 rounded-lg text-sm text-blue-700 dark:text-blue-300">
          <p>
            <strong>How it works:</strong> Each tier has a "representative count" used for price calculation. 
            When a school selects a tier, the price is calculated using: 
            <code className="mx-1 px-1 bg-blue-500/20 rounded">Base + (Rate × Representative Count) × Multiplier</code>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
