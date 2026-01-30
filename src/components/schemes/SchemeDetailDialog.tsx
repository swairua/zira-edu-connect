import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, CheckCircle2, XCircle, Calendar, BookOpen, Target, Users, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useSchemeForReview } from '@/hooks/useSchemeApprovals';

interface SchemeDetailDialogProps {
  schemeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  isApproving?: boolean;
}

export function SchemeDetailDialog({
  schemeId,
  open,
  onOpenChange,
  onApprove,
  onReject,
  isApproving,
}: SchemeDetailDialogProps) {
  const { data: scheme, isLoading } = useSchemeForReview(schemeId ?? undefined);

  const isPending = scheme?.status === 'submitted' as string;

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Draft',
      submitted: 'Pending Approval',
      active: 'Approved',
      rejected: 'Rejected',
      archived: 'Archived',
    };
    return labels[status] || status;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl sm:max-w-4xl max-h-[85vh] sm:max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Scheme of Work Review
          </DialogTitle>
          <DialogDescription>
            Review the complete scheme of work before making a decision
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : scheme ? (
          <ScrollArea className="flex-1 max-h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Teacher</p>
                  <p className="font-medium">
                    {scheme.teacher?.first_name} {scheme.teacher?.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subject</p>
                  <p className="font-medium">{scheme.subject?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Class</p>
                  <p className="font-medium">{scheme.class?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="outline">
                    {getStatusLabel(scheme.status)}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Scheme Details */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Scheme Details
                </h4>
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Title</p>
                    <p className="font-medium">{scheme.title}</p>
                  </div>
                  {scheme.description && (
                    <div>
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p>{scheme.description}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Term</p>
                      <p>{scheme.term?.name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Academic Year</p>
                      <p>{scheme.academic_year?.name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Weeks</p>
                      <p>{scheme.total_weeks}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Entries */}
              {scheme.entries && scheme.entries.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Weekly Plan ({scheme.entries.length} weeks)
                    </h4>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-20">Week</TableHead>
                            <TableHead>Topic</TableHead>
                            <TableHead>Strand</TableHead>
                            <TableHead>Sub-Strand</TableHead>
                            <TableHead className="w-20">Lessons</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {scheme.entries.map((entry) => (
                            <TableRow key={entry.id}>
                              <TableCell>
                                <Badge variant="secondary">Wk {entry.week_number}</Badge>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{entry.topic}</p>
                                  {entry.sub_topic && (
                                    <p className="text-sm text-muted-foreground">{entry.sub_topic}</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">
                                {entry.strand?.name || '-'}
                              </TableCell>
                              <TableCell className="text-sm">
                                {entry.sub_strand?.name || '-'}
                              </TableCell>
                              <TableCell>
                                {entry.lessons_allocated}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </>
              )}

              {/* Approval Trail */}
              {(scheme.submitted_at || scheme.approved_at) && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Approval Trail
                    </h4>
                    <div className="space-y-2 text-sm">
                      {scheme.submitted_at && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="gap-1">
                            <FileText className="h-3 w-3" />
                            Submitted
                          </Badge>
                          <span className="text-muted-foreground">
                            {format(new Date(scheme.submitted_at), 'MMM d, yyyy h:mm a')}
                          </span>
                          {scheme.teacher && (
                            <span>by {scheme.teacher.first_name} {scheme.teacher.last_name}</span>
                          )}
                        </div>
                      )}
                      {scheme.approved_at && (scheme.status as string) === 'active' && (
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Approved
                          </Badge>
                          <span className="text-muted-foreground">
                            {format(new Date(scheme.approved_at), 'MMM d, yyyy h:mm a')}
                          </span>
                          {scheme.approver && (
                            <span>by {scheme.approver.first_name} {scheme.approver.last_name}</span>
                          )}
                        </div>
                      )}
                      {scheme.approved_at && (scheme.status as string) === 'rejected' && (
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Rejected
                          </Badge>
                          <span className="text-muted-foreground">
                            {format(new Date(scheme.approved_at), 'MMM d, yyyy h:mm a')}
                          </span>
                          {scheme.approver && (
                            <span>by {scheme.approver.first_name} {scheme.approver.last_name}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Rejection Reason */}
              {(scheme.status as string) === 'rejected' && scheme.rejection_reason && (
                <>
                  <Separator />
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <h4 className="font-medium mb-2 text-destructive">Rejection Reason</h4>
                    <p className="text-sm">{scheme.rejection_reason}</p>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            Scheme not found
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {isPending && onApprove && onReject && schemeId && (
            <>
              <Button
                variant="destructive"
                onClick={() => onReject(schemeId)}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
              <Button
                onClick={() => onApprove(schemeId)}
                disabled={isApproving}
                className="gap-2"
              >
                {isApproving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Approve
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
