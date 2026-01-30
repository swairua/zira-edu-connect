import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLibraryLoans } from '@/hooks/useLibraryLoans';
import { Search, BookCheck, AlertTriangle, RotateCcw, BookX } from 'lucide-react';
import { format, differenceInDays, isPast } from 'date-fns';
import { usePermissions } from '@/hooks/usePermissions';
import { Link } from 'react-router-dom';

export default function ActiveLoans() {
  const [statusFilter, setStatusFilter] = useState('active');
  const [search, setSearch] = useState('');
  const { loans, isLoading, returnBook, markAsLost } = useLibraryLoans(statusFilter);
  const { can } = usePermissions();

  const canEdit = can('library', 'edit');

  const filteredLoans = loans.filter((loan) => {
    const searchLower = search.toLowerCase();
    return (
      loan.copy?.book?.title?.toLowerCase().includes(searchLower) ||
      loan.student?.first_name?.toLowerCase().includes(searchLower) ||
      loan.student?.last_name?.toLowerCase().includes(searchLower) ||
      loan.student?.admission_number?.toLowerCase().includes(searchLower) ||
      loan.copy?.copy_number?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (loan: typeof loans[0]) => {
    if (loan.status === 'returned') {
      return <Badge variant="secondary">Returned</Badge>;
    }
    if (loan.status === 'lost') {
      return <Badge variant="destructive">Lost</Badge>;
    }
    const isOverdue = isPast(new Date(loan.due_date));
    if (isOverdue) {
      const daysOverdue = differenceInDays(new Date(), new Date(loan.due_date));
      return <Badge variant="destructive">{daysOverdue}d overdue</Badge>;
    }
    const daysRemaining = differenceInDays(new Date(loan.due_date), new Date());
    if (daysRemaining <= 2) {
      return <Badge variant="outline" className="border-amber-500 text-amber-600">Due soon</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  return (
    <DashboardLayout title="Library Loans">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Library Loans</h1>
            <p className="text-muted-foreground">Track all book borrowings and returns</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/library/returns">
                <BookCheck className="h-4 w-4 mr-2" />
                Process Return
              </Link>
            </Button>
            <Button asChild>
              <Link to="/library/checkout">
                <BookCheck className="h-4 w-4 mr-2" />
                New Checkout
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <CardTitle>Loans</CardTitle>
                <CardDescription>{filteredLoans.length} loans found</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredLoans.length === 0 ? (
              <div className="text-center py-12">
                <BookCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No loans found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Copy #</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Borrowed</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    {canEdit && <TableHead className="w-[120px]">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoans.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {loan.copy?.book?.title}
                      </TableCell>
                      <TableCell>{loan.copy?.copy_number}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {loan.student?.first_name} {loan.student?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {loan.student?.admission_number}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(loan.borrowed_at), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{format(new Date(loan.due_date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{getStatusBadge(loan)}</TableCell>
                      {canEdit && (
                        <TableCell>
                          {loan.status === 'active' || loan.status === 'overdue' ? (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => returnBook.mutate({ loanId: loan.id })}
                                disabled={returnBook.isPending}
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Return
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsLost.mutate(loan.id)}
                                disabled={markAsLost.isPending}
                              >
                                <BookX className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {loan.returned_at && format(new Date(loan.returned_at), 'MMM d')}
                            </span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
