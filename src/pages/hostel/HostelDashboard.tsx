import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Bed, 
  Users, 
  TrendingUp, 
  Plus,
  ArrowRight,
  AlertTriangle,
  Clock,
  DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBoardingStats } from '@/hooks/useHostels';
import { useRecentAllocations } from '@/hooks/useBedAllocations';
import { useChargeStats } from '@/hooks/useBoardingCharges';
import { formatDistanceToNow } from 'date-fns';

export default function HostelDashboard() {
  const { data: stats, isLoading: statsLoading } = useBoardingStats();
  const { data: recentAllocations, isLoading: allocationsLoading } = useRecentAllocations(5);
  const { data: chargeStats, isLoading: chargesLoading } = useChargeStats();

  return (
    <DashboardLayout
      title="Boarding Management"
      subtitle="Manage hostels, rooms, and student bed allocations"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/hostel/hostels">
              <Building2 className="h-4 w-4 mr-2" />
              Manage Hostels
            </Link>
          </Button>
          <Button asChild>
            <Link to="/hostel/assign">
              <Plus className="h-4 w-4 mr-2" />
              Assign Bed
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Capacity
                  </CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalCapacity || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Across {stats?.hostelCount || 0} hostels
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Occupied Beds
                  </CardTitle>
                  <Bed className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.occupiedBeds || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.availableBeds || 0} beds available
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Occupancy Rate
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.occupancyRate || 0}%</div>
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${stats?.occupancyRate || 0}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Boarders
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.activeAllocations || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Students currently allocated
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Allocations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Allocations</CardTitle>
                <CardDescription>Latest bed assignments</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/hostel/allocations">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {allocationsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-5 w-16" />
                    </div>
                  ))}
                </div>
              ) : recentAllocations?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bed className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No allocations yet</p>
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <Link to="/hostel/assign">Assign First Student</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentAllocations?.map((allocation) => (
                    <div key={allocation.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {allocation.student?.first_name} {allocation.student?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {allocation.bed?.room?.hostel?.name} - Room {allocation.bed?.room?.room_number}, Bed {allocation.bed?.bed_number}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={allocation.status === 'active' ? 'default' : 'secondary'}>
                          {allocation.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(allocation.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Charges Overview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Charges Overview</CardTitle>
                <CardDescription>Deposits, penalties & damages</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/hostel/charges">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {chargesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium">Pending Charges</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">KES {chargeStats?.pendingTotal.toLocaleString() || 0}</p>
                      <p className="text-xs text-muted-foreground">{chargeStats?.pendingCount || 0} items</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Total Deposits</span>
                    </div>
                    <p className="font-bold">KES {chargeStats?.depositTotal.toLocaleString() || 0}</p>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium">Penalties</span>
                    </div>
                    <p className="font-bold">KES {chargeStats?.penaltyTotal.toLocaleString() || 0}</p>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">Damage Charges</span>
                    </div>
                    <p className="font-bold">KES {chargeStats?.damageTotal.toLocaleString() || 0}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link to="/hostel/assign">
                  <Bed className="h-5 w-5" />
                  <span>Assign Bed</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link to="/hostel/hostels">
                  <Building2 className="h-5 w-5" />
                  <span>Add Hostel</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link to="/hostel/charges">
                  <DollarSign className="h-5 w-5" />
                  <span>Add Charge</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link to="/hostel/allocations">
                  <Users className="h-5 w-5" />
                  <span>View Allocations</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
