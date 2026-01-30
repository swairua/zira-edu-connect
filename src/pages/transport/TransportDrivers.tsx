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
import { useTransportDrivers, useCreateDriver, useUpdateDriver, useDeleteDriver, TransportDriver } from '@/hooks/useTransportDrivers';
import { useTransportVehicles } from '@/hooks/useTransportVehicles';
import { Users, Plus, Edit, Trash2, MoreVertical, Phone, AlertTriangle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, isPast, parseISO } from 'date-fns';

export default function TransportDrivers() {
  const { institution } = useInstitution();
  const { data: drivers, isLoading } = useTransportDrivers(institution?.id);
  const { data: vehicles } = useTransportVehicles(institution?.id);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TransportDriver | null>(null);

  const createDriver = useCreateDriver();
  const updateDriver = useUpdateDriver();
  const deleteDriver = useDeleteDriver();

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      license_number: formData.get('license_number') as string || undefined,
      license_expiry: formData.get('license_expiry') as string || undefined,
      current_vehicle_id: formData.get('current_vehicle_id') as string || undefined,
      status: formData.get('status') as 'active' | 'on_leave' | 'inactive',
      emergency_contact: formData.get('emergency_contact') as string || undefined,
    };

    if (editing) {
      await updateDriver.mutateAsync({ id: editing.id, ...data });
    } else {
      await createDriver.mutateAsync({ institution_id: institution!.id, ...data });
    }
    setDialogOpen(false);
    setEditing(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpired = (date: string | null) => {
    if (!date) return false;
    return isPast(parseISO(date));
  };

  return (
    <DashboardLayout title="Drivers" subtitle="Manage transport drivers">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Driver
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-40" />)}
          </div>
        ) : drivers?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No drivers registered yet</p>
              <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Driver
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {drivers?.map(driver => (
              <Card key={driver.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{driver.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {driver.phone}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditing(driver); setDialogOpen(true); }}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteDriver.mutate({ id: driver.id, institutionId: institution!.id })}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Badge className={getStatusColor(driver.status)}>{driver.status.replace('_', ' ')}</Badge>
                  {driver.current_vehicle && (
                    <p className="text-sm text-muted-foreground">
                      Vehicle: {driver.current_vehicle.registration_number}
                    </p>
                  )}
                  {driver.license_number && (
                    <p className="text-sm text-muted-foreground">
                      License: {driver.license_number}
                    </p>
                  )}
                  {driver.license_expiry && (
                    <p className={`text-xs ${isExpired(driver.license_expiry) ? 'text-red-600 flex items-center gap-1' : 'text-muted-foreground'}`}>
                      {isExpired(driver.license_expiry) && <AlertTriangle className="h-3 w-3" />}
                      Expires: {format(parseISO(driver.license_expiry), 'dd MMM yyyy')}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Driver' : 'Add Driver'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" defaultValue={editing?.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" defaultValue={editing?.phone} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="license">License Number</Label>
                <Input id="license" name="license_number" defaultValue={editing?.license_number || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry">License Expiry</Label>
                <Input id="expiry" name="license_expiry" type="date" defaultValue={editing?.license_expiry || ''} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle">Assigned Vehicle</Label>
                <Select name="current_vehicle_id" defaultValue={editing?.current_vehicle_id || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles?.filter(v => v.status === 'active').map(vehicle => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>{vehicle.registration_number}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={editing?.status || 'active'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency">Emergency Contact</Label>
              <Input id="emergency" name="emergency_contact" defaultValue={editing?.emergency_contact || ''} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createDriver.isPending || updateDriver.isPending}>
                {editing ? 'Save Changes' : 'Add Driver'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
