import { UnifiedPortalLayout } from '@/components/layout/UnifiedPortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { BookOpen, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';

export default function StudentLibrary() {
  const { user } = useAuth();
  const { institutionId } = useInstitution();

  // Get student record for current user
  const { data: studentData, isLoading: studentLoading } = useQuery({
    queryKey: ['my-student-record', institutionId, user?.id],
    queryFn: async () => {
      if (!institutionId || !user?.id) return null;
      const { data } = await supabase
        .from('students')
        .select('id, first_name, last_name')
        .eq('institution_id', institutionId)
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!institutionId && !!user?.id,
  });

  const { data: loans, isLoading } = useStudentLoans(studentData?.id);
  const { data: loanCounts } = useStudentActiveLoansCount(studentData?.id);

  const activeLoans = loans?.filter(l => l.status === 'active' || l.status === 'overdue') || [];
  const returnedLoans = loans?.filter(l => l.status === 'returned') || [];

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

  return (
    <UnifiedPortalLayout
      portalType="student"
      title="My Books"
      subtitle="Your library loans and reading history"
      userName={studentData ? `${studentData.first_name} ${studentData.last_name}` : 'Student'}
      isLoading={studentLoading}
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Currently Borrowed</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loanCounts?.active || 0}</div>
              <p className="text-xs text-muted-foreground">Books in your possession</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{loanCounts?.overdue || 0}</div>
              <p className="text-xs text-muted-foreground">Please return soon</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Books Read</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{returnedLoans.length}</div>
              <p className="text-xs text-muted-foreground">Total returned</p>
            </CardContent>
          </Card>
        </div>

        {/* Current Loans */}
        <Card>
          <CardHeader>
            <CardTitle>Current Loans</CardTitle>
            <CardDescription>Books you currently have borrowed</CardDescription>
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
                <p className="text-sm text-muted-foreground">
                  Visit the library to borrow books
                </p>
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

        {/* Reading History */}
        {returnedLoans.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Reading History</CardTitle>
              <CardDescription>Books you have previously borrowed</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Borrowed</TableHead>
                    <TableHead>Returned</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returnedLoans.slice(0, 10).map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell className="font-medium">
                        {loan.copy?.book?.title || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {loan.copy?.book?.author || '-'}
                      </TableCell>
                      <TableCell>
                        {format(new Date(loan.borrowed_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {loan.returned_at ? format(new Date(loan.returned_at), 'MMM d, yyyy') : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </UnifiedPortalLayout>
  );
}
