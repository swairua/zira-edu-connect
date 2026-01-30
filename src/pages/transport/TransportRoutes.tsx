import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useTransportZones, useCreateZone, useUpdateZone, useDeleteZone, TransportZone } from '@/hooks/useTransportZones';
import { useTransportRoutes, useCreateRoute, useUpdateRoute, useDeleteRoute, TransportRoute } from '@/hooks/useTransportRoutes';
import { MapPin, Route, Plus, Edit, Trash2, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';

export default function TransportRoutes() {
  const { institution } = useInstitution();
  const navigate = useNavigate();
  const { data: zones, isLoading: zonesLoading } = useTransportZones(institution?.id);
  const { data: routes, isLoading: routesLoading } = useTransportRoutes(institution?.id);

  const [zoneDialogOpen, setZoneDialogOpen] = useState(false);
  const [routeDialogOpen, setRouteDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<TransportZone | null>(null);
  const [editingRoute, setEditingRoute] = useState<TransportRoute | null>(null);

  const createZone = useCreateZone();
  const updateZone = useUpdateZone();
  const deleteZone = useDeleteZone();
  const createRoute = useCreateRoute();
  const updateRoute = useUpdateRoute();
  const deleteRoute = useDeleteRoute();

  const handleSaveZone = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      description: formData.get('description') as string,
      base_fee: parseFloat(formData.get('base_fee') as string) || 0,
    };

    if (editingZone) {
      await updateZone.mutateAsync({ id: editingZone.id, ...data });
    } else {
      await createZone.mutateAsync({ institution_id: institution!.id, ...data });
    }
    setZoneDialogOpen(false);
    setEditingZone(null);
  };

  const handleSaveRoute = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      description: formData.get('description') as string,
      zone_id: formData.get('zone_id') as string || undefined,
      route_type: formData.get('route_type') as 'pickup' | 'dropoff' | 'both',
      departure_time: formData.get('departure_time') as string || undefined,
      arrival_time: formData.get('arrival_time') as string || undefined,
    };

    if (editingRoute) {
      await updateRoute.mutateAsync({ id: editingRoute.id, ...data });
    } else {
      await createRoute.mutateAsync({ institution_id: institution!.id, ...data });
    }
    setRouteDialogOpen(false);
    setEditingRoute(null);
  };

  return (
    <DashboardLayout title="Routes & Zones" subtitle="Manage transport zones and routes">
      <Tabs defaultValue="routes" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="routes">Routes</TabsTrigger>
            <TabsTrigger value="zones">Zones</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setEditingZone(null); setZoneDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Zone
            </Button>
            <Button onClick={() => { setEditingRoute(null); setRouteDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Route
            </Button>
          </div>
        </div>

        <TabsContent value="routes" className="space-y-4">
          {routesLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-40" />)}
            </div>
          ) : routes?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Route className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No routes defined yet</p>
                <Button className="mt-4" onClick={() => setRouteDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Route
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {routes?.map(route => (
                <Card key={route.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/transport/routes/${route.id}`)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{route.name}</CardTitle>
                        <CardDescription>{route.code}</CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingRoute(route); setRouteDialogOpen(true); }}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); deleteRoute.mutate({ id: route.id, institutionId: institution!.id }); }}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {route.zone && <Badge variant="secondary">{route.zone.name}</Badge>}
                      <Badge variant="outline">{route.route_type}</Badge>
                      {!route.is_active && <Badge variant="destructive">Inactive</Badge>}
                    </div>
                    {route.departure_time && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Departs: {route.departure_time}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="zones" className="space-y-4">
          {zonesLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
            </div>
          ) : zones?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No zones defined yet</p>
                <Button className="mt-4" onClick={() => setZoneDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Zone
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {zones?.map(zone => (
                <Card key={zone.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{zone.name}</CardTitle>
                        <CardDescription>{zone.code}</CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditingZone(zone); setZoneDialogOpen(true); }}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteZone.mutate({ id: zone.id, institutionId: institution!.id })}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold">{zone.currency} {zone.base_fee.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Base fee per term</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Zone Dialog */}
      <Dialog open={zoneDialogOpen} onOpenChange={setZoneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingZone ? 'Edit Zone' : 'Add Zone'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveZone} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zone-name">Name</Label>
                <Input id="zone-name" name="name" defaultValue={editingZone?.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zone-code">Code</Label>
                <Input id="zone-code" name="code" defaultValue={editingZone?.code} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zone-desc">Description</Label>
              <Input id="zone-desc" name="description" defaultValue={editingZone?.description || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zone-fee">Base Fee (KES)</Label>
              <Input id="zone-fee" name="base_fee" type="number" defaultValue={editingZone?.base_fee || 0} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setZoneDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createZone.isPending || updateZone.isPending}>
                {editingZone ? 'Save Changes' : 'Create Zone'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Route Dialog */}
      <Dialog open={routeDialogOpen} onOpenChange={setRouteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRoute ? 'Edit Route' : 'Add Route'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveRoute} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="route-name">Name</Label>
                <Input id="route-name" name="name" defaultValue={editingRoute?.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="route-code">Code</Label>
                <Input id="route-code" name="code" defaultValue={editingRoute?.code} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="route-zone">Zone</Label>
              <Select name="zone_id" defaultValue={editingRoute?.zone_id || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Select zone (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {zones?.map(zone => (
                    <SelectItem key={zone.id} value={zone.id}>{zone.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="route-type">Type</Label>
              <Select name="route_type" defaultValue={editingRoute?.route_type || 'both'}>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="route-depart">Departure Time</Label>
                <Input id="route-depart" name="departure_time" type="time" defaultValue={editingRoute?.departure_time || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="route-arrive">Arrival Time</Label>
                <Input id="route-arrive" name="arrival_time" type="time" defaultValue={editingRoute?.arrival_time || ''} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="route-desc">Description</Label>
              <Input id="route-desc" name="description" defaultValue={editingRoute?.description || ''} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRouteDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createRoute.isPending || updateRoute.isPending}>
                {editingRoute ? 'Save Changes' : 'Create Route'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
