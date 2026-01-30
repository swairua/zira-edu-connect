import { useState, useMemo, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Search, CheckCircle2, XCircle, Eye, Clock, CheckSquare, FileText, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useLessonPlanApprovalStats, useLessonPlansForApproval, useApproveLessonPlan, useRejectLessonPlan } from '@/hooks/useLessonPlanApprovals';
import { useStaffProfile } from '@/hooks/useStaffProfile';
import { useAuth } from '@/hooks/useAuth';
import { useInstitution } from '@/contexts/InstitutionContext';
import { LessonPlanDetailDialog } from '@/components/lesson-plans/LessonPlanDetailDialog';
import { LessonPlanRejectDialog } from '@/components/lesson-plans/LessonPlanRejectDialog';
import { lessonPlanStatusLabels, lessonPlanStatusVariants, type LessonPlanStatus } from '@/types/lesson-plans';
import { ensureStaffProfile } from '@/lib/ensure-staff-profile';

type FilterStatus = 'all' | 'submitted' | 'approved' | 'rejected';

export default function LessonPlanApprovals() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('submitted');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailPlanId, setDetailPlanId] = useState<string | null>(null);
  const [rejectPlanId, setRejectPlanId] = useState<string | null>(null);
  const [resolvedApproverId, setResolvedApproverId] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading } = useLessonPlanApprovalStats();
  const { data: lessonPlans, isLoading: plansLoading } = useLessonPlansForApproval(filterStatus === 'all' ? undefined : filterStatus);
  const { data: staffProfile, isLoading: staffLoading } = useStaffProfile();
  const { user } = useAuth();
  const { institutionId } = useInstitution();
  
  const approveMutation = useApproveLessonPlan();
  const rejectMutation = useRejectLessonPlan();

  // Ensure we have an approver ID - create staff profile if needed
  useEffect(() => {
    const resolveApprover = async () => {
      if (staffProfile?.id) {
        setResolvedApproverId(staffProfile.id);
        return;
      }
      
      if (!staffLoading && user?.id && institutionId) {
        const staffId = await ensureStaffProfile(user.id, user.email, institutionId);
        setResolvedApproverId(staffId);
      }
    };
    
    resolveApprover();
  }, [staffProfile?.id, staffLoading, user?.id, user?.email, institutionId]);

  // Filter plans by search query
  const filteredPlans = useMemo(() => {
    if (!lessonPlans) return [];
    if (!searchQuery.trim()) return lessonPlans;
    
    const query = searchQuery.toLowerCase();
    return lessonPlans.filter(plan => 
      plan.topic?.toLowerCase().includes(query) ||
      plan.teacher?.first_name?.toLowerCase().includes(query) ||
      plan.teacher?.last_name?.toLowerCase().includes(query) ||
      plan.subject?.name?.toLowerCase().includes(query) ||
      plan.class?.name?.toLowerCase().includes(query)
    );
  }, [lessonPlans, searchQuery]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pendingIds = filteredPlans.filter(p => p.status === 'submitted').map(p => p.id);
      setSelectedIds(pendingIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleApprove = async (id: string) => {
    if (!resolvedApproverId) {
      toast.error('Unable to identify approver. Please try refreshing the page.');
      return;
    }
    await approveMutation.mutateAsync({ id, approverId: resolvedApproverId });
    setSelectedIds(prev => prev.filter(i => i !== id));
  };

  const handleBulkApprove = async () => {
    if (!resolvedApproverId) {
      toast.error('Unable to identify approver. Please try refreshing the page.');
      return;
    }
    
    for (const id of selectedIds) {
      await approveMutation.mutateAsync({ id, approverId: resolvedApproverId });
    }
    toast.success(`${selectedIds.length} lesson plans approved`);
    setSelectedIds([]);
  };

  const handleReject = async (reason: string) => {
    if (!rejectPlanId || !resolvedApproverId) return;
    
    await rejectMutation.mutateAsync({ 
      id: rejectPlanId, 
      approverId: resolvedApproverId, 
      reason 
    });
    setRejectPlanId(null);
    setSelectedIds(prev => prev.filter(i => i !== rejectPlanId));
  };

  const getStatusBadgeVariant = (status: LessonPlanStatus) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'secondary',
      submitted: 'outline',
      approved: 'default',
      rejected: 'destructive',
      revised: 'secondary',
    };
    return variants[status] || 'secondary';
  };

  const isLoading = statsLoading || plansLoading;
  const pendingCount = filteredPlans.filter(p => p.status === 'submitted').length;

  return (
    <DashboardLayout
      title="Lesson Plan Approvals"
      subtitle="Review and approve teacher lesson plans"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus('submitted')}>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-warning" />
                Pending Review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats?.pending || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus('approved')}>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Approved
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats?.approved || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus('rejected')}>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive" />
                Rejected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats?.rejected || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus('all')}>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Total Plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats?.total || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-lg">Lesson Plans</CardTitle>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by topic, teacher, subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full sm:w-64"
                  />
                </div>
                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="submitted">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                {selectedIds.length > 0 && (
                  <Button 
                    onClick={handleBulkApprove}
                    disabled={approveMutation.isPending}
                    className="gap-2"
                  >
                    {approveMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckSquare className="h-4 w-4" />
                    )}
                    Approve ({selectedIds.length})
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredPlans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mb-4" />
                <p className="text-lg font-medium">No lesson plans found</p>
                <p className="text-sm">
                  {filterStatus === 'submitted' 
                    ? 'There are no lesson plans pending approval' 
                    : 'Try adjusting your filters'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={pendingCount > 0 && selectedIds.length === pendingCount}
                          onCheckedChange={handleSelectAll}
                          disabled={pendingCount === 0}
                        />
                      </TableHead>
                      <TableHead>Topic</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPlans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(plan.id)}
                            onCheckedChange={(checked) => handleSelectOne(plan.id, !!checked)}
                            disabled={plan.status !== 'submitted'}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{plan.topic}</p>
                            {plan.sub_topic && (
                              <p className="text-sm text-muted-foreground">{plan.sub_topic}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {plan.teacher 
                            ? `${plan.teacher.first_name} ${plan.teacher.last_name}`
                            : '-'
                          }
                        </TableCell>
                        <TableCell>{plan.subject?.name || '-'}</TableCell>
                        <TableCell>{plan.class?.name || '-'}</TableCell>
                        <TableCell>
                          {plan.lesson_date 
                            ? format(new Date(plan.lesson_date), 'MMM d, yyyy')
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(plan.status)}>
                            {lessonPlanStatusLabels[plan.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDetailPlanId(plan.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {plan.status === 'submitted' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApprove(plan.id)}
                                  disabled={approveMutation.isPending}
                                  className="text-success hover:text-success"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setRejectPlanId(plan.id)}
                                  disabled={rejectMutation.isPending}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Dialog */}
      <LessonPlanDetailDialog
        planId={detailPlanId}
        open={!!detailPlanId}
        onOpenChange={(open) => !open && setDetailPlanId(null)}
        onApprove={handleApprove}
        onReject={(id) => setRejectPlanId(id)}
        isApproving={approveMutation.isPending}
      />

      {/* Reject Dialog */}
      <LessonPlanRejectDialog
        open={!!rejectPlanId}
        onOpenChange={(open) => !open && setRejectPlanId(null)}
        onConfirm={handleReject}
        isLoading={rejectMutation.isPending}
      />
    </DashboardLayout>
  );
}
