import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTeacherAssignments, TeacherAssignment } from '@/hooks/useTeacherGrading';
import { ClipboardList, FileEdit, Search, Calendar, Users, CheckCircle2, Clock, AlertCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { CreateAssignmentDialog } from '@/components/portal/CreateAssignmentDialog';

export default function TeacherAssignments() {
  const navigate = useNavigate();
  const { data: assignments = [], isLoading } = useTeacherAssignments();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.class?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'needs_grading') {
      return matchesSearch && (assignment._count?.pending ?? 0) > 0;
    }
    if (statusFilter === 'completed') {
      return matchesSearch && (assignment._count?.pending ?? 0) === 0 && (assignment._count?.graded ?? 0) > 0;
    }
    return matchesSearch && assignment.status === statusFilter;
  });

  const stats = {
    total: assignments.length,
    needsGrading: assignments.filter(a => (a._count?.pending ?? 0) > 0).length,
    completed: assignments.filter(a => (a._count?.pending ?? 0) === 0 && (a._count?.graded ?? 0) > 0).length,
  };

  const getStatusBadge = (assignment: TeacherAssignment) => {
    const pending = assignment._count?.pending ?? 0;
    const graded = assignment._count?.graded ?? 0;
    const total = assignment._count?.submissions ?? 0;

    if (pending > 0) {
      return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />{pending} to grade</Badge>;
    }
    if (graded === total && total > 0) {
      return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle2 className="h-3 w-3" />Completed</Badge>;
    }
    if (new Date(assignment.due_date) > new Date()) {
      return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Open</Badge>;
    }
    return <Badge variant="outline">No Submissions</Badge>;
  };

  return (
    <PortalLayout title="Assignments" subtitle="Grade and manage student assignments">
      <div className="space-y-6">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">My Assignments</h2>
            <p className="text-sm text-muted-foreground">Create and grade student assignments</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <ClipboardList className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Assignments</p>
                  {isLoading ? <Skeleton className="h-7 w-8" /> : <p className="text-2xl font-bold">{stats.total}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Needs Grading</p>
                  {isLoading ? <Skeleton className="h-7 w-8" /> : <p className="text-2xl font-bold">{stats.needsGrading}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  {isLoading ? <Skeleton className="h-7 w-8" /> : <p className="text-2xl font-bold">{stats.completed}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignments</SelectItem>
                  <SelectItem value="needs_grading">Needs Grading</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Assignments List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Assignments</CardTitle>
            <CardDescription>Assignments from your assigned classes and subjects</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ClipboardList className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No assignments found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your filters'
                    : 'No assignments have been created for your classes yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAssignments.map(assignment => (
                  <div
                    key={assignment.id}
                    className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start gap-2">
                        <h3 className="font-semibold">{assignment.title}</h3>
                        {getStatusBadge(assignment)}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {assignment.class?.name}
                        </span>
                        <span>{assignment.subject?.name}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Due: {format(new Date(assignment.due_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          {assignment._count?.submissions ?? 0} submissions
                        </span>
                        {assignment.total_marks && (
                          <span className="text-muted-foreground">
                            Max: {assignment.total_marks} marks
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => navigate(`/portal/assignments/${assignment.id}/grade`)}
                      className="gap-2"
                    >
                      <FileEdit className="h-4 w-4" />
                      Grade
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateAssignmentDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />
    </PortalLayout>
  );
}
