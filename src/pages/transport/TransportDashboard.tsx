import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useTransportStats } from '@/hooks/useTransportStats';
import { 
  Bus, 
  MapPin, 
  Truck, 
  Users, 
  UserCheck, 
  Clock, 
  AlertTriangle,
  Plus,
  Route,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TransportDashboard() {
  const { institution } = useInstitution();
  const { data: stats, isLoading } = useTransportStats(institution?.id);
  const navigate = useNavigate();

  const statCards = [
    { label: 'Active Routes', value: stats?.totalRoutes || 0, icon: Route, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Zones', value: stats?.totalZones || 0, icon: MapPin, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Vehicles', value: stats?.totalVehicles || 0, icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Drivers', value: stats?.totalDrivers || 0, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Active Subscriptions', value: stats?.activeSubscriptions || 0, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending Approvals', value: stats?.pendingApprovals || 0, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Suspended', value: stats?.suspendedSubscriptions || 0, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Total Capacity', value: stats?.totalCapacity || 0, icon: Bus, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <DashboardLayout title="Transport Management" subtitle="Manage school transport routes, vehicles, and subscriptions">
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate('/transport/routes')}>
            <MapPin className="mr-2 h-4 w-4" />
            Manage Routes
          </Button>
          <Button variant="outline" onClick={() => navigate('/transport/vehicles')}>
            <Truck className="mr-2 h-4 w-4" />
            Vehicles
          </Button>
          <Button variant="outline" onClick={() => navigate('/transport/drivers')}>
            <Users className="mr-2 h-4 w-4" />
            Drivers
          </Button>
          <Button variant="outline" onClick={() => navigate('/transport/subscriptions')}>
            <UserCheck className="mr-2 h-4 w-4" />
            Subscriptions
          </Button>
          <Button variant="outline" onClick={() => navigate('/transport/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          ) : (
            statCards.map((stat) => (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pending Approvals Alert */}
        {stats && stats.pendingApprovals > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="font-medium">
                  {stats.pendingApprovals} subscription request{stats.pendingApprovals > 1 ? 's' : ''} pending approval
                </span>
              </div>
              <Button size="sm" onClick={() => navigate('/transport/approvals')}>
                Review
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
