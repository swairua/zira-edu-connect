import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useStudents } from '@/hooks/useStudents';
import { useTransportRoutes, useRouteStops } from '@/hooks/useTransportRoutes';
import { useGetFeeForRoute } from '@/hooks/useTransportFeeConfigs';
import { useCreateSubscription } from '@/hooks/useTransportSubscriptions';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Bus } from 'lucide-react';
import { format } from 'date-fns';

export default function SubscribeStudent() {
  const { institution } = useInstitution();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [studentId, setStudentId] = useState('');
  const [routeId, setRouteId] = useState('');
  const [stopId, setStopId] = useState('');
  const [subscriptionType, setSubscriptionType] = useState<'pickup' | 'dropoff' | 'both'>('both');
  const [search, setSearch] = useState('');

  const { data: students } = useStudents(institution?.id);
  const { data: routes } = useTransportRoutes(institution?.id);
  const { data: stops } = useRouteStops(routeId || undefined);
  const { data: feeInfo } = useGetFeeForRoute(routeId || undefined, subscriptionType);
  const { data: academicYears } = useAcademicYears(institution?.id);
  const createSubscription = useCreateSubscription();

  const currentYear = academicYears?.find(y => y.is_current);

  const filteredStudents = students?.filter(s => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      s.first_name?.toLowerCase().includes(searchLower) ||
      s.last_name?.toLowerCase().includes(searchLower) ||
      s.admission_number?.toLowerCase().includes(searchLower)
    );
  });

  const selectedStudent = students?.find(s => s.id === studentId);
  const selectedRoute = routes?.find(r => r.id === routeId);
  const selectedStop = stops?.find(s => s.id === stopId);

  const handleSubmit = async () => {
    if (!institution?.id || !studentId || !routeId || !feeInfo) return;

    await createSubscription.mutateAsync({
      institution_id: institution.id,
      student_id: studentId,
      route_id: routeId,
      stop_id: stopId || undefined,
      academic_year_id: currentYear?.id,
      subscription_type: subscriptionType,
      start_date: format(new Date(), 'yyyy-MM-dd'),
      fee_amount: feeInfo.fee,
      currency: feeInfo.currency,
    });

    navigate('/transport/subscriptions');
  };

  return (
    <DashboardLayout title="Subscribe Student to Transport" subtitle="Add a student to a transport route">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate('/transport/subscriptions')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Subscriptions
        </Button>

        {/* Step 1: Select Student */}
        <Card className={step !== 1 ? 'opacity-60' : ''}>
          <CardHeader>
            <CardTitle className="text-lg">1. Select Student</CardTitle>
            <CardDescription>Choose the student to subscribe to transport</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 ? (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or admission number..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {filteredStudents?.slice(0, 10).map(student => (
                    <div
                      key={student.id}
                      className={`p-3 rounded-lg border cursor-pointer hover:bg-muted transition-colors ${
                        studentId === student.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setStudentId(student.id)}
                    >
                      <p className="font-medium">{student.first_name} {student.last_name}</p>
                      <p className="text-sm text-muted-foreground">{student.admission_number}</p>
                    </div>
                  ))}
                </div>
                {studentId && (
                  <Button className="w-full" onClick={() => setStep(2)}>
                    Continue
                  </Button>
                )}
              </>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{selectedStudent?.first_name} {selectedStudent?.last_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedStudent?.admission_number}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                  Change
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Select Route */}
        <Card className={step < 2 ? 'opacity-40' : step !== 2 ? 'opacity-60' : ''}>
          <CardHeader>
            <CardTitle className="text-lg">2. Select Route & Stop</CardTitle>
            <CardDescription>Choose the transport route and pickup/drop-off point</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step >= 2 && (
              step === 2 ? (
                <>
                  <div className="space-y-2">
                    <Label>Route</Label>
                    <Select value={routeId} onValueChange={setRouteId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select route" />
                      </SelectTrigger>
                      <SelectContent>
                        {routes?.filter(r => r.is_active).map(route => (
                          <SelectItem key={route.id} value={route.id}>
                            {route.name} {route.zone && `(${route.zone.name})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {routeId && stops && stops.length > 0 && (
                    <div className="space-y-2">
                      <Label>Stop (Optional)</Label>
                      <Select value={stopId} onValueChange={setStopId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select stop" />
                        </SelectTrigger>
                        <SelectContent>
                          {stops.map(stop => (
                            <SelectItem key={stop.id} value={stop.id}>
                              {stop.name} {stop.pickup_time && `(${stop.pickup_time})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Subscription Type</Label>
                    <Select value={subscriptionType} onValueChange={(v) => setSubscriptionType(v as 'pickup' | 'dropoff' | 'both')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="both">Both (Pickup & Drop-off)</SelectItem>
                        <SelectItem value="pickup">Pickup Only</SelectItem>
                        <SelectItem value="dropoff">Drop-off Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {routeId && (
                    <Button className="w-full" onClick={() => setStep(3)}>
                      Continue
                    </Button>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedRoute?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedStop?.name || 'No specific stop'} • {subscriptionType}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                    Change
                  </Button>
                </div>
              )
            )}
          </CardContent>
        </Card>

        {/* Step 3: Confirm */}
        <Card className={step < 3 ? 'opacity-40' : ''}>
          <CardHeader>
            <CardTitle className="text-lg">3. Confirm Subscription</CardTitle>
            <CardDescription>Review and confirm the transport subscription</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step >= 3 && (
              <>
                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Student</span>
                    <span className="font-medium">{selectedStudent?.first_name} {selectedStudent?.last_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Route</span>
                    <span className="font-medium">{selectedRoute?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium capitalize">{subscriptionType}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-muted-foreground">Fee Amount</span>
                    <span className="font-bold text-lg">
                      {feeInfo?.currency || 'KES'} {(feeInfo?.fee || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                <Button className="w-full" onClick={handleSubmit} disabled={createSubscription.isPending}>
                  <Bus className="mr-2 h-4 w-4" />
                  {createSubscription.isPending ? 'Creating...' : 'Create Subscription'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
