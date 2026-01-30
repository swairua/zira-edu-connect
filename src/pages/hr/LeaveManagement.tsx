import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, CheckCircle, XCircle, Plus, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { useLeaveTypes } from '@/hooks/useLeaveTypes';
import { useLeaveBalances } from '@/hooks/useLeaveBalances';
import { LeaveRequestDialog } from '@/components/hr/LeaveRequestDialog';
import { LeaveApprovalDialog } from '@/components/hr/LeaveApprovalDialog';
import { LeaveTypeDialog } from '@/components/hr/LeaveTypeDialog';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  approved: 'bg-green-500/10 text-green-700 border-green-200',
  rejected: 'bg-red-500/10 text-red-700 border-red-200',
  cancelled: 'bg-gray-500/10 text-gray-700 border-gray-200',
};

export default function LeaveManagement() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<any>(null);
  
  const { leaveRequests, isLoading: requestsLoading } = useLeaveRequests(
    statusFilter === 'all' ? undefined : statusFilter
  );
  const { leaveTypes, isLoading: typesLoading, deleteLeaveType } = useLeaveTypes();
  const { balances, isLoading: balancesLoading } = useLeaveBalances();

  const pendingCount = leaveRequests.filter(r => r.status === 'pending').length;
  const approvedCount = leaveRequests.filter(r => r.status === 'approved').length;
  const rejectedCount = leaveRequests.filter(r => r.status === 'rejected').length;

  const handleViewRequest = (request: any) => {
    setSelectedRequest(request);
    setApprovalDialogOpen(true);
  };

  const handleEditType = (type: any) => {
    setSelectedType(type);
    setTypeDialogOpen(true);
  };

  const handleAddType = () => {
    setSelectedType(null);
    setTypeDialogOpen(true);
  };

  return (
    <DashboardLayout title="Leave Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
            <p className="text-muted-foreground">
              Manage staff leave requests, approvals, and balances
            </p>
          </div>
          <Button onClick={() => setRequestDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leave Types</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leaveTypes.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="requests" className="space-y-4">
          <TabsList>
            <TabsTrigger value="requests">Leave Requests</TabsTrigger>
            <TabsTrigger value="types">Leave Types</TabsTrigger>
            <TabsTrigger value="balances">Leave Balances</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Leave Requests</CardTitle>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Requests</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff</TableHead>
                        <TableHead>Leave Type</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaveRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            No leave requests found
                          </TableCell>
                        </TableRow>
                      ) : (
                        leaveRequests.map((request: any) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">
                              {request.staff?.first_name} {request.staff?.last_name}
                            </TableCell>
                            <TableCell>{request.leave_type?.name}</TableCell>
                            <TableCell>{format(new Date(request.start_date), 'MMM dd, yyyy')}</TableCell>
                            <TableCell>{format(new Date(request.end_date), 'MMM dd, yyyy')}</TableCell>
                            <TableCell>{request.days}</TableCell>
                            <TableCell>
                              <Badge className={statusColors[request.status]}>
                                {request.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => handleViewRequest(request)}>
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="types">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Leave Types</CardTitle>
                <Button onClick={handleAddType}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Type
                </Button>
              </CardHeader>
              <CardContent>
                {typesLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Days Allowed</TableHead>
                        <TableHead>Carry Forward</TableHead>
                        <TableHead>Requires Approval</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaveTypes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No leave types configured
                          </TableCell>
                        </TableRow>
                      ) : (
                        leaveTypes.map((type) => (
                          <TableRow key={type.id}>
                            <TableCell className="font-medium">{type.name}</TableCell>
                            <TableCell>{type.days_allowed} days</TableCell>
                            <TableCell>
                              <Badge variant={type.carry_forward ? 'default' : 'secondary'}>
                                {type.carry_forward ? 'Yes' : 'No'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={type.requires_approval ? 'default' : 'secondary'}>
                                {type.requires_approval ? 'Yes' : 'No'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEditType(type)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => deleteLeaveType.mutate(type.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="balances">
            <Card>
              <CardHeader>
                <CardTitle>Staff Leave Balances</CardTitle>
              </CardHeader>
              <CardContent>
                {balancesLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff</TableHead>
                        <TableHead>Leave Type</TableHead>
                        <TableHead>Entitled</TableHead>
                        <TableHead>Used</TableHead>
                        <TableHead>Carried</TableHead>
                        <TableHead>Remaining</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {balances.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            No leave balances found
                          </TableCell>
                        </TableRow>
                      ) : (
                        balances.map((balance) => (
                          <TableRow key={balance.id}>
                            <TableCell className="font-medium">
                              {balance.staff?.first_name} {balance.staff?.last_name}
                            </TableCell>
                            <TableCell>{balance.leave_type?.name}</TableCell>
                            <TableCell>{balance.entitled}</TableCell>
                            <TableCell>{balance.used}</TableCell>
                            <TableCell>0</TableCell>
                            <TableCell className="font-medium">
                              {balance.balance}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <LeaveRequestDialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen} />
      <LeaveApprovalDialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen} request={selectedRequest} />
      <LeaveTypeDialog open={typeDialogOpen} onOpenChange={setTypeDialogOpen} leaveType={selectedType} />
    </DashboardLayout>
  );
}
