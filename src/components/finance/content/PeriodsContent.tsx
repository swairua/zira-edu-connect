import { useState } from 'react';
import { useInstitution } from '@/contexts/InstitutionContext';
import { 
  useFinancialPeriods, 
  useCreatePeriod, 
  useLockPeriod, 
  useUnlockPeriod,
  useDeletePeriod,
  PeriodType 
} from '@/hooks/useFinancialPeriods';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Lock, 
  Unlock, 
  Trash2, 
  Calendar,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { format } from 'date-fns';

export function PeriodsContent() {
  const { institution } = useInstitution();
  const { data: periods, isLoading } = useFinancialPeriods(institution?.id || null);
  const createPeriod = useCreatePeriod();
  const lockPeriod = useLockPeriod();
  const unlockPeriod = useUnlockPeriod();
  const deletePeriod = useDeletePeriod();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLockDialogOpen, setIsLockDialogOpen] = useState(false);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [lockReason, setLockReason] = useState('');
  
  const [formData, setFormData] = useState({
    period_name: '',
    period_type: 'month' as PeriodType,
    start_date: '',
    end_date: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution?.id) return;

    await createPeriod.mutateAsync({
      institution_id: institution.id,
      ...formData,
    });

    setIsCreateDialogOpen(false);
    setFormData({
      period_name: '',
      period_type: 'month',
      start_date: '',
      end_date: '',
    });
  };

  const handleLock = async () => {
    if (!selectedPeriodId || !institution?.id) return;
    
    await lockPeriod.mutateAsync({
      id: selectedPeriodId,
      institutionId: institution.id,
      lock_reason: lockReason || undefined,
    });

    setIsLockDialogOpen(false);
    setSelectedPeriodId(null);
    setLockReason('');
  };

  const handleUnlock = async (id: string) => {
    if (!institution?.id) return;
    await unlockPeriod.mutateAsync({ id, institutionId: institution.id });
  };

  const handleDelete = async (id: string) => {
    if (!institution?.id) return;
    await deletePeriod.mutateAsync({ id, institutionId: institution.id });
  };

  const openLockDialog = (id: string) => {
    setSelectedPeriodId(id);
    setLockReason('');
    setIsLockDialogOpen(true);
  };

  const lockedCount = periods?.filter(p => p.is_locked).length || 0;
  const openCount = periods?.filter(p => !p.is_locked).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financial Periods</h1>
          <p className="text-muted-foreground">Manage period locks to prevent retroactive changes</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Period
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Financial Period</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="period_name">Period Name</Label>
                <Input
                  id="period_name"
                  value={formData.period_name}
                  onChange={(e) => setFormData({ ...formData, period_name: e.target.value })}
                  placeholder="e.g., January 2024"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Period Type</Label>
                <Select
                  value={formData.period_type}
                  onValueChange={(value: PeriodType) => 
                    setFormData({ ...formData, period_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="term">Term</SelectItem>
                    <SelectItem value="quarter">Quarter</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPeriod.isPending}>
                  {createPeriod.isPending ? 'Creating...' : 'Create Period'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Total Periods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{periods?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Lock className="h-4 w-4 text-red-600" />
              Locked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lockedCount}</div>
            <p className="text-sm text-muted-foreground">No changes allowed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Unlock className="h-4 w-4 text-green-600" />
              Open
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{openCount}</div>
            <p className="text-sm text-muted-foreground">Can be modified</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Periods</CardTitle>
          <CardDescription>
            Locked periods prevent any financial changes (payments, invoices, adjustments) within their date range
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !periods?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No financial periods defined</p>
              <p className="text-sm">Create periods to manage lock controls</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Locked By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.map((period) => (
                  <TableRow key={period.id}>
                    <TableCell className="font-medium">{period.period_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {period.period_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(period.start_date), 'MMM d, yyyy')} - {format(new Date(period.end_date), 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      {period.is_locked ? (
                        <Badge className="bg-red-100 text-red-800 gap-1">
                          <Lock className="h-3 w-3" />
                          Locked
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 gap-1">
                          <Unlock className="h-3 w-3" />
                          Open
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {period.is_locked && period.locker ? (
                        <div className="text-sm">
                          <p>{period.locker.first_name} {period.locker.last_name}</p>
                          {period.locked_at && (
                            <p className="text-muted-foreground text-xs">
                              {format(new Date(period.locked_at), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {period.is_locked ? (
                          period.can_unlock && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUnlock(period.id)}
                              disabled={unlockPeriod.isPending}
                            >
                              <Unlock className="h-4 w-4 mr-1" />
                              Unlock
                            </Button>
                          )
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openLockDialog(period.id)}
                            >
                              <Lock className="h-4 w-4 mr-1" />
                              Lock
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Period</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{period.period_name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(period.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="h-5 w-5" />
            Important Information
          </CardTitle>
        </CardHeader>
        <CardContent className="text-yellow-800">
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Locking a period prevents all financial modifications within that date range</li>
            <li>This includes payments, invoices, adjustments, and reversals</li>
            <li>Only administrators can lock/unlock periods</li>
            <li>Locked periods cannot be deleted</li>
            <li>Consider locking periods after month-end reconciliation is complete</li>
          </ul>
        </CardContent>
      </Card>

      <Dialog open={isLockDialogOpen} onOpenChange={setIsLockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-red-600" />
              Lock Financial Period
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> Locking this period will prevent any financial changes 
                (payments, invoices, adjustments) within its date range.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lock_reason">Reason for Locking (optional)</Label>
              <Textarea
                id="lock_reason"
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
                placeholder="e.g., Month-end reconciliation complete"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLockDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleLock}
              disabled={lockPeriod.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              <Lock className="h-4 w-4 mr-2" />
              {lockPeriod.isPending ? 'Locking...' : 'Lock Period'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
