import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useTransportSubscriptions, useSuspendSubscription, useReactivateSubscription, useCancelSubscription } from '@/hooks/useTransportSubscriptions';
import { useTransportRoutes } from '@/hooks/useTransportRoutes';
import { UserCheck, Search, Plus, MoreVertical, Ban, Play, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';

export default function TransportSubscriptions() {
  const { institution } = useInstitution();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [routeFilter, setRouteFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  const { data: subscriptions, isLoading } = useTransportSubscriptions(institution?.id, {
    status: statusFilter || undefined,
    routeId: routeFilter || undefined,
  });
  const { data: routes } = useTransportRoutes(institution?.id);

  const suspendSubscription = useSuspendSubscription();
  const reactivateSubscription = useReactivateSubscription();
  const cancelSubscription = useCancelSubscription();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'suspended': return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      case 'cancelled': return <Badge variant="secondary">Cancelled</Badge>;
      case 'ended': return <Badge variant="outline">Ended</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const filteredSubscriptions = subscriptions?.filter(sub => {
    if (!search) return true;
    const student = sub.student;
    const searchLower = search.toLowerCase();
    return (
      student?.first_name?.toLowerCase().includes(searchLower) ||
      student?.last_name?.toLowerCase().includes(searchLower) ||
      student?.admission_number?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <DashboardLayout title="Transport Subscriptions" subtitle="View and manage student transport subscriptions">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search student..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={routeFilter || 'all'} onValueChange={(v) => setRouteFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Routes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Routes</SelectItem>
                {routes?.map(route => (
                  <SelectItem key={route.id} value={route.id}>{route.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => navigate('/transport/subscribe')}>
            <Plus className="mr-2 h-4 w-4" />
            Subscribe Student
          </Button>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64" />
            </CardContent>
          </Card>
        ) : filteredSubscriptions?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <UserCheck className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No subscriptions found</p>
              <Button className="mt-4" onClick={() => navigate('/transport/subscribe')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Subscription
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Stop</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions?.map(sub => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{sub.student?.first_name} {sub.student?.last_name}</p>
                        <p className="text-sm text-muted-foreground">{sub.student?.admission_number}</p>
                      </div>
                    </TableCell>
                    <TableCell>{sub.route?.name || '-'}</TableCell>
                    <TableCell>{sub.stop?.name || '-'}</TableCell>
                    <TableCell className="capitalize">{sub.subscription_type}</TableCell>
                    <TableCell>{sub.currency} {sub.fee_amount.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    <TableCell>{format(parseISO(sub.start_date), 'dd MMM yyyy')}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {sub.status === 'active' && (
                            <DropdownMenuItem onClick={() => suspendSubscription.mutate({ id: sub.id, reason: 'Manual suspension', institutionId: institution!.id })}>
                              <Ban className="mr-2 h-4 w-4" /> Suspend
                            </DropdownMenuItem>
                          )}
                          {sub.status === 'suspended' && (
                            <DropdownMenuItem onClick={() => reactivateSubscription.mutate({ id: sub.id, institutionId: institution!.id })}>
                              <Play className="mr-2 h-4 w-4" /> Reactivate
                            </DropdownMenuItem>
                          )}
                          {['active', 'pending', 'suspended'].includes(sub.status) && (
                            <DropdownMenuItem className="text-destructive" onClick={() => cancelSubscription.mutate({ id: sub.id, institutionId: institution!.id })}>
                              <X className="mr-2 h-4 w-4" /> Cancel
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
