import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
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
  useGradeHistory, 
  useProcessGradeChange,
  usePendingGradeChangesCount 
} from '@/hooks/useGradeHistory';
import { usePermissions } from '@/hooks/usePermissions';
import { 
  History, 
  CheckCircle, 
  XCircle, 
  Clock,
  ArrowRight,
  Search,
  AlertTriangle,
  FileText,
  BookOpen
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function GradeHistory() {
  const { institutionId, institution } = useInstitution();
  const { can } = usePermissions();
  const canApproveGrades = can('academics', 'approve');
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [currentChange, setCurrentChange] = useState<string | null>(null);
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected'>('approved');

  const { data: changes = [], isLoading } = useGradeHistory(
    institutionId, 
    { approvalStatus: statusFilter === 'all' ? undefined : statusFilter }
  );
  const { data: pendingCount } = usePendingGradeChangesCount(institutionId);
  const processChange = useProcessGradeChange();

  const filteredChanges = changes.filter(change => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      change.student?.first_name?.toLowerCase().includes(query) ||
      change.student?.last_name?.toLowerCase().includes(query) ||
      change.subject?.name?.toLowerCase().includes(query) ||
      change.changer?.first_name?.toLowerCase().includes(query) ||
      change.changer?.last_name?.toLowerCase().includes(query)
    );
  });

  const openReviewDialog = (changeId: string, action: 'approved' | 'rejected') => {
    setCurrentChange(changeId);
    setReviewAction(action);
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!currentChange) return;

    try {
      await processChange.mutateAsync({
        changeLogId: currentChange,
        action: reviewAction === 'approved' ? 'approve' : 'reject',
      });
      toast.success(`Grade change ${reviewAction}`);
      setReviewDialogOpen(false);
    } catch (error) {
      toast.error('Failed to process grade change');
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-warning text-warning"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="mr-1 h-3 w-3" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">Auto</Badge>;
    }
  };

  return (
    <DashboardLayout title="Grade History" subtitle="Track all grade changes and modifications">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Grade Change History</h1>
          <p className="text-muted-foreground">
            Audit trail of all grade modifications at {institution?.name || 'your institution'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-xl font-bold">{pendingCount || 0}</p>
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
                  <p className="text-xl font-bold">
                    {changes.filter(c => c.approval_status === 'approved').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <History className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Changes</p>
                  <p className="text-xl font-bold">{changes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by student, subject, or teacher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Changes</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Change Log</CardTitle>
            <CardDescription>
              Complete history of grade modifications with before/after values
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredChanges.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <History className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No grade changes found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search' : 'Grade modifications will appear here'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Changed By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChanges.map((change) => (
                    <TableRow key={change.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {change.entity_type === 'assignment_submission' ? (
                            <BookOpen className="h-4 w-4 text-primary" />
                          ) : (
                            <FileText className="h-4 w-4 text-primary" />
                          )}
                          <span className="text-xs capitalize">
                            {change.entity_type.replace('_', ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {change.student?.first_name} {change.student?.last_name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {change.subject?.name || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="text-center">
                            <div className="text-sm font-medium text-destructive">
                              {change.old_marks ?? '-'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {change.old_grade || '-'}
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <div className="text-center">
                            <div className="text-sm font-medium text-success">
                              {change.new_marks ?? '-'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {change.new_grade || '-'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground line-clamp-2 max-w-[200px]">
                          {change.change_reason}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {change.changer?.first_name} {change.changer?.last_name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {change.changed_at 
                            ? format(new Date(change.changed_at), 'MMM d, HH:mm')
                            : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(change.approval_status)}</TableCell>
                      <TableCell className="text-right">
                        {change.approval_status === 'pending' && change.requires_approval && canApproveGrades && (
                          <div className="flex justify-end gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => openReviewDialog(change.id, 'approved')}
                            >
                              <CheckCircle className="h-4 w-4 text-success" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => openReviewDialog(change.id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
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
              {reviewAction === 'approved' ? 'Approve Grade Change' : 'Reject Grade Change'}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approved' 
                ? 'This will apply the new grade to the student record.'
                : 'This will keep the original grade unchanged.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={processChange.isPending}
              variant={reviewAction === 'rejected' ? 'destructive' : 'default'}
            >
              {processChange.isPending ? 'Processing...' : 
                reviewAction === 'approved' ? 'Approve Change' : 'Reject Change'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
