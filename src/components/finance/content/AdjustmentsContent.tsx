import { useState } from 'react';
import { useInstitution } from '@/contexts/InstitutionContext';
import { 
  useFinancialAdjustments, 
  usePendingAdjustments,
  useApproveAdjustment, 
  useRejectAdjustment,
  AdjustmentStatus,
  AdjustmentType 
} from '@/hooks/useFinancialAdjustments';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AlertCircle, 
  Check, 
  X, 
  Clock, 
  FileText, 
  RefreshCcw,
  ArrowRightLeft,
  CreditCard,
  Trash2,
  Search
} from 'lucide-react';
import { format } from 'date-fns';

const ADJUSTMENT_TYPE_ICONS: Record<AdjustmentType, React.ReactNode> = {
  reversal: <RefreshCcw className="h-4 w-4" />,
  modification: <FileText className="h-4 w-4" />,
  credit_note: <CreditCard className="h-4 w-4" />,
  write_off: <Trash2 className="h-4 w-4" />,
  reallocation: <ArrowRightLeft className="h-4 w-4" />,
};

const STATUS_COLORS: Record<AdjustmentStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

export function AdjustmentsContent() {
  const { institution } = useInstitution();
  const { can } = usePermissions();
  const canApproveFinance = can('finance', 'approve');
  
  const [statusFilter, setStatusFilter] = useState<AdjustmentStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<AdjustmentType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: pendingAdjustments, isLoading: loadingPending } = usePendingAdjustments(institution?.id || null);
  const { data: allAdjustments, isLoading: loadingAll } = useFinancialAdjustments(
    institution?.id || null,
    {
      status: statusFilter !== 'all' ? statusFilter : undefined,
      adjustment_type: typeFilter !== 'all' ? typeFilter : undefined,
    }
  );
  
  const approveAdjustment = useApproveAdjustment();
  const rejectAdjustment = useRejectAdjustment();
  
  const [selectedAdjustment, setSelectedAdjustment] = useState<string | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

  const handleAction = async () => {
    if (!selectedAdjustment || !institution?.id) return;

    if (actionType === 'approve') {
      await approveAdjustment.mutateAsync({
        id: selectedAdjustment,
        institutionId: institution.id,
        approval_notes: approvalNotes || undefined,
      });
    } else {
      await rejectAdjustment.mutateAsync({
        id: selectedAdjustment,
        institutionId: institution.id,
        approval_notes: approvalNotes,
      });
    }

    setSelectedAdjustment(null);
    setApprovalNotes('');
  };

  const openActionDialog = (id: string, type: 'approve' | 'reject') => {
    setSelectedAdjustment(id);
    setActionType(type);
    setApprovalNotes('');
  };

  const formatCurrency = (amount: number) => {
    return `KES ${Math.abs(amount).toLocaleString()}`;
  };

  const stats = {
    pending: pendingAdjustments?.length || 0,
    totalPendingAmount: pendingAdjustments?.reduce((sum, a) => sum + Math.abs(a.adjustment_amount), 0) || 0,
    approvedToday: allAdjustments?.filter(a => 
      a.status === 'approved' && 
      a.approved_at && 
      new Date(a.approved_at).toDateString() === new Date().toDateString()
    ).length || 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Financial Adjustments</h1>
        <p className="text-muted-foreground">Review and approve payment reversals, modifications, and write-offs</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(stats.totalPendingAmount)} total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Check className="h-4 w-4" />
              Approved Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approvedToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Total Processed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allAdjustments?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="all">All Adjustments</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Review and approve or reject financial adjustment requests</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPending ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : !pendingAdjustments?.length ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Check className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending adjustments</p>
                  <p className="text-sm">All adjustment requests have been processed</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingAdjustments.map((adjustment) => (
                    <Card key={adjustment.id} className="border-l-4 border-l-yellow-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {ADJUSTMENT_TYPE_ICONS[adjustment.adjustment_type]}
                              <span className="font-medium capitalize">
                                {adjustment.adjustment_type.replace('_', ' ')}
                              </span>
                              <Badge variant="outline">{adjustment.entity_type}</Badge>
                            </div>
                            {adjustment.student && (
                              <p className="text-sm text-muted-foreground">
                                Student: {adjustment.student.first_name} {adjustment.student.last_name} 
                                ({adjustment.student.admission_number})
                              </p>
                            )}
                            <p className="text-sm">
                              <span className="text-muted-foreground">Reason:</span> {adjustment.reason}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Requested by {adjustment.requester?.first_name} {adjustment.requester?.last_name} 
                              on {format(new Date(adjustment.requested_at), 'MMM d, yyyy h:mm a')}
                            </p>
                          </div>
                          <div className="text-right space-y-2">
                            <div className="text-xl font-bold">
                              {adjustment.adjustment_amount < 0 ? '-' : '+'}
                              {formatCurrency(adjustment.adjustment_amount)}
                            </div>
                            <div className="flex gap-2">
                              {canApproveFinance && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => openActionDialog(adjustment.id, 'reject')}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => openActionDialog(adjustment.id, 'approve')}
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Adjustments</CardTitle>
                  <CardDescription>Complete history of financial adjustments</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-48"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as AdjustmentStatus | 'all')}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as AdjustmentType | 'all')}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="reversal">Reversal</SelectItem>
                      <SelectItem value="modification">Modification</SelectItem>
                      <SelectItem value="credit_note">Credit Note</SelectItem>
                      <SelectItem value="write_off">Write Off</SelectItem>
                      <SelectItem value="reallocation">Reallocation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingAll ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : !allAdjustments?.length ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No adjustments found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allAdjustments.map((adjustment) => (
                      <TableRow key={adjustment.id}>
                        <TableCell className="text-sm">
                          {format(new Date(adjustment.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {ADJUSTMENT_TYPE_ICONS[adjustment.adjustment_type]}
                            <span className="capitalize text-sm">
                              {adjustment.adjustment_type.replace('_', ' ')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{adjustment.entity_type}</Badge>
                        </TableCell>
                        <TableCell>
                          {adjustment.student ? (
                            <span className="text-sm">
                              {adjustment.student.first_name} {adjustment.student.last_name}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {adjustment.adjustment_amount < 0 ? '-' : '+'}
                          {formatCurrency(adjustment.adjustment_amount)}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm">
                          {adjustment.reason}
                        </TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLORS[adjustment.status]}>
                            {adjustment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedAdjustment} onOpenChange={() => setSelectedAdjustment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Adjustment' : 'Reject Adjustment'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {actionType === 'approve' ? 'Approval Notes (optional)' : 'Rejection Reason (required)'}
              </label>
              <Textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder={actionType === 'approve' ? 'Add any notes...' : 'Explain why this is being rejected...'}
                required={actionType === 'reject'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedAdjustment(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={
                (actionType === 'reject' && !approvalNotes) ||
                approveAdjustment.isPending ||
                rejectAdjustment.isPending
              }
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
