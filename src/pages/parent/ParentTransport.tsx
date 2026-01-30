import { useParent } from '@/contexts/ParentContext';
import { ParentLayout } from '@/components/parent/ParentLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Bus, MapPin, Clock, User, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useParentTransportSubscription } from '@/hooks/useParentTransport';
import { format } from 'date-fns';

export default function ParentTransport() {
  const { selectedStudent, isLoading: parentLoading } = useParent();
  const { subscription, isLoading } = useParentTransportSubscription(selectedStudent?.id || null);

  if (parentLoading) {
    return (
      <ParentLayout title="Transport">
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </ParentLayout>
    );
  }

  if (!selectedStudent) {
    return (
      <ParentLayout title="Transport">
        <Card>
          <CardContent className="py-8 text-center">
            <Bus className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No student selected</p>
          </CardContent>
        </Card>
      </ParentLayout>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Active</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending Approval</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <ParentLayout title="Transport">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Transport</h1>
          <p className="text-muted-foreground">
            View {selectedStudent.first_name}'s transport subscription and details
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : subscription ? (
          <>
            {/* Status Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Subscription Status</CardTitle>
                  {getStatusBadge(subscription.status)}
                </div>
              </CardHeader>
              <CardContent>
                {subscription.status === 'suspended' && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 text-destructive mb-4">
                    <AlertCircle className="h-5 w-5 mt-0.5" />
                    <div>
                      <p className="font-medium">Transport Suspended</p>
                      <p className="text-sm">{subscription.suspended_reason || 'Please contact the school for more information.'}</p>
                    </div>
                  </div>
                )}
                {subscription.status === 'active' && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 text-green-700">
                    <CheckCircle2 className="h-5 w-5 mt-0.5" />
                    <div>
                      <p className="font-medium">Transport Active</p>
                      <p className="text-sm">Your child's transport subscription is active and in good standing.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Route Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bus className="h-5 w-5" />
                  Route Details
                </CardTitle>
                <CardDescription>
                  {subscription.subscription_type === 'both' 
                    ? 'Pickup & Drop-off' 
                    : subscription.subscription_type === 'pickup' 
                      ? 'Pickup Only' 
                      : 'Drop-off Only'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Route</p>
                      <p className="font-medium">{subscription.route?.name || 'N/A'}</p>
                      {subscription.route?.zone && (
                        <p className="text-sm text-muted-foreground">Zone: {subscription.route.zone.name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Pickup/Drop-off Point</p>
                      <p className="font-medium">{subscription.stop?.name || 'N/A'}</p>
                      {subscription.stop?.location_description && (
                        <p className="text-sm text-muted-foreground">{subscription.stop.location_description}</p>
                      )}
                    </div>
                  </div>
                </div>

                {(subscription.stop?.pickup_time || subscription.stop?.dropoff_time) && (
                  <div className="pt-4 border-t">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex gap-6">
                        {subscription.stop?.pickup_time && (
                          <div>
                            <p className="text-sm text-muted-foreground">Pickup Time</p>
                            <p className="font-medium">{subscription.stop.pickup_time}</p>
                          </div>
                        )}
                        {subscription.stop?.dropoff_time && (
                          <div>
                            <p className="text-sm text-muted-foreground">Drop-off Time</p>
                            <p className="font-medium">{subscription.stop.dropoff_time}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vehicle & Driver */}
            {subscription.route?.vehicle && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Vehicle & Driver</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <Bus className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Vehicle</p>
                        <p className="font-medium">{subscription.route.vehicle.registration_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {subscription.route.vehicle.make} {subscription.route.vehicle.model}
                        </p>
                      </div>
                    </div>
                    {subscription.route.vehicle.driver && (
                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Driver</p>
                          <p className="font-medium">{subscription.route.vehicle.driver.name}</p>
                          {subscription.route.vehicle.driver.phone && (
                            <a 
                              href={`tel:${subscription.route.vehicle.driver.phone}`}
                              className="text-sm text-primary flex items-center gap-1 mt-1"
                            >
                              <Phone className="h-3 w-3" />
                              {subscription.route.vehicle.driver.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Fee Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fee Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Transport Fee (Current Term)</p>
                    <p className="text-2xl font-bold">
                      {subscription.currency} {subscription.fee_amount?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <Button variant="outline" asChild>
                    <a href="/parent/fees">View All Fees</a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Period */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Subscription Period</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">
                      {subscription.start_date ? format(new Date(subscription.start_date), 'PPP') : 'N/A'}
                    </p>
                  </div>
                  {subscription.end_date && (
                    <div>
                      <p className="text-sm text-muted-foreground">End Date</p>
                      <p className="font-medium">
                        {format(new Date(subscription.end_date), 'PPP')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Bus className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Transport Subscription</h3>
              <p className="text-muted-foreground mb-4">
                {selectedStudent.first_name} is not currently subscribed to school transport.
              </p>
              <p className="text-sm text-muted-foreground">
                Contact the school administration to subscribe to transport services.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ParentLayout>
  );
}
