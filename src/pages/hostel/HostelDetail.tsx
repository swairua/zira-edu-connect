import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  ArrowLeft, 
  Bed, 
  Users,
  Edit,
  Wrench
} from 'lucide-react';
import { useHostel, useRooms, useCreateRoom, useBeds, useUpdateBedStatus, HostelRoom, HostelBed } from '@/hooks/useHostels';
import { cn } from '@/lib/utils';

export default function HostelDetail() {
  const { id: hostelId } = useParams<{ id: string }>();
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<HostelRoom | null>(null);
  const [editingBed, setEditingBed] = useState<HostelBed | null>(null);

  const { data: hostel, isLoading: hostelLoading } = useHostel(hostelId);
  const { data: rooms, isLoading: roomsLoading } = useRooms(hostelId);
  const { data: beds } = useBeds(selectedRoom?.id);
  const createRoom = useCreateRoom();
  const updateBedStatus = useUpdateBedStatus();

  const handleAddRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hostelId) return;
    
    const formData = new FormData(e.currentTarget);
    
    await createRoom.mutateAsync({
      hostel_id: hostelId,
      room_number: formData.get('room_number') as string,
      floor: formData.get('floor') as string || undefined,
      room_type: formData.get('room_type') as 'standard' | 'prefect' | 'sick_bay' | 'special',
      bed_capacity: parseInt(formData.get('bed_capacity') as string, 10),
    });
    
    setIsAddRoomOpen(false);
  };

  const handleUpdateBedStatus = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingBed) return;
    
    const formData = new FormData(e.currentTarget);
    
    await updateBedStatus.mutateAsync({
      id: editingBed.id,
      status: formData.get('status') as 'available' | 'occupied' | 'maintenance' | 'reserved',
      notes: formData.get('notes') as string || undefined,
    });
    
    setEditingBed(null);
  };

  const getBedStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'occupied': return 'bg-blue-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'reserved': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoomTypeLabel = (type: string) => {
    switch (type) {
      case 'prefect': return 'Prefect Room';
      case 'sick_bay': return 'Sick Bay';
      case 'special': return 'Special';
      default: return 'Standard';
    }
  };

  if (hostelLoading) {
    return (
      <DashboardLayout title="Loading...">
        <Skeleton className="h-96 w-full" />
      </DashboardLayout>
    );
  }

  if (!hostel) {
    return (
      <DashboardLayout title="Hostel Not Found">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">The requested hostel could not be found.</p>
            <Button asChild>
              <Link to="/hostel/hostels">Back to Hostels</Link>
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={hostel.name}
      subtitle={`${hostel.code} • ${hostel.gender.charAt(0).toUpperCase() + hostel.gender.slice(1)} • ${hostel.capacity} beds capacity`}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/hostel/hostels">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <Button onClick={() => setIsAddRoomOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Room
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Rooms List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-semibold">Rooms ({rooms?.length || 0})</h3>
          
          {roomsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : rooms?.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Bed className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No rooms added yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {rooms?.map((room) => (
                <Card 
                  key={room.id}
                  className={cn(
                    "cursor-pointer transition-colors",
                    selectedRoom?.id === room.id ? "border-primary" : "hover:border-muted-foreground/30"
                  )}
                  onClick={() => setSelectedRoom(room)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Room {room.room_number}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {room.floor && (
                            <span className="text-xs text-muted-foreground">{room.floor} Floor</span>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {getRoomTypeLabel(room.room_type)}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {room._count?.occupied_beds || 0}/{room.bed_capacity}
                        </p>
                        <p className="text-xs text-muted-foreground">Occupied</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Room Details / Bed Grid */}
        <div className="lg:col-span-2">
          {selectedRoom ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Room {selectedRoom.room_number}</CardTitle>
                    <CardDescription>
                      {selectedRoom.floor && `${selectedRoom.floor} Floor • `}
                      {getRoomTypeLabel(selectedRoom.room_type)} • {selectedRoom.bed_capacity} beds
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Beds</h4>
                  <div className="flex gap-2 flex-wrap mb-4">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="h-3 w-3 rounded-full bg-green-500" />
                      Available
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="h-3 w-3 rounded-full bg-blue-500" />
                      Occupied
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="h-3 w-3 rounded-full bg-yellow-500" />
                      Maintenance
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="h-3 w-3 rounded-full bg-purple-500" />
                      Reserved
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {beds?.map((bed) => (
                    <div
                      key={bed.id}
                      className={cn(
                        "p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md",
                        bed.status === 'available' && "border-green-200 bg-green-50 hover:border-green-400",
                        bed.status === 'occupied' && "border-blue-200 bg-blue-50 hover:border-blue-400",
                        bed.status === 'maintenance' && "border-yellow-200 bg-yellow-50 hover:border-yellow-400",
                        bed.status === 'reserved' && "border-purple-200 bg-purple-50 hover:border-purple-400"
                      )}
                      onClick={() => setEditingBed(bed)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-lg">Bed {bed.bed_number}</span>
                        <span className={cn("h-2.5 w-2.5 rounded-full", getBedStatusColor(bed.status))} />
                      </div>
                      <p className="text-xs text-muted-foreground capitalize">{bed.status}</p>
                      {bed.bed_type !== 'standard' && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {bed.bed_type.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Bed className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-1">Select a Room</h3>
                <p className="text-sm text-muted-foreground">
                  Click on a room from the list to view and manage its beds
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add Room Dialog */}
      <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
            <DialogDescription>
              Create a new room in {hostel.name}. Beds will be automatically created based on capacity.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddRoom}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="room_number">Room Number *</Label>
                  <Input id="room_number" name="room_number" placeholder="101" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor">Floor</Label>
                  <Input id="floor" name="floor" placeholder="Ground Floor" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="room_type">Room Type</Label>
                  <Select name="room_type" defaultValue="standard">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="prefect">Prefect Room</SelectItem>
                      <SelectItem value="sick_bay">Sick Bay</SelectItem>
                      <SelectItem value="special">Special</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bed_capacity">Number of Beds *</Label>
                  <Input 
                    id="bed_capacity" 
                    name="bed_capacity" 
                    type="number" 
                    min="1" 
                    max="20" 
                    defaultValue="4"
                    required 
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddRoomOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createRoom.isPending}>
                {createRoom.isPending ? 'Creating...' : 'Create Room'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Bed Status Dialog */}
      <Dialog open={!!editingBed} onOpenChange={(open) => !open && setEditingBed(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Bed Status</DialogTitle>
            <DialogDescription>
              Change the status of Bed {editingBed?.bed_number}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateBedStatus}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="bed-status">Status</Label>
                <Select name="status" defaultValue={editingBed?.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Note: "Occupied" status is set automatically when a student is assigned.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input 
                  id="notes" 
                  name="notes" 
                  placeholder="Reason for status change..."
                  defaultValue={editingBed?.notes || ''}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingBed(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateBedStatus.isPending}>
                {updateBedStatus.isPending ? 'Updating...' : 'Update Status'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
