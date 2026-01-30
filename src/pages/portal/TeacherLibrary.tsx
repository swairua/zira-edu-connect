import { UnifiedPortalLayout } from '@/components/layout/UnifiedPortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useMyAllocations, useTeacherAllocations, type AllocationCopy } from '@/hooks/useTeacherAllocations';
import { useTeacherDistributedLoans, type DistributedLoan } from '@/hooks/useTeacherDistributedLoans';
import { useAuth } from '@/hooks/useAuth';
import { useStaffProfile } from '@/hooks/useStaffProfile';
import { useInstitution } from '@/contexts/InstitutionContext';
import { BookOpen, Package, Users, ArrowRight, ChevronDown, ChevronRight, RotateCcw, AlertTriangle, Clock } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ReturnCopyDialog } from '@/components/library/ReturnCopyDialog';
import { MarkLostDialog } from '@/components/library/MarkLostDialog';

export default function TeacherLibrary() {
  const { user } = useAuth();
  const { institutionId } = useInstitution();
  const { data: profile, isLoading: profileLoading } = useStaffProfile();
  const { data: allocations, isLoading } = useMyAllocations();
  const { returnIndividualCopy, markCopyAsLost } = useTeacherAllocations();
  const { 
    activeLoans, 
    overdueLoans, 
    returnedLoans,
    isLoading: loansLoading, 
    returnFromStudent 
  } = useTeacherDistributedLoans();
  const navigate = useNavigate();

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [lostDialogOpen, setLostDialogOpen] = useState(false);
  const [studentReturnDialogOpen, setStudentReturnDialogOpen] = useState(false);
  const [selectedCopy, setSelectedCopy] = useState<AllocationCopy | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<DistributedLoan | null>(null);

  const activeAllocations = allocations || [];
  
  // Calculate stats from copy-level data
  const totalWithMe = activeAllocations.reduce((sum, a) => {
    const allocatedCopies = (a.allocation_copies || []).filter(c => c.status === 'allocated').length;
    return sum + allocatedCopies;
  }, 0);
  
  const totalDistributed = activeAllocations.reduce((sum, a) => {
    const distributedCopies = (a.allocation_copies || []).filter(c => c.status === 'distributed').length;
    return sum + distributedCopies;
  }, 0);

  const totalWithStudents = activeLoans.length;
  const totalOverdue = overdueLoans.length;

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleReturnClick = (copy: AllocationCopy) => {
    setSelectedCopy(copy);
    setReturnDialogOpen(true);
  };

  const handleLostClick = (copy: AllocationCopy) => {
    setSelectedCopy(copy);
    setLostDialogOpen(true);
  };

  const handleStudentReturnClick = (loan: DistributedLoan) => {
    setSelectedLoan(loan);
    setStudentReturnDialogOpen(true);
  };

  const handleConfirmReturn = (condition: string, notes: string) => {
    if (!selectedCopy) return;
    returnIndividualCopy.mutate({
      allocationCopyId: selectedCopy.id,
      conditionAtReturn: condition,
      notes: notes || undefined,
    });
  };

  const handleConfirmLost = (notes: string) => {
    if (!selectedCopy) return;
    markCopyAsLost.mutate({
      allocationCopyId: selectedCopy.id,
      notes: notes || undefined,
    });
  };

  const handleConfirmStudentReturn = (condition: string, notes: string) => {
    if (!selectedLoan) return;
    returnFromStudent.mutate({
      loanId: selectedLoan.id,
      conditionAtReturn: condition,
      notes: notes || undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'allocated':
        return <Badge variant="default">With You</Badge>;
      case 'distributed':
        return <Badge variant="outline" className="border-primary text-primary">With Student</Badge>;
      case 'returned':
        return <Badge variant="secondary">Returned</Badge>;
      case 'lost':
        return <Badge variant="destructive">Lost</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLoanStatusBadge = (loan: DistributedLoan) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(loan.due_date);
    dueDate.setHours(0, 0, 0, 0);
    const daysRemaining = differenceInDays(dueDate, today);

    if (loan.status === 'returned') {
      return <Badge variant="secondary">Returned</Badge>;
    }
    if (loan.status === 'lost') {
      return <Badge variant="destructive">Lost</Badge>;
    }
    if (daysRemaining < 0) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          {Math.abs(daysRemaining)} days overdue
        </Badge>
      );
    }
    if (daysRemaining <= 3) {
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-600 gap-1">
          <Clock className="h-3 w-3" />
          Due in {daysRemaining} days
        </Badge>
      );
    }
    return <Badge variant="default">Active</Badge>;
  };

  return (
    <UnifiedPortalLayout
      portalType="teacher"
      title="My Books"
      subtitle="Books allocated to you and distributed to students"
      userName={profile ? `${profile.first_name} ${profile.last_name}` : 'Teacher'}
      isLoading={profileLoading}
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">With Me</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWithMe}</div>
              <p className="text-xs text-muted-foreground">Ready to distribute</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">With Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWithStudents}</div>
              <p className="text-xs text-muted-foreground">Currently issued</p>
            </CardContent>
          </Card>

          <Card className={totalOverdue > 0 ? 'border-destructive' : ''}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className={`h-4 w-4 ${totalOverdue > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalOverdue > 0 ? 'text-destructive' : ''}`}>{totalOverdue}</div>
              <p className="text-xs text-muted-foreground">Need follow-up</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Returned</CardTitle>
              <RotateCcw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{returnedLoans.length}</div>
              <p className="text-xs text-muted-foreground">From students</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Allocations and With Students */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Book Management</CardTitle>
                <CardDescription>Manage your allocations and track distributed books</CardDescription>
              </div>
              <Button onClick={() => navigate('/portal/library/distribute')}>
                Distribute Books
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="allocations" className="space-y-4">
              <TabsList>
                <TabsTrigger value="allocations">My Allocations</TabsTrigger>
                <TabsTrigger value="students" className="gap-2">
                  With Students
                  {totalWithStudents > 0 && (
                    <Badge variant="secondary" className="ml-1">{totalWithStudents}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="allocations" className="space-y-4">
                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : activeAllocations.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No books allocated to you yet</p>
                    <p className="text-sm text-muted-foreground">
                      Contact your librarian to receive books for your class
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeAllocations.map((allocation) => {
                      const copies = allocation.allocation_copies || [];
                      const allocatedCount = copies.filter(c => c.status === 'allocated').length;
                      const distributedCount = copies.filter(c => c.status === 'distributed').length;
                      const returnedCount = copies.filter(c => c.status === 'returned').length;
                      const lostCount = copies.filter(c => c.status === 'lost').length;
                      const isExpanded = expandedRows.has(allocation.id);

                      return (
                        <Collapsible key={allocation.id} open={isExpanded} onOpenChange={() => toggleRow(allocation.id)}>
                          <CollapsibleTrigger asChild>
                            <div className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className="text-muted-foreground">
                                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </div>
                                <div>
                                  <p className="font-medium">{allocation.book?.title || 'Unknown Book'}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {allocation.book?.book_code && `${allocation.book.book_code} • `}
                                    {allocation.class?.name || 'General'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-sm font-medium">
                                    {allocatedCount} with you, {distributedCount} with students
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {returnedCount > 0 && `${returnedCount} returned`}
                                    {returnedCount > 0 && lostCount > 0 && ' • '}
                                    {lostCount > 0 && `${lostCount} lost`}
                                  </p>
                                </div>
                                <Badge
                                  variant={
                                    allocation.status === 'active'
                                      ? 'default'
                                      : allocation.status === 'partial'
                                      ? 'outline'
                                      : 'secondary'
                                  }
                                >
                                  {allocation.status}
                                </Badge>
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="mt-2 ml-8 border rounded-lg overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Copy #</TableHead>
                                    <TableHead>Barcode</TableHead>
                                    <TableHead>Condition</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Return Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {copies.map((copy) => (
                                    <TableRow key={copy.id}>
                                      <TableCell className="font-medium">
                                        {copy.copy?.copy_number || '-'}
                                      </TableCell>
                                      <TableCell className="text-muted-foreground">
                                        {copy.copy?.barcode || '-'}
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                          {copy.condition_at_return || copy.copy?.condition || 'good'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>{getStatusBadge(copy.status)}</TableCell>
                                      <TableCell>
                                        {copy.returned_at
                                          ? format(new Date(copy.returned_at), 'MMM d, yyyy')
                                          : '-'}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {copy.status === 'allocated' && (
                                          <div className="flex justify-end gap-2">
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleReturnClick(copy);
                                              }}
                                              disabled={returnIndividualCopy.isPending}
                                            >
                                              Return
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="text-destructive hover:text-destructive"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleLostClick(copy);
                                              }}
                                              disabled={markCopyAsLost.isPending}
                                            >
                                              Lost
                                            </Button>
                                          </div>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="students" className="space-y-4">
                {loansLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : activeLoans.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No books currently with students</p>
                    <p className="text-sm text-muted-foreground">
                      Distribute books to students from the "My Allocations" tab
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Book</TableHead>
                          <TableHead>Copy #</TableHead>
                          <TableHead>Distributed</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeLoans.map((loan) => (
                          <TableRow key={loan.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {loan.student?.first_name} {loan.student?.last_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {loan.student?.admission_number}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{loan.copy?.book?.title || 'Unknown'}</p>
                                <p className="text-sm text-muted-foreground">
                                  {loan.copy?.book?.book_code}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono">
                              {loan.copy?.copy_number || '-'}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {format(new Date(loan.borrowed_at), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell>
                              {format(new Date(loan.due_date), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell>{getLoanStatusBadge(loan)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStudentReturnClick(loan)}
                                disabled={returnFromStudent.isPending}
                              >
                                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                                Collect
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <ReturnCopyDialog
        open={returnDialogOpen}
        onOpenChange={setReturnDialogOpen}
        copyNumber={selectedCopy?.copy?.copy_number || ''}
        onConfirm={handleConfirmReturn}
        isPending={returnIndividualCopy.isPending}
      />
      <MarkLostDialog
        open={lostDialogOpen}
        onOpenChange={setLostDialogOpen}
        copyNumber={selectedCopy?.copy?.copy_number || ''}
        onConfirm={handleConfirmLost}
        isPending={markCopyAsLost.isPending}
      />
      <ReturnCopyDialog
        open={studentReturnDialogOpen}
        onOpenChange={setStudentReturnDialogOpen}
        copyNumber={selectedLoan?.copy?.copy_number || ''}
        onConfirm={handleConfirmStudentReturn}
        isPending={returnFromStudent.isPending}
      />
    </UnifiedPortalLayout>
  );
}
