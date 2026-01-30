import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, AlertTriangle, Plus, Search, Building2, TrendingUp, TrendingDown } from 'lucide-react';
import { useAllInstitutionSmsCredits, useActiveSmsBundles, useAddSmsCredits, getSmsBalanceStatus } from '@/hooks/useSmsBilling';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface AddCreditsFormData {
  institutionId: string;
  institutionName: string;
  bundleId?: string;
  customCredits?: number;
}

export function SmsCreditsBilling() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddCreditsOpen, setIsAddCreditsOpen] = useState(false);
  const [addCreditsForm, setAddCreditsForm] = useState<AddCreditsFormData | null>(null);

  const { data: institutionCredits, isLoading } = useAllInstitutionSmsCredits();
  const { data: bundles } = useActiveSmsBundles();
  const addCredits = useAddSmsCredits();
  const { toast } = useToast();

  const formatNumber = (num: number) => num.toLocaleString();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-500">Healthy</Badge>;
      case 'low':
        return <Badge variant="secondary" className="bg-yellow-500 text-white">Low</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'empty':
        return <Badge variant="outline">Empty</Badge>;
      default:
        return null;
    }
  };

  const filteredInstitutions = institutionCredits?.filter(ic => {
    const institution = (ic as any).institution;
    const matchesSearch = !searchQuery || 
      institution?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      institution?.code?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filterStatus === 'all') return true;
    
    const status = getSmsBalanceStatus(ic as any);
    return status === filterStatus;
  }) ?? [];

  // Stats
  const totalCredits = institutionCredits?.reduce((sum, ic) => sum + (ic as any).total_credits, 0) ?? 0;
  const totalUsed = institutionCredits?.reduce((sum, ic) => sum + (ic as any).used_credits, 0) ?? 0;
  const lowBalanceCount = institutionCredits?.filter(ic => {
    const status = getSmsBalanceStatus(ic as any);
    return status === 'low' || status === 'critical' || status === 'empty';
  }).length ?? 0;

  const handleAddCredits = (institutionId: string, institutionName: string) => {
    setAddCreditsForm({
      institutionId,
      institutionName,
    });
    setIsAddCreditsOpen(true);
  };

  const handleSubmitCredits = async () => {
    if (!addCreditsForm) return;

    const selectedBundle = bundles?.find(b => b.id === addCreditsForm.bundleId);
    const creditsToAdd = selectedBundle 
      ? selectedBundle.credits + selectedBundle.bonus_credits
      : addCreditsForm.customCredits ?? 0;

    if (creditsToAdd <= 0) {
      toast({
        title: 'Error',
        description: 'Please select a bundle or enter custom credits',
        variant: 'destructive',
      });
      return;
    }

    await addCredits.mutateAsync({
      institutionId: addCreditsForm.institutionId,
      credits: creditsToAdd,
      bundleId: addCreditsForm.bundleId,
      description: selectedBundle 
        ? `${selectedBundle.name} bundle purchased`
        : 'Manual credits added',
    });

    setIsAddCreditsOpen(false);
    setAddCreditsForm(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Credits Issued
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold">{formatNumber(totalCredits)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Credits Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold">{formatNumber(totalUsed)}</span>
            </div>
            <Progress value={(totalUsed / totalCredits) * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Low Balance Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-2xl font-bold">{lowBalanceCount}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Institutions need top-up
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Credits Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Institution SMS Credits
              </CardTitle>
              <CardDescription>
                Monitor and manage SMS credit balances for all institutions
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search institutions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-full sm:w-[200px]"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="healthy">Healthy</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="empty">Empty</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Institution</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Used</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Last Top-up</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInstitutions.map((ic) => {
                const institution = (ic as any).institution;
                const status = getSmsBalanceStatus(ic as any);
                const usagePercent = (ic as any).total_credits > 0 
                  ? ((ic as any).used_credits / (ic as any).total_credits) * 100 
                  : 0;

                return (
                  <TableRow key={ic.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{institution?.name ?? 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{institution?.code}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber((ic as any).total_credits)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber((ic as any).used_credits)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatNumber((ic as any).total_credits - (ic as any).used_credits)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(status)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      {(ic as any).last_topup_at 
                        ? new Date((ic as any).last_topup_at).toLocaleDateString()
                        : '—'
                      }
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddCredits((ic as any).institution_id, institution?.name)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}

              {filteredInstitutions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No institutions found matching your criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Credits Dialog */}
      <Dialog open={isAddCreditsOpen} onOpenChange={setIsAddCreditsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add SMS Credits</DialogTitle>
            <DialogDescription>
              Add credits to {addCreditsForm?.institutionName}
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <div className="space-y-2">
              <Label>Select Bundle</Label>
              <Select
                value={addCreditsForm?.bundleId ?? ''}
                onValueChange={(value) => setAddCreditsForm(prev => prev ? {
                  ...prev,
                  bundleId: value,
                  customCredits: undefined,
                } : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a bundle" />
                </SelectTrigger>
                <SelectContent>
                  {bundles?.map(bundle => (
                    <SelectItem key={bundle.id} value={bundle.id}>
                      {bundle.name} - KES {bundle.price.toLocaleString()} ({(bundle.credits + bundle.bonus_credits).toLocaleString()} credits)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">OR</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="space-y-2">
              <Label>Custom Credits</Label>
              <Input
                type="number"
                placeholder="Enter number of credits"
                value={addCreditsForm?.customCredits ?? ''}
                onChange={(e) => setAddCreditsForm(prev => prev ? {
                  ...prev,
                  bundleId: undefined,
                  customCredits: parseInt(e.target.value) || 0,
                } : null)}
              />
              <p className="text-xs text-muted-foreground">
                Use this for manual adjustments or custom deals
              </p>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCreditsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitCredits}
              disabled={(!addCreditsForm?.bundleId && !addCreditsForm?.customCredits) || addCredits.isPending}
            >
              {addCredits.isPending ? 'Adding...' : 'Add Credits'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
