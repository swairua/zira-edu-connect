import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useInstitution } from '@/contexts/InstitutionContext';
import { 
  useGradeApprovals, 
  useProcessApproval, 
  useBulkApprove,
  useApprovalStats 
} from '@/hooks/useGradeApprovals';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  RotateCcw,
  AlertCircle,
  Users,
  BookOpen
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function GradeApprovals() {
  const { institutionId, institution } = useInstitution();
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedApprovals, setSelectedApprovals] = useState<string[]>([]);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [currentApproval, setCurrentApproval] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'request_revision'>('approve');

  const { data: approvals = [], isLoading } = useGradeApprovals(institutionId, statusFilter);
  const { data: stats } = useApprovalStats(institutionId);
  const processApproval = useProcessApproval();
  const bulkApprove = useBulkApprove();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedApprovals(approvals.filter(a => a.status === 'pending').map(a => a.id));
    } else {
      setSelectedApprovals([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedApprovals(prev => [...prev, id]);
    } else {
      setSelectedApprovals(prev => prev.filter(a => a !== id));
    }
  };

  const openReviewDialog = (approvalId: string, action: 'approve' | 'reject' | 'request_revision') => {
    setCurrentApproval(approvalId);
    setReviewAction(action);
    setReviewNotes('');
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!currentApproval) return;

    try {
      await processApproval.mutateAsync({
        approvalId: currentApproval,
        action: reviewAction,
        notes: reviewNotes || undefined
      });
      toast.success(`Grade ${reviewAction === 'approve' ? 'approved' : reviewAction === 'reject' ? 'rejected' : 'returned for revision'}`);
      setReviewDialogOpen(false);
      setSelectedApprovals(prev => prev.filter(id => id !== currentApproval));
    } catch (error) {
      toast.error('Failed to process approval');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedApprovals.length === 0) return;

    try {
      await bulkApprove.mutateAsync(selectedApprovals);
      toast.success(`${selectedApprovals.length} grades approved`);
      setSelectedApprovals([]);
    } catch (error) {
      toast.error('Failed to bulk approve');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-warning text-warning"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="mr-1 h-3 w-3" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
      case 'revision_requested':
        return <Badge variant="secondary"><RotateCcw className="mr-1 h-3 w-3" />Revision</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingCount = approvals.filter(a => a.status === 'pending').length;

  return (
    <DashboardLayout title="Grade Approvals" subtitle="Review and approve teacher-submitted grades">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Grade Approvals</h1>
          <p className="text-muted-foreground">
            Review and approve grades submitted by teachers at {institution?.name || 'your institution'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-xl font-bold">{stats?.pending || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-xl font-bold">{stats?.approved || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-xl font-bold">{stats?.rejected || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-xl font-bold">{stats?.total || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="revision_requested">Revision Requested</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedApprovals.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedApprovals.length} selected
                  </span>
                  <Button
                    size="sm"
                    onClick={handleBulkApprove}
                    disabled={bulkApprove.isPending}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve All
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Approvals Table */}
        <Card>
          <CardHeader>
            <CardTitle>Grade Submissions</CardTitle>
            <CardDescription>
              Review grades submitted by teachers for approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : approvals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No submissions to review</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {statusFilter === 'pending' 
                    ? 'All grades have been reviewed' 
                    : 'No submissions match the selected filter'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedApprovals.length === pendingCount && pendingCount > 0}
                        onCheckedChange={handleSelectAll}
                        disabled={pendingCount === 0}
                      />
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvals.map((approval) => (
                    <TableRow key={approval.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedApprovals.includes(approval.id)}
                          onCheckedChange={(checked) => handleSelectOne(approval.id, !!checked)}
                          disabled={approval.status !== 'pending'}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {approval.entity_type === 'assignment' ? (
                            <BookOpen className="h-4 w-4 text-primary" />
                          ) : (
                            <FileText className="h-4 w-4 text-primary" />
                          )}
                          <span className="capitalize">{approval.entity_type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {approval.assignment?.title || approval.exam?.name || 'N/A'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {approval.assignment?.subject?.name} • {approval.assignment?.class?.name}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {approval.submitter?.first_name} {approval.submitter?.last_name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{approval.student_count || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {approval.submitted_at 
                            ? format(new Date(approval.submitted_at), 'MMM d, yyyy')
                            : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(approval.status)}</TableCell>
                      <TableCell className="text-right">
                        {approval.status === 'pending' && (
                          <div className="flex justify-end gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => openReviewDialog(approval.id, 'approve')}
                            >
                              <CheckCircle className="h-4 w-4 text-success" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => openReviewDialog(approval.id, 'reject')}
                            >
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => openReviewDialog(approval.id, 'request_revision')}
                            >
                              <RotateCcw className="h-4 w-4 text-warning" />
                            </Button>
                          </div>
                        )}
                        {approval.status !== 'pending' && approval.review_notes && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => {
                              setCurrentApproval(approval.id);
                              setReviewNotes(approval.review_notes || '');
                              setReviewDialogOpen(true);
                            }}
                          >
                            <AlertCircle className="h-4 w-4" />
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
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' && 'Approve Grades'}
              {reviewAction === 'reject' && 'Reject Grades'}
              {reviewAction === 'request_revision' && 'Request Revision'}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve' && 'Approve these grades to make them visible after release.'}
              {reviewAction === 'reject' && 'Reject these grades. The teacher will need to resubmit.'}
              {reviewAction === 'request_revision' && 'Return these grades to the teacher for correction.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Notes {reviewAction !== 'approve' && <span className="text-destructive">*</span>}
              </label>
              <Textarea
                placeholder={
                  reviewAction === 'approve' 
                    ? 'Optional notes...' 
                    : 'Please provide a reason...'
                }
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={processApproval.isPending || (reviewAction !== 'approve' && !reviewNotes.trim())}
              variant={reviewAction === 'reject' ? 'destructive' : 'default'}
            >
              {processApproval.isPending ? 'Processing...' : 
                reviewAction === 'approve' ? 'Approve' : 
                reviewAction === 'reject' ? 'Reject' : 'Request Revision'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
