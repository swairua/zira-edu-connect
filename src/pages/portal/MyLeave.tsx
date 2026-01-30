import { PortalLayout } from '@/components/portal/PortalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useMyLeave } from '@/hooks/useMyLeave';
import { LeaveBalanceCard } from '@/components/portal/LeaveBalanceCard';
import { LeaveRequestForm } from '@/components/portal/LeaveRequestForm';

const statusConfig = {
  pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
  approved: { label: 'Approved', variant: 'default' as const, icon: CheckCircle },
  rejected: { label: 'Rejected', variant: 'destructive' as const, icon: XCircle },
  cancelled: { label: 'Cancelled', variant: 'outline' as const, icon: AlertCircle },
};

export default function MyLeave() {
  const {
    myRequests,
    myBalances,
    leaveTypes,
    pendingRequests,
    approvedRequests,
    submitRequest,
    cancelRequest,
    isLoading,
  } = useMyLeave();

  return (
    <PortalLayout title="My Leave">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{pendingRequests.length}</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved This Year</p>
                  <p className="text-2xl font-bold">{approvedRequests.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Days Used</p>
                  <p className="text-2xl font-bold">
                    {myBalances.reduce((sum, b) => sum + b.used_days, 0)}
                  </p>
                </div>
                <CalendarDays className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                  <p className="text-2xl font-bold">{myRequests.length}</p>
                </div>
                <CalendarDays className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Leave Balances */}
          <div className="lg:col-span-1">
            <LeaveBalanceCard balances={myBalances} isLoading={isLoading} />
          </div>

          {/* Request Form */}
          <div className="lg:col-span-2">
            <LeaveRequestForm
              leaveTypes={leaveTypes}
              balances={myBalances}
              onSubmit={(request) => submitRequest.mutate(request)}
              isPending={submitRequest.isPending}
            />
          </div>
        </div>

        {/* Leave History */}
        <Card>
          <CardHeader>
            <CardTitle>Leave History</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <LeaveRequestsTable
                  requests={myRequests}
                  isLoading={isLoading}
                  onCancel={(id) => cancelRequest.mutate(id)}
                  isCancelling={cancelRequest.isPending}
                />
              </TabsContent>
              <TabsContent value="pending" className="mt-4">
                <LeaveRequestsTable
                  requests={myRequests.filter(r => r.status === 'pending')}
                  isLoading={isLoading}
                  onCancel={(id) => cancelRequest.mutate(id)}
                  isCancelling={cancelRequest.isPending}
                />
              </TabsContent>
              <TabsContent value="approved" className="mt-4">
                <LeaveRequestsTable
                  requests={myRequests.filter(r => r.status === 'approved')}
                  isLoading={isLoading}
                  onCancel={(id) => cancelRequest.mutate(id)}
                  isCancelling={cancelRequest.isPending}
                />
              </TabsContent>
              <TabsContent value="rejected" className="mt-4">
                <LeaveRequestsTable
                  requests={myRequests.filter(r => r.status === 'rejected')}
                  isLoading={isLoading}
                  onCancel={(id) => cancelRequest.mutate(id)}
                  isCancelling={cancelRequest.isPending}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}

interface LeaveRequestsTableProps {
  requests: ReturnType<typeof useMyLeave>['myRequests'];
  isLoading: boolean;
  onCancel: (id: string) => void;
  isCancelling: boolean;
}

function LeaveRequestsTable({ requests, isLoading, onCancel, isCancelling }: LeaveRequestsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!requests.length) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No leave requests found.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Dates</TableHead>
          <TableHead>Days</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => {
          const config = statusConfig[request.status];
          const StatusIcon = config.icon;
          return (
            <TableRow key={request.id}>
              <TableCell className="font-medium">
                {request.leave_type?.name || 'Unknown'}
                {request.half_day && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({request.half_day_period})
                  </span>
                )}
              </TableCell>
              <TableCell>
                {format(new Date(request.start_date), 'MMM d')} -{' '}
                {format(new Date(request.end_date), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>{request.days}</TableCell>
              <TableCell>
                <Badge variant={config.variant} className="gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {config.label}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(request.created_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                {request.status === 'pending' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        Cancel
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Leave Request?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will cancel your pending leave request for{' '}
                          {request.leave_type?.name}. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Request</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onCancel(request.id)}
                          disabled={isCancelling}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Cancel Request
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                {request.status === 'rejected' && request.rejection_reason && (
                  <span className="text-xs text-destructive">
                    {request.rejection_reason}
                  </span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
