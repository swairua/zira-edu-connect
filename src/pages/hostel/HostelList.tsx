import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Building2, 
  Users, 
  Bed, 
  Edit, 
  Trash2,
  Search,
  MapPin
} from 'lucide-react';
import { useHostels, useCreateHostel, useUpdateHostel, useDeleteHostel, Hostel } from '@/hooks/useHostels';
import { useStaff } from '@/hooks/useStaff';
import { useInstitution } from '@/contexts/InstitutionContext';
import { Link } from 'react-router-dom';

export default function HostelList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingHostel, setEditingHostel] = useState<Hostel | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Hostel | null>(null);

  const { institution } = useInstitution();
  const { data: hostels, isLoading } = useHostels();
  const { data: staff } = useStaff(institution?.id || null);
  const createHostel = useCreateHostel();
  const updateHostel = useUpdateHostel();
  const deleteHostel = useDeleteHostel();

  // Filter staff by designation for warden selection
  const eligibleWardens = staff?.filter(s => s.is_active) || [];

  const filteredHostels = hostels?.filter(hostel =>
    hostel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hostel.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    await createHostel.mutateAsync({
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      gender: formData.get('gender') as 'male' | 'female' | 'mixed',
      description: formData.get('description') as string || undefined,
      location: formData.get('location') as string || undefined,
      warden_staff_id: formData.get('warden_staff_id') as string || undefined,
    });
    
    setIsCreateOpen(false);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingHostel) return;
    
    const formData = new FormData(e.currentTarget);
    
    await updateHostel.mutateAsync({
      id: editingHostel.id,
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      gender: formData.get('gender') as 'male' | 'female' | 'mixed',
      description: formData.get('description') as string || undefined,
      location: formData.get('location') as string || undefined,
      warden_staff_id: formData.get('warden_staff_id') as string || null,
    });
    
    setEditingHostel(null);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await deleteHostel.mutateAsync(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  const getGenderBadge = (gender: string) => {
    switch (gender) {
      case 'male':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600">Male</Badge>;
      case 'female':
        return <Badge variant="outline" className="bg-pink-500/10 text-pink-600">Female</Badge>;
      default:
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-600">Mixed</Badge>;
    }
  };

  return (
    <DashboardLayout
      title="Hostels & Rooms"
      subtitle="Manage hostel buildings, rooms, and bed configurations"
      actions={
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Hostel
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search hostels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Hostels Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredHostels?.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-1">No Hostels Found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery ? 'Try a different search term' : 'Get started by adding your first hostel'}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setIsCreateOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Hostel
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredHostels?.map((hostel) => (
              <Card key={hostel.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{hostel.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs">{hostel.code}</span>
                        {getGenderBadge(hostel.gender)}
                      </CardDescription>
                    </div>
                    <Badge variant={hostel.is_active ? 'default' : 'secondary'}>
                      {hostel.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hostel.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {hostel.location}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-muted">
                      <p className="text-lg font-bold">{hostel._count?.rooms || 0}</p>
                      <p className="text-xs text-muted-foreground">Rooms</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted">
                      <p className="text-lg font-bold">{hostel.capacity}</p>
                      <p className="text-xs text-muted-foreground">Beds</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted">
                      <p className="text-lg font-bold">{hostel._count?.occupied_beds || 0}</p>
                      <p className="text-xs text-muted-foreground">Occupied</p>
                    </div>
                  </div>

                  {hostel.warden && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Warden: {hostel.warden.first_name} {hostel.warden.last_name}</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link to={`/hostel/hostels/${hostel.id}`}>
                        <Bed className="h-4 w-4 mr-1" />
                        Rooms
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setEditingHostel(hostel)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setDeleteConfirm(hostel)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Create Hostel Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Hostel</DialogTitle>
            <DialogDescription>
              Create a new hostel building. You can add rooms after creating the hostel.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Hostel Name *</Label>
                  <Input id="name" name="name" placeholder="Boys Hostel A" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Code *</Label>
                  <Input id="code" name="code" placeholder="BH-A" required />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select name="gender" defaultValue="male">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" placeholder="Block A, Main Campus" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warden_staff_id">Warden (Optional)</Label>
                <Select name="warden_staff_id">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a warden" />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleWardens.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.first_name} {member.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Additional details about this hostel..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createHostel.isPending}>
                {createHostel.isPending ? 'Creating...' : 'Create Hostel'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Hostel Dialog */}
      <Dialog open={!!editingHostel} onOpenChange={(open) => !open && setEditingHostel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Hostel</DialogTitle>
            <DialogDescription>
              Update hostel information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Hostel Name *</Label>
                  <Input 
                    id="edit-name" 
                    name="name" 
                    defaultValue={editingHostel?.name} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-code">Code *</Label>
                  <Input 
                    id="edit-code" 
                    name="code" 
                    defaultValue={editingHostel?.code} 
                    required 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-gender">Gender *</Label>
                <Select name="gender" defaultValue={editingHostel?.gender}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input 
                  id="edit-location" 
                  name="location" 
                  defaultValue={editingHostel?.location || ''} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-warden">Warden</Label>
                <Select name="warden_staff_id" defaultValue={editingHostel?.warden_staff_id || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a warden" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {eligibleWardens.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.first_name} {member.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  name="description" 
                  defaultValue={editingHostel?.description || ''}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingHostel(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateHostel.isPending}>
                {updateHostel.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Hostel?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"? This will also delete all rooms and beds. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteHostel.isPending}>
              {deleteHostel.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
