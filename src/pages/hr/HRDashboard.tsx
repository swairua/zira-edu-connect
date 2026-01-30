import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Calendar, Clock, UserCheck, FileText, ClipboardList, Settings, ArrowRight } from 'lucide-react';
import { useHRDashboard } from '@/hooks/useHRDashboard';
import { LeaveRequestDialog } from '@/components/hr/LeaveRequestDialog';
import { LeaveApprovalDialog } from '@/components/hr/LeaveApprovalDialog';
import { useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function HRDashboard() {
  const { stats, isLoading, pendingRequests, recentActivity } = useHRDashboard();
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const navigate = useNavigate();

  const handleApproveRequest = (request: any) => {
    setSelectedRequest(request);
    setApprovalDialogOpen(true);
  };

  const quickActions = [
    { icon: FileText, label: 'Submit Leave', onClick: () => setRequestDialogOpen(true) },
    { icon: ClipboardList, label: 'Mark Attendance', onClick: () => navigate('/hr/attendance') },
    { icon: Settings, label: 'Leave Types', onClick: () => navigate('/hr/leave') },
    { icon: Users, label: 'View Staff', onClick: () => navigate('/staff') },
  ];

  return (
    <DashboardLayout title="HR Management">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HR Management</h1>
          <p className="text-muted-foreground">
            Manage staff leave, attendance, and HR operations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats?.totalStaff || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">Active employees</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Leave</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats?.pendingLeave || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">Requests awaiting approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present Today</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats?.presentToday || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">Staff checked in</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On Leave Today</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats?.onLeaveToday || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">Staff on approved leave</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pending Leave Requests */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pending Leave Requests</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/hr/leave')}>
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              <CardDescription>Requests awaiting your approval</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : pendingRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No pending leave requests
                </p>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((request: any) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {request.staff?.first_name} {request.staff?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.leave_type?.name} • {format(new Date(request.start_date), 'MMM d')} - {format(new Date(request.end_date), 'MMM d')}
                        </p>
                      </div>
                      <Button size="sm" onClick={() => handleApproveRequest(request)}>
                        Review
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common HR tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <Button
                    key={action.label}
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2"
                    onClick={action.onClick}
                  >
                    <action.icon className="h-5 w-5" />
                    <span>{action.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Leave Activity</CardTitle>
            <CardDescription>Latest leave request updates</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No recent activity
              </p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity: any) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          activity.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">
                            {activity.staff?.first_name} {activity.staff?.last_name}
                          </span>
                          {' '}leave request {activity.status}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.leave_type?.name} • {format(new Date(activity.updated_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <Badge variant={activity.status === 'approved' ? 'default' : 'destructive'}>
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <LeaveRequestDialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen} />
      
      {selectedRequest && (
        <LeaveApprovalDialog
          open={approvalDialogOpen}
          onOpenChange={setApprovalDialogOpen}
          request={selectedRequest}
        />
      )}
    </DashboardLayout>
  );
}
