import { useState, useMemo, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Search, CheckCircle2, XCircle, Eye, Clock, CheckSquare, FileText, BookOpen, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useSchemeApprovalStats, useSchemesForApproval, useApproveScheme, useRejectScheme } from '@/hooks/useSchemeApprovals';
import { useStaffProfile } from '@/hooks/useStaffProfile';
import { useAuth } from '@/hooks/useAuth';
import { useInstitution } from '@/contexts/InstitutionContext';
import { SchemeDetailDialog } from '@/components/schemes/SchemeDetailDialog';
import { SchemeRejectDialog } from '@/components/schemes/SchemeRejectDialog';
import { ensureStaffProfile } from '@/lib/ensure-staff-profile';

type FilterStatus = 'all' | 'submitted' | 'approved' | 'rejected';

export default function SchemeApprovals() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('submitted');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailSchemeId, setDetailSchemeId] = useState<string | null>(null);
  const [rejectSchemeId, setRejectSchemeId] = useState<string | null>(null);
  const [resolvedApproverId, setResolvedApproverId] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading } = useSchemeApprovalStats();
  const { data: schemes, isLoading: schemesLoading } = useSchemesForApproval(filterStatus === 'all' ? undefined : filterStatus);
  const { data: staffProfile, isLoading: staffLoading } = useStaffProfile();
  const { user } = useAuth();
  const { institutionId } = useInstitution();

  const approveMutation = useApproveScheme();
  const rejectMutation = useRejectScheme();

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

  // Filter schemes by search query
  const filteredSchemes = useMemo(() => {
    if (!schemes) return [];
    if (!searchQuery.trim()) return schemes;

    const query = searchQuery.toLowerCase();
    return schemes.filter(scheme =>
      scheme.title?.toLowerCase().includes(query) ||
      scheme.teacher?.first_name?.toLowerCase().includes(query) ||
      scheme.teacher?.last_name?.toLowerCase().includes(query) ||
      scheme.subject?.name?.toLowerCase().includes(query) ||
      scheme.class?.name?.toLowerCase().includes(query)
    );
  }, [schemes, searchQuery]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pendingIds = filteredSchemes.filter(s => s.status === 'submitted').map(s => s.id);
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
    toast.success(`${selectedIds.length} schemes approved`);
    setSelectedIds([]);
  };

  const handleReject = async (reason: string) => {
    if (!rejectSchemeId || !resolvedApproverId) return;

    await rejectMutation.mutateAsync({
      id: rejectSchemeId,
      approverId: resolvedApproverId,
      reason,
    });
    setRejectSchemeId(null);
    setSelectedIds(prev => prev.filter(i => i !== rejectSchemeId));
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'secondary',
      submitted: 'outline',
      active: 'default',
      rejected: 'destructive',
      archived: 'secondary',
    };
    return variants[status] || 'secondary';
  };

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

  const isLoading = statsLoading || schemesLoading;
  const pendingCount = filteredSchemes.filter(s => s.status === 'submitted').length;

  return (
    <DashboardLayout
      title="Scheme of Work Approvals"
      subtitle="Review and approve teacher schemes of work for term planning"
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
                Total Schemes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats?.total || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-lg">Schemes of Work</CardTitle>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, teacher, subject..."
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
            ) : filteredSchemes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mb-4" />
                <p className="text-lg font-medium">No schemes found</p>
                <p className="text-sm">
                  {filterStatus === 'submitted'
                    ? 'There are no schemes pending approval'
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
                      <TableHead>Title</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead>Weeks</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSchemes.map((scheme) => (
                      <TableRow key={scheme.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(scheme.id)}
                            onCheckedChange={(checked) => handleSelectOne(scheme.id, !!checked)}
                            disabled={scheme.status !== 'submitted'}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{scheme.title}</p>
                            {scheme.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">{scheme.description}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {scheme.teacher
                            ? `${scheme.teacher.first_name} ${scheme.teacher.last_name}`
                            : '-'
                          }
                        </TableCell>
                        <TableCell>{scheme.subject?.name || '-'}</TableCell>
                        <TableCell>{scheme.class?.name || '-'}</TableCell>
                        <TableCell>{scheme.term?.name || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{scheme.total_weeks} weeks</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(scheme.status)}>
                            {getStatusLabel(scheme.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDetailSchemeId(scheme.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {scheme.status === 'submitted' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApprove(scheme.id)}
                                  disabled={approveMutation.isPending}
                                  className="text-success hover:text-success"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setRejectSchemeId(scheme.id)}
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
      <SchemeDetailDialog
        schemeId={detailSchemeId}
        open={!!detailSchemeId}
        onOpenChange={(open) => !open && setDetailSchemeId(null)}
        onApprove={handleApprove}
        onReject={(id) => setRejectSchemeId(id)}
        isApproving={approveMutation.isPending}
      />

      {/* Reject Dialog */}
      <SchemeRejectDialog
        open={!!rejectSchemeId}
        onOpenChange={(open) => !open && setRejectSchemeId(null)}
        onConfirm={handleReject}
        isLoading={rejectMutation.isPending}
      />
    </DashboardLayout>
  );
}
