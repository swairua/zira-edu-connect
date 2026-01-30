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
  CheckCircle,
  XCircle,
  Filter,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { useBoardingCharges, useCreateCharge, useApproveCharge, useWaiveCharge, BoardingCharge } from '@/hooks/useBoardingCharges';
import { useStudents } from '@/hooks/useStudents';
import { useInstitution } from '@/contexts/InstitutionContext';
import { format } from 'date-fns';

export default function BoardingCharges() {
  const [filters, setFilters] = useState({
    status: '',
    chargeType: '',
    searchQuery: '',
  });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [waivingCharge, setWaivingCharge] = useState<BoardingCharge | null>(null);

  const { institution } = useInstitution();
  const { data: charges, isLoading } = useBoardingCharges(filters);
  const { data: students } = useStudents(institution?.id || null);
  const createCharge = useCreateCharge();
  const approveCharge = useApproveCharge();
  const waiveCharge = useWaiveCharge();

  const boardingStudents = students?.filter(s => s.boarding_status === 'boarding');

  const handleAddCharge = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    await createCharge.mutateAsync({
      student_id: formData.get('student_id') as string,
      charge_type: formData.get('charge_type') as 'deposit' | 'penalty' | 'damage' | 'extra_fee',
      description: formData.get('description') as string,
      amount: parseFloat(formData.get('amount') as string),
      notes: formData.get('notes') as string || undefined,
    });
    
    setIsAddOpen(false);
  };

  const handleWaive = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!waivingCharge) return;
    
    const formData = new FormData(e.currentTarget);
    
    await waiveCharge.mutateAsync({
      chargeId: waivingCharge.id,
      notes: formData.get('notes') as string,
    });
    
    setWaivingCharge(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'invoiced':
        return <Badge className="bg-blue-500">Invoiced</Badge>;
      case 'paid':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'waived':
        return <Badge variant="secondary">Waived</Badge>;
      case 'refunded':
        return <Badge variant="outline">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getChargeTypeBadge = (type: string) => {
    switch (type) {
      case 'deposit':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600">Deposit</Badge>;
      case 'penalty':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600">Penalty</Badge>;
      case 'damage':
        return <Badge variant="outline" className="bg-orange-500/10 text-orange-600">Damage</Badge>;
      case 'extra_fee':
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-600">Extra Fee</Badge>;
      case 'refund':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600">Refund</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <DashboardLayout
      title="Boarding Charges"
      subtitle="Manage deposits, penalties, and damage charges"
      actions={
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Charge
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="invoiced">Invoiced</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="waived">Waived</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.chargeType || 'all'} 
                onValueChange={(v) => setFilters(f => ({ ...f, chargeType: v === 'all' ? '' : v }))}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="penalty">Penalty</SelectItem>
                  <SelectItem value="damage">Damage</SelectItem>
                  <SelectItem value="extra_fee">Extra Fee</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Charges Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : charges?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No charges found
                    </TableCell>
                  </TableRow>
                ) : (
                  charges?.map((charge) => (
                    <TableRow key={charge.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {charge.student?.first_name} {charge.student?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {charge.student?.admission_number}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getChargeTypeBadge(charge.charge_type)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {charge.description}
                      </TableCell>
                      <TableCell className="font-medium">
                        {charge.currency} {Math.abs(charge.amount).toLocaleString()}
                        {charge.amount < 0 && ' (Credit)'}
                      </TableCell>
                      <TableCell>
                        {format(new Date(charge.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>{getStatusBadge(charge.status)}</TableCell>
                      <TableCell className="text-right">
                        {charge.status === 'pending' && (
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => approveCharge.mutate(charge.id)}
                              disabled={approveCharge.isPending}
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setWaivingCharge(charge)}
                            >
                              <XCircle className="h-4 w-4 text-muted-foreground" />
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

      {/* Add Charge Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Boarding Charge</DialogTitle>
            <DialogDescription>
              Create a new charge for a boarding student
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddCharge}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="student_id">Student *</Label>
                <Select name="student_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {boardingStudents?.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.first_name} {student.last_name} ({student.admission_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="charge_type">Charge Type *</Label>
                  <Select name="charge_type" defaultValue="penalty">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deposit">Deposit</SelectItem>
                      <SelectItem value="penalty">Penalty</SelectItem>
                      <SelectItem value="damage">Damage</SelectItem>
                      <SelectItem value="extra_fee">Extra Fee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (KES) *</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="e.g., Broken window in Room 101"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Additional details..."
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createCharge.isPending}>
                {createCharge.isPending ? 'Creating...' : 'Create Charge'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Waive Charge Dialog */}
      <Dialog open={!!waivingCharge} onOpenChange={(open) => !open && setWaivingCharge(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Waive Charge</DialogTitle>
            <DialogDescription>
              Are you sure you want to waive this charge of {waivingCharge?.currency} {waivingCharge?.amount.toLocaleString()}?
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleWaive}>
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="font-medium">{waivingCharge?.description}</p>
                <p className="text-sm text-muted-foreground">
                  {waivingCharge?.student?.first_name} {waivingCharge?.student?.last_name}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="waive-notes">Reason for Waiving *</Label>
                <Textarea
                  id="waive-notes"
                  name="notes"
                  placeholder="Explain why this charge is being waived..."
                  rows={3}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setWaivingCharge(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={waiveCharge.isPending}>
                {waiveCharge.isPending ? 'Waiving...' : 'Waive Charge'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
