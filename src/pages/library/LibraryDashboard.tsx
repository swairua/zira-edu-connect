import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useLibraryDashboard } from '@/hooks/useLibraryDashboard';
import { useOverdueLoans } from '@/hooks/useLibraryLoans';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  BookCopy, 
  BookCheck, 
  AlertTriangle, 
  Clock, 
  DollarSign,
  Plus,
  ArrowRight,
  BookX,
  Users
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export default function LibraryDashboard() {
  const { data: stats, isLoading } = useLibraryDashboard();
  const { data: overdueLoans, isLoading: overdueLoading } = useOverdueLoans();

  return (
    <DashboardLayout title="Library">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Library</h1>
            <p className="text-muted-foreground">Manage books, loans, and borrowing</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/library/returns">
                <BookCheck className="h-4 w-4 mr-2" />
                Process Return
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/library/allocations">
                <Users className="h-4 w-4 mr-2" />
                Teacher Allocations
              </Link>
            </Button>
            <Button asChild>
              <Link to="/library/checkout">
                <Plus className="h-4 w-4 mr-2" />
                Checkout Book
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Books</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stats?.totalBooks || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">
                {stats?.totalCopies || 0} total copies
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <BookCopy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold text-green-600">{stats?.availableCopies || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">copies available for loan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
              <BookCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stats?.activeLoans || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">books currently borrowed</p>
            </CardContent>
          </Card>

          <Card className={stats?.overdueLoans ? 'border-destructive' : ''}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className={`h-4 w-4 ${stats?.overdueLoans ? 'text-destructive' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className={`text-2xl font-bold ${stats?.overdueLoans ? 'text-destructive' : ''}`}>
                  {stats?.overdueLoans || 0}
                </div>
              )}
              <p className="text-xs text-muted-foreground">books past due date</p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Lost Books</CardTitle>
              <BookX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold text-orange-600">{stats?.lostBooks || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Penalties</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stats?.pendingPenalties || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Penalty Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">
                  KES {(stats?.totalPenaltyAmount || 0).toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link to="/library/books" className="block">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  Book Catalog
                  <ArrowRight className="h-4 w-4" />
                </CardTitle>
                <CardDescription>Manage books and copies</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/library/loans" className="block">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  Active Loans
                  <ArrowRight className="h-4 w-4" />
                </CardTitle>
                <CardDescription>View all current borrowings</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/library/penalties" className="block">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  Penalties
                  <ArrowRight className="h-4 w-4" />
                </CardTitle>
                <CardDescription>Manage library fines</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/library/settings" className="block">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  Settings
                  <ArrowRight className="h-4 w-4" />
                </CardTitle>
                <CardDescription>Configure borrowing rules</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/library/allocations" className="block">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  Teacher Allocations
                  <ArrowRight className="h-4 w-4" />
                </CardTitle>
                <CardDescription>Issue books to teachers for class distribution</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Overdue Books List */}
        {(overdueLoans?.length || 0) > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Overdue Books
              </CardTitle>
              <CardDescription>Books that need immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overdueLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))
                ) : (
                  overdueLoans?.slice(0, 5).map((loan) => {
                    const daysOverdue = differenceInDays(new Date(), new Date(loan.due_date));
                    return (
                      <div
                        key={loan.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{loan.copy?.book?.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {loan.student?.first_name} {loan.student?.last_name} ({loan.student?.admission_number})
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="destructive">{daysOverdue} days overdue</Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Due: {format(new Date(loan.due_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                {(overdueLoans?.length || 0) > 5 && (
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/library/loans?status=overdue">
                      View all {overdueLoans?.length} overdue books
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
