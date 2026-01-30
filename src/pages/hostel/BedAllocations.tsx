import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  ArrowRightLeft, 
  XCircle,
  Filter,
  Download
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBedAllocations, useEndAllocation, useTransferBed, BedAllocation } from '@/hooks/useBedAllocations';
import { useHostels, useAvailableBeds } from '@/hooks/useHostels';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { useInstitution } from '@/contexts/InstitutionContext';
import { format } from 'date-fns';

export default function BedAllocations() {
  const [filters, setFilters] = useState({
    status: 'active',
    hostelId: '',
    academicYearId: '',
    searchQuery: '',
  });
  const [endingAllocation, setEndingAllocation] = useState<BedAllocation | null>(null);
  const [transferringAllocation, setTransferringAllocation] = useState<BedAllocation | null>(null);

  const { institution } = useInstitution();
  const { data: allocations, isLoading } = useBedAllocations(filters);
  const { data: hostels } = useHostels();
  const { data: academicYears } = useAcademicYears(institution?.id || null);
  const { data: availableBeds } = useAvailableBeds();
  const endAllocation = useEndAllocation();
  const transferBed = useTransferBed();

  const handleEndAllocation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!endingAllocation) return;
    
    const formData = new FormData(e.currentTarget);
    
    await endAllocation.mutateAsync({
      allocationId: endingAllocation.id,
      reason: formData.get('reason') as string,
      endDate: formData.get('end_date') as string,
    });
    
    setEndingAllocation(null);
  };

  const handleTransfer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!transferringAllocation) return;
    
    const formData = new FormData(e.currentTarget);
    
    await transferBed.mutateAsync({
      allocationId: transferringAllocation.id,
      newBedId: formData.get('new_bed_id') as string,
      reason: formData.get('reason') as string,
    });
    
    setTransferringAllocation(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'ended':
        return <Badge variant="secondary">Ended</Badge>;
      case 'transferred':
        return <Badge className="bg-blue-500">Transferred</Badge>;
      case 'suspended':
        return <Badge className="bg-yellow-500">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout
      title="Bed Allocations"
      subtitle="View and manage student bed assignments"
      actions={
        <Button asChild>
          <Link to="/hostel/assign">
            <Plus className="h-4 w-4 mr-2" />
            Assign Bed
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search student..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters(f => ({ ...f, searchQuery: e.target.value }))}
                  className="pl-9"
                />
              </div>
              
              <Select 
                value={filters.status || 'all'} 
                onValueChange={(v) => setFilters(f => ({ ...f, status: v === 'all' ? '' : v }))}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.hostelId || 'all'} 
                onValueChange={(v) => setFilters(f => ({ ...f, hostelId: v === 'all' ? '' : v }))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Hostels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Hostels</SelectItem>
                  {hostels?.map((hostel) => (
                    <SelectItem key={hostel.id} value={hostel.id}>
                      {hostel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={filters.academicYearId || 'all'} 
                onValueChange={(v) => setFilters(f => ({ ...f, academicYearId: v === 'all' ? '' : v }))}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Academic Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {academicYears?.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Allocations Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Hostel / Room / Bed</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : allocations?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No allocations found
                    </TableCell>
                  </TableRow>
                ) : (
                  allocations?.map((allocation) => (
                    <TableRow key={allocation.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {allocation.student?.first_name} {allocation.student?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {allocation.student?.admission_number}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {allocation.bed?.room?.hostel?.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Room {allocation.bed?.room?.room_number}, Bed {allocation.bed?.bed_number}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(allocation.start_date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {allocation.academic_year?.name || '-'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(allocation.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        {allocation.status === 'active' && (
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setTransferringAllocation(allocation)}
                            >
                              <ArrowRightLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEndingAllocation(allocation)}
                            >
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* End Allocation Dialog */}
      <Dialog open={!!endingAllocation} onOpenChange={(open) => !open && setEndingAllocation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Allocation</DialogTitle>
            <DialogDescription>
              End bed allocation for {endingAllocation?.student?.first_name} {endingAllocation?.student?.last_name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEndAllocation}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reason">Reason *</Label>
                <Select name="reason" defaultValue="term_end">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="term_end">Term End</SelectItem>
                    <SelectItem value="graduation">Graduation</SelectItem>
                    <SelectItem value="transfer">Transfer to Another School</SelectItem>
                    <SelectItem value="disciplinary">Disciplinary</SelectItem>
                    <SelectItem value="request">Parent/Student Request</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEndingAllocation(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={endAllocation.isPending}>
                {endAllocation.isPending ? 'Ending...' : 'End Allocation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={!!transferringAllocation} onOpenChange={(open) => !open && setTransferringAllocation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Student</DialogTitle>
            <DialogDescription>
              Transfer {transferringAllocation?.student?.first_name} {transferringAllocation?.student?.last_name} to a different bed
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTransfer}>
            <div className="space-y-4 py-4">
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-sm font-medium">Current Location</p>
                <p className="text-sm text-muted-foreground">
                  {transferringAllocation?.bed?.room?.hostel?.name} - Room {transferringAllocation?.bed?.room?.room_number}, Bed {transferringAllocation?.bed?.bed_number}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_bed_id">New Bed *</Label>
                <Select name="new_bed_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select available bed" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBeds?.map((bed) => (
                      <SelectItem key={bed.id} value={bed.id}>
                        {bed.room?.hostel?.name} - Room {bed.room?.room_number}, Bed {bed.bed_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transfer-reason">Reason *</Label>
                <Textarea
                  id="transfer-reason"
                  name="reason"
                  placeholder="Reason for transfer..."
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setTransferringAllocation(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={transferBed.isPending}>
                {transferBed.isPending ? 'Transferring...' : 'Transfer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
