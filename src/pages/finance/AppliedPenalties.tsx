import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useInstitution } from '@/contexts/InstitutionContext';
import { 
  useAppliedPenalties, 
  usePenaltyWaiverRequests,
  useCreateWaiverRequest,
  useApproveWaiverRequest,
  useRejectWaiverRequest,
  AppliedPenalty,
  PenaltyWaiverRequest 
} from '@/hooks/useAppliedPenalties';
import { AlertTriangle, Check, X, Clock, FileWarning, Percent } from 'lucide-react';
import { format } from 'date-fns';

export default function AppliedPenaltiesPage() {
  const { institutionId } = useInstitution();
  const [statusFilter, setStatusFilter] = useState('all');
  const [waiverDialogOpen, setWaiverDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedPenalty, setSelectedPenalty] = useState<AppliedPenalty | null>(null);
  const [selectedWaiver, setSelectedWaiver] = useState<PenaltyWaiverRequest | null>(null);
  const [waiverReason, setWaiverReason] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');

  const { data: penalties = [], isLoading: penaltiesLoading } = useAppliedPenalties(institutionId, { includeWaived: true });
  const { data: waiverRequests = [], isLoading: waiversLoading } = usePenaltyWaiverRequests(
    institutionId,
    statusFilter !== 'all' ? statusFilter : undefined
  );

  const createWaiver = useCreateWaiverRequest();
  const approveWaiver = useApproveWaiverRequest();
  const rejectWaiver = useRejectWaiverRequest();

  // Stats
  const stats = {
    totalPenalties: penalties.filter(p => !p.waived).length,
    totalAmount: penalties.filter(p => !p.waived).reduce((sum, p) => sum + p.amount, 0),
    waivedCount: penalties.filter(p => p.waived).length,
    pendingWaivers: waiverRequests.filter(w => w.status === 'pending').length,
  };

  const handleRequestWaiver = (penalty: AppliedPenalty) => {
    setSelectedPenalty(penalty);
    setWaiverReason('');
    setWaiverDialogOpen(true);
  };

  const handleSubmitWaiver = async () => {
    if (!selectedPenalty || !institutionId) return;

    await createWaiver.mutateAsync({
      institution_id: institutionId,
      applied_penalty_id: selectedPenalty.id,
      reason: waiverReason,
      requester_type: 'staff',
    });
    setWaiverDialogOpen(false);
  };

  const handleOpenReview = (waiver: PenaltyWaiverRequest) => {
    setSelectedWaiver(waiver);
    setReviewNotes('');
    setReviewDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedWaiver) return;
    await approveWaiver.mutateAsync({ requestId: selectedWaiver.id, reviewNotes });
    setReviewDialogOpen(false);
  };

  const handleReject = async () => {
    if (!selectedWaiver) return;
    await rejectWaiver.mutateAsync({ requestId: selectedWaiver.id, reviewNotes });
    setReviewDialogOpen(false);
  };

  return (
    <DashboardLayout title="Applied Penalties">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Applied Penalties</h1>
          <p className="text-muted-foreground">Manage late payment penalties and waiver requests</p>
        </div>

        {/* Stats */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Penalties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPenalties}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                KES {stats.totalAmount.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Waived</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.waivedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-600">Pending Waivers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.pendingWaivers}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="penalties">
          <TabsList>
            <TabsTrigger value="penalties">Applied Penalties</TabsTrigger>
            <TabsTrigger value="waivers">
              Waiver Requests
              {stats.pendingWaivers > 0 && (
                <Badge variant="destructive" className="ml-2">{stats.pendingWaivers}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="penalties" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                {penaltiesLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : penalties.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-1">No penalties applied</h3>
                    <p className="text-sm text-muted-foreground">
                      Late payment penalties will appear here
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Days Overdue</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {penalties.map((penalty) => (
                        <TableRow key={penalty.id}>
                          <TableCell>{format(new Date(penalty.applied_at), 'dd MMM yyyy')}</TableCell>
                          <TableCell>
                            {penalty.students ? (
                              <div>
                                <div className="font-medium">
                                  {penalty.students.first_name} {penalty.students.last_name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {penalty.students.admission_number}
                                </div>
                              </div>
                            ) : '-'}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {penalty.student_invoices?.invoice_number || '-'}
                          </TableCell>
                          <TableCell>{penalty.days_overdue} days</TableCell>
                          <TableCell className="font-semibold text-red-600">
                            KES {penalty.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {penalty.waived ? (
                              <Badge variant="outline" className="text-green-600">Waived</Badge>
                            ) : (
                              <Badge variant="destructive">Active</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {!penalty.waived && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleRequestWaiver(penalty)}
                              >
                                Request Waiver
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="waivers" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Waiver Requests</CardTitle>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {waiversLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : waiverRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <FileWarning className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-1">No waiver requests</h3>
                    <p className="text-sm text-muted-foreground">
                      Penalty waiver requests will appear here
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Penalty Amount</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {waiverRequests.map((waiver) => {
                        const penalty = waiver.applied_penalties as any;
                        return (
                          <TableRow key={waiver.id}>
                            <TableCell>{format(new Date(waiver.created_at), 'dd MMM yyyy')}</TableCell>
                            <TableCell>
                              {penalty?.students ? (
                                `${penalty.students.first_name} ${penalty.students.last_name}`
                              ) : '-'}
                            </TableCell>
                            <TableCell className="font-semibold">
                              KES {penalty?.amount?.toLocaleString() || 0}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{waiver.reason}</TableCell>
                            <TableCell>
                              {waiver.status === 'pending' && (
                                <Badge variant="secondary" className="gap-1">
                                  <Clock className="h-3 w-3" /> Pending
                                </Badge>
                              )}
                              {waiver.status === 'approved' && (
                                <Badge variant="default" className="gap-1 bg-green-600">
                                  <Check className="h-3 w-3" /> Approved
                                </Badge>
                              )}
                              {waiver.status === 'rejected' && (
                                <Badge variant="destructive" className="gap-1">
                                  <X className="h-3 w-3" /> Rejected
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {waiver.status === 'pending' && (
                                <Button 
                                  size="sm"
                                  onClick={() => handleOpenReview(waiver)}
                                >
                                  Review
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Request Waiver Dialog */}
        <Dialog open={waiverDialogOpen} onOpenChange={setWaiverDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Penalty Waiver</DialogTitle>
              <DialogDescription>
                Submit a request to waive this penalty. An admin will review your request.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedPenalty && (
                <div className="rounded-lg border p-3 bg-muted/50">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Penalty Amount:</span>
                    <span className="font-semibold">KES {selectedPenalty.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-muted-foreground">Days Overdue:</span>
                    <span>{selectedPenalty.days_overdue} days</span>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Waiver</Label>
                <Textarea
                  id="reason"
                  placeholder="Explain why this penalty should be waived..."
                  value={waiverReason}
                  onChange={(e) => setWaiverReason(e.target.value)}
                  rows={3}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setWaiverDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitWaiver} disabled={!waiverReason || createWaiver.isPending}>
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Review Waiver Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Waiver Request</DialogTitle>
              <DialogDescription>
                Approve or reject this penalty waiver request
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedWaiver && (
                <>
                  <div className="rounded-lg border p-3 bg-muted/50">
                    <p className="text-sm font-medium mb-1">Reason Provided:</p>
                    <p className="text-sm text-muted-foreground">{selectedWaiver.reason}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Review Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any notes about your decision..."
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows={2}
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleReject}
                disabled={rejectWaiver.isPending}
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button 
                onClick={handleApprove}
                disabled={approveWaiver.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
