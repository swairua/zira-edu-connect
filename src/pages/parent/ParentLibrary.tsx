import { useState } from 'react';
import { UnifiedPortalLayout } from '@/components/layout/UnifiedPortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useStudentLoans, useStudentActiveLoansCount } from '@/hooks/useStudentLibrary';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, AlertTriangle, User } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';

export default function ParentLibrary() {
  const { user } = useAuth();
  const { institutionId } = useInstitution();
  const [selectedChildId, setSelectedChildId] = useState<string>('');

  // Get parent record and their profile
  const { data: parentData, isLoading: parentLoading } = useQuery({
    queryKey: ['parent-profile', institutionId, user?.id],
    queryFn: async () => {
      if (!institutionId || !user?.id) return null;
      const { data } = await supabase
        .from('parents')
        .select('id, first_name, last_name')
        .eq('user_id', user.id)
        .eq('institution_id', institutionId)
        .single();
      return data;
    },
    enabled: !!institutionId && !!user?.id,
  });

  // Get parent's children
  const { data: children, isLoading: childrenLoading } = useQuery({
    queryKey: ['parent-children', institutionId, parentData?.id],
    queryFn: async () => {
      if (!institutionId || !parentData?.id) return [];

      // Get linked students
      const { data, error } = await supabase
        .from('student_parents')
        .select(`
          student:students(id, first_name, last_name, admission_number)
        `)
        .eq('parent_id', parentData.id);

      if (error) return [];
      return data?.map(d => d.student).filter(Boolean) || [];
    },
    enabled: !!institutionId && !!parentData?.id,
  });

  // Auto-select first child
  if (children?.length && !selectedChildId) {
    setSelectedChildId(children[0].id);
  }

  const { data: loans, isLoading } = useStudentLoans(selectedChildId);
  const { data: loanCounts } = useStudentActiveLoansCount(selectedChildId);

  const activeLoans = loans?.filter(l => l.status === 'active' || l.status === 'overdue') || [];

  const getStatusBadge = (loan: typeof loans[0]) => {
    const today = new Date();
    const dueDate = new Date(loan.due_date);
    const daysUntilDue = differenceInDays(dueDate, today);

    if (loan.status === 'returned') {
      return <Badge variant="secondary">Returned</Badge>;
    }
    if (loan.status === 'lost') {
      return <Badge variant="destructive">Lost</Badge>;
    }
    if (daysUntilDue < 0) {
      return <Badge variant="destructive">Overdue by {Math.abs(daysUntilDue)} days</Badge>;
    }
    if (daysUntilDue <= 3) {
      return <Badge variant="outline" className="border-amber-500 text-amber-600">Due in {daysUntilDue} days</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const selectedChild = children?.find(c => c.id === selectedChildId);

  return (
    <UnifiedPortalLayout
      portalType="parent"
      title="Library"
      subtitle="View your children's library loans"
      userName={parentData ? `${parentData.first_name} ${parentData.last_name}` : 'Parent'}
      isLoading={parentLoading}
    >
      <div className="space-y-6">
        {/* Child Selector */}
        {children && children.length > 1 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Select Child</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                <SelectTrigger className="w-full md:w-[300px]">
                  <SelectValue placeholder="Select a child" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.first_name} {child.last_name} ({child.admission_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {childrenLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : !children?.length ? (
          <Card>
            <CardContent className="py-12 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No children linked to your account</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Currently Borrowed</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loanCounts?.active || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {selectedChild ? `${selectedChild.first_name}'s books` : 'Books borrowed'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{loanCounts?.overdue || 0}</div>
                  <p className="text-xs text-muted-foreground">Need to return</p>
                </CardContent>
              </Card>
            </div>

            {/* Current Loans */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedChild ? `${selectedChild.first_name}'s Books` : 'Current Loans'}
                </CardTitle>
                <CardDescription>Books currently borrowed from the library</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : activeLoans.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No books currently borrowed</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Book</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Borrowed</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeLoans.map((loan) => (
                        <TableRow key={loan.id}>
                          <TableCell className="font-medium">
                            {loan.copy?.book?.title || 'Unknown'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {loan.copy?.book?.book_code || '-'}
                          </TableCell>
                          <TableCell>
                            {format(new Date(loan.borrowed_at), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            {format(new Date(loan.due_date), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>{getStatusBadge(loan)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </UnifiedPortalLayout>
  );
}
