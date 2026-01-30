import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useTransportVehicles, useCreateVehicle, useUpdateVehicle, useDeleteVehicle, TransportVehicle } from '@/hooks/useTransportVehicles';
import { useTransportRoutes } from '@/hooks/useTransportRoutes';
import { Truck, Plus, Edit, Trash2, MoreVertical, AlertTriangle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, isPast, parseISO } from 'date-fns';

export default function TransportVehicles() {
  const { institution } = useInstitution();
  const { data: vehicles, isLoading } = useTransportVehicles(institution?.id);
  const { data: routes } = useTransportRoutes(institution?.id);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TransportVehicle | null>(null);

  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const deleteVehicle = useDeleteVehicle();

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      registration_number: formData.get('registration_number') as string,
      vehicle_type: formData.get('vehicle_type') as 'bus' | 'van' | 'minibus' | 'car',
      make: formData.get('make') as string,
      model: formData.get('model') as string,
      year: parseInt(formData.get('year') as string) || undefined,
      capacity: parseInt(formData.get('capacity') as string) || 0,
      current_route_id: formData.get('current_route_id') as string || undefined,
      status: formData.get('status') as 'active' | 'maintenance' | 'inactive',
      insurance_expiry: formData.get('insurance_expiry') as string || undefined,
      inspection_expiry: formData.get('inspection_expiry') as string || undefined,
    };

    if (editing) {
      await updateVehicle.mutateAsync({ id: editing.id, ...data });
    } else {
      await createVehicle.mutateAsync({ institution_id: institution!.id, ...data });
    }
    setDialogOpen(false);
    setEditing(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpired = (date: string | null) => {
    if (!date) return false;
    return isPast(parseISO(date));
  };

  return (
    <DashboardLayout title="Vehicles" subtitle="Manage transport vehicles">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)}
          </div>
        ) : vehicles?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Truck className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No vehicles registered yet</p>
              <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Vehicle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vehicles?.map(vehicle => (
              <Card key={vehicle.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{vehicle.registration_number}</CardTitle>
                      <CardDescription>{vehicle.make} {vehicle.model} {vehicle.year && `(${vehicle.year})`}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditing(vehicle); setDialogOpen(true); }}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteVehicle.mutate({ id: vehicle.id, institutionId: institution!.id })}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getStatusColor(vehicle.status)}>{vehicle.status}</Badge>
                    <Badge variant="outline">{vehicle.vehicle_type}</Badge>
                    <Badge variant="secondary">{vehicle.capacity} seats</Badge>
                  </div>
                  {vehicle.current_route && (
                    <p className="text-sm text-muted-foreground">
                      Route: {vehicle.current_route.name}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {vehicle.insurance_expiry && (
                      <span className={isExpired(vehicle.insurance_expiry) ? 'text-red-600 flex items-center gap-1' : 'text-muted-foreground'}>
                        {isExpired(vehicle.insurance_expiry) && <AlertTriangle className="h-3 w-3" />}
                        Insurance: {format(parseISO(vehicle.insurance_expiry), 'dd MMM yyyy')}
                      </span>
                    )}
                    {vehicle.inspection_expiry && (
                      <span className={isExpired(vehicle.inspection_expiry) ? 'text-red-600 flex items-center gap-1' : 'text-muted-foreground'}>
                        {isExpired(vehicle.inspection_expiry) && <AlertTriangle className="h-3 w-3" />}
                        Inspection: {format(parseISO(vehicle.inspection_expiry), 'dd MMM yyyy')}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Vehicle' : 'Add Vehicle'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reg">Registration Number</Label>
                <Input id="reg" name="registration_number" defaultValue={editing?.registration_number} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select name="vehicle_type" defaultValue={editing?.vehicle_type || 'bus'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bus">Bus</SelectItem>
                    <SelectItem value="minibus">Minibus</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="car">Car</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Make</Label>
                <Input id="make" name="make" defaultValue={editing?.make || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input id="model" name="model" defaultValue={editing?.model || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input id="year" name="year" type="number" defaultValue={editing?.year || ''} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (seats)</Label>
                <Input id="capacity" name="capacity" type="number" defaultValue={editing?.capacity || ''} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={editing?.status || 'active'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="route">Assigned Route</Label>
              <Select name="current_route_id" defaultValue={editing?.current_route_id || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Select route (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {routes?.map(route => (
                    <SelectItem key={route.id} value={route.id}>{route.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="insurance">Insurance Expiry</Label>
                <Input id="insurance" name="insurance_expiry" type="date" defaultValue={editing?.insurance_expiry || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inspection">Inspection Expiry</Label>
                <Input id="inspection" name="inspection_expiry" type="date" defaultValue={editing?.inspection_expiry || ''} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createVehicle.isPending || updateVehicle.isPending}>
                {editing ? 'Save Changes' : 'Add Vehicle'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
