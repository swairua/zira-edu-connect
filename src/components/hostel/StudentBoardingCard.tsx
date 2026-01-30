import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useStudentAllocation, useAllocationHistory } from '@/hooks/useBedAllocations';
import { useStudentCharges } from '@/hooks/useBoardingCharges';
import { useCurrentAcademicYear } from '@/hooks/useAcademicYears';
import { 
  Bed, 
  Building2, 
  DoorOpen, 
  History, 
  Receipt, 
  AlertCircle,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { format } from 'date-fns';

interface StudentBoardingCardProps {
  studentId: string;
  institutionId: string;
  boardingStatus?: string | null;
}

export function StudentBoardingCard({ studentId, institutionId, boardingStatus }: StudentBoardingCardProps) {
  const { data: currentYear } = useCurrentAcademicYear(institutionId);
  const { data: allocation, isLoading: loadingAllocation } = useStudentAllocation(studentId);
  const { data: charges = [], isLoading: loadingCharges } = useStudentCharges(studentId);
  const { data: history = [] } = useAllocationHistory(allocation?.id);

  const pendingCharges = charges.filter(c => c.status === 'pending');
  const depositCharges = charges.filter(c => c.charge_type === 'deposit');

  if (loadingAllocation) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // Day student - no boarding
  if (boardingStatus === 'day' || !boardingStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Boarding Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Bed className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Day Student</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              This student is registered as a day student and does not have a bed allocation.
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/hostel/assign">
                Convert to Boarding
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Allocation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bed className="h-5 w-5" />
            Current Accommodation
          </CardTitle>
          <CardDescription>
            {currentYear?.name || 'Current'} allocation details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allocation ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Hostel</p>
                      <p className="font-medium">{allocation.bed?.room?.hostel?.name || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <DoorOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Room & Bed</p>
                      <p className="font-medium">
                        Room {allocation.bed?.room?.room_number} - Bed {allocation.bed?.bed_number}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <div className="flex items-center gap-2">
                  <Badge variant={allocation.status === 'active' ? 'default' : 'secondary'}>
                    {allocation.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Since {format(new Date(allocation.start_date), 'dd MMM yyyy')}
                  </span>
                </div>
                {allocation.term && (
                  <span className="text-sm font-medium">{allocation.term.name}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No Active Allocation</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                This boarding student doesn't have an active bed allocation for the current term.
              </p>
              <Button className="mt-4" asChild>
                <Link to="/hostel/assign">
                  Assign Bed
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Boarding Charges Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Boarding Charges
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingCharges ? (
            <Skeleton className="h-20 w-full" />
          ) : charges.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No boarding charges found
            </p>
          ) : (
            <div className="space-y-3">
              {/* Deposit Status */}
              {depositCharges.length > 0 && (
                <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10 p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-green-700 dark:text-green-400">Deposit Paid</span>
                  </div>
                  <span className="font-medium">
                    KES {depositCharges.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
                  </span>
                </div>
              )}

              {/* Pending Charges */}
              {pendingCharges.length > 0 && (
                <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10 p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <span className="font-medium text-amber-700 dark:text-amber-400">
                      {pendingCharges.length} Pending Charge(s)
                    </span>
                  </div>
                  <span className="font-medium">
                    KES {pendingCharges.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
                  </span>
                </div>
              )}

              <Button variant="outline" className="w-full" asChild>
                <Link to={`/hostel/charges?student=${studentId}`}>
                  View All Charges
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allocation History */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Allocation History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.slice(0, 5).map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 text-sm">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                    <History className="h-3 w-3" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium capitalize">{entry.action}</p>
                    <p className="text-muted-foreground">
                      {format(new Date(entry.created_at!), 'dd MMM yyyy, HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
